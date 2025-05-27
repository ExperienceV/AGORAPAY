from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from database.queries.user import get_token_by_user
from utils.security.modules import auth_dependency
from pathlib import Path
from icecream import ic

ic("-- Inicio del módulo de páginas --")
ic("Iniciando router de páginas")
router = APIRouter(tags=["pages"])

ic("/login: Ruta para la página de autenticación")
@router.get("/login", response_class=HTMLResponse)
async def auth_page() -> str:
    path = Path("static/auth.html")
    return path.read_text(encoding="utf-8")

ic("/home: Ruta para la página principal")
@router.get("/home", response_class=HTMLResponse)
async def home(user: dict = Depends(auth_dependency)):
    try:
        path = Path("static/index.html")
        return path.read_text(encoding="utf-8")
    except HTTPException as http_exc:
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )
