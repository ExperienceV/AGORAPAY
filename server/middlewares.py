from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from config import settings
from icecream import ic

# Middleware to refresh the access token
class TokenRefreshMiddleware(BaseHTTPMiddleware):
    try:   
        async def dispatch(self, request: Request, call_next):
            # Execute the request and get the response
            ic("Ejecutando middleware de refresco de token")
            response = await call_next(request)
            
            # Verify if the response has a new token
            ic("Verificando si hay un nuevo token en la respuesta")
            new_token = getattr(request.state, "new_token", None)
            
            if new_token:
                ic("Nuevo token encontrado:", new_token)
                ic("Agregando nuevo access_token")
                modified_response = JSONResponse(
                    content={"detail": "Token refreshed"},
                    status_code=response.status_code,
                )
                
                # 🔄 Añadir la cookie al nuevo token
                ic("Añadiendo cookie de access_token")
                modified_response.set_cookie(
                    key="access_token",
                    value=f"Bearer {new_token}",
                    httponly=settings.HTTPONLY,
                    secure=settings.SECURE,  # True en producción (HTTPS)
                    samesite=settings.SAMESITE,
                    max_age=settings.ACCESS_TOKEN_MAX_AGE # 15 DAYS
                )
                ic("Cookie de access_token añadida correctamente")
                return modified_response
            
            ic("No se encontró un nuevo token, devolviendo la respuesta original")
            return response
    except HTTPException as http_exc:
        # Capturar excepciones HTTP y devolverlas directamente
        ic("Excepción HTTP capturada:", http_exc)
        raise JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )