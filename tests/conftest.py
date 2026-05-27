# tests/conftest.py
# ─────────────────────────────────────────────────────────────
# Pytest fixtures shared across all test files.
#
# WHY in-memory SQLite for tests?
#   Tests run in isolation — each test function gets a fresh DB.
#   No teardown needed; the DB is destroyed when the connection closes.
#   Tests never touch your real shopvision.db file.
# ─────────────────────────────────────────────────────────────

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base
from app.dependencies import get_db

# In-memory SQLite — isolated per test session
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def create_test_tables():
    """Create all tables once for the test session."""
    # Import models so SQLAlchemy registers them
    from app.models import user, category, transaction, receipt, widget  # noqa
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db():
    """Provide a clean DB session for each test."""
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    """FastAPI test client with DB dependency overridden."""
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
