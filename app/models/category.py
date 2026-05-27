# app/models/category.py
# ─────────────────────────────────────────────────────────────
# Category ORM model.
# type: 'income' | 'expense' — determines which transaction list it appears in.
# color: hex code used for badges in the UI.
# icon: heroicons name, rendered as SVG in templates.
# ─────────────────────────────────────────────────────────────

from datetime import datetime
from sqlalchemy import Integer, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    type: Mapped[str] = mapped_column(String(10), nullable=False)  # 'income' | 'expense'
    color: Mapped[str] = mapped_column(String(20), default="#6366f1")
    icon: Mapped[str] = mapped_column(String(50), default="tag")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Transactions in this category
    transactions: Mapped[list] = relationship(
        "Transaction", back_populates="category", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<Category id={self.id} name={self.name!r} type={self.type!r}>"
