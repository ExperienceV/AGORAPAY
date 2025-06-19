import os
import pytest

os.environ["GITHUB_CLIENT_ID"] = "········lmrzAs"
os.environ["GITHUB_CLIENT_SECRET"] = "········72f1842ec48"
os.environ["SESSION_SECRET_KEY"] = "········Uq5829xSE="
os.environ["FERNET_KEY"] = "········Ep9IJl0="

os.environ["PAYPAL_CLIENT_ID"] = "········VnjgqL"
os.environ["PAYPAL_SECRET"] = "········AZxQ"
os.environ["PAYPAL_API_URL"] = "https://api-m.sandbox.paypal.com"

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure environment variables are set for tests"""
    pass
