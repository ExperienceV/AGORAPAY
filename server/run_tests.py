import os
import sys
import pytest

# Set test environment variables
os.environ["GITHUB_CLIENT_ID"] = "test_github_client_id"
os.environ["GITHUB_CLIENT_SECRET"] = "test_github_client_secret"
os.environ["SESSION_SECRET_KEY"] = "test_session_secret_key"
os.environ["FERNET_KEY"] = "test_fernet_key"
os.environ["PAYPAL_CLIENT_ID"] = "test_paypal_client_id"
os.environ["PAYPAL_SECRET"] = "test_paypal_secret"
os.environ["PAYPAL_API_URL"] = "https://api-m.sandbox.paypal.com"

if __name__ == "__main__":
    # Get the test file path from command line arguments
    test_path = sys.argv[1] if len(sys.argv) > 1 else "tests"
    # Run pytest with the specified path
    sys.exit(pytest.main(["-v", test_path]))
