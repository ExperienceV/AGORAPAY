from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from server.middlewares import TokenRefreshMiddleware
from dotenv import load_dotenv
from server.config import settings
import os

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

from server.routers.github.auth import router as github_router
from server.routers.menu.home import router as home_router
from server.routers.auth import router as auth_router
from server.routers.repository.repository import router as repository_router
from server.routers.paypal.orders import router as paypal_router
from server.routers.github.preview import router as preview_router

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

