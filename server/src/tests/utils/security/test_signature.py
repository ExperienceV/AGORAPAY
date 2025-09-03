import pytest
from unittest.mock import patch
from app.utils.security.signature import (
    create_access_token,
    create_refresh_token,
    verify_token,
    get_current_user,
)

@pytest.fixture(autouse=True)
def mock_fernet_key():
    """Mock the FERNET_KEY environment variable for tests"""
    import os
    from cryptography.fernet import Fernet
    test_key = Fernet.generate_key()
    with patch.dict(os.environ, {'FERNET_KEY': test_key.decode()}):
        yield

def test_create_access_token():
    data = {"sub": "test_user", "name": "Test User"}
    token = create_access_token(data=data)
    
    assert isinstance(token, str)
    assert len(token) > 0

def test_create_refresh_token():
    data = {"sub": "test_user", "name": "Test User"}
    token = create_refresh_token(data=data)
    
    assert isinstance(token, str)
    assert len(token) > 0

def test_verify_acces_token():
    data = {"sub": "test_user", "name": "Test User"}    
    access_token = create_access_token(data=data)
    payload = verify_token(access_token)
    assert isinstance(payload, dict)
    assert payload["sub"] == data["sub"]
    assert payload["name"] == data["name"]

def test_verify_refresh_token():
    data = {"sub": "test_user", "name": "Test User"}    
    refresh_token = create_refresh_token(data=data)
    payload = verify_token(refresh_token)
    assert isinstance(payload, dict)
    assert payload["sub"] == data["sub"]
    assert payload["name"] == data["name"]

def test_get_current_user():
    from fastapi import Request

    test_data = {"sub": "test_user", "name": "Test User"}
    access_token = create_access_token(data=test_data)
    
    mock_request = Request(scope={
        "type": "http",
        "headers": [],
        "method": "GET",
        "scheme": "http",
        "server": ("testserver", 80),
        "path": "/",
    })

    user = get_current_user(
        request=mock_request,
        access_token=f"Bearer {access_token}",
        refresh_token=None
    )
    
    assert isinstance(user, dict)
    assert user["name"] == test_data["name"]

    with pytest.raises(Exception) as exc_info:
        get_current_user(
            request=mock_request,
            access_token=None,
            refresh_token=None
        )
    assert "Not authorized" in str(exc_info.value)
