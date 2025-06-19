from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from dotenv import load_dotenv
import os
import sys

is_test = 'pytest' in sys.modules

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

env_file = os.path.join(BASE_DIR, "tests/.env.test") if is_test else os.path.join(BASE_DIR, ".env")
load_dotenv(env_file)

class Settings(BaseSettings):
    # COOKIE SETTINGS
    SAMESITE: str = "none"  
    HTTPONLY: bool = True  
    SECURE: bool = True    
    FRONTEND_URL: str = "https://agorapay.a1devhub.tech"
    BACKEND_URL: str = "https://agoserver.a1devhub.tech"
    DOMAIN: str = ".a1devhub.tech"
    
    # CORS SETTINGS
    CORS_ALLOW_CREDENTIALS: bool = True
    CORS_ALLOW_ORIGINS: list = [
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

    ACCESS_TOKEN_MAX_AGE: int = ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60   # 1 DAY IN SECONDS
    REFRESH_TOKEN_MAX_AGE: int = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60 # 15 DAYS IN SECONDS

    # AUTH SETTINGS
    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    SESSION_SECRET_KEY: str
    FERNET_KEY: str

    # PAYMENT SETTINGS
    PAYPAL_CLIENT_ID: str
    PAYPAL_SECRET: str
    PAYPAL_API_URL: str

    model_config = ConfigDict(env_file=env_file)

settings = Settings()