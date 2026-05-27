from fastapi import APIRouter, Request, Depends, Form, Response, status
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_db, require_owner
from app.templates_config import templates
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth_service import verify_password, hash_password, create_access_token
from app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    """Login form."""
    return templates.TemplateResponse(
        request=request,
        name="auth/login.html",
        context={"page_title": "Login"},
    )


@router.post("/login", response_class=HTMLResponse)
async def login_submit(
    request: Request,
    response: Response,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Process login form."""
    user = db.query(User).filter(User.username == username.lower(), User.is_active == True).first()
    
    if not user or not verify_password(password, user.password_hash):
        return templates.TemplateResponse(
            request=request,
            name="auth/login.html",
            context={"page_title": "Login", "error": "Invalid username or password", "username": username},
            status_code=400
        )
        
    access_token = create_access_token(data={"sub": user.username, "role": user.role})
    
    # We use HX-Redirect for HTMX requests to force a full page navigation,
    # or a standard RedirectResponse if someone disables JS.
    if "hx-request" in request.headers:
        resp = Response(status_code=200)
        resp.headers["HX-Redirect"] = "/dashboard"
        resp.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=not settings.is_dev,
            samesite="lax",
            max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        return resp
    
    # Non-HTMX fallback
    resp = RedirectResponse(url="/dashboard", status_code=status.HTTP_302_FOUND)
    resp.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=not settings.is_dev,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return resp


@router.post("/logout")
async def logout(request: Request, response: Response):
    """Clear session cookie."""
    if "hx-request" in request.headers:
        resp = Response(status_code=200)
        resp.headers["HX-Redirect"] = "/auth/login"
        resp.delete_cookie("access_token")
        return resp
        
    resp = RedirectResponse(url="/auth/login", status_code=status.HTTP_302_FOUND)
    resp.delete_cookie("access_token")
    return resp


@router.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    """Registration form."""
    return templates.TemplateResponse(
        request=request,
        name="auth/register.html",
        context={"page_title": "Register"},
    )


@router.post("/register", response_class=HTMLResponse)
async def register_submit(
    request: Request,
    response: Response,
    name: str = Form(...),
    username: str = Form(...),
    password: str = Form(...),
    role: str = Form("cashier"),
    db: Session = Depends(get_db)
):
    """Process registration form."""
    # Check if username exists
    existing = db.query(User).filter(User.username == username.lower()).first()
    if existing:
        return templates.TemplateResponse(
            request=request,
            name="auth/register.html",
            context={
                "page_title": "Register", 
                "error": "Username already taken",
                "name": name,
                "username": username,
                "role": role
            },
            status_code=400
        )
        
    try:
        user_data = UserCreate(name=name, username=username, password=password, role=role)
    except ValueError as e:
        return templates.TemplateResponse(
            request=request,
            name="auth/register.html",
            context={
                "page_title": "Register", 
                "error": str(e),
                "name": name,
                "username": username,
                "role": role
            },
            status_code=400
        )
        
    new_user = User(
        name=user_data.name,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    
    # Success -> redirect to login (or dashboard if auto-login is desired)
    if "hx-request" in request.headers:
        resp = Response(status_code=200)
        resp.headers["HX-Redirect"] = "/auth/login?registered=1"
        return resp
        
    return RedirectResponse(url="/auth/login?registered=1", status_code=status.HTTP_302_FOUND)
