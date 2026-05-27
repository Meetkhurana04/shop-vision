# app/models/user.py
# ─────────────────────────────────────────────────────────────
# User ORM model.
# role: 'owner' = full access, 'manager' = some access, 'cashier' = minimal access.
# is_active: soft-disable without deleting historical data.
# ─────────────────────────────────────────────────────────────

from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="cashier")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships (used in later phases)
    transactions: Mapped[list] = relationship("Transaction", back_populates="user", lazy="select")
    receipts: Mapped[list] = relationship("Receipt", back_populates="user", lazy="select")
    widgets: Mapped[list] = relationship("DashboardWidget", back_populates="user", lazy="select")

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r} role={self.role!r}>"

    @property
    def is_owner(self) -> bool:
        return self.role == "owner"
