from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from server.services.github_service import get_repository_tree, fetch_file_from_repository
from server.database.queries.user import get_token_by_user

router = APIRouter(tags=["views"])


@router.get("/tree")
async def get_repo_tree(repository: str = None, username: str = None, branch: str = "main"):
    """
    🔍 Retrieves the file tree of a public or private GitHub repository.

    Parameters:
        - repository (str): Repository name.
        - username (str): Repository owner's username.
        - branch (str): Branch to query (default "main").

    Logic:
        - Looks up the user's token in the database.
        - Uses the GitHub API to get the repository tree.

    Returns:
        - A dictionary with the file structure of the specified repository.
    """
    github_token = get_token_by_user(username=username)

    repo_tree = get_repository_tree(
        owner=username,
        repo=repository,
        branch=branch,
        token=github_token
    )

    return repo_tree


@router.get("/file")
async def get_file(
    path: str = Query(..., description="File path"),
    owner: str = "ExperienceV",
    repo: str = "ChatBot-OpenAI"
):
    """
    📄 Retrieves the content of a specific file within a repository.

    Parameters:
        - path (str): File path within the repository (required).
        - owner (str): Repository owner (default "ExperienceV").
        - repo (str): Repository name (default "ChatBot-OpenAI").

    Logic:
        - Looks up the owner's GitHub token.
        - Queries GitHub for the file content at the specified path.

    Returns:
        - A JSON object with the file content (may be base64 encoded if binary).
    """
    token = get_token_by_user(username=owner)
    result = await fetch_file_from_repository(owner, repo, path, token)
    print(result)
    return JSONResponse(content=result)
