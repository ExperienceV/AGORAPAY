from fastapi import FastAPI, Request
from starlette.middleware.sessions import SessionMiddleware
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from icecream import ic
from middlewares import TokenRefreshMiddleware
from dotenv import load_dotenv
from config import settings

ic("Iniciando aplicación FastAPI")
app = FastAPI()
ic("Cargando variables de entorno desde .env")
load_dotenv()


# Configuración de CORS más específica
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ALLOW_ORIGINS,
    allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
    allow_methods=settings.CORS_ALLOW_METHODS,
    allow_headers=settings.CORS_ALLOW_HEADERS,
    expose_headers=["Set-Cookie"],
)

ic("Configurando middlewares")
ic("Añadiendo middleware de refresco de token")
app.add_middleware(TokenRefreshMiddleware)
ic("Añadiendo middleware de sesión")
ic("Secret key para sesiones:", os.getenv("SESSION_SECRET_KEY"))
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SESSION_SECRET_KEY")
)

# ic("Configurando manejador de excepciones HTTP")
# @app.exception_handler(StarletteHTTPException)
# async def custom_http_exception_handler(request: Request, exc: StarletteHTTPException):
#     if exc.status_code in (401, 403):
#         ic("Redirigiendo a la página de login debido a error de autenticación")
#         return RedirectResponse(url="/login")
#     ic(f"Excepción HTTP capturada: {exc.status_code} - {exc.detail}")
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail}
#     )

ic("Montando directorio estático para archivos estáticos")
app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/me")
def me(request: Request):
    return {"message": "Hello, World!"} 


ic("Importando routers de diferentes módulos")
from routers.github.auth import router as github_router
from routers.menu.home import router as home_router
from routers.repository.repository import router as repository_router
from routers.pages import router as auth_router


ic("Incluyendo routers en la aplicación FastAPI")
routers = [
    github_router,
    auth_router,
    home_router,
    repository_router
]

ic("Iterando sobre los routers para incluirlos en la aplicación")
for router in routers:
    app.include_router(router)

