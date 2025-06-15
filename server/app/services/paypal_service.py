import httpx, os
from dotenv import load_dotenv
import requests
import urllib

load_dotenv()

PAYPAL_API = os.getenv("PAYPAL_API_URL")
CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
SECRET = os.getenv("PAYPAL_SECRET")


async def get_access_token():
    print("\n=== OBTENIENDO TOKEN DE ACCESO DE PAYPAL ===")
    print(f"API URL: {PAYPAL_API}")
    print(f"Client ID: {CLIENT_ID[:5]}...{CLIENT_ID[-5:] if CLIENT_ID else 'None'}")
    print(f"Secret: {SECRET[:2]}..." if SECRET else "Secret: None")
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{PAYPAL_API}/v1/oauth2/token",
                auth=(CLIENT_ID, SECRET),
                data={"grant_type": "client_credentials"},
                headers={"Accept": "application/json"}
            )
            res.raise_for_status()
            token_data = res.json()
            print("Token obtenido exitosamente")
            return token_data["access_token"]
        except Exception as e:
            print(f"Error obteniendo token: {str(e)}")
            print(f"Respuesta de PayPal: {res.text if 'res' in locals() else 'No response'}")
            raise


async def create_order(amount: float, product_name: str, seller_id: int, repo_url: str):
    print("\n=== INICIANDO CREACIÓN DE ORDEN EN PAYPAL_SERVICE ===")
    print(f"Monto: ${amount:.2f}")
    print(f"Producto: {product_name}")
    
    print("Obteniendo token de acceso...")
    token = await get_access_token()
    print("Token de acceso obtenido exitosamente")
    
    backend_url = os.getenv('BACKEND_URL', 'https://agoserver.a1devhub.tech')
    print(f"\nConfiguración:")
    print(f"API URL: {PAYPAL_API}")
    print(f"Backend URL: {backend_url}")

    encoded_url = urllib.parse.quote(repo_url)

    
    async with httpx.AsyncClient() as client:
        try:
            order_data = {
                "intent": "AUTHORIZE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{amount:.2f}"
                    },
                    "description": product_name
                }],
                "application_context": {
                    "return_url": f"{backend_url}/success",
                    "cancel_url": f"{backend_url}/cancel",
                    "user_action": "PAY_NOW"
                }
            }
            
            print(f"\nDatos de la orden a crear:")
            print(f"Order data: {order_data}")


            
            print("\nEnviando solicitud de creación de orden a PayPal...")
            res = await client.post(
                f"{PAYPAL_API}/v2/checkout/orders",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            },
            json={
                "intent": "AUTHORIZE",
                "purchase_units": [{
                    "amount": {
                        "currency_code": "USD",
                        "value": f"{amount:.2f}"
                    },
                    "description": product_name
                }],                "application_context": {
                    "return_url": f"{os.getenv('BACKEND_URL', 'https://agoserver.a1devhub.tech')}/success?repo_name={product_name}&repo_url={encoded_url}&seller_id={seller_id}",
                    "cancel_url": f"{os.getenv('BACKEND_URL', 'https://agoserver.a1devhub.tech')}/cancel",
                    "user_action": "PAY_NOW"  # Hacer más clara la acción para el usuario
                }
            }
        )
        except Exception as e:
            print(e)

        response = res.json()
        print(response)
        return response


async def authorize_payment(order_id):
    access_token = await get_access_token()

    response = requests.post(
        f"https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/authorize",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        }
    )
    
    return response.json()


async def capture_authorization(authorization_id: str):
    token = await get_access_token()
    print("Generando captura con el token")
    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{PAYPAL_API}/v2/payments/authorizations/{authorization_id}/capture",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {token}",
            }
        )
        response = res.json()
        print(f"Devolviendo respuesta: {response}")
        return response
