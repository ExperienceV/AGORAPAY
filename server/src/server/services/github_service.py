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
from server.utils.functions import github_parse_url
from fastapi import HTTPException
from server.database.queries.user import get_token_by_user
from server.database.queries.repository import get_set_repositories, save_transfer_repo


def download_github_repository(owner: str, repo: str, access_token: str, branch: str = "main") -> tuple[Path, Path]:
    """
    Download a GitHub repository as a ZIP and extract it to a temporary directory.
    Returns the path to the extracted repo root and the temp directory.
    """
    zip_url = f"https://api.github.com/repos/{owner}/{repo}/zipball/{branch}"
    headers = {
        "Authorization": f"token {access_token}",
        "Accept": "application/vnd.github+json"
    }
    ic(zip_url, headers)

    response = requests.get(zip_url, headers=headers)
    ic(response.status_code)

    if response.status_code != 200:
        raise Exception(f"Failed to download repository: {response.status_code} - {response.text}")

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
        raise Exception("No extracted folder found in ZIP.")

    repo_root_path = extracted_folders[0]
    return repo_root_path, temp_dir


def get_github_username(token: str) -> str:
    """
    Retrieve the GitHub username associated with the provided token.
    """
    url = "https://api.github.com/user"
    headers = {"Authorization": f"token {token}"}
    response = requests.get(url, headers=headers)
    ic(response.status_code)

    if response.status_code != 200:
        raise Exception(f"Failed to get user: {response.status_code} - {response.text}")

    username = response.json()["login"]
    ic(username)
    return username


def download_user_repository(token: str, repo: str, branch: str = "main") -> Path:
    """
    Download a repository for the authenticated user.
    """
    owner = get_github_username(token)
    ic(owner)
    return download_github_repository(owner, repo, token, branch)


def create_github_repository(repo_name: str, token: str, private: bool = True) -> str:
    """
    Create a new GitHub repository for the authenticated user.
    Returns the clone URL.
    """
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
        raise Exception(f"Failed to create repository: {response.text}")

    return response.json()["clone_url"]


def upload_repository_to_github(local_repo_path: Path, new_repo_name: str, github_token: str) -> str:
    """
    Upload a local repository to a new GitHub repository.
    Returns the new repository's clone URL.
    """
    ic(local_repo_path, new_repo_name)

    clone_url = create_github_repository(new_repo_name, github_token)
    authed_url = clone_url.replace("https://", f"https://{github_token}@")
    ic(clone_url, authed_url)

    try:
        subprocess.run(["git", "init"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "remote", "add", "origin", authed_url], cwd=local_repo_path, check=True)
        subprocess.run(["git", "add", "."], cwd=local_repo_path, check=True)
        subprocess.run(["git", "commit", "-m", "Imported from AgoraPay platform"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "branch", "-M", "main"], cwd=local_repo_path, check=True)
        subprocess.run(["git", "push", "-u", "origin", "main"], cwd=local_repo_path, check=True)

    except subprocess.CalledProcessError as e:
        ic(e)
        raise Exception(f"Failed to upload repository to GitHub: {str(e)}")

    finally:
        temp_root = local_repo_path.parent
        ic(f"Deleting temporary folder: {temp_root}")
        shutil.rmtree(temp_root, ignore_errors=True)

    ic("Repository uploaded successfully")
    return clone_url


def list_github_repositories(access_token: str):
    """
    List all repositories for the authenticated user.
    """
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
                "name": repo["name"],
                "url": repo["html_url"],
                "visibility": "Private" if repo["private"] else "Public",
                "default_branch": repo["default_branch"]
            })
        ic(len(repos_data))
        return repos_data
    else:
        raise Exception(f"Failed to get repositories: {response.status_code} - {response.text}")


def get_repository_tree(
    owner: str,
    repo: str,
    branch: str = "main",
    token: Optional[str] = None
):
    """
    Get the file tree of a repository for a given branch.
    """
    headers = {
        "Accept": "application/vnd.github.v3+json"
    }

    if token:
        headers["Authorization"] = f"token {token}"

    try:
        # Get the SHA of the latest commit in the branch
        url_branch = f"https://api.github.com/repos/{owner}/{repo}/branches/{branch}"
        response_branch = requests.get(url_branch, headers=headers)
        response_branch.raise_for_status()
        sha_commit = response_branch.json()["commit"]["sha"]

        # Get the repository tree using the commit SHA
        url_tree = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{sha_commit}?recursive=1"
        response_tree = requests.get(url_tree, headers=headers)
        response_tree.raise_for_status()

        return response_tree.json()

    except requests.exceptions.RequestException as e:
        print(f"Failed to get repository tree: {e}")
        return None
    

async def fetch_file_from_repository(
    owner: str,
    repo: str,
    path: str,
    token: Optional[str] = None
) -> dict:
    """
    Fetch a file's content from a GitHub repository.
    Returns a preview (first 30 lines) of the file content.
    """
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
            "content": f"// Error {r.status_code}: could not fetch the file"
        }

    data = r.json()
    if "content" not in data:
        return {
            "content": "// The file does not contain valid data"
        }

    try:
        content = base64.b64decode(data["content"]).decode("utf-8", errors="ignore")
        preview = "\n".join(content.splitlines()[:30])
        return {"content": preview}
    except Exception as e:
        return {"content": f"// Error decoding file: {e}"}


async def transfer_repository(
    user: dict,
    seller_id: int,
    repo_name: str,
    repo_url: str
) -> dict:
    """
    Transfer a repository from a seller to a buyer (current user).
    Downloads the repo from the seller's account and uploads it to the buyer's account.
    """
    ic("Initializing repository transfer")
    try:
        ic("Received repository transfer request")
        # Extract owner and repo name from the provided URL
        ic("Parsing repository URL:", repo_url)
        owner, repo_name = github_parse_url(repo_url)
        ic("Owner:", owner, "Repo name:", repo_name)

        # Get tokens for both seller and buyer
        ic("Getting GitHub tokens for seller and buyer")
        seller_token = get_token_by_user(user_id=seller_id)
        buyer_token = get_token_by_user(user_id=user["id"])
        ic("Tokens obtained:")
        ic(f"Seller token: {'***' if seller_token else None}, Buyer token: {'***' if buyer_token else None}")

        # Get repository information from the seller's account
        ic("Getting seller's repositories with ID:", seller_id)
        seller_repos = get_set_repositories(user_id=seller_id)
        ic("Seller's repositories obtained:")
        ic("Getting repo_id for repository with URL:", repo_url)
        repo_id = next(
            (repo["repository_id"] for repo in seller_repos if repo["url"] == repo_url),
            None
        )
        ic("Repo ID found:", repo_id)

        # Download the repository from the seller's account
        ic("Downloading seller's repository:", repo_name)
        downloaded_path, temp_dir = download_github_repository(
            owner=owner,
            repo=repo_name,
            access_token=seller_token
        )
        ic("Repository downloaded at:", downloaded_path, "with temp dir:", temp_dir)

        # Upload the repository to the buyer's account
        unique_name = f"AgoraPay-{repo_name}"
        ic("Uploading repository to buyer's GitHub with name:", unique_name)
        new_repo_url = upload_repository_to_github(
            local_repo_path=downloaded_path,
            new_repo_name=unique_name,
            github_token=buyer_token
        )
        ic("Repository uploaded successfully. New repository URL:", new_repo_url)

        # Save repo information in the database
        ic("Saving transferred repository information in the database")
        source_repo = next(
            (repo for repo in seller_repos if repo["repository_id"] == repo_id),
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
        ic("Database response after saving transfer:", transfer_response)

        ic("Repository transfer completed successfully")
        return {
            "message": "Repository transferred successfully",
            "repo_url": transfer_response
        }

    except HTTPException as http_exc:
        ic("HTTPException caught during repository transfer:", http_exc.detail)
        print(f"HTTPException: {http_exc.detail}")
        raise http_exc
    except Exception as e:
        ic("Unexpected exception during repository transfer:", str(e))
        print(f"Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
