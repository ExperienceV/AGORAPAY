import requests
import tempfile
import subprocess
import shutil
from pathlib import Path
import zipfile
from icecream import ic


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
                "visibilidad": "Privado" if repo["private"] else "Público"
            })
        ic(len(repos_data))
        return repos_data
    else:
        raise Exception(f"Error al obtener repositorios: {response.status_code} - {response.text}")
