from fastapi import APIRouter, Request
from services.auth_service import register_github_oauth
from starlette.responses import RedirectResponse
from config import settings
from database.queries.user import add_user
from pathlib import Path
from utils.security.signature import create_access_token, create_refresh_token
from icecream import ic

ic("-- Inicio del módulo de autenticación con GitHub --")
router = APIRouter(prefix="/auth/github", tags=["auth"])



# Define the redirect URI
ic("/login: Ruta para iniciar sesión con GitHub")
@router.get('/login')
async def login_with_github(request: Request):
    ic("Iniciando sesión con GitHub")
    oauth = register_github_oauth()
    redirect_uri = request.url_for('github_callback')
    return await oauth.github.authorize_redirect(request, redirect_uri)


ic("/callback: Ruta de callback para GitHub")
# Define the callback endpoint
@router.get("/callback", name="github_callback")    
async def github_callback(request: Request):
    ic("Procesando callback de GitHub")
    oauth = register_github_oauth()
    # get the authorization response
    token = await oauth.github.authorize_access_token(request)

    # get the access token
    access_token = token.get('access_token')

    # get the user info
    user_info = await oauth.github.get('user', token=token)
    user = user_info.json()

    # get the user name
    username = user.get("login")

    # get the user email
    email = user.get("email")
    if not email:
        emails_resp = await oauth.github.get('user/emails', token=token)
        emails = emails_resp.json()
        if isinstance(emails, list):
            primary_email = next((e["email"] for e in emails if e.get("primary") and e.get("verified")), None)
            email = primary_email or emails[0]["email"]

    # add user to the database
    if username and email:
        add_response = add_user(name=username, email=email, token=access_token)

    # get the user ID
    user_id = add_response.get("id")

    # create JWT tokens
    ic("Creando tokens JWT para el usuario")
    access_token = create_access_token(data={"id": user_id, "name": username, "email": email})
    refresh_token = create_refresh_token(data={"id": user_id, "name": username, "email": email})


    # Create response with specific headers
    frontend_callback_url = f"{settings.FRONTEND_URL}/callback"
    response = RedirectResponse(url=frontend_callback_url)
    
    # Configurar las cookies con la configuración correcta
    cookie_settings = {
        "httponly": settings.HTTPONLY,
        "secure": settings.SECURE,
        "samesite": settings.SAMESITE,
        "domain": "a1devhub.tech",  # Dominio principal
        "path": "/"  # Accesible en todas las rutas
    }

    # Establecer cookies de autenticación
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

    # Agregar headers específicos para CORS
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Origin"] = settings.FRONTEND_URL
    
    ic("Respuesta preparada con cookies de autenticación")
    return response


