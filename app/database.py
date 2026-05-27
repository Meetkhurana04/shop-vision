# app/database.py
# ─────────────────────────────────────────────────────────────
# Sets up the SQLAlchemy engine and session factory.
# WHY SQLite connect_args check_same_thread=False?
#   SQLite's default behaviour only allows the thread that created
#   the connection to use it. FastAPI uses multiple threads for
#   concurrent requests, so we disable that check. SQLAlchemy's
#   session-per-request pattern keeps this safe.
# ─────────────────────────────────────────────────────────────

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings

# Create the SQLite engine.
# echo=True prints every SQL query to the console — helpful in dev,
# set echo=False in production (or tie it to settings.is_dev).
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=settings.is_dev,
)

# SessionLocal is a factory: call SessionLocal() to get a DB session.
SessionLocal = sessionmaker(
    autocommit=False,  # We commit manually — safer
    autoflush=False,   # We flush manually — avoids surprise queries
    bind=engine,
)


# All ORM models inherit from this Base.
# Importing Base in models/ registers them with SQLAlchemy's metadata.
class Base(DeclarativeBase):
    pass


def create_all_tables():
    """Create all tables defined in ORM models if they don't exist yet.
    
    Called once at startup. Safe to call multiple times — SQLAlchemy
    uses CREATE TABLE IF NOT EXISTS under the hood.
    """
    # Import all models here so SQLAlchemy knows about them before
    # calling create_all(). Order matters for foreign keys.
    from app.models import user, category, transaction, receipt, widget, customer  # noqa: F401
    Base.metadata.create_all(bind=engine)
