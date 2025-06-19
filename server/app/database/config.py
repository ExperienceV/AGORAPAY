from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from icecream import ic

ic("Configuring SQLite database")
DATABASE_URL = "sqlite:///./app.db"

ic("Creating database engine with URL:", DATABASE_URL)
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

ic("Creating database session")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
