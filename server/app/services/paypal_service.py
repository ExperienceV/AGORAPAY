import httpx
import os
from dotenv import load_dotenv
import requests
import urllib.parse
from typing import Dict, Any

load_dotenv()

PAYPAL_API = os.getenv("PAYPAL_API_URL")
CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
SECRET = os.getenv("PAYPAL_SECRET")
IS_TEST = os.getenv("IS_TEST", "false").lower() == "true"

def get_base_url() -> str:
    """
    Returns the base URL for the backend service.
    If in test mode, returns the local URL; otherwise, returns the production URL.
    This is used to construct the success and cancel URLs for PayPal orders.
    Returns:
        str: The base URL for the backend service.
    """
    if IS_TEST:
        return "http://localhost:8000"
    return os.getenv('BACKEND_URL', 'https://agoserver.a1devhub.tech')

async def get_access_token() -> str:
    print("\n=== GET PAYPAL TOKEN ACCESS ===")
    print(f"API URL: {PAYPAL_API}")
    print(f"Client ID: {CLIENT_ID[:5]}...{CLIENT_ID[-5:] if CLIENT_ID else 'None'}")
    print(f"Secret: {SECRET[:2]}..." if SECRET else "Secret: None")
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                f"{PAYPAL_API}/v1/oauth2/token",
                auth=(CLIENT_ID, SECRET),
                data={"grant_type": "client_credentials"}
            )
            res.raise_for_status()
            token_data = res.json()
            print("Token successfully obtained.")
            return token_data["access_token"]
        except Exception as e:
            print(f"Error obtaining access token: {str(e)}")
            raise

async def create_order(amount: float, product_name: str, seller_id: str, repo_url: str) -> Dict[str, Any]:
    print("\n=== CREATE ORDER OF PAYNMENT ===")
    print(f"Amount: ${amount:.2f}")
    print(f"Product: {product_name}")
    
    token = await get_access_token()
    backend_url = get_base_url()
    
    print(f"\nConfiguración:")
    print(f"API URL: {PAYPAL_API}")
    print(f"Backend URL: {backend_url}")
    print(f"Ambiente: {'Test' if IS_TEST else 'Producción'}")

    # BUILD SUCCESS AND CANCEL URLS
    success_params = urllib.parse.urlencode({
        'repo_name': product_name,
        'repo_url': repo_url,
        'seller_id': seller_id
    })
    
    success_url = f"{backend_url}/success?{success_params}"
    cancel_url = f"{backend_url}/cancel"

    # BUILD ORDER DATA
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
            "return_url": success_url,
            "cancel_url": cancel_url,
            "user_action": "PAY_NOW"
        }
    }
    
    print(f"\nDatos de la orden a crear:")
    print(f"Order data: {order_data}")

    async with httpx.AsyncClient() as client:
        try:
            print("\nEnviando solicitud de creación de orden a PayPal...")
            res = await client.post(
                f"{PAYPAL_API}/v2/checkout/orders",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {token}"
                },
                json=order_data
            )
            
            res.raise_for_status()
            response_data = res.json()
            
            # Sure that the application context is included in the response
            if "application_context" not in response_data:
                response_data["application_context"] = order_data["application_context"]
            
            print(f"\nRespuesta de PayPal: {response_data}")
            return response_data
            
        except httpx.HTTPError as e:
            print(f"Error en la respuesta de PayPal: {e.response.text if hasattr(e, 'response') else str(e)}")
            raise
        except Exception as e:
            print(f"Error inesperado: {str(e)}")
            raise


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
        print(f"Return response: {response}")
        return response
