# app/schemas/transaction.py
# Pydantic schemas for transactions — fully used in Phase 2.

from pydantic import BaseModel, field_validator
from datetime import date, datetime


class TransactionCreate(BaseModel):
    type: str           # 'sale' | 'expense' | 'credit_given' | 'credit_taken'
    amount: float
    description: str | None = None
    note: str | None = None
    date: date
    category_id: int | None = None
    receipt_id: int | None = None
    receipt_image_path: str | None = None

    @field_validator("type")
    @classmethod
    def type_must_be_valid(cls, v: str) -> str:
        valid_types = ("sale", "expense", "credit_given", "credit_taken")
        if v not in valid_types:
            raise ValueError(f"type must be one of {valid_types}")
        return v

    @field_validator("amount")
    @classmethod
    def amount_positive(cls, v: float) -> float:
        if v <= 0:
            raise ValueError("amount must be greater than 0")
        return v


class TransactionRead(BaseModel):
    id: int
    user_id: int
    type: str
    amount: float
    description: str | None
    note: str | None
    date: date
    category_id: int | None
    receipt_id: int | None
    receipt_image_path: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
