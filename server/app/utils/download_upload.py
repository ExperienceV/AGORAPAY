from urllib.parse import urlparse

def parse_github_repo_url(repo_url: str) -> tuple[str, str]:
    """
    Extrae el owner y nombre del repositorio desde la URL completa de GitHub.
    """
    path = urlparse(repo_url).path.strip("/")
    parts = path.split("/")
    if len(parts) != 2:
        raise ValueError(f"URL inválida: {repo_url}")
    return parts[0], parts[1]
