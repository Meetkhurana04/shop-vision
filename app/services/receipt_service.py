# app/services/receipt_service.py
# Stub — fully implemented in Phase 5.

import uuid
from pathlib import Path
from app.config import settings


def build_receipt_path(user_id: int, original_filename: str) -> tuple[str, str]:
    """Return (stored_filename, relative_file_path) for a new receipt upload.

    Path pattern: receipts/{user_id}/{year}/{month}/{uuid}.{ext}
    """
    from datetime import datetime
    now = datetime.utcnow()
    ext = Path(original_filename).suffix.lower()
    stored_name = f"{uuid.uuid4().hex}{ext}"
    relative_path = f"receipts/{user_id}/{now.year}/{now.month:02d}/{stored_name}"
    return stored_name, relative_path


def ensure_upload_dirs(user_id: int) -> Path:
    """Create the upload directory for a user/year/month if it doesn't exist."""
    from datetime import datetime
    now = datetime.utcnow()
    target = settings.UPLOAD_DIR / str(user_id) / str(now.year) / f"{now.month:02d}"
    target.mkdir(parents=True, exist_ok=True)
    return target
