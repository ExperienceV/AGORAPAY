from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse
from pathlib import Path
from utils.security.modules import auth_dependency

router = APIRouter(tags=["pages"])

@router.get("/login", response_class=HTMLResponse)
async def auth_page() -> str:
    path = Path("static/auth.html")
    return path.read_text(encoding="utf-8")

@router.get("/home")
async def home(user: dict = Depends(auth_dependency)):
    return {"message":"hello react!"}
