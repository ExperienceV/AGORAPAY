from pydantic import BaseModel

class UploadModel(BaseModel):
    name_repository: str
    url_repository: str
    branch: str = "main"  # Default to 'main' if not specified

class TransferModel(BaseModel):
    seller_id: int
    repo_url: str
    repo_name: str