from sqlalchemy import Column, Integer, String, ForeignKey, Table, Boolean, Float
from sqlalchemy.orm import relationship
from app.database.config import Base
from icecream import ic

ic("Starting user and repository models module")
# Table to represent the many-to-many relationship between users and purchased repositories

ic("Defining many-to-many relationship table between users and purchased repositories")
user_purchased_repositories = Table(
    "user_purchased_repositories",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("repository_id", Integer, ForeignKey("repositories.id"))
)

# Represents a repository in the database
ic("Defining Repository model to represent a repository in the database")
class Repository(Base):
    __tablename__ = "repositories"    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    url = Column(String)
    branch = Column(String, default="main")  # New field for branch
    price = Column(Float)
    uploader_id = Column(Integer, ForeignKey("users.id"))

    # Seller metadata
    seller_id = Column(Integer, nullable=True)
    seller_repo_id = Column(Integer, nullable=True)

    # New field: if it's a transferred repo
    is_transfer = Column(Boolean, default=False)

    uploader = relationship("User", back_populates="uploaded_repositories")
    buyers = relationship("User", secondary=user_purchased_repositories, back_populates="purchased_repositories")


# Represents a user in the database
ic("Defining User model to represent a user in the database")
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, index=True)
    github_token_encrypted = Column(String)

    # One to many (repos uploaded by the user)
    uploaded_repositories = relationship("Repository", back_populates="uploader")

    # Many to many (repos purchased by the user)
    purchased_repositories = relationship(
        "Repository",
        secondary=user_purchased_repositories,
        back_populates="buyers"
    )
