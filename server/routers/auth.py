from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from utils.security.modules import auth_dependency

router = APIRouter(prefix="/auth")

@router.get("/verify_user")
async def test(user = Depends(auth_dependency)):
    return JSONResponse(content="autenticado", status_code=200)