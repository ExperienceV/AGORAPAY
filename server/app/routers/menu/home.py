from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import  JSONResponse
from app.utils.security.modules import auth_dependency
from app.database.queries.user import get_user_data
from app.database.queries.repository import get_set_repositories

router = APIRouter(tags=["menu"])

@router.get("/get_user_info")
async def get_user_info(
    username: str = None,
    email: str = None, 
    user: dict = Depends(auth_dependency)):
    """
    📋 Retrieves user profile information and their repositories.

    Parameters:
        - username (str, optional): GitHub username. If provided, takes priority.
        - email (str, optional): User's email. Used if `username` is not provided.
        - user (dict): Authenticated user extracted from the JWT token (default if neither `username` nor `email` is provided).

    Logic:
        - Looks up the user profile using `username`, `email`, or authenticated ID.
        - Retrieves the list of repositories uploaded or transferred to the user.
        - Classifies repositories into `uploaded` and `transferred`.

    Returns:
        - A JSON with the following structure:
        ```json
        {
            "user": {
                "profile": {...},                 // User profile data
                "repositories": [...],           // Uploaded repositories
                "transfer_repository": [...]     // Repositories transferred to the user
            }
        }
        ```
        - In case of error (user not found), returns a JSON with error details and the corresponding HTTP code.
    """
    try:
        # Get profile
        if username:
            data_profile = get_user_data(username=username)
        elif email:
            data_profile = get_user_data(email=email)
        else:
            data_profile = get_user_data(user_id=user.get("id"))

        if not data_profile:
            raise HTTPException(status_code=404, detail="User not found.")

        # Get uploaded (and transferred) repositories for the user
        if username:
            all_repos = get_set_repositories(user_name=username)
        elif email:
            all_repos = get_set_repositories(user_email=email)
        else:
            all_repos = get_set_repositories(user_id=user.get("id"))

        if not all_repos:
            all_repos = []

        # Separate uploaded vs transferred
        uploaded = []
        transferred = []

        for repo in all_repos:
            if repo.get("is_transfer"):
                del repo["is_transfer"]
                transferred.append(repo)
            else:
                del repo["is_transfer"]
                uploaded.append(repo)

        # Return final structure
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
