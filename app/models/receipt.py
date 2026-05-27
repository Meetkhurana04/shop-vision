# app/models/receipt.py
# ─────────────────────────────────────────────────────────────
# Receipt ORM model — stores uploaded image metadata.
# The actual file lives at file_path under app/static/uploads/.
# ocr_* fields are filled after Tesseract processes the image.
# ─────────────────────────────────────────────────────────────

from datetime import datetime
from sqlalchemy import Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Receipt(Base):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)       # UUID-based stored name
    original_name: Mapped[str | None] = mapped_column(String(255))           # Original upload name
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)      # Relative path
    ocr_text: Mapped[str | None] = mapped_column(String(4096))               # Raw OCR output
    ocr_amount: Mapped[float | None] = mapped_column(Float)                  # Parsed amount
    ocr_date: Mapped[datetime | None] = mapped_column(Date)                  # Parsed date
    uploaded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="receipts")   # type: ignore[name-defined]
    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="receipt", uselist=False)  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return f"<Receipt id={self.id} filename={self.filename!r}>"
