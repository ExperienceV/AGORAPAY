from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, Float
from sqlalchemy.orm import relationship
from app.database.config import Base
from icecream import ic

ic("Iniciando el módulo de modelos de usuario y repositorio")
# Table to represent the many-to-many relationship between users and purchased repositories

ic("Definiendo la tabla de relación muchos a muchos entre usuarios y repositorios comprados")
user_purchased_repositories = Table(
    "user_purchased_repositories",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("repository_id", Integer, ForeignKey("repositories.id"))
)

# Represents a repository in the database
ic("Definiendo el modelo Repository para representar un repositorio en la base de datos")
class Repository(Base):
    __tablename__ = "repositories"    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    url = Column(String)
    branch = Column(String, default="main")  # New field for branch
    price = Column(Float)
    uploader_id = Column(Integer, ForeignKey("users.id"))

    # Metadatos del vendedor
    seller_id = Column(Integer, nullable=True)
    seller_repo_id = Column(Integer, nullable=True)

    # Nuevo campo: si es un repo comprado
    is_transfer = Column(Boolean, default=False)

    uploader = relationship("User", back_populates="uploaded_repositories")
    buyers = relationship("User", secondary=user_purchased_repositories, back_populates="purchased_repositories")


# Represents a user in the database
ic("Definiendo el modelo User para representar un usuario en la base de datos")
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, index=True)
    github_token_encrypted = Column(String)

    # Uno a muchos (repos subidos por el usuario)
    uploaded_repositories = relationship("Repository", back_populates="uploader")

    # Muchos a muchos (repos comprados por el usuario)
    purchased_repositories = relationship(
        "Repository",
        secondary=user_purchased_repositories,
        back_populates="buyers"
    )
