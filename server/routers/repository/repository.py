from fastapi import APIRouter, Depends, HTTPException
from utils.security.modules import auth_dependency
from fastapi.responses import JSONResponse
from models import UploadModel, TransferModel
from database.queries.user import get_token_by_user
from database.queries.repository import set_repository, get_set_repositories, save_transfer_repo
from services.github_service import list_github_repositories, download_github_repo, upload_repo_to_github
from utils.download_upload import parse_github_repo_url
import uuid
from icecream import ic

ic("-- Iniciando el router de repositorios --")
ic("Iniciando router de repositorios")
router = APIRouter(tags=["repository"])

ic("/get_github_repositories: Ruta para obtener los repositorios de GitHub")
@router.get("/get_github_repositories")
async def github_repositories(user: dict = Depends(auth_dependency)) -> list:
    """
    Endpoint to get the repository information.
    """
    ic("Obteniendo repositorios de GitHub para el usuario:", user.get("name"))
    try:
        # get name from user
        ic("Extrayendo nombre de usuario del objeto user")
        name = user.get("name")
        ic("Nombre de usuario:", name)

        # get token from database with user
        ic("Obteniendo token de GitHub para el usuario:", name)
        github_token = get_token_by_user(username=name)
        ic("Token de GitHub obtenido:", github_token)

        # get repository information with token
        ic("Obtendiendo repositorios de GitHub usando el token")
        repositories = list_github_repositories(
            access_token=github_token
            )
        ic("Repositorios obtenidos:", repositories)
        
        # Check if the repositories are empty
        ic("Verificando si se encontraron repositorios")
        if not repositories:
            ic("No se encontraron repositorios para el usuario:", name)
            return JSONResponse(
                status_code=404,
                content={"message": "No repositories found."}
            )
        ic("Repositorios encontrados:", repositories)

        # return the repository information
        ic("Devolviendo la lista de repositorios")
        return repositories
    except HTTPException as http_exc:   
        ic("Excepción HTTP capturada:", http_exc.detail)
        # capture HTTP exceptions and return them directly
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


ic("/upload_repository: Ruta para subir un repositorio")
@router.post("/upload_repository")
async def upload_repository(
    up_model: UploadModel,
    user: dict = Depends(auth_dependency)
) -> dict:
    """
    Endpoint to upload a repository.
    """
    ic("Inicializando subida de repositorio")
    ic("Subiendo repositorio:", up_model.name_repository, "con URL:", up_model.url_repository)
    print("Subiendo repositorio:")
    try:
        # get name from user
        ic("Extrayendo nombre de usuario del objeto user")
        name = user.get("name")

        # get ID from user
        ic("Extrayendo ID de usuario del objeto user")
        user_id = user.get("id")

        # Upload the repository using the service
        ic("Subiendo metadatos del repositorio a la base de datos")
        response = set_repository(
            user_id=user_id,
            name_repository=up_model.name_repository,
            url_repository=up_model.url_repository)

        ic("Respuesta de la base de datos:", response)
        if not response:
            ic("Error al subir el repositorio a la base de datos")
            return JSONResponse(
                status_code=500,
                content={"message": "Algo a sucedido..."}
            )

        ic("Repositorio subido correctamente a la base de datos")
        return response
    except HTTPException as http_exc:
        ic("Excepción HTTP capturada:", http_exc.detail)
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


ic("/get_uploaded_repositories: Ruta para obtener los repositorios subidos por el usuario a la base de datos")
@router.get("/get_uploaded_repositories")
async def get_uploaded_repositories(
    user: dict = Depends(auth_dependency)
) -> list:
    """
    Endpoint to get the uploaded repositories by the user.
    """
    ic("Inicializando obtención de repositorios subidos por el usuario")
    try:
        # get ID from user
        ic("Extrayendo ID de usuario del objeto user")
        user_id = user.get("id")

        # Get the uploaded repositories using the service
        ic("Obteniendo repositorios subidos por el usuario con ID:", user_id)
        repositories = get_set_repositories(user_id)
        ic("Repositorios subidos obtenidos:", repositories)

        if not repositories:
            ic("No se encontraron repositorios subidos por el usuario:", user_id)
            return JSONResponse(
                status_code=404,
                content={"message": "No uploaded repositories found."}
            )

        ic("Devolviendo la lista de repositorios subidos")
        return repositories
    except HTTPException as http_exc:
        ic("Excepción HTTP capturada:", http_exc.detail)
        raise HTTPException(
            status_code=http_exc.status_code,
            detail=http_exc.detail
        )


ic("/transfer_repository: Ruta para transferir un repositorio") 
@router.post("/transfer_repository")
async def transfer_repository(
    tm: TransferModel,
    user: dict = Depends(auth_dependency)
) -> dict:
    """
    Endpoint to transfer a repository from one user to another.
    This endpoint allows a user to transfer a repository from a seller's GitHub account
    """
    ic("Inicializando transferencia de repositorio")
    try:
        ic("Recibiendo solicitud de transferencia de repositorio")

        repo_url = tm.repo_url
        seller_id = tm.seller_id
        repo_name = tm.repo_name

        # Extract owner and repo name from the provided URL
        ic("Analizando URL del repositorio:", repo_url)
        owner, repo_name = parse_github_repo_url(repo_url)
        ic("Owner:", owner, "Repo name:", repo_name)

        # Get tokens for both seller and buyer
        ic("Obteniendo tokens de GitHub para el vendedor y el comprador")
        seller_token = get_token_by_user(user_id=seller_id)
        buyer_token = get_token_by_user(user_id=user["id"])
        ic("Tokens obtenidos:")
        ic(f"Seller token: {'***' if seller_token else None}, Buyer token: {'***' if buyer_token else None}")

        # Get repository information from the seller's account
        ic("Obteniendo repositorios del vendedor con ID:", seller_id)
        data_repo = get_set_repositories(
            user_id=seller_id
        )
        ic("Repositorios del vendedor obtenidos:")
        ic("Obteniendo repo_id del repositorio con URL:", repo_url)
        repo_id = next(
            (repo["repository_id"] for repo in data_repo if repo["url"] == repo_url),
            None
        )
        ic("Repo ID encontrado:", repo_id)

        # Download the repository from the seller's account
        ic("Descargando repositorio del vendedor:", repo_name)
        downloaded_path, temp_dir = download_github_repo(
            owner=owner,
            repo=repo_name,
            access_token=seller_token
        )
        ic("Repositorio descargado en:", downloaded_path, "con directorio temporal:", temp_dir)

        # Upload the repository to the buyer's account
        unique_name = f"{uuid.uuid4()}-{repo_name}"
        ic("Subiendo repositorio al GitHub del comprador con nombre:", unique_name)
        new_repo_url = upload_repo_to_github(
            local_repo_path=downloaded_path,
            new_repo_name=unique_name,
            github_token=buyer_token
        )
        ic("Repositorio subido con éxito. Nueva URL del repositorio:", new_repo_url)

        # Save repo information in the database
        ic("Guardando información del repositorio transferido en la base de datos")
        transfer_response = save_transfer_repo(
            user_id=user["id"],
            repo_name=unique_name,
            repo_url=new_repo_url,
            seller_id=seller_id,
            seller_repo_id=repo_id
        )
        ic("Respuesta de la base de datos al guardar la transferencia:", transfer_response)

        ic("Transferencia de repositorio completada con éxito")
        # Return success message with the new repository URL
        return {
            "message": "Repositorio transferido con éxito",
            "repo_url": transfer_response
        }

    except HTTPException as http_exc:
        ic("Excepción HTTP capturada durante la transferencia de repositorio:", http_exc.detail)
        print(f"HTTPException: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        ic("Excepción inesperada durante la transferencia de repositorio:", str(e))
        print(f"Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))