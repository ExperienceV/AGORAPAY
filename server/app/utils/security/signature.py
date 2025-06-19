from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from jose.exceptions import ExpiredSignatureError
from fastapi import HTTPException, status, Cookie, Request
from typing import Optional
from fastapi.security import HTTPBearer
from icecream import ic
from app.config import settings

# Authentication security scheme
security = HTTPBearer()

def create_access_token(data: dict):
    """
    Create an access token JWT.
    - data: Data to include in the token (e.g., user name).
    - exp: Expiration time of the token (15 minutes by default).
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_MAX_AGE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict):
    """
    Create a refresh token JWT.
    - data: Data to include in the token (e.g., user name).
    - exp: Expiration time of the token (15 days by default).   
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_MAX_AGE)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_token(token: str):
    """
    verify_token: Verify a token JWT.
    - token: Token to verify.
    - If token is valid: Return a payload decode.
    - If token is invalid: Raise a exception.       
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token, please login again.",
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

        # 1. first check if tokens are provided
        if not access_token and not refresh_token:
            ic("No tokens provided")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unathorize, login."
            )


        # 2. Next, check if access token is provided
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
                detail="Expired token, please login again."
            )
        except JWTError:
            ic("Invalid token error")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid token, please login again."
            )

    except HTTPException:
        # Re-raise the HTTPException to be handled by FastAPI
        raise
    except Exception as e:
        ic("Unexpected error", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Server error, please try again later."
        )