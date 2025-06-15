from typing import Optional
from fastapi import Cookie, Request
from app.utils.security.signature import get_current_user
from icecream import ic

async def auth_dependency(
    request: Request,
    access_token: Optional[str] = Cookie(None),
    refresh_token: Optional[str] = Cookie(None)
) -> dict:
    """
    Dependency function that wraps get_current_user for FastAPI DI system
    """
    # Handle OPTIONS preflight requests
    if request.method == "OPTIONS":
        return {"name": "preflight"}
    
    user = get_current_user(request, access_token, refresh_token)
    ic(user)
    return user
