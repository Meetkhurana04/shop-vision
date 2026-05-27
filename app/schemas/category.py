# app/schemas/category.py

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    type: str       # 'income' | 'expense'
    color: str = "#6366f1"
    icon: str = "tag"


class CategoryRead(BaseModel):
    id: int
    name: str
    type: str
    color: str
    icon: str

    model_config = {"from_attributes": True}
