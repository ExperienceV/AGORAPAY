import os
import pytest

# Configuración de variables de entorno para GitHub
os.environ["GITHUB_CLIENT_ID"] = "Ov23li2pVUvp5almrzAs"
os.environ["GITHUB_CLIENT_SECRET"] = "7e0c91cf0eff75b6c3a94642c92ae72f1842ec48"
os.environ["SESSION_SECRET_KEY"] = "xCXZ__jjKMDdjK_h7v3JtMHZO2VzFMaDbKUq5829xSE="
os.environ["FERNET_KEY"] = "57p8K_CiQ5nqLOaYguwaRkB0hBqt9cAYwwXXEp9IJl0="

# Configuración de variables de entorno para PayPal
os.environ["PAYPAL_CLIENT_ID"] = "ARL8xdfkLtoCx9RsRjPOvIZ0Y6v-w5ulupH_L7MoM1esmKJGoNAFO-wXrmnXhAmMqKHhHVzl7vVnjgqL"
os.environ["PAYPAL_SECRET"] = "EHeCNeRijztBz6_r6Bda55YlsN3vt4I1IzvIgAUTVe0EIq97-EM1J_5Ah9-FLFZS3Z9_Y6kj8ef4AZxQ"
os.environ["PAYPAL_API_URL"] = "https://api-m.sandbox.paypal.com"

@pytest.fixture(autouse=True)
def setup_test_env():
    """Ensure environment variables are set for tests"""
    pass
