from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import HTTPException, status, Cookie, Request
from typing import Optional
from fastapi.security import HTTPBearer
from icecream import ic
from app.config import settings

# Esquema de autenticación Bearer
security = HTTPBearer()

def create_access_token(data: dict):
    """
    Crea un token JWT de acceso.
    - data: Datos a incluir en el token (por ejemplo, el nombre de usuario).
    - exp: Tiempo de expiración del token (15 minutos por defecto).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_MAX_AGE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict):
    """
    Crea un token JWT de refresco.
    - data: Datos a incluir en el token.
    - exp: Tiempo de expiración del token (7 días por defecto).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_MAX_AGE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str):
    """
    Verifica la validez de un token JWT.
    - token: Token JWT a verificar.
    - Retorna el payload del token si es válido.
    - Lanza una excepción HTTP 401 si el token es inválido o ha expirado.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
        )

def get_current_user(
        request: Request,
        access_token: Optional[str] = Cookie(None),
        refresh_token: Optional[str] = Cookie(None)) -> dict:
    """
    Get current authenticated user by validating JWT tokens.
    """
    try:
        ic("Token check started")

        # 1. Primero verifica si no hay tokens
        if not access_token and not refresh_token:
            ic("No tokens provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No estás autorizado, inicia sesión."
            )


        # 2. Luego maneja los casos específicos de JWT
        try:
            if not access_token:
                ic("Access token missing, using refresh token")
                payload = jwt.decode(refresh_token.replace("Bearer ", ""), 
                                  settings.SECRET_KEY, 
                                  algorithms=[settings.ALGORITHM])
                
                new_access_token = create_access_token(data=payload)
                request.state.new_token = new_access_token
                return {"name": payload["name"]}
            
            clean_token = access_token.replace("Bearer ", "")
            payload = verify_token(clean_token)
            return payload

        except ExpiredSignatureError:
            ic("Token expired error")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token expirado"
            )
        except JWTError:
            ic("Invalid token error")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token inválido"
            )

    except HTTPException:
        # Re-lanzar las HTTPException que ya hemos definido
        raise
    except Exception as e:
        ic("Unexpected error", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error interno del servidor"
        )