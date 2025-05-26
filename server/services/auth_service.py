from fastapi import APIRouter, Request
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.responses import HTMLResponse, JSONResponse
from config import settings
from database.queries.user import add_user, get_id_with_username
from pathlib import Path
from utils.security.signature import create_access_token, create_refresh_token

router = APIRouter(prefix="/auth/github", tags=["auth"])

# Get environment variables
config = Config('.env')
oauth = OAuth(config)

def register_github_oauth():
    oauth.register(
        name='github',
        client_id=config('GITHUB_CLIENT_ID'),
        client_secret=config('GITHUB_CLIENT_SECRET'),
        access_token_url='https://github.com/login/oauth/access_token',
        authorize_url='https://github.com/login/oauth/authorize',
        api_base_url='https://api.github.com/',
        client_kwargs={
            'scope': 'user:email repo'
        },
    )

    return oauth