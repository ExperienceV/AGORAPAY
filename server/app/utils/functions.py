from urllib.parse import urlparse

def github_parse_url(repo_url: str) -> tuple[str, str]:
    """
    Extracts the owner and repository name from a GitHub repository URL.
    """
    path = urlparse(repo_url).path.strip("/")
    parts = path.split("/")
    if len(parts) != 2:
        raise ValueError(f"Invalid URL: {repo_url}")
    return parts[0], parts[1]
