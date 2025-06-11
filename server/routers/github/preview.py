from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.github_service import search_repo_tree, fetch_file_from_repo
from database.queries.user import get_token_by_user

app = APIRouter(tags=["views"])


@app.get("/tree")
async def get_repo_tree(repository: str = None, username: str = None, branch: str = "main"):
    """
    🔍 Obtiene el árbol de archivos de un repositorio público o privado de GitHub.

    📥 Parámetros:
        - repository (str): Nombre del repositorio.
        - username (str): Nombre del propietario del repositorio.
        - branch (str): Rama del repositorio a consultar (por defecto "main").

    🧠 Lógica:
        - Busca el token del usuario en la base de datos.
        - Utiliza la API de GitHub para obtener el árbol del repositorio.

    📤 Retorna:
        - Un diccionario con la estructura de archivos del repositorio especificado.
    """
    github_token = get_token_by_user(username=username)

    repo_tree = search_repo_tree(
        owner=username,
        repo=repository,
        branch=branch,
        token=github_token
    )

    return repo_tree


@app.get("/file")
async def get_file(
    path: str = Query(..., description="Ruta del archivo"),
    owner: str = "ExperienceV",
    repo: str = "ChatBot-OpenAI"
):
    """
    📄 Obtiene el contenido de un archivo específico dentro de un repositorio.

    📥 Parámetros:
        - path (str): Ruta del archivo dentro del repositorio (requerido).
        - owner (str): Propietario del repositorio (por defecto "ExperienceV").
        - repo (str): Nombre del repositorio (por defecto "ChatBot-OpenAI").

    🧠 Lógica:
        - Busca el token de GitHub del propietario.
        - Consulta a GitHub el contenido del archivo en la ruta especificada.

    📤 Retorna:
        - Un objeto JSON con el contenido del archivo (puede estar codificado en base64 si es binario).
    """
    token = get_token_by_user(username=owner)
    result = await fetch_file_from_repo(owner, repo, path, token)
    print(result)
    return JSONResponse(content=result)
