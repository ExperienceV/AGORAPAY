from app.utils.functions import github_parse_url
import pytest

valid_url = "https://github.com/octocat/Hello-World"
invalid_url = "https://github.com/octocat"

def test_parse_with_valid_url():
    parse_url = github_parse_url(repo_url=valid_url)
    assert isinstance(parse_url, tuple)

def test_parse_with_invalid_url():
    with pytest.raises(ValueError, match="Invalid URL"):
        github_parse_url(repo_url=invalid_url)