from cryptography.fernet import Fernet
from dotenv import load_dotenv
import os

load_dotenv()

fernet = Fernet(os.environ["FERNET_KEY"].encode())

def encrypt_token(token: str) -> str:
    encrypt = fernet.encrypt(token.encode()).decode()
    print(f"Encrypted token: {encrypt}")
    return encrypt

def decrypt_token(encrypted_token: str) -> str:
    return fernet.decrypt(encrypted_token.encode()).decode()
