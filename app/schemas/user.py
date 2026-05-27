# app/schemas/user.py
# ─────────────────────────────────────────────────────────────
# Pydantic schemas for user data validation.
# WHY separate schemas from models?
#   ORM models define DB structure; schemas define what the API
#   accepts (Create) or returns (Read). Keeps HTTP and DB concerns apart.
# ─────────────────────────────────────────────────────────────

from pydantic import BaseModel, field_validator
from datetime import datetime


class UserCreate(BaseModel):
    """Validated input for registering a new user."""
    name: str
    username: str
    password: str
    role: str = "cashier"

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in ("owner", "manager", "cashier"):
            raise ValueError("role must be 'owner', 'manager', or 'cashier'")
        return v

    @field_validator("username")
    @classmethod
    def username_no_spaces(cls, v: str) -> str:
        if " " in v:
            raise ValueError("username cannot contain spaces")
        return v.lower()


class UserRead(BaseModel):
    """Safe user data returned to templates — never includes password_hash."""
    id: int
    name: str
    username: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}
