from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from utils.security.modules import auth_dependency
from database.queries.user import get_user_data
from database.queries.repository import get_set_repositories

router = APIRouter(tags=["menu"])

@router.get("/get_user_info")
async def get_user_info(
    username: str = None,
    email: str = None, 
    user: dict = Depends(auth_dependency)):
    """
    📋 Obtiene información del perfil del usuario y sus repositorios.

    📥 Parámetros:
        - username (str, opcional): Nombre de usuario de GitHub. Si se proporciona, tiene prioridad.
        - email (str, opcional): Correo electrónico del usuario. Se usa si no se proporciona `username`.
        - user (dict): Usuario autenticado extraído del token JWT (por defecto, si no se pasan `username` ni `email`).

    🧠 Lógica:
        - Busca el perfil del usuario usando `username`, `email` o ID autenticado.
        - Recupera la lista de repositorios subidos o transferidos por el usuario.
        - Clasifica los repositorios en `uploaded` y `transferred`.

    📤 Retorna:
        - Un JSON con la siguiente estructura:
        ```json
        {
            "user": {
                "profile": {...},                 // Datos del perfil del usuario
                "repositories": [...],           // Repos subidos por el usuario
                "transfer_repository": [...]     // Repos transferidos al usuario
            }
        }
        ```
        - En caso de error (usuario no encontrado), retorna un JSON con el detalle del error y el código HTTP correspondiente.
    """
    try:
        # Obtener perfil
        if username:
            data_profile = get_user_data(username=username)
        elif email:
            data_profile = get_user_data(email=email)
        else:
            data_profile = get_user_data(user_id=user.get("id"))

        if not data_profile:
            raise HTTPException(status_code=404, detail="User not found.")

        # Obtener repositorios subidos (y transferidos) por el usuario
        if username:
            all_repos = get_set_repositories(user_name=username)
        elif email:
            all_repos = get_set_repositories(user_email=email)
        else:
            all_repos = get_set_repositories(user_id=user.get("id"))

        if not all_repos:
            all_repos = []

        # Separar normales vs transferidos
        uploaded = []
        transferred = []

        for repo in all_repos:
            if repo.get("is_transfer"):
                del repo["is_transfer"]
                transferred.append(repo)
            else:
                del repo["is_transfer"]
                uploaded.append(repo)

        # Retornar estructura final
        user_info = {
            "profile": data_profile,
            "repositories": uploaded,
            "transfer_repository": transferred
        }

        return {"user": user_info}

    except HTTPException as http_exc:
        return JSONResponse(
            status_code=http_exc.status_code,
            content={"detail": http_exc.detail}
        )
