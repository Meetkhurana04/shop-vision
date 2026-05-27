from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import date
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate

def get_transactions(
    db: Session, 
    user_id: Optional[int] = None, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None,
    txn_type: Optional[str] = None,
    limit: int = 50
):
    """Fetch transactions with optional filtering."""
    query = db.query(Transaction)
    
    if user_id is not None:
        query = query.filter(Transaction.user_id == user_id)
        
    if start_date:
        query = query.filter(Transaction.date >= start_date)
        
    if end_date:
        query = query.filter(Transaction.date <= end_date)
        
    if txn_type:
        query = query.filter(Transaction.type == txn_type)
        
    return query.order_by(desc(Transaction.date), desc(Transaction.id)).limit(limit).all()

def get_transaction(db: Session, transaction_id: int) -> Optional[Transaction]:
    """Get a single transaction by ID."""
    return db.query(Transaction).filter(Transaction.id == transaction_id).first()

def create_transaction(db: Session, user_id: int, txn_in: TransactionCreate) -> Transaction:
    """Create a new transaction."""
    txn = Transaction(
        user_id=user_id,
        type=txn_in.type,
        amount=txn_in.amount,
        description=txn_in.description,
        note=txn_in.note,
        date=txn_in.date,
        category_id=txn_in.category_id,
        receipt_id=txn_in.receipt_id,
        receipt_image_path=txn_in.receipt_image_path
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn

def update_transaction(db: Session, db_txn: Transaction, txn_in: TransactionCreate) -> Transaction:
    """Update an existing transaction."""
    db_txn.type = txn_in.type
    db_txn.amount = txn_in.amount
    db_txn.description = txn_in.description
    db_txn.note = txn_in.note
    db_txn.date = txn_in.date
    db_txn.category_id = txn_in.category_id
    db_txn.receipt_id = txn_in.receipt_id
    db_txn.receipt_image_path = txn_in.receipt_image_path
    
    db.commit()
    db.refresh(db_txn)
    return db_txn

def delete_transaction(db: Session, db_txn: Transaction):
    """Delete a transaction."""
    db.delete(db_txn)
    db.commit()
