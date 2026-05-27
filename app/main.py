# app/main.py
# ─────────────────────────────────────────────────────────────
# FastAPI application factory.
#
# This file:
#   1. Creates the FastAPI app instance
#   2. Mounts static files (CSS, JS, uploads)
#   3. Configures Jinja2 templates
#   4. Registers all routers
#   5. Creates DB tables on startup
#   6. Defines the root redirect
#
# WHY lifespan instead of @app.on_event("startup")?
#   lifespan is the modern FastAPI approach (recommended since v0.93).
#   on_event is deprecated and will be removed in a future version.
# ─────────────────────────────────────────────────────────────

# Fix for passlib + bcrypt >= 4.0.0 compatibility
import bcrypt
if not hasattr(bcrypt, "__about__"):
    class About:
        __version__ = getattr(bcrypt, "__version__", "4.0.0")
    bcrypt.__about__ = About

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.database import create_all_tables

# ── Routers ───────────────────────────────────────────────────
from app.routers import auth, dashboard, transactions, categories, reports, receipts, widgets, vision


# ── Lifespan: runs on startup and shutdown ─────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: ensure DB tables and upload directories exist.
    Shutdown: nothing to clean up for SQLite.
    """
    # Create all SQLAlchemy models as DB tables (idempotent)
    create_all_tables()

    # Ensure uploads directory exists
    upload_path = Path("app/static/uploads/receipts")
    upload_path.mkdir(parents=True, exist_ok=True)

    print(f"[OK] Shopvision started -- {settings.APP_ENV} mode")
    print(f"   DB: {settings.DATABASE_URL}")
    print(f"   Uploads: {upload_path.resolve()}")

    yield  # App runs while we're inside this yield

    # Shutdown logic here (nothing needed for SQLite)
    print("[BYE] Shopvision shutting down")


# ── App instance ───────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="Family shop management — simple, fast, offline-first.",
    version="0.1.0",
    lifespan=lifespan,
    # Hide docs in production (optional)
    docs_url="/api/docs" if settings.is_dev else None,
    redoc_url=None,
)


# ── Static files ───────────────────────────────────────────────
# FastAPI serves everything under app/static/ at the /static URL prefix.
# In production, Nginx should serve this path instead (faster).
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static",
)


# ── Templates ──────────────────────────────────────────────────
# Jinja2Templates instance shared across all routers via import.
# Each router creates its own local instance pointing to the same dir.
templates = Jinja2Templates(directory="app/templates")

# Inject `settings` as a Jinja2 global — every template can now
# reference {{ settings.APP_NAME }} without explicit route context passing.
templates.env.globals["settings"] = settings


# ── Register routers ───────────────────────────────────────────
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(transactions.router)
app.include_router(categories.router)
app.include_router(reports.router)
app.include_router(receipts.router)
app.include_router(widgets.router)
app.include_router(vision.router)


# ── Root redirect ──────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    """Redirect / to the dashboard (Phase 2 will redirect to login if not authenticated)."""
    return RedirectResponse(url="/dashboard")


# ── Global exception handlers ──────────────────────────────────
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return templates.TemplateResponse(
        request=request,
        name="errors/404.html",
        context={"page_title": "Page Not Found"},
        status_code=404,
    )


from fastapi.responses import RedirectResponse, Response

@app.exception_handler(401)
async def unauthorized_handler(request: Request, exc):
    """Redirect to login if user is not authenticated."""
    if request.headers.get("HX-Request"):
        return Response(status_code=401, headers={"HX-Redirect": "/auth/login"})
    return RedirectResponse(url="/auth/login")


@app.exception_handler(500)
async def server_error_handler(request: Request, exc):
    return templates.TemplateResponse(
        request=request,
        name="errors/500.html",
        context={"page_title": "Server Error"},
        status_code=500,
    )
