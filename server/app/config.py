from pydantic_settings import BaseSettings
from pydantic import field_validator

class Settings(BaseSettings):
    # COOKIE SETTINGS
    SAMESITE: str = "none"  # none para permitir cross-site
    HTTPONLY: bool = True   # True para seguridad
    SECURE: bool = True     # True para conexiones HTTPS
    FRONTEND_URL: str = "https://agorapay.a1devhub.tech"
    BACKEND_URL: str = "https://agoserver.a1devhub.tech"
    DOMAIN: str = ".a1devhub.tech"
    
    # Configuración de CORS
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_ORIGINS: list =[
        "https://agorapay.a1devhub.tech"
    ]
    CORS_ALLOW_METHODS: list = ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    CORS_ALLOW_HEADERS: list = [
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "X-Requested-With"
    ]

    # SIGNATURE SETTINGS
    DEFAULT_PASSWORD: str = "如果我能说人和天使的语言，却没有爱，我就像一个响亮的锣或一个响亮的钹一样。 2我若有预言的恩赐，也明白一切神圣的秘密和一切知识，并且有全备的信，能够移山，却没有爱，我就算不得什么。"
    SECRET_KEY: str = "secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_DAYS: int = 1  # 1 Days
    REFRESH_TOKEN_EXPIRE_DAYS: int = 15  # 15 Days

    ACCESS_TOKEN_MAX_AGE: int = ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60   # 15 DAYS ON SECONDS
    REFRESH_TOKEN_MAX_AGE: int = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 # 30 DAYS ON SECONDS

    # AUTH SETTINGS
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    SESSION_SECRET_KEY: str
    FERNET_KEY: str

    # PAYMENT SETTINGS
        # PAYPAL:
    PAYPAL_CLIENT_ID: str
    PAYPAL_SECRET: str
    PAYPAL_API_URL: str

    class Config:
        env_file = ".env"

settings = Settings()