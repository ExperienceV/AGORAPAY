from fastapi import APIRouter, Request, HTTPException, Depends, Form
from server.services.paypal_service import create_order, capture_authorization, authorize_payment
from server.utils.security.modules import auth_dependency
from fastapi.responses import RedirectResponse, JSONResponse
from server.config import settings
from server.services.github_service import transfer_repository

router = APIRouter(tags=["paypal"])

@router.get("/create-order/{repo_name}")
async def create_payment(
    repo_name: str, 
    seller_id: str,  
    repo_url: str,
    repo_price: int, 
    request: Request,
    user: dict = Depends(auth_dependency)):
    """
    🛒 Initiates the creation of a PayPal payment order for a repository.

    Parameters:
        - repo_name (str): Name of the repository to purchase.
        - seller_id (str): Seller's ID.
        - repo_url (str): Repository URL.
        - request (Request): HTTP request object for accessing headers.
        - user (dict): Authenticated user (extracted from JWT token).

    Logic:
        - Creates a PayPal order with product and amount data.
        - Gets the approval link for the user to confirm payment.
        - If it fails, redirects to an error page.

    Returns:
        - RedirectResponse: Redirects to PayPal approval URL or error page in the frontend.
    """
    print("Checking if repository is free or paid")
    if not repo_price:
        response_transfer = await transfer_repository(
            user=user,
            seller_id=seller_id,
            repo_name=repo_name,
            repo_url=repo_url
        )
        response_transfer["repo_name"] = repo_name
        return JSONResponse(
            content=response_transfer,
            status_code=200
        )
    print("\n=== STARTING PAYMENT ORDER CREATION ===")
    print(f"Repository: {repo_name}")
    print(f"Request headers: {dict(request.headers)}")
    try:
        print("Creating order in PayPal...")
        order = await create_order(
            amount=float(repo_price),
            product_name=repo_name,
            repo_url=repo_url,
            seller_id=seller_id
        )
        print(f"Order creation response: {order}")
        if "id" not in order:
            print(f"ERROR: PayPal response missing order ID")
            print(f"Full response: {order}")
            raise ValueError("Could not create order in PayPal: missing ID")
        print(f"Order ID created: {order['id']}")
        print("Looking for approval link in response...")
        print(f"Available links: {order.get('links', [])}")
        approval_link = next(
            (link["href"] for link in order.get("links", []) if link["rel"] == "approve"),
            None
        )
        if not approval_link:
            print("ERROR: Approval link not found")
            print(f"Links in response: {order.get('links', [])}")
            raise ValueError("Approval link not found in PayPal response")
        print(f"Approval link found: {approval_link}")
        print(f"This is the approval link: {approval_link}")
        return RedirectResponse(approval_link)
    except Exception as e:
        print(f"Error creating order: {str(e)}")
        error_url = f"{settings.FRONTEND_URL}/error?message=Error creating order: {str(e)}"
        return RedirectResponse(error_url)


@router.get("/success")
async def success(
    request: Request, 
    repo_name: str, 
    repo_url: str, 
    seller_id: int
    ):
    """
    ✅ Handles the PayPal success callback after payment approval.

    Parameters:
        - request (Request): HTTP request object with PayPal query parameters.
        - repo_name (str): Name of the purchased repository.
        - repo_url (str): URL of the purchased repository.
        - seller_id (int): Seller's ID.

    Logic:
        - Extracts order token and PayerID from the query.
        - Authorizes the payment with PayPal using the token.
        - Gets the authorization ID to confirm payment.
        - Redirects to the frontend with authorization info or error.

    Returns:
        - RedirectResponse: Redirects to the frontend with payment success or error info.
    """
    print("\n=== STARTING PAYMENT SUCCESS PROCESS ===")
    print(f"Received query params: {dict(request.query_params)}")
    order_id = request.query_params.get("token")
    payer_id = request.query_params.get("PayerID")
    print(f"Token/Order ID: {order_id}")
    print(f"Payer ID: {payer_id}")
    print("---- RECEIVED ORDER MODEL ----")
    print(f"seller_id: {seller_id}")
    print(f"repo_url: {repo_url}")
    if not order_id or not payer_id:
        print("ERROR: Missing required parameters")
        error_message = "Missing required PayPal parameters"
        frontend_url = f"{settings.FRONTEND_URL}/success?error={error_message}"
        return RedirectResponse(frontend_url)
    try:          
        print("\n=== STARTING ORDER AUTHORIZATION ===")
        auth_response = await authorize_payment(order_id)
        print(f"Authorization response: {auth_response}")
        if "purchase_units" not in auth_response:
            print("ERROR: No purchase_units found in response")
            raise ValueError("Invalid authorization response: No purchase_units")
        if not auth_response["purchase_units"]:
            print("ERROR: purchase_units is empty")
            raise ValueError("Invalid authorization response: purchase_units empty")
        authorization_id = auth_response["purchase_units"][0]["payments"]["authorizations"][0]["id"]
        frontend_url = f"{settings.FRONTEND_URL}/success?authorization_id={authorization_id}&seller_id={seller_id}&repo_url={repo_url}&repo_name={repo_name}"
        return RedirectResponse(frontend_url)  
    except Exception as e:
        print(f"Error in /success: {str(e)}")
        error_message = "Could not process payment: " + str(e)
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
    📋 Captures the payment authorization and transfers the repository.

    Parameters (form data):
        - authorization_id (str): PayPal authorization ID.
        - seller_id (str): Seller's ID.
        - repo_url (str): Repository URL to transfer.
        - repo_name (str): Repository name.
        - user (dict): Authenticated user (JWT token).

    Logic:
        - Captures the payment authorization in PayPal.
        - Executes the logic to transfer the repository to the buyer.

    Returns:
        - dict: Capture status and PayPal response.
    Errors:
        - HTTPException 400 if authorization_id is missing.
        - HTTPException 500 if payment capture fails.
    """
    print("Receiving confirmation data:")
    print(authorization_id)
    print(repo_url)
    print(repo_name)
    print(seller_id)
    if not authorization_id:
        raise HTTPException(status_code=400, detail="Missing authorization_id")
    try:
        result = await capture_authorization(authorization_id)
    except Exception as e: 
        raise HTTPException(status_code=500, detail=f"Error capturing: {str(e)}")
    try:
        seller_id = int(seller_id)
        transfer_response = await transfer_repository(
            user=user,
            seller_id=seller_id,
            repo_name=repo_name,
            repo_url=repo_url
        )
        print(transfer_response)
        return {"status": "captured", "paypal_response": result}
    except HTTPException as http_exc:
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )


@router.get("/cancel")
async def cancel():
    """
    ❌ Handles payment cancellation.

    Logic:
        - Simply redirects to the cancellation page in the frontend.

    Returns:
        - RedirectResponse: Redirects to the frontend cancellation URL.
    """
    return RedirectResponse(f"{settings.FRONTEND_URL}/cancel")
