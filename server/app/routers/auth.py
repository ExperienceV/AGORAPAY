from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from app.utils.security.modules import auth_dependency

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/verify_user")
async def verify_user(user=Depends(auth_dependency)):
    """
    ✅ Verifies that the user is properly authenticated.

    Parameters:
        - user (dict): Authenticated user extracted from the JWT token.

    Logic:
        - Uses the authentication dependency to validate the user.

    Returns:
        - Confirmation message "authenticated" with HTTP 200 code if authentication is successful.
    """
    return JSONResponse(content="authenticated", status_code=200)