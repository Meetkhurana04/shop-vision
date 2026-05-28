import json
from datetime import date, datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, or_

from app.models.widget import DashboardWidget
from app.models.transaction import Transaction

DEFAULT_WIDGETS = [
    {"widget_type": "summary_card", "config": '{"title": "Today\'s Sales", "metric": "today_sales"}'},
    {"widget_type": "summary_card", "config": '{"title": "Pending Credits", "metric": "pending_credits"}'},
    {"widget_type": "quick_add", "config": None},
    {"widget_type": "bar_chart", "config": '{"title": "Monthly Sales"}'},
    {"widget_type": "recent_transactions", "config": '{"limit": 5}'}
]

def get_user_widgets(db: Session, user_id: int) -> List[DashboardWidget]:
    """Get widgets for a user. If none exist, create defaults."""
    widgets = db.query(DashboardWidget).filter(DashboardWidget.user_id == user_id).order_by(DashboardWidget.position).all()
    
    if not widgets:
        # Create default widgets
        for i, w_def in enumerate(DEFAULT_WIDGETS):
            new_widget = DashboardWidget(
                user_id=user_id,
                widget_type=w_def["widget_type"],
                config=w_def["config"],
                position=i,
                is_visible=True
            )
            db.add(new_widget)
        db.commit()
        widgets = db.query(DashboardWidget).filter(DashboardWidget.user_id == user_id).order_by(DashboardWidget.position).all()
        
    return widgets

def get_widget(db: Session, widget_id: int) -> Optional[DashboardWidget]:
    return db.query(DashboardWidget).filter(DashboardWidget.id == widget_id).first()

def toggle_widget_visibility(db: Session, widget: DashboardWidget) -> DashboardWidget:
    widget.is_visible = not widget.is_visible
    db.commit()
    db.refresh(widget)
    return widget

def reorder_widgets(db: Session, user_id: int, widget_ids: List[int]):
    """Update positions of widgets based on the provided list of IDs."""
    widgets = db.query(DashboardWidget).filter(DashboardWidget.user_id == user_id).all()
    widget_map = {w.id: w for w in widgets}
    
    for i, wid in enumerate(widget_ids):
        if wid in widget_map:
            widget_map[wid].position = i
            
    db.commit()

def get_widget_data(db: Session, user_id: int, widget: DashboardWidget) -> Dict[str, Any]:
    """Calculate and return data for a specific widget."""
    config = json.loads(widget.config) if widget.config else {}
    today = date.today()
    
    if widget.widget_type == "summary_card":
        metric = config.get("metric")
        if metric == "today_sales":
            # Today's sales = regular 'sale' transactions today
            val = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.date == today,
                Transaction.type == "sale"
            ).scalar() or 0.0
            return {"value": val, "title": config.get("title", "Today's Sales"), "is_currency": True, "color": "green"}
            
        elif metric == "pending_credits":
            # Pending = total udhaar (vision) + credit_given (old) - total payments (vision) - credit_taken (old)
            udhaar = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.type.in_(["udhaar", "credit_given"])
            ).scalar() or 0.0
            paid = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.type.in_(["payment", "credit_taken"])
            ).scalar() or 0.0
            net = udhaar - paid
            return {"value": max(net, 0), "title": config.get("title", "Pending Credits"), "is_currency": True, "color": "yellow" if net > 0 else "green"}
            
    elif widget.widget_type == "recent_transactions":
        limit = config.get("limit", 5)
        txns = db.query(Transaction).filter(
            Transaction.user_id == user_id
        ).order_by(Transaction.date.desc(), Transaction.id.desc()).limit(limit).all()
        return {"transactions": txns, "title": config.get("title", "Recent Activity")}
        
    elif widget.widget_type == "bar_chart":
        # Get sales for the last 6 months
        labels = []
        data = []
        for i in range(5, -1, -1):
            target_month = today.replace(day=1) - timedelta(days=28 * i)
            target_month = target_month.replace(day=1) # Ensure we are at start of month
            
            # This is a bit rough for SQLite due to date manipulation, but let's use string matching or extract.
            # In SQLite, strftime('%Y-%m', date) works, but we can also just filter between dates.
            # Using simple python filtering for a small dataset, or basic ranges.
            start_date = target_month
            if target_month.month == 12:
                end_date = target_month.replace(year=target_month.year + 1, month=1)
            else:
                end_date = target_month.replace(month=target_month.month + 1)
                
            val = db.query(func.sum(Transaction.amount)).filter(
                Transaction.user_id == user_id,
                Transaction.type == "sale",
                Transaction.date >= start_date,
                Transaction.date < end_date
            ).scalar() or 0.0
            
            labels.append(start_date.strftime("%b %Y"))
            data.append(val)
            
        return {
            "title": config.get("title", "Monthly Sales"),
            "chart_data": {
                "labels": labels,
                "datasets": [{
                    "label": "Sales",
                    "data": data,
                    "backgroundColor": "rgba(99, 102, 241, 0.8)",
                    "borderRadius": 4
                }]
            }
        }
        
    elif widget.widget_type == "quick_add":
        return {"title": "Quick Add"}
        
    return {}
