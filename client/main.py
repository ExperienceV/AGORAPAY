from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
import os
from app.middlewares import TokenRefreshMiddleware
from dotenv import load_dotenv
from app.config import settings

app = FastAPI()
load_dotenv()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    expose_headers=["*"],
    max_age=3600
)

app.add_middleware(TokenRefreshMiddleware)
app.add_middleware(
   SessionMiddleware, 
   secret_key=os.getenv("SESSION_SECRET_KEY")
)

from app.routers.github.auth import router as github_router
from app.routers.menu.home import router as home_router
from app.routers.auth import router as auth_router
from app.routers.repository.repository import router as repository_router
from app.routers.paypal.orders import router as paypal_router
from app.routers.github.preview import app as preview_router

routers = [
    github_router,
    home_router,
    auth_router,
    repository_router,
    preview_router,
    paypal_router
]

for router in routers:
    app.include_router(router)
