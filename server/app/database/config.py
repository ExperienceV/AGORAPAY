from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from icecream import ic

ic("Configurando la base de datos SQLite")
DATABASE_URL = "sqlite:///./app.db"

ic("Creando el motor de la base de datos con URL:", DATABASE_URL)
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

ic("Creando la sesión de la base de datos")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
