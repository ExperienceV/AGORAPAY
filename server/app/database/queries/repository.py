from app.database.config import Base, engine, SessionLocal
from app.database.models.user import User, Repository
from typing import Optional
from icecream import ic
ic("-- Starting repository queries module --")
Base.metadata.create_all(bind=engine)

# Dependency to get the database session
ic("Defining get_db function to obtain the database session")
def get_db():
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


# Associate a repository as uploaded by the user
ic("Defining set_repository function to associate a repository uploaded by the user")
def set_repository(user_id: int, name_repository: str, url_repository: str, price: float = 0.0, branch: str = "main"):
    db = get_db()
    try:
        ic("Starting transaction to upload repository")
        user = db.query(User).get(user_id)
        if not user:
            raise Exception("User not found")
        ic("Creating Repository object with provided data")
        repo = Repository(
            name=name_repository, 
            url=url_repository, 
            branch=branch,
            price=price, 
            uploader_id=user_id
        )
        ic("Associating repository with user ID:", user_id)
        db.add(repo)
        user.uploaded_repositories.append(repo)
        db.commit()
        db.refresh(repo)
        ic("Repository uploaded successfully with ID:", repo.id)
        return {"message": "Repository uploaded successfully", "repo_id": repo.id}
    except Exception as e:
        ic("Error uploading repository:", str(e))
        db.rollback()
        raise Exception(f"Error uploading repository: {str(e)}")


# Get all repositories uploaded by a user
ic("Defining get_set_repositories function to get repositories uploaded by a user")
def get_set_repositories(
        user_id: Optional[int] = None, 
        user_name: Optional[str] = None, 
        user_email: Optional[str] = None
        ):
    db = get_db()
    ic("Starting query to get repositories uploaded by user")
    if user_id:
        user = db.query(User).get(user_id)
    elif user_name:
        user = db.query(User).filter(User.username == user_name).first()
    elif user_email:
        user = db.query(User).filter(User.email == user_email).first()
    else:
        ic("Error: No user identifier, name, or email provided.")
        raise Exception("You must provide a user identifier, name, or email.")
    ic("User found:", user.username if user else "Not found")
    repos = user.uploaded_repositories
    ic("Uploaded repositories found:", len(repos) if repos else 0)
    if not repos:
        return None
    ic("Converting repositories to serializable format")
    return [
        {
            "uploader_id": repo.uploader_id,            
            "repository_id": repo.id,
            "name": repo.name,
            "url": repo.url,
            "price": repo.price,
            "branch": repo.branch,
            "is_transfer": repo.is_transfer
        } for repo in repos
    ]


# Save a transferred repository for a user
ic("Defining save_transfer_repo function to save a transferred repository for a user")
def save_transfer_repo(
    user_id: int,
    repo_name: str,
    repo_url: str,
    seller_id: int,
    seller_repo_id: int,
    branch: str = "main"
):
    db = get_db()
    ic("Validating buyer user with ID:", user_id)
    buyer = db.query(User).get(user_id)
    if not buyer:
        ic("Error: Buyer not found with ID:", user_id)
        raise Exception("Buyer not found")
    ic("Creating a new repository for the buyer")    
    new_repo = Repository(
        name=repo_name,
        url=repo_url,
        branch=branch,
        uploader_id=user_id,
        seller_id=seller_id,
        seller_repo_id=seller_repo_id,
        is_transfer=True
    )
    ic("Associating new repository with buyer ID:", user_id)
    db.add(new_repo)
    db.commit()
    db.refresh(new_repo)
    ic("Associating new repository to buyer's purchased repositories list")
    buyer.purchased_repositories.append(new_repo)
    db.commit()
    db.refresh(buyer)
    ic("Repository purchased and saved successfully with ID:", new_repo.id)    
    return {
        "message": "Repository purchased and saved successfully",
        "repo_id": new_repo.id,
        "repo_name": new_repo.name,
        "repo_url": new_repo.url,
        "branch": new_repo.branch,
        "seller_id": new_repo.seller_id,
        "seller_repo_id": new_repo.seller_repo_id
    }


# Get all purchased repositories for a user
ic("Defining get_transfer_repo function to get purchased repositories for a user")
def get_transfer_repo(
        user_id: Optional[int] = None,
        user_name: Optional[str] = None,
        user_email: Optional[str] = None
        ):
    db = get_db()
    ic("Starting query to get purchased repositories for user")
    if user_id:
        user = db.query(User).get(user_id)
    elif user_name:
        user = db.query(User).filter(User.username == user_name).first()
    elif user_email:
        user = db.query(User).filter(User.email == user_email).first()
    else:
        ic("Error: No user identifier, name, or email provided.")
        raise Exception("You must provide a user identifier, name, or email.")
    ic("User found:", user.username if user else "Not found")
    repos = user.purchased_repositories
    if not repos:
        ic("No purchased repositories found for user:", user.username if user else "Not found")
        return None
    ic("Converting purchased repositories to serializable format")    
    repo_data = [
        {
            "repository_id": repo.id,
            "name": repo.name,
            "url": repo.url,
            "branch": repo.branch,
            "uploader_id": repo.uploader_id,
            "seller_id": repo.seller_id,
            "seller_repo_id": repo.seller_repo_id
        } for repo in repos
    ]
    ic("Purchased repositories found:", len(repo_data))
    return repo_data


# Delete a repository from the database
ic("Defining delete_repository function to delete a repository")
def delete_repository(repo_id: int, user_id: int):
    db = get_db()
    try:
        ic("Starting transaction to delete repository")
        repo = db.query(Repository).filter_by(id=repo_id, uploader_id=user_id).first()
        if not repo:
            ic("Repository not found or does not belong to user")
            raise Exception("Repository not found or you do not have permission to delete it")
        db.delete(repo)
        db.commit()
        ic("Repository deleted successfully")
        return {"message": "Repository deleted successfully", "repo_id": repo_id}
    except Exception as e:
        ic("Error deleting repository:", str(e))
        db.rollback()
        raise Exception(f"Error deleting repository: {str(e)}")