# app/routers/dashboard.py
# ─────────────────────────────────────────────────────────────
# Dashboard routes.
# Phase 1: Returns a basic placeholder page.
# Phase 3: Will query widgets and render them server-side.
# ─────────────────────────────────────────────────────────────

from fastapi import APIRouter, Request, Depends
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.templates_config import templates
from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.services import widget_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("", response_class=HTMLResponse)
async def dashboard_home(
    request: Request, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Main dashboard page — fetches widgets and renders grid."""
    widgets = widget_service.get_user_widgets(db, current_user.id)
    
    # We could pre-fetch widget data here to avoid multiple HTMX requests on first load,
    # or just let HTMX fetch them lazily. 
    # For a smoother SPA-like experience on initial load, pre-fetching is better.
    widget_data_map = {}
    for w in widgets:
        widget_data_map[w.id] = widget_service.get_widget_data(db, current_user.id, w)
            
    return templates.TemplateResponse(
        request=request,
        name="dashboard/index.html",
        context={
            "page_title": "Dashboard", 
            "user": current_user,
            "widgets": widgets,
            "widget_data_map": widget_data_map
        },
    )
