import pytest
from app.utils.security.modules import auth_dependency
from app.utils.security.signature import create_access_token
from fastapi import Request
from unittest.mock import patch


@pytest.fixture(autouse=True)
def mock_fernet_key():
    """Mock the FERNET_KEY environment variable for tests"""
    import os
    from cryptography.fernet import Fernet
    test_key = Fernet.generate_key()
    with patch.dict(os.environ, {'FERNET_KEY': test_key.decode()}):
        yield

@pytest.mark.asyncio
async def test_auth_dependency():
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

    user = await auth_dependency(
        request=mock_request,
        access_token=f"Bearer {access_token}",
        refresh_token=None
    )
    
    assert isinstance(user, dict)
    assert user["name"] == test_data["name"]

    with pytest.raises(Exception) as exc_info:
        await auth_dependency(
            request=mock_request,
            access_token=None,
            refresh_token=None
        )
    assert "Not authorized" in str(exc_info.value)
