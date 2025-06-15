from fastapi import APIRouter, Request, HTTPException, Depends, Form
from app.services.paypal_service import create_order, capture_authorization, authorize_payment
from app.utils.security.modules import auth_dependency
from fastapi.responses import RedirectResponse, JSONResponse
from app.config import settings
from app.services.github_service import transfer_repository


router = APIRouter(tags=["paypal"])


@router.get("/create-order/{repo_name}")
async def create_payment(
    repo_name: str, 
    seller_id: str,  
    repo_url: str,
    repo_price: float, 
    request: Request,
    user: dict = Depends(auth_dependency)):
    """
    🛒 Inicia la creación de una orden de pago en PayPal para un repositorio.

    📥 Parámetros:
        - repo_name (str): Nombre del repositorio a comprar.
        - seller_id (str): ID del vendedor.
        - repo_url (str): URL del repositorio.
        - request (Request): Objeto de la solicitud HTTP para acceder a headers.
        - user (dict): Usuario autenticado (extraído del token JWT).

    🧠 Lógica:
        - Crea una orden en PayPal con los datos del producto y monto.
        - Obtiene el enlace de aprobación para que el usuario confirme el pago.
        - Si falla, redirige a una página de error.

    📤 Retorna:
        - RedirectResponse: Redirige a la URL de aprobación de PayPal o a la página de error en el frontend.
    """

    print("Verificando si es un repositorio gratuito o de paga")
    if not repo_price:
        response_transfer = transfer_repository(
            seller_id=seller_id,
            repo_name=repo_name,
            repo_url=repo_url
        )

        response_transfer["repo_name"] = repo_name

        return JSONResponse(
            content=repo_name,
            status_code=200
        )

    print("\n=== INICIANDO CREACIÓN DE ORDEN DE PAGO ===")
    print(f"Repositorio: {repo_name}")
    print(f"Headers de la solicitud: {dict(request.headers)}")
    
    try:
        print("Creando orden en PayPal...")
        # Crear la orden con PayPal
        order = await create_order(
            amount=110.00,
            product_name=repo_name,
            repo_url=repo_url,
            seller_id=seller_id
        )
        print(f"Respuesta de creación de orden: {order}")
          # Verificar si la orden se creó correctamente
        if "id" not in order:
            print(f"ERROR: Respuesta de PayPal no contiene ID de orden")
            print(f"Respuesta completa: {order}")
            raise ValueError("No se pudo crear la orden en PayPal: falta ID")
            
        print(f"ID de orden creada: {order['id']}")
            
        # Buscar el enlace de aprobación
        print("Buscando enlace de aprobación en la respuesta...")
        print(f"Enlaces disponibles: {order.get('links', [])}")
        
        approval_link = next(
            (link["href"] for link in order.get("links", []) if link["rel"] == "approve"),
            None
        )
        
        if not approval_link:
            print("ERROR: No se encontró el enlace de aprobación")
            print(f"Enlaces en la respuesta: {order.get('links', [])}")
            raise ValueError("No se encontró el enlace de aprobación en la respuesta de PayPal")
            
        print(f"Enlace de aprobación encontrado: {approval_link}")
            
        # Guardar el ID de la orden en la sesión si es necesario
        # request.session["order_id"] = order["id"]
        
        print(f"Este es el approval link: {approval_link}")
        return RedirectResponse(approval_link)
        
    except Exception as e:
        print(f"Error al crear la orden: {str(e)}")
        error_url = f"{settings.FRONTEND_URL}/error?message=Error al crear la orden: {str(e)}"
        return RedirectResponse(error_url)


@router.get("/success")
async def success(
    request: Request, 
    repo_name: str, 
    repo_url: str, 
    seller_id: int
    #user: dict = Depends(auth_dependency)
    ):
    """
    ✅ Maneja el callback exitoso de PayPal tras la aprobación del pago.

    📥 Parámetros:
        - request (Request): Objeto de la solicitud HTTP con parámetros query de PayPal.
        - repo_name (str): Nombre del repositorio comprado.
        - repo_url (str): URL del repositorio comprado.
        - seller_id (int): ID del vendedor.

    🧠 Lógica:
        - Extrae el token de orden y PayerID de la query.
        - Autoriza el pago con PayPal usando el token.
        - Obtiene el ID de autorización para confirmar el pago.
        - Redirige al frontend con la info de autorización o error.

    📤 Retorna:
        - RedirectResponse: Redirige al frontend con información de éxito o error del pago.
    """
    print("\n=== INICIO DEL PROCESO DE ÉXITO DE PAGO ===")
    print(f"Query params recibidos: {dict(request.query_params)}")
    
    order_id = request.query_params.get("token")
    payer_id = request.query_params.get("PayerID")
    
    print(f"Token/Order ID: {order_id}")
    print(f"Payer ID: {payer_id}")

    print("---- MODELO DE ORDEN RECIBIDO ----")
    print(f"seller_id: {seller_id}")
    print(f"repo_url: {repo_url}")
    
    

    if not order_id or not payer_id:
        print("ERROR: Faltan parámetros requeridos")
        error_message = "Faltan parámetros requeridos de PayPal"
        frontend_url = f"{settings.FRONTEND_URL}/success?error={error_message}"
        return RedirectResponse(frontend_url)
    try:          
        print("\n=== INICIANDO AUTORIZACIÓN DE ORDEN ===")
        # Autorizar el pedido con PayPal
        auth_response = await authorize_payment(order_id)
        print(f"Respuesta de autorización recibida: {auth_response}")
        
        if "purchase_units" not in auth_response:
            print("ERROR: No se encontraron purchase_units en la respuesta")
            raise ValueError("Respuesta de autorización inválida: No hay purchase_units")
            
        if not auth_response["purchase_units"]:
            print("ERROR: purchase_units está vacío")
            raise ValueError("Respuesta de autorización inválida: purchase_units vacío")
            
        authorization_id = auth_response["purchase_units"][0]["payments"]["authorizations"][0]["id"]
        
        # Redirigir a tu aplicación React con el authorization_id y PayerID
        frontend_url = f"{settings.FRONTEND_URL}/success?authorization_id={authorization_id}&seller_id={seller_id}&repo_url={repo_url}&repo_name={repo_name}"
        return RedirectResponse(frontend_url)  
    except Exception as e:
        # Log del error específico
        print(f"Error en /success: {str(e)}")
        error_message = "No se pudo procesar el pago: " + str(e)
        frontend_url = f"{settings.FRONTEND_URL}/success?error={error_message}"
        return RedirectResponse(frontend_url)


@router.post("/confirm")
async def confirm(
    authorization_id: str = Form(...),
    seller_id: str = Form(...),
    repo_url: str = Form(...),
    repo_name: str = Form(...),
    user: dict = Depends(auth_dependency)
    ):
    """
    📋 Captura la autorización del pago y transfiere el repositorio.

    📥 Parámetros (form data):
        - authorization_id (str): ID de autorización de PayPal.
        - seller_id (str): ID del vendedor.
        - repo_url (str): URL del repositorio a transferir.
        - repo_name (str): Nombre del repositorio.
        - user (dict): Usuario autenticado (token JWT).

    🧠 Lógica:
        - Captura la autorización del pago en PayPal.
        - Ejecuta la lógica para transferir el repositorio al comprador.

    📤 Retorna:
        - dict: Estado de captura y respuesta de PayPal.
    
    🚨 Errores:
        - HTTPException 400 si falta authorization_id.
        - HTTPException 500 si falla la captura del pago.
    """
    if not authorization_id:
        raise HTTPException(status_code=400, detail="Falta el authorization_id")

    try:
        result = await capture_authorization(authorization_id)
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Error al capturar: {str(e)}")
    

    seller_id = int(seller_id)
    # Logica para transferir repositorio
    transfer_response = await transfer_repository(
        user=user,
        seller_id=seller_id,
        repo_name=repo_name,
        repo_url=repo_url

    )

    print(transfer_response)

    return {"status": "capturado", "paypal_response": result}


@router.get("/cancel")
async def cancel():
    """
    ❌ Maneja la cancelación del pago.

    🧠 Lógica:
        - Simplemente redirige a la página de cancelación en el frontend.

    📤 Retorna:
        - RedirectResponse: Redirige a la URL de cancelación del frontend.
    """
    # Redirigir a tu página de cancelación en React
    return RedirectResponse(f"{settings.FRONTEND_URL}/cancel")
