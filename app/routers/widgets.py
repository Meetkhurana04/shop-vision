from typing import List
from fastapi import APIRouter, Request, Depends, HTTPException, status
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_db, get_current_user
from app.templates_config import templates
from app.models.user import User
from app.services import widget_service

router = APIRouter(prefix="/dashboard/widgets", tags=["widgets"])

class ReorderRequest(BaseModel):
    widget_ids: List[int]

@router.get("/{widget_id}", response_class=HTMLResponse)
async def get_widget_fragment(
    request: Request,
    widget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the rendered HTML fragment for a single widget."""
    widget = widget_service.get_widget(db, widget_id)
    if not widget or widget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Widget not found")
        
    data = widget_service.get_widget_data(db, current_user.id, widget)
    
    return templates.TemplateResponse(
        request=request,
        name=f"partials/widget_{widget.widget_type}.html",
        context={"widget": widget, "data": data},
    )

@router.post("/{widget_id}/toggle", response_class=HTMLResponse)
async def toggle_widget(
    request: Request,
    widget_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggles visibility and returns the updated widget container."""
    widget = widget_service.get_widget(db, widget_id)
    if not widget or widget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Widget not found")
        
    widget = widget_service.toggle_widget_visibility(db, widget)
    data = widget_service.get_widget_data(db, current_user.id, widget)
    
    return templates.TemplateResponse(
        request=request,
        name=f"partials/widget_container.html",
        context={"widget": widget, "data": data},
    )

@router.post("/reorder")
async def reorder_widgets(
    request: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates the position of widgets."""
    widget_service.reorder_widgets(db, current_user.id, request.widget_ids)
    return JSONResponse({"status": "success"})
