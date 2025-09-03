import os
import pytest

os.environ["GITHUB_CLIENT_ID"] = "CLIENT_ID"
os.environ["GITHUB_CLIENT_SECRET"] = "CLIENT_SECRET"
os.environ["SESSION_SECRET_KEY"] = "SESSION_SECRET"
os.environ["FERNET_KEY"] = "FERNET_KEY_32CHARS!"

os.environ["PAYPAL_CLIENT_ID"] = "PAYPAL_CLIENT_ID"
os.environ["PAYPAL_SECRET"] = "PAYPAL_SECRET"
os.environ["PAYPAL_API_URL"] = "https://api-m.sandbox.paypal.com"

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure environment variables are set for tests"""
    pass
