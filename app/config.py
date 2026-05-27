# app/config.py
# ─────────────────────────────────────────────────────────────
# Loads settings from the .env file using python-dotenv.
# All other files import from here — never read os.environ directly.
# ─────────────────────────────────────────────────────────────

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the project root (one level above this file)
load_dotenv(Path(__file__).parent.parent / ".env")


class Settings:
    # ── App identity ──────────────────────────────────────────
    APP_NAME: str = os.getenv("APP_NAME", "Shopvision")
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # ── Database ──────────────────────────────────────────────
    # sqlite:///./shopvision.db  → file in project root
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./shopvision.db")

    # ── JWT / Auth ────────────────────────────────────────────
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(
        os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480")
    )

    # ── File uploads ──────────────────────────────────────────
    # Where receipt images are stored (relative to project root)
    UPLOAD_DIR: Path = Path("app/static/uploads/receipts")
    MAX_UPLOAD_SIZE_BYTES: int = 5 * 1024 * 1024  # 5 MB
    ALLOWED_MIME_TYPES: list = ["image/jpeg", "image/png", "image/webp"]

    @property
    def is_dev(self) -> bool:
        return self.APP_ENV == "development"


# Single instance — import this everywhere
settings = Settings()
