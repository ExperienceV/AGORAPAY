import httpx
from urllib.parse import quote
import base64
import requests
import tempfile
import subprocess
import shutil
from pathlib import Path
import zipfile
from icecream import ic
from typing import Optional
from app.utils.download_upload import parse_github_repo_url
from fastapi import HTTPException
from app.database.queries.user import get_token_by_user
from app.database.queries.repository import get_set_repositories, save_transfer_repo
import uuid


def download_github_repo(owner: str, repo: str, access_token: str, branch: str = "main") -> tuple[Path, Path]:
    zip_url = f"https://api.github.com/repos/{owner}/{repo}/zipball/{branch}"
    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github+json"
    }
    ic(zip_url, headers)

    response = requests.get(zip_url, headers=headers)
    ic(response.status_code)

    if response.status_code != 200:
        raise Exception(f"Error al descargar el repositorio: {response.status_code} - {response.text}")

    temp_dir = Path(tempfile.mkdtemp())
    zip_path = temp_dir / f"{repo}.zip"
    ic(temp_dir, zip_path)

    with open(zip_path, "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(temp_dir)

    extracted_folders = [f for f in temp_dir.iterdir() if f.is_dir()]
    ic(extracted_folders)

    if not extracted_folders:
        raise Exception("No se encontró carpeta extraída en el ZIP.")

    repo_root_path = extracted_folders[0]
    return repo_root_path, temp_dir


def get_github_username(token: str) -> str:
    url = "https://api.github.com/user"
    headers = {"Authorization": f"token {token}"}
    response = requests.get(url, headers=headers)
    ic(response.status_code)

    if response.status_code != 200:
        raise Exception(f"Error al obtener usuario: {response.status_code} - {response.text}")

    username = response.json()["login"]
    ic(username)
    return username


def download_user_repo(token: str, repo: str, branch: str = "main") -> Path:
    owner = get_github_username(token)
    ic(owner)
    return download_github_repo(owner, repo, token, branch)


def create_github_repo(repo_name: str, token: str, private: bool = True) -> str:
    url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json"
    }
    data = {
        "name": repo_name,
        "private": private,
        "auto_init": False
    }

    ic(url, headers, data)

    response = requests.post(url, headers=headers, json=data)
    ic(response.status_code, response.text)

    if response.status_code != 201:
        raise Exception(f"Error al crear repositorio: {response.text}")

    return response.json()["clone_url"]


def upload_repo_to_github(local_repo_path: Path, new_repo_name: str, github_token: str) -> str:
    ic(local_repo_path, new_repo_name)

    clone_url = create_github_repo(new_repo_name, github_token)
    authed_url = clone_url.replace("https://", f"https://{github_token}@")
    ic(clone_url, authed_url)

    try:
        subprocess.run(["git", "init"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "remote", "add", "origin", authed_url], cwd=local_repo_path, check=True)
        subprocess.run(["git", "add", "."], cwd=local_repo_path, check=True)
        subprocess.run(["git", "commit", "-m", "Importado desde compra en plataforma"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "branch", "-M", "main"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "push", "-u", "origin", "main"], cwd=local_repo_path, check=True)

    except subprocess.CalledProcessError as e:
        ic(e)
        raise Exception(f"Error al subir repositorio a GitHub: {str(e)}")

    finally:
        temp_root = local_repo_path.parent
        ic(f"Eliminando carpeta temporal: {temp_root}")
        shutil.rmtree(temp_root, ignore_errors=True)

    ic("Repositorio subido con éxito")
    return clone_url


def list_github_repositories(access_token: str):
    url = "https://api.github.com/user/repos"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json"
    }
    params = {
        "visibility": "all",
        "affiliation": "owner",
        "per_page": 100
    }

    ic(url, headers, params)

    response = requests.get(url, headers=headers, params=params)
    ic(response.status_code)

    if response.status_code == 200:        
        repos_data = []
        for repo in response.json():            
            repos_data.append({
                "nombre": repo["name"],
                "url": repo["html_url"],
                "visibilidad": "Privado" if repo["private"] else "Público",
                "default_branch": repo["default_branch"],
                "default_branch": repo["default_branch"]
            })
        ic(len(repos_data))
        return repos_data
    else:
        raise Exception(f"Error al obtener repositorios: {response.status_code} - {response.text}")


def search_repo_tree(
    owner: str = "ExperienceV", 
    repo: str = "ChatBot-OpenAI", 
    branch: str = "main",
    token: str = None
):
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }

    if token:
        headers["Authorization"] = f"token {token}"

    try:
        # Obtener el SHA del último commit en el branch
        url_branch = f"https://api.github.com/repos/{owner}/{repo}/branches/{branch}"
        response_branch = requests.get(url_branch, headers=headers)
        response_branch.raise_for_status()
        sha_commit = response_branch.json()["commit"]["sha"]

        # Obtener el árbol del repositorio usando el SHA del commit
        url_tree = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{sha_commit}?recursive=1"
        response_tree = requests.get(url_tree, headers=headers)
        response_tree.raise_for_status()

        return response_tree.json()

    except requests.exceptions.RequestException as e:
        print(f"Error al obtener el árbol del repositorio: {e}")
        return None
    

async def fetch_file_from_repo(
    owner: str,
    repo: str,
    path: str,
    token: Optional[str] = None
) -> dict:
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }
    if token:
        headers["Authorization"] = f"token {token}"

    encoded_path = quote(path)
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{encoded_path}"
    print(f"Url: {url}")

    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers=headers)

    if r.status_code != 200:
        return {
            "content": f"// Error {r.status_code}: no se pudo obtener el archivo"
        }

    data = r.json()
    if "content" not in data:
        return {
            "content": "// El archivo no contiene datos válidos"
        }

    try:
        content = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        preview = "\n".join(content.splitlines()[:30])
        return {"content": preview}
    except Exception as e:
        return {"content": f"// Error al decodificar el archivo: {e}"}


async def transfer_repository(
    user: dict,
    seller_id: int,
    repo_name: str,
    repo_url: str
) -> dict:
    """
    Endpoint to transfer a repository from one user to another.
    This endpoint allows a user to transfer a repository from a seller's GitHub account
    """
    ic("Inicializando transferencia de repositorio")
    try:
        ic("Recibiendo solicitud de transferencia de repositorio")

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
        ic("Guardando información del repositorio transferido en la base de datos")        # Get the branch from the seller's repository
        source_repo = next(
            (repo for repo in data_repo if repo["repository_id"] == repo_id),
            None
        )
        if not source_repo:
            raise Exception("Source repository not found")

        transfer_response = save_transfer_repo(
            user_id=user["id"],
            repo_name=unique_name,
            repo_url=new_repo_url,
            seller_id=seller_id,
            seller_repo_id=repo_id,
            branch=source_repo.get("branch", "main")
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
