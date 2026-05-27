# app/models/widget.py
# ─────────────────────────────────────────────────────────────
# DashboardWidget ORM model — per-user widget layout config.
#
# WHY JSON config column?
#   Each widget type has different settings (period, limit, colors).
#   Storing as JSON avoids a separate config table per widget type.
#   These values are never filtered by SQL — only read in Python.
# ─────────────────────────────────────────────────────────────

from datetime import datetime
from sqlalchemy import Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class DashboardWidget(Base):
    __tablename__ = "dashboard_widgets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    # Widget type keys (see implementation plan §8.1):
    # 'summary_card' | 'bar_chart' | 'pie_chart' | 'recent_transactions' | 'category_summary'
    widget_type: Mapped[str] = mapped_column(String(50), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    config: Mapped[str | None] = mapped_column(Text)   # JSON string
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="widgets")  # type: ignore[name-defined]

    def __repr__(self) -> str:
        return (
            f"<DashboardWidget id={self.id} "
            f"type={self.widget_type!r} position={self.position}>"
        )
