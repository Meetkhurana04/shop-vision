# app/models/transaction.py
# ─────────────────────────────────────────────────────────────
# Transaction ORM model — the core ledger entry.
#
# WHY separate `date` from `created_at`?
#   `date` = the business date of the transaction (backdatable).
#   `created_at` = when the record was entered in the system.
#   Family shops enter receipts at end of day for earlier purchases.
# ─────────────────────────────────────────────────────────────

from datetime import datetime, date
from sqlalchemy import Integer, String, Float, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    category_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True
    )
    receipt_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("receipts.id", ondelete="SET NULL"), nullable=True
    )
    customer_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("customers.id", ondelete="SET NULL"), nullable=True
    )
    receipt_image_path: Mapped[str | None] = mapped_column(String(255), nullable=True)
    type: Mapped[str] = mapped_column(String(20), nullable=False)   # 'sale' | 'expense' | 'credit_given' | 'credit_taken'
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))
    note: Mapped[str | None] = mapped_column(Text)
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")           # type: ignore[name-defined]
    category: Mapped["Category"] = relationship("Category", back_populates="transactions")  # type: ignore[name-defined]
    receipt: Mapped["Receipt"] = relationship("Receipt", back_populates="transaction")   # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Transaction id={self.id} type={self.type!r} amount={self.amount}>"
