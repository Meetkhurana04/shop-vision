from datetime import date, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, extract, and_

from app.models.transaction import Transaction

def get_sales_summary(db: Session, user_id: int, period: str = "daily", start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """Get sales summary grouped by period (daily, weekly, monthly)."""
    
    query = db.query(
        Transaction.date,
        func.sum(Transaction.amount).label("total_sales")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == "sale"
    )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    # Group by date for daily. For SQLite, grouping by week/month requires string manipulation.
    if period == "monthly":
        query = db.query(
            func.strftime('%Y-%m', Transaction.date).label("period_date"),
            func.sum(Transaction.amount).label("total_sales")
        ).filter(
            Transaction.user_id == user_id,
            Transaction.type == "sale"
        )
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
            
        results = query.group_by("period_date").order_by("period_date").all()
        return [{"date": row.period_date, "total": row.total_sales} for row in results]
        
    else:
        # Default to daily
        results = query.group_by(Transaction.date).order_by(Transaction.date).all()
        return [{"date": row.date.strftime("%Y-%m-%d"), "total": row.total_sales} for row in results]

def get_profit_and_loss(db: Session, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> Dict[str, float]:
    """Calculate total sales vs total expenses."""
    query = db.query(
        Transaction.type,
        func.sum(Transaction.amount).label("total")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type.in_(["sale", "expense"])
    )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    results = query.group_by(Transaction.type).all()
    
    data = {"sales": 0.0, "expenses": 0.0, "profit": 0.0}
    for row in results:
        if row.type == "sale":
            data["sales"] = float(row.total or 0)
        elif row.type == "expense":
            data["expenses"] = float(row.total or 0)
            
    data["profit"] = data["sales"] - data["expenses"]
    return data

def get_top_items(db: Session, user_id: int, type_filter: str = "sale", limit: int = 5, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """Get top items/descriptions by total amount."""
    query = db.query(
        Transaction.description,
        func.sum(Transaction.amount).label("total"),
        func.count(Transaction.id).label("count")
    ).filter(
        Transaction.user_id == user_id,
        Transaction.type == type_filter,
        Transaction.description != None,
        Transaction.description != ""
    )
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    results = query.group_by(func.lower(Transaction.description)).order_by(func.sum(Transaction.amount).desc()).limit(limit).all()
    
    return [{"item": row.description, "total": row.total, "count": row.count} for row in results]

def get_all_transactions_for_export(db: Session, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[Dict[str, Any]]:
    """Get raw data for web worker to export."""
    query = db.query(Transaction).filter(Transaction.user_id == user_id)
    
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    results = query.order_by(Transaction.date.desc(), Transaction.id.desc()).all()
    
    return [
        {
            "id": t.id,
            "date": t.date.isoformat(),
            "type": t.type,
            "amount": float(t.amount),
            "description": t.description or "",
            "note": t.note or ""
        }
        for t in results
    ]
