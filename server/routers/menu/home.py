from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from utils.security.modules import auth_dependency
from database.queries.user import get_user_data
from database.queries.repository import get_set_repositories
from icecream import ic

router = APIRouter(tags=["Menu-Home"])
ic("-- Inicio del módulo de menú-home --")

ic("/get_user_info: Ruta para obtener información del usuario")
@router.get("/get_user_info")
async def get_user_info(
    username: str = None,
    email: str = None, 
    user: dict = Depends(auth_dependency)):
    """
    Endpoint to get user profile and repositories.
    """
    ic("Iniciando endpoint get_user_info")
    try:
        # Obtener perfil
        ic("Obteniendo perfil del usuario")
        if username:
            data_profile = get_user_data(username=username)
        elif email:
            data_profile = get_user_data(email=email)
        else:
            data_profile = get_user_data(user_id=user.get("id"))
        ic("Perfil obtenido:", data_profile)

        if not data_profile:
            ic("Perfil no encontrado para el usuario:", user.get("name"))
            raise HTTPException(status_code=404, detail="User not found.")

        # Obtener repositorios subidos (y transferidos) por el usuario
        ic("Obteniendo repositorios del usuario")
        if username:
            all_repos = get_set_repositories(user_name=username)
        elif email:
            all_repos = get_set_repositories(user_email=email)
        else:
            all_repos = get_set_repositories(user_id=user.get("id"))

        if not all_repos:
            ic("No se encontraron repositorios para el usuario:", user.get("name"))
            all_repos = []

        # Separar normales vs transferidos
        uploaded = []
        transferred = []

        ic("Separando repositorios subidos y transferidos")
        for repo in all_repos:
            if repo.get("is_transfer"):
                del repo["is_transfer"]
                transferred.append(repo)
            else:
                del repo["is_transfer"]
                uploaded.append(repo)

        # Retornar estructura final
        ic("Preparando información del usuario")
        user_info = {
            "profile": data_profile,
            "repositories": uploaded,
            "transfer_repository": transferred
        }

        ic("Información del usuario preparada:", user_info)
        ic("Devolviendo información del usuario")
        return {"user": user_info}

    except HTTPException as http_exc:
        ic("Excepción HTTP capturada:", http_exc.detail)
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )


ic("/protected-route: Ruta protegida para verificar autenticación")
@router.get("/protected-route")
async def protected_route(user: dict = Depends(auth_dependency)):
    try:
        return {"user": user}
    except HTTPException as http_exc:
        # Capturar excepciones HTTP y devolverlas directamente
        raise JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )


