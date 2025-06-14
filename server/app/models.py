from pydantic import BaseModel

class UploadModel(BaseModel):
    name_repository: str
    url_repository: str
    branch: str = "main"
    price: float

class ConfirmModel(BaseModel):
    authorization_id: str
    seller_id: str
    repo_name: str
    repo_url: str
    
    