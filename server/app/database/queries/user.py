from sqlalchemy.orm import Session
from app.database.config import Base, engine, SessionLocal
from app.database.models.user import User
from app.utils.security.crypt_token import encrypt_token, decrypt_token
from typing import Optional
from icecream import ic
ic("-- Starting user queries module --")
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
ic("Defining get_db function to obtain the database session")
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# Function to add or update a user in the database
ic("Defining add_user function to add or update a user")
def add_user(name: str, email: str, token: str):
    db = get_db()
    try:
        ic("Starting transaction to add or update user")
        # Encrypt the token before storing it
        ic("Encrypting user's token")
        encrypted = encrypt_token(token)
        # search for the user by email
        ic("Searching for user by email:", email)
        user = db.query(User).filter(User.email == email).first()
        ic("Updating or creating user")
        if user:
            ic("User found, updating token")
            user.github_token_encrypted = encrypted
            db.commit()
            db.refresh(user)
            ic("User token updated successfully")
            return {"message": "User token updated", "id": user.id}
        else:
            ic("User not found, creating new user")
            new_user = User(username=name, email=email, github_token_encrypted=encrypted)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            ic("New user created successfully")
            return {"message": "User created", "id": new_user.id}
    finally:
        ic("Closing database session")
        db.close()

# Function to get user data by username, email, or user_id
ic("Defining get_user_data function to get user data")
def get_user_data(
        db: Session = SessionLocal(), 
        username: Optional[str] = None, 
        email: Optional[str] = None,
        user_id: Optional[int] = None
        ) -> Optional[str]:
    ic("Starting query to get user data")
    if username:
        user = db.query(User).filter(User.username == username).first()
    elif email:
        user = db.query(User).filter(User.email == email).first()
    elif user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        return None
    ic("User data obtained:", user)
    if user:
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
        ic("User data:", data)
        return data
    ic("User not found")
    return None

# Function to get the GitHub token by username, email, or user_id
ic("Defining get_token_by_user function to get user's GitHub token")
def get_token_by_user(
        db: Session = SessionLocal(), 
        username: Optional[str] = None, 
        email: Optional[str] = None,
        user_id: Optional[int] = None
        ) -> Optional[str]:
    ic("Starting query to get user's GitHub token")
    if username:
        user = db.query(User).filter(User.username == username).first()
    elif email:
        user = db.query(User).filter(User.email == email).first()
    elif user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        ic("No user identifier provided")
        return None
    if user and user.github_token_encrypted:
        ic("GitHub token found, decrypting")
        return decrypt_token(user.github_token_encrypted)
    ic("User's GitHub token not found")
    return None

# Function to get the user ID by username
ic("Defining get_id_with_username function to get user ID by username")
def get_id_with_username(username: str) -> int | None:
    db = get_db()
    ic("Starting query to get user ID by username:", username)
    user = db.query(User).filter_by(username=username).first()
    ic("User found:", user)
    return user.id if user else None

