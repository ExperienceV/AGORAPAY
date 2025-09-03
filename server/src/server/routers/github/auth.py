from fastapi import APIRouter, Request
from server.services.auth_service import register_github_oauth
from starlette.responses import RedirectResponse, JSONResponse
from server.config import settings
from server.database.queries.user import add_user
from server.utils.security.signature import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth/github", tags=["github"])

@router.get('/login')
async def login_with_github(request: Request):
    """
    Starts the OAuth authentication flow with GitHub.

    Parameters:
        - request (Request): Incoming HTTP request.

    Returns:
        - A redirect to the GitHub authorization endpoint.
    """
    oauth = register_github_oauth()
    redirect_uri = f"{settings.BACKEND_URL}/auth/github/callback"
    return await oauth.github.authorize_redirect(request, redirect_uri)


@router.get("/callback", name="github_callback")
async def github_callback(request: Request):
    """
    Callback that handles GitHub's response after login.

    Parameters:
        - request (Request): HTTP request with the authorization code.

    Logic:
        - Exchanges the code for an access token.
        - Gets user info from GitHub.
        - Registers the user in the database (if not exists).
        - Generates and sets cookies with JWTs (access and refresh).
        - Redirects to the frontend.

    Returns:
        - A redirect to the frontend with cookies set.
    """
    oauth = register_github_oauth()
    token = await oauth.github.authorize_access_token(request)
    access_token = token.get('access_token')

    user_info = await oauth.github.get('user', token=token)
    user = user_info.json()
    username = user.get("login")
    email = user.get("email")

    if not email:
        emails_resp = await oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        if isinstance(emails, list):
            primary_email = next((e["email"] for e in emails if e.get("primary") and e.get("verified")), None)
            email = primary_email or emails[0]["email"]

    if username and email:
        add_response = add_user(name=username, email=email, token=access_token)

    user_id = add_response.get("id")
    access_token = create_access_token(data={"id": user_id, "name": username, "email": email})
    refresh_token = create_refresh_token(data={"id": user_id, "name": username, "email": email})

    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/callback")

    cookie_settings = {
        "httponly": settings.HTTPONLY,
        "secure": settings.SECURE,
        "samesite": settings.SAMESITE,
        "path": "/",
        "domain": settings.DOMAIN
    }

    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        max_age=settings.ACCESS_TOKEN_MAX_AGE,
        **cookie_settings
    )

    response.set_cookie(
        key="refresh_token",
        value=f"Bearer {refresh_token}",
        max_age=settings.REFRESH_TOKEN_MAX_AGE,
        **cookie_settings
    )

    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Origin"] = settings.FRONTEND_URL

    return response


@router.post("/logout")
def logout():
    """
    Logs out the user by deleting authentication cookies.

    Returns:
        - A JSON message indicating the session was closed.
        - Deletes 'access_token' and 'refresh_token' cookies.
    """
    response = JSONResponse(content={"message": "Session closed"})
    response.delete_cookie("access_token", domain=".a1devhub.tech")
    response.delete_cookie("refresh_token", domain=".a1devhub.tech")
    return response
