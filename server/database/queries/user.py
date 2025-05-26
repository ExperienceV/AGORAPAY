from sqlalchemy.orm import Session
from database.config import Base, engine, SessionLocal
from fastapi import Depends
from database.models.user import User
from utils.security.crypt_token import encrypt_token, decrypt_token
from typing import Optional
from icecream import ic
ic("-- Iniciando el módulo de consultas de usuario --")
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
ic("Definiendo la función get_db para obtener la sesión de la base de datos")
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()

# Function to add or update a user in the database
ic("Definiendo la función add_user para agregar o actualizar un usuario")
def add_user(name: str, email: str, token: str):
    db = get_db()
    try:
        ic("Iniciando la transacción para agregar o actualizar el usuario")
        # Encrypt the token before storing it
        ic("Encriptando el token del usuario")
        encrypted = encrypt_token(token)
        
        # search for the user by email
        ic("Buscando el usuario por correo electrónico:", email)
        user = db.query(User).filter(User.email == email).first()

        ic("Actualizando o creando el usuario")
        if user:
            ic("Usuario encontrado, actualizando el token")
            # If the user exists, update the token
            user.github_token_encrypted = encrypted
            db.commit()
            db.refresh(user)
            ic("Token del usuario actualizado correctamente")
            return {"message": "User token updated", "id": user.id}
        else:
            # if the user does not exist, create a new user
            ic("Usuario no encontrado, creando un nuevo usuario")
            new_user = User(username=name, email=email, github_token_encrypted=encrypted)
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            ic("Nuevo usuario creado correctamente")
            return {"message": "User created", "id": new_user.id}
    finally:
        ic("Cerrando la sesión de la base de datos")
        db.close()


# Function to get user data by username, email, or user_id
ic("Definiendo la función get_user_data para obtener datos del usuario")
def get_user_data(
        db: Session = SessionLocal(), 
        username: Optional[str] = None, 
        email: Optional[str] = None,
        user_id: Optional[int] = None
        ) -> Optional[str]:
    ic("Iniciando la consulta para obtener datos del usuario")
    if username:
        user = db.query(User).filter(User.username == username).first()
    elif email:
        user = db.query(User).filter(User.email == email).first()
    elif user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        return None

    ic("Datos del usuario obtenidos:", user)
    if user:
        data = {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
        ic("Datos del usuario:", data)
        return data
    ic("No se encontró el usuario")
    return None


# Function to get the GitHub token by username, email, or user_id
ic("Definiendo la función get_token_by_user para obtener el token de GitHub del usuario")
def get_token_by_user(
        db: Session = SessionLocal(), 
        username: Optional[str] = None, 
        email: Optional[str] = None,
        user_id: Optional[int] = None
        ) -> Optional[str]:
    ic("Iniciando la consulta para obtener el token de GitHub del usuario")
    # Check if any identifier is provided
    if username:
        user = db.query(User).filter(User.username == username).first()
    elif email:
        user = db.query(User).filter(User.email == email).first()
    elif user_id:
        user = db.query(User).filter(User.id == user_id).first()
    else:
        ic("No se proporcionó ningún identificador de usuario")
        return None

    if user and user.github_token_encrypted:
        ic("Token de GitHub encontrado, desencriptando")
        return decrypt_token(user.github_token_encrypted)
    ic("No se encontró el token de GitHub del usuario")
    return None


# Function to get the user ID by username
ic("Definiendo la función get_id_with_username para obtener el ID del usuario por nombre de usuario")
def get_id_with_username(username: str) -> int | None:
    db = get_db()
    ic("Iniciando la consulta para obtener el ID del usuario por nombre de usuario:", username)
    usuario = db.query(User).filter_by(username=username).first()
    ic("Usuario encontrado:", usuario)
    return usuario.id if usuario else None

