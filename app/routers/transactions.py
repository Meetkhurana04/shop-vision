from typing import Optional
from datetime import date
from fastapi import APIRouter, Request, Depends, Form, HTTPException, status
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.dependencies import get_db, get_current_user
from app.templates_config import templates
from app.models.user import User
from app.schemas.transaction import TransactionCreate
from app.services import transaction_service

router = APIRouter(prefix="/transactions", tags=["transactions"])

@router.get("", response_class=HTMLResponse)
async def transaction_list(
    request: Request,
    type: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List transactions with optional filters."""
    txns = transaction_service.get_transactions(
        db, user_id=current_user.id, txn_type=type, start_date=start_date, end_date=end_date
    )
    
    if "hx-request" in request.headers and not request.headers.get("hx-boosted"):
        # If HTMX request and not a full page boosted request, just return the table rows
        return templates.TemplateResponse(
            request=request,
            name="partials/transaction_list.html",
            context={"transactions": txns},
        )
        
    return templates.TemplateResponse(
        request=request,
        name="transactions/index.html",
        context={
            "page_title": "Transactions", 
            "transactions": txns, 
            "user": current_user,
            "type_filter": type,
            "start_date": start_date,
            "end_date": end_date
        },
    )

@router.get("/add", response_class=HTMLResponse)
async def add_transaction_modal(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Returns the add transaction form modal fragment."""
    return templates.TemplateResponse(
        request=request,
        name="transactions/form_modal.html",
        context={"action_url": "/transactions/add", "method": "POST", "title": "Add Transaction"},
    )

@router.post("/add", response_class=HTMLResponse)
async def add_transaction_submit(
    request: Request,
    type: str = Form(...),
    amount: float = Form(...),
    date_val: date = Form(alias="date"),
    description: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create transaction and return new row with close-modal trigger."""
    try:
        txn_in = TransactionCreate(
            type=type, amount=amount, date=date_val, description=description, note=note
        )
    except ValueError as e:
        return templates.TemplateResponse(
            request=request,
            name="transactions/form_modal.html",
            context={
                "action_url": "/transactions/add", 
                "method": "POST", 
                "title": "Add Transaction",
                "error": str(e)
            },
            status_code=422
        )
        
    txn = transaction_service.create_transaction(db, current_user.id, txn_in)
    
    response = templates.TemplateResponse(
        request=request,
        name="partials/transaction_row.html",
        context={"txn": txn},
    )
    # Tell Alpine to close the modal and HTMX to swap the row in
    response.headers["HX-Trigger"] = "transactionAdded, closeModal"
    return response

@router.get("/{txn_id}", response_class=HTMLResponse)
async def transaction_detail_modal(
    request: Request,
    txn_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """View transaction details in a modal."""
    txn = transaction_service.get_transaction(db, txn_id)
    if not txn or txn.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    return templates.TemplateResponse(
        request=request,
        name="transactions/detail.html",
        context={"txn": txn},
    )

@router.get("/{txn_id}/edit", response_class=HTMLResponse)
async def edit_transaction_modal(
    request: Request,
    txn_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns the edit transaction form modal fragment."""
    txn = transaction_service.get_transaction(db, txn_id)
    if not txn or txn.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    return templates.TemplateResponse(
        request=request,
        name="transactions/form_modal.html",
        context={"action_url": f"/transactions/{txn_id}", "method": "PUT", "title": "Edit Transaction", "txn": txn},
    )

@router.put("/{txn_id}", response_class=HTMLResponse)
async def edit_transaction_submit(
    request: Request,
    txn_id: int,
    type: str = Form(...),
    amount: float = Form(...),
    date_val: date = Form(alias="date"),
    description: Optional[str] = Form(None),
    note: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update transaction and return updated row."""
    db_txn = transaction_service.get_transaction(db, txn_id)
    if not db_txn or db_txn.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    try:
        txn_in = TransactionCreate(
            type=type, amount=amount, date=date_val, description=description, note=note
        )
    except ValueError as e:
        return templates.TemplateResponse(
            request=request,
            name="transactions/form_modal.html",
            context={
                "action_url": f"/transactions/{txn_id}", 
                "method": "PUT", 
                "title": "Edit Transaction",
                "txn": db_txn,
                "error": str(e)
            },
            status_code=422
        )
        
    txn = transaction_service.update_transaction(db, db_txn, txn_in)
    
    response = templates.TemplateResponse(
        request=request,
        name="partials/transaction_row.html",
        context={"txn": txn},
    )
    response.headers["HX-Trigger"] = "transactionUpdated, closeModal"
    return response

@router.delete("/{txn_id}")
async def delete_transaction(
    request: Request,
    txn_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete transaction and remove row."""
    db_txn = transaction_service.get_transaction(db, txn_id)
    if not db_txn or db_txn.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    transaction_service.delete_transaction(db, db_txn)
    
    # Return empty string to remove row, trigger events
    response = HTMLResponse("")
    response.headers["HX-Trigger"] = "transactionDeleted"
    return response
