from database.config import Base, engine, SessionLocal
from database.models.user import User
from database.models.user import Repository
from typing import Optional
from icecream import ic
ic("-- Iniciando el módulo de consultas de repositorios --")
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
ic("Definiendo la función get_db para obtener la sesión de la base de datos")
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


# Asociar un repositorio como subido por el usuario
ic("Definiendo la función set_repository para asociar un repositorio subido por el usuario")
def set_repository(user_id: int, name_repository: str, url_repository: str):
    db = get_db()
    try:
        ic("Iniciando la transacción para subir el repositorio")
        usuario = db.query(User).get(user_id)
        if not usuario:
            raise Exception("Usuario no encontrado")

        # Crear el objeto repositorio dentro de la función
        ic("Creando el objeto Repository con los datos proporcionados")
        repo = Repository(name=name_repository, url=url_repository, uploader_id=user_id)
        # Asociar el repositorio al usuario
        ic("Asociando el repositorio al usuario con ID:", user_id)
        db.add(repo)
        usuario.uploaded_repositories.append(repo)

        db.commit()
        db.refresh(repo)

        ic("Repositorio subido correctamente con ID:", repo.id)
        return {"message": "Repositorio subido correctamente", "repo_id": repo.id}
    except Exception as e:
        ic("Error al subir el repositorio:", str(e))
        db.rollback()
        raise Exception(f"Error al subir el repositorio: {str(e)}")


# Obtener todos los repositorios subidos por un usuario 
ic("Definiendo la función get_set_repositories para obtener repositorios subidos por un usuario")
def get_set_repositories(
        user_id: Optional[int] = None, 
        user_name: Optional[str] = None, 
        user_email: Optional[str] = None
        ):
    db = get_db()
    ic("Iniciando la consulta para obtener repositorios subidos por el usuario")
    if user_id:
        usuario = db.query(User).get(user_id)
    elif user_name:
        usuario = db.query(User).filter(User.username == user_name).first()
    elif user_email:
        usuario = db.query(User).filter(User.email == user_email).first()
    else:
        ic("Error: No se proporcionó un identificador de usuario, nombre o correo electrónico.")
        raise Exception("Debe proporcionar un identificador de usuario, nombre o correo electrónico.")
    
    ic("Usuario encontrado:", usuario.username if usuario else "No encontrado")
    repos = usuario.uploaded_repositories

    ic("Repositorios subidos encontrados:", len(repos) if repos else 0)
    if not repos:
        return None
    
    # Convertir los repositorios a un formato serializable  
    ic("Convirtiendo los repositorios a un formato serializable")
    return [
        {
            "uploader_id": repo.uploader_id,
            "repository_id": repo.id,
            "name": repo.name,
            "url": repo.url,
            "is_transfer": repo.is_transfer
        } for repo in repos
    ]


# Guardar un repositorio transferido por un usuario
ic("Definiendo la función save_transfer_repo para guardar un repositorio transferido por un usuario")
def save_transfer_repo(
    user_id: int,
    repo_name: str,
    repo_url: str,
    seller_id: int,
    seller_repo_id: int
):
    db = get_db()

    # Validar usuario comprador
    ic("Validando el usuario comprador con ID:", user_id)
    comprador = db.query(User).get(user_id)
    if not comprador:
        ic("Error: Comprador no encontrado con ID:", user_id)
        raise Exception("Comprador no encontrado")

    # Crear el nuevo repositorio para el comprador
    ic("Creando un nuevo repositorio para el comprador")
    nuevo_repo = Repository(
        name=repo_name,
        url=repo_url,
        uploader_id=user_id,
        seller_id=seller_id,
        seller_repo_id=seller_repo_id,
        is_transfer=True  # 👈 Esto es lo importante
    )
    # Asociar el repositorio al comprador
    ic("Asociando el nuevo repositorio al comprador con ID:", user_id)
    db.add(nuevo_repo)
    db.commit()
    db.refresh(nuevo_repo)

    # Asociar como repositorio comprado
    ic("Asociando el nuevo repositorio a la lista de repositorios comprados del comprador")
    comprador.purchased_repositories.append(nuevo_repo)
    db.commit()
    db.refresh(comprador)

    ic("Repositorio comprado y guardado correctamente con ID:", nuevo_repo.id)
    return {
        "message": "Repositorio comprado y guardado correctamente",
        "repo_id": nuevo_repo.id,
        "repo_name": nuevo_repo.name,
        "repo_url": nuevo_repo.url,
        "seller_id": nuevo_repo.seller_id,
        "seller_repo_id": nuevo_repo.seller_repo_id
    }


# Obtener todos los repositorios comprados por un usuario
ic("Definiendo la función get_transfer_repo para obtener repositorios comprados por un usuario")
def get_transfer_repo(
        user_id: Optional[int] = None,
        user_name: Optional[str] = None,
        user_email: Optional[str] = None
        ):
    db = get_db()
    ic("Iniciando la consulta para obtener repositorios comprados por el usuario")
    if user_id:
        usuario = db.query(User).get(user_id)
    elif user_name:
        usuario = db.query(User).filter(User.username == user_name).first()
    elif user_email:
        usuario = db.query(User).filter(User.email == user_email).first()
    else:
        ic("Error: No se proporcionó un identificador de usuario, nombre o correo electrónico.")
        raise Exception("Debe proporcionar un identificador de usuario, nombre o correo electrónico.")

    ic("Usuario encontrado:", usuario.username if usuario else "No encontrado")
    repos = usuario.purchased_repositories
    if not repos:
        ic("No se encontraron repositorios comprados para el usuario:", usuario.username if usuario else "No encontrado")
        return None
    
    # Convertir los repositorios a un formato serializable
    ic("Convirtiendo los repositorios comprados a un formato serializable")
    repo_data = [
        {
            "repository_id": repo.id,
            "name": repo.name,
            "url": repo.url,
            "uploader_id": repo.uploader_id,
            "seller_id": repo.seller_id,
            "seller_repo_id": repo.seller_repo_id
        } for repo in repos
    ]

    ic("Repositorios comprados encontrados:", len(repo_data))
    return repo_data