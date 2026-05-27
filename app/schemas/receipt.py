# app/schemas/receipt.py

from pydantic import BaseModel
from datetime import datetime


class ReceiptRead(BaseModel):
    id: int
    filename: str
    original_name: str | None
    file_path: str
    ocr_text: str | None
    ocr_amount: float | None
    ocr_date: str | None
    uploaded_at: datetime

    model_config = {"from_attributes": True}
