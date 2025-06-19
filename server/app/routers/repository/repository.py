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
    📋 Retrieves the list of GitHub repositories for the authenticated user.

    Parameters:
        - user (dict): Authenticated user extracted from the JWT token.

    Logic:
        - Gets the username and GitHub token from the database.
        - Queries the repositories using the access token.
        - Returns the list of repositories if any exist.

    Returns:
        - List of repositories in JSON format.
        - If no repositories are found, returns a JSON message and 404 code.
        - In case of HTTP error, propagates the corresponding exception.
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
    📤 Uploads (registers) a repository in the database for the authenticated user.

    Parameters:
        - up_model (UploadModel): Model with repository data (name, URL, branch).
        - user (dict): Authenticated user extracted from the JWT token.

    Logic:
        - Extracts the user's ID and name.
        - Registers the repository with the provided data.
        - Returns the registration response or an error if it fails.

    Returns:
        - Response with registered repository information.
        - In case of error, returns a JSON message and 500 code.
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
                content={"message": "Something went wrong..."}
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
    📋 Retrieves the list of repositories uploaded (registered) by the authenticated user.

    Parameters:
        - user (dict): Authenticated user extracted from the JWT token.

    Logic:
        - Extracts the user's ID.
        - Queries the database for repositories uploaded by the user.
        - Returns the list or a message if no repositories exist.

    Returns:
        - List of registered repositories.
        - If no repositories are found, returns a JSON message and 404 code.
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
    🗑️ Deletes a repository registered by the authenticated user.

    Parameters:
        - repo_id (int): ID of the repository to delete.
        - user (dict): Authenticated user extracted from the JWT token.

    Logic:
        - Verifies that the user is the owner of the repository.
        - Deletes the repository if verification is successful.
        - Returns the deletion response.

    Returns:
        - Response with the result of the deletion.
        - In case of error, returns an HTTP exception with error details.
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
