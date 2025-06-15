from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.security.modules import auth_dependency
from fastapi.responses import JSONResponse
from app.models import UploadModel
from app.database.queries.user import get_token_by_user
from app.database.queries.repository import set_repository, get_set_repositories, delete_repository
from app.services.github_service import list_github_repositories

router = APIRouter(tags=["repository"])

@router.get("/get_github_repositories")
async def github_repositories(user: dict = Depends(auth_dependency)) -> list:
    """
    📋 Obtiene la lista de repositorios de GitHub del usuario autenticado.

    📥 Parámetros:
        - user (dict): Usuario autenticado extraído del token JWT.

    🧠 Lógica:
        - Obtiene el nombre de usuario y token GitHub desde la base de datos.
        - Consulta los repositorios usando el token de acceso.
        - Retorna la lista de repositorios si existen.

    📤 Retorna:
        - Lista de repositorios en formato JSON.
        - En caso de no encontrar repositorios, retorna un JSON con mensaje y código 404.
        - En caso de error HTTP, propaga la excepción correspondiente.
    """
    try:
        # get name from user
        name = user.get("name")

        # get token from database with user
        github_token = get_token_by_user(username=name)

        # get repository information with token
        repositories = list_github_repositories(
            access_token=github_token
            )
        
        # Check if the repositories are empty
        if not repositories:
            return JSONResponse(
                status_code=404,
                content={"message": "No repositories found."}
            )

        # return the repository information
        return repositories
    except HTTPException as http_exc:   
        # capture HTTP exceptions and return them directly
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


@router.post("/upload_repository")
async def upload_repository(
    up_model: UploadModel,
    user: dict = Depends(auth_dependency)
) -> dict:
    """
    📤 Sube (registra) un repositorio en la base de datos para el usuario autenticado.

    📥 Parámetros:
        - up_model (UploadModel): Modelo con datos del repositorio (nombre, URL, rama).
        - user (dict): Usuario autenticado extraído del token JWT.

    🧠 Lógica:
        - Extrae el ID y nombre del usuario.
        - Registra el repositorio con los datos proporcionados.
        - Retorna la respuesta del registro o un error en caso de fallo.

    📤 Retorna:
        - Respuesta con información del repositorio registrado.
        - En caso de error, retorna un JSON con mensaje y código 500.
    """
    try:
        # get name from user
        name = user.get("name")

        # get ID from user
        user_id = user.get("id")

        # Upload the repository using the service
        response = set_repository(
            user_id=user_id,     
            price=up_model.price,
            name_repository=up_model.name_repository,
            url_repository=up_model.url_repository,
            branch=up_model.branch
        )

        if not response:
            return JSONResponse(
                status_code=500,
                content={"message": "Algo a sucedido..."}
            )
        return response
    except HTTPException as http_exc:
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


@router.get("/get_uploaded_repositories")
async def get_uploaded_repositories(
    user: dict = Depends(auth_dependency)
) -> list:
    """
    📋 Obtiene la lista de repositorios subidos (registrados) por el usuario autenticado.

    📥 Parámetros:
        - user (dict): Usuario autenticado extraído del token JWT.

    🧠 Lógica:
        - Extrae el ID del usuario.
        - Consulta la base de datos para obtener los repositorios subidos por el usuario.
        - Retorna la lista o un mensaje si no existen repositorios.

    📤 Retorna:
        - Lista de repositorios registrados.
        - En caso de no encontrar repositorios, retorna un JSON con mensaje y código 404.
    """
    try:
        # get ID from user
        user_id = user.get("id")

        # Get the uploaded repositories using the service
        repositories = get_set_repositories(user_id)

        if not repositories:
            return JSONResponse(
                status_code=404,
                content={"message": "No uploaded repositories found."}
            )

        return repositories
    except HTTPException as http_exc:
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


@router.delete("/delete_repository/{repo_id}")
async def delete_repository_endpoint(
    repo_id: int,
    user: dict = Depends(auth_dependency)
) -> dict:
    """
    🗑️ Elimina un repositorio registrado por el usuario autenticado.

    📥 Parámetros:
        - repo_id (int): ID del repositorio a eliminar.
        - user (dict): Usuario autenticado extraído del token JWT.

    🧠 Lógica:
        - Verifica que el usuario es el propietario del repositorio.
        - Elimina el repositorio si la verificación es exitosa.
        - Retorna la respuesta de eliminación.

    📤 Retorna:
        - Respuesta con resultado de la eliminación.
        - En caso de error, retorna excepción HTTP con detalle del error.
    """
    try:
        # get ID from user
        user_id = user.get("id")

        # Delete the repository
        response = delete_repository(repo_id=repo_id, user_id=user_id)

        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
