# app/services/auth_service.py
# ─────────────────────────────────────────────────────────────
# JWT creation/verification and password hashing.
# Used by the auth router (Phase 2) — stubbed here so imports work.
# ─────────────────────────────────────────────────────────────

from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt

from app.config import settings

# bcrypt context — automatically handles salting and hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict) -> str:
    """Create a signed JWT token with an expiry timestamp.

    Args:
        data: Payload dict — should include 'sub' (username) and 'role'.

    Returns:
        Encoded JWT string to store in the httpOnly cookie.
    """
    payload = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """Decode and verify a JWT token.

    Returns the payload dict on success, None if invalid or expired.
    """
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        return None
