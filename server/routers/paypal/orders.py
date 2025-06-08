from fastapi import APIRouter, Request, HTTPException
from services.paypal_service import create_order, capture_authorization, authorize_payment
from fastapi.responses import RedirectResponse
from config import settings


router = APIRouter()


@router.get("/create-order/{repo_name}")
async def create_payment(repo_name: str, seller_id: str,  repo_url: str, request: Request):
    print("\n=== INICIANDO CREACIÓN DE ORDEN DE PAGO ===")
    print(f"Repositorio: {repo_name}")
    print(f"Headers de la solicitud: {dict(request.headers)}")
    
    try:
        print("Creando orden en PayPal...")
        # Crear la orden con PayPal
        order = await create_order(
            amount=110.00,
            product_name=repo_name
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
async def success(request: Request):
    print("\n=== INICIO DEL PROCESO DE ÉXITO DE PAGO ===")
    print(f"Query params recibidos: {dict(request.query_params)}")
    
    order_id = request.query_params.get("token")
    payer_id = request.query_params.get("PayerID")
    
    print(f"Token/Order ID: {order_id}")
    print(f"Payer ID: {payer_id}")
    
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
        frontend_url = f"{settings.FRONTEND_URL}/success?authorization_id={authorization_id}&payer_id={payer_id}"
        return RedirectResponse(frontend_url)  
    except Exception as e:
        # Log del error específico
        print(f"Error en /success: {str(e)}")
        error_message = "No se pudo procesar el pago: " + str(e)
        frontend_url = f"{settings.FRONTEND_URL}/success?error={error_message}"
        return RedirectResponse(frontend_url)


@router.post("/confirm")
async def confirm(request: Request):
    form = await request.form()
    authorization_id = form.get("authorization_id")
    if not authorization_id:
        raise HTTPException(status_code=400, detail="Falta el authorization_id")

    try:
        result = await capture_authorization(authorization_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al capturar: {str(e)}")
    
    # Logica para transferir repositorio

    return {"status": "capturado", "paypal_response": result}


@router.get("/cancel")
async def cancel():
    # Redirigir a tu página de cancelación en React
    return RedirectResponse(f"{settings.FRONTEND_URL}/cancel")
