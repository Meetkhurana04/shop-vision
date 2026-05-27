# app/dependencies.py
# ─────────────────────────────────────────────────────────────
# FastAPI dependency functions injected via Depends().
#
# WHY a dependency for the DB session?
#   It guarantees the session is always closed after each request,
#   even if an exception is raised — like a try/finally block you
#   never forget to write.
#
# Auth dependencies are stubbed here and will be completed in Phase 2
# when the full JWT middleware is implemented.
# ─────────────────────────────────────────────────────────────

from typing import Generator
from sqlalchemy.orm import Session
from app.database import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a database session for one request, then close it.

    Usage in a route:
        @router.get("/example")
        def example(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Auth stubs (completed in Phase 2) ─────────────────────────
# These are placeholder functions so routers can already import
# them without breaking. Replace the bodies in Phase 2.

from fastapi import Request, HTTPException, status, Depends
from app.services.auth_service import decode_access_token
from app.models.user import User

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    """Read JWT from cookie, verify, and return current User."""
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"HX-Redirect": "/auth/login"},
        )
    
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid",
            headers={"HX-Redirect": "/auth/login"},
        )
        
    username = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
        
    user = db.query(User).filter(User.username == username, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        
    return user


def require_role(roles: list[str]):
    """Dependency generator to restrict route by roles."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough privileges"
            )
        return current_user
    return role_checker

def require_owner(current_user: User = Depends(require_role(["owner"]))) -> User:
    """Helper dependency for owner-only routes."""
    return current_user
