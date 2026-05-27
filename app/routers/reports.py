from typing import Optional
from datetime import date, timedelta
from fastapi import APIRouter, Request, Depends, Query
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session

from app.dependencies import get_current_user, get_db
from app.templates_config import templates
from app.models.user import User
from app.services import report_service

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("", response_class=HTMLResponse)
async def reports_page(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Main reports page structure."""
    
    # Default to current month
    today = date.today()
    start_date = today.replace(day=1)
    
    return templates.TemplateResponse(
        request=request,
        name="reports/index.html",
        context={
            "page_title": "Reports & Analytics",
            "default_start": start_date.isoformat(),
            "default_end": today.isoformat()
        },
    )

@router.get("/partials/summary", response_class=HTMLResponse)
async def report_summary_partial(
    request: Request,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """HTMX endpoint to return P&L and Top Items as HTML."""
    pnl = report_service.get_profit_and_loss(db, current_user.id, start_date, end_date)
    top_sales = report_service.get_top_items(db, current_user.id, "sale", 5, start_date, end_date)
    top_expenses = report_service.get_top_items(db, current_user.id, "expense", 5, start_date, end_date)
    
    return templates.TemplateResponse(
        request=request,
        name="reports/partials/summary.html",
        context={"pnl": pnl, "top_sales": top_sales, "top_expenses": top_expenses},
    )

@router.get("/data/charts", response_class=JSONResponse)
async def report_charts_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """JSON endpoint for Chart.js to render Sales and Expenses."""
    # Determine if we should group daily or monthly based on date range
    period = "daily"
    if start_date and end_date:
        if (end_date - start_date).days > 60:
            period = "monthly"
            
    sales_data = report_service.get_sales_summary(db, current_user.id, period, start_date, end_date)
    
    # Expenses pie chart
    top_expenses = report_service.get_top_items(db, current_user.id, "expense", 5, start_date, end_date)
    
    return {
        "sales": {
            "labels": [d["date"] for d in sales_data],
            "data": [d["total"] for d in sales_data]
        },
        "expenses": {
            "labels": [d["item"] for d in top_expenses] + (["Other"] if not top_expenses else []),
            "data": [d["total"] for d in top_expenses] + ([0] if not top_expenses else [])
        }
    }

@router.get("/export/data", response_class=JSONResponse)
async def export_data(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns raw JSON for Web Worker to process into CSV/PDF."""
    data = report_service.get_all_transactions_for_export(db, current_user.id, start_date, end_date)
    return {"transactions": data}
