from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from services.github_service import search_repo_tree, fetch_file_from_repo
from database.queries.user import get_token_by_user

app = APIRouter()


@app.get("/tree")
async def get_repo_tree(repository: str = None, username: str = None, branch: str = "main"):
    github_token = get_token_by_user(username=username)

    # Obtener arbol del reposiorio

    repo_tree = search_repo_tree(
        owner=username,
        repo=repository,
        branch=branch,
        token=github_token
    )

    # Enviar arbol del repositorio.
    return repo_tree


@app.get("/file")
async def get_file(
    path: str = Query(..., description="Ruta del archivo"),
    owner: str = "ExperienceV",
    repo: str = "ChatBot-OpenAI"
):
    token = get_token_by_user(username=owner)
    result = await fetch_file_from_repo(owner, repo, path, token)
    print(result)
    return JSONResponse(content=result)