from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from server.config import settings
from icecream import ic

# Middleware to refresh the access token
class TokenRefreshMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            if request.method == "OPTIONS":
                return await call_next(request)

            response = await call_next(request)
            new_token = getattr(request.state, "new_token", None)

            if new_token:
                modified_response = JSONResponse(
                    content={"detail": "Token refreshed"},
                    status_code=response.status_code,
                )
                modified_response.set_cookie(
                    key="access_token",
                    value=f"Bearer {new_token}",
                    httponly=settings.HTTPONLY,
                    secure=settings.SECURE,
                    samesite=settings.SAMESITE,
                    max_age=settings.ACCESS_TOKEN_MAX_AGE
                )
                return modified_response

            return response
        except HTTPException as http_exc:
            return JSONResponse(
                status_code=http_exc.status_code,
                content={"detail": http_exc.detail}
            )