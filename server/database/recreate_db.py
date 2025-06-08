from config import Base, engine
from models.user import User, Repository, user_purchased_repositories

def recreate_database():
    print("Recreating database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Database schema recreated successfully!")

if __name__ == "__main__":
    recreate_database()
