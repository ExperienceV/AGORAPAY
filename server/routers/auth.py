from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from utils.security.modules import auth_dependency

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/verify_user")
async def test(user = Depends(auth_dependency)):
    """
    ✅ Verifica que el usuario esté autenticado correctamente.

    📥 Parámetros:
        - user (dict): Usuario autenticado extraído del token JWT.

    🧠 Lógica:
        - Usa la dependencia de autenticación para validar al usuario.

    📤 Retorna:
        - Mensaje de confirmación "autenticado" con código HTTP 200 si la autenticación es exitosa.
    """
    return JSONResponse(content="autenticado", status_code=200)