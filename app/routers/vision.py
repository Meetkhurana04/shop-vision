from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db, get_current_user
from app.templates_config import templates
from app.models.user import User
from app.models.customer import Customer, CustomerFace, CustomerVisit
from app.models.transaction import Transaction

import json, uuid, base64
from datetime import date
from pathlib import Path

router = APIRouter(prefix="/vision", tags=["vision"])


# ── Private helpers ─────────────────────────────────────────────

def _save_image(data_url: str, folder: str) -> str | None:
    """Decode a base64 data URL and save as JPEG. Returns relative path."""
    try:
        b64 = data_url.split(",")[1] if "," in data_url else data_url
        img_bytes = base64.b64decode(b64)
        filename  = f"{uuid.uuid4().hex}.jpg"
        save_dir  = Path(f"app/static/uploads/{folder}")
        save_dir.mkdir(parents=True, exist_ok=True)
        (save_dir / filename).write_bytes(img_bytes)
        return f"uploads/{folder}/{filename}"
    except Exception:
        return None


def _compute_stats(customer_id: int, db: Session) -> dict:
    """Returns outstanding balance + last payment + last udhaar."""
    txns         = db.query(Transaction).filter(Transaction.customer_id == customer_id).all()
    total_udhaar  = sum(t.amount for t in txns if t.type == "udhaar")
    total_payment = sum(t.amount for t in txns if t.type == "payment")
    outstanding   = total_udhaar - total_payment

    last_payment = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer_id, Transaction.type == "payment")
        .order_by(Transaction.created_at.desc()).first()
    )
    last_udhaar = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer_id, Transaction.type == "udhaar")
        .order_by(Transaction.created_at.desc()).first()
    )
    return {"outstanding": outstanding, "last_payment": last_payment, "last_udhaar": last_udhaar}


def _compute_running_balances(customer_id: int, db: Session) -> dict:
    """
    Returns {txn_id: running_balance} computed oldest→newest.
    running_balance = cumulative (udhaar - payment) up to and including that txn.
    Positive = shop is owed money. Negative = advance paid.
    """
    all_txns = (
        db.query(Transaction)
        .filter(Transaction.customer_id == customer_id)
        .order_by(Transaction.created_at.asc())
        .all()
    )
    running = 0.0
    balance_map = {}
    for t in all_txns:
        running += t.amount if t.type == "udhaar" else -t.amount
        balance_map[t.id] = running
    return balance_map


def _get_suggestions(customer_id: int, db: Session) -> list:
    """Returns top 3 most-used transaction amounts for this customer."""
    rows = (
        db.query(Transaction.amount, func.count(Transaction.amount).label("cnt"))
        .filter(Transaction.customer_id == customer_id)
        .group_by(Transaction.amount)
        .order_by(func.count(Transaction.amount).desc())
        .limit(3)
        .all()
    )
    return [int(r.amount) for r in rows]


# ── 1. Main Vision Dashboard (camera feed) ──────────────────────
@router.get("", response_class=HTMLResponse)
async def vision_dashboard(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return templates.TemplateResponse(
        request=request, name="vision/index.html",
        context={"page_title": "Smart Vision"},
    )


# ── 2. All Families list ────────────────────────────────────────
@router.get("/customers", response_class=HTMLResponse)
async def families_list(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customers = db.query(Customer).order_by(Customer.family_name).all()
    family_data = []
    for c in customers:
        stats = _compute_stats(c.id, db)
        family_data.append({"customer": c, "outstanding": stats["outstanding"]})
    return templates.TemplateResponse(
        request=request, name="vision/families.html",
        context={"page_title": "All Families", "family_data": family_data},
    )


# ── 3. Register new face ────────────────────────────────────────
@router.post("/register")
async def register_face(
    request: Request,
    family_name: str = Form(...),
    display_name: str = Form(""),
    phone: str = Form(""),
    embedding: str = Form(...),
    image_data: str = Form(...),
    db: Session = Depends(get_db),
):
    customer = Customer(family_name=family_name, display_name=display_name, phone=phone)
    db.add(customer); db.commit(); db.refresh(customer)

    image_path = _save_image(image_data, "faces")
    if image_path:
        # rename extension to .png since faces are png
        image_path = image_path.replace(".jpg", ".png")
        # re-save properly
        b64 = image_data.split(",")[1] if "," in image_data else image_data
        img_bytes = base64.b64decode(b64)
        full_path = Path(f"app/static/{image_path}")
        full_path.parent.mkdir(parents=True, exist_ok=True)
        full_path.write_bytes(img_bytes)

    face = CustomerFace(
        customer_id=customer.id,
        image_path=image_path or "uploads/faces/default.png",
        embedding=embedding,
    )
    db.add(face); db.commit()
    return HTMLResponse(
        f"<div class='p-3 bg-green-100 text-green-800 rounded'>Registered <b>{family_name}</b>!</div>"
    )


# ── 4. Get all embeddings for client-side matching ──────────────
@router.get("/embeddings")
async def get_embeddings(db: Session = Depends(get_db)):
    faces = db.query(CustomerFace).all()
    results = []
    for face in faces:
        c = db.query(Customer).filter(Customer.id == face.customer_id).first()
        results.append({
            "face_id": face.id,
            "customer_id": c.id,
            "family_name": c.family_name,
            "display_name": c.display_name,
            "embedding": json.loads(face.embedding),
            "image_url": f"/static/{face.image_path}",
        })
    return results


# ── 5. Full Family Customer Page ────────────────────────────────
@router.get("/customer/{customer_id}", response_class=HTMLResponse)
async def customer_page(
    request: Request,
    customer_id: int,
    page: int = 1,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        return HTMLResponse("Customer not found", status_code=404)

    stats       = _compute_stats(customer_id, db)
    suggestions = _get_suggestions(customer_id, db)
    balance_map = _compute_running_balances(customer_id, db)

    per_page   = 10
    offset     = (page - 1) * per_page
    total      = db.query(Transaction).filter(Transaction.customer_id == customer_id).count()
    txns       = (
        db.query(Transaction).filter(Transaction.customer_id == customer_id)
        .order_by(Transaction.created_at.desc())
        .offset(offset).limit(per_page).all()
    )
    total_pages = max(1, (total + per_page - 1) // per_page)

    return templates.TemplateResponse(
        request=request, name="vision/customer_page.html",
        context={
            "page_title": f"{customer.family_name} Family",
            "customer": customer,
            "stats": stats,
            "suggestions": suggestions,
            "transactions": txns,
            "running_balances": balance_map,
            "page": page,
            "total_pages": total_pages,
            "total_txns": total,
        },
    )


# ── 6. Add transaction → return new row partial ─────────────────
@router.post("/customer/{customer_id}/add", response_class=HTMLResponse)
async def add_customer_transaction(
    request: Request,
    customer_id: int,
    amount: float = Form(...),
    txn_type: str = Form(...),
    snapshot_image: str = Form(""),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    receipt_path = _save_image(snapshot_image, "transactions") if snapshot_image else None

    txn = Transaction(
        user_id=current_user.id,
        customer_id=customer_id,
        type=txn_type,
        amount=amount,
        date=date.today(),
        receipt_image_path=receipt_path,
    )
    db.add(txn); db.commit(); db.refresh(txn)

    # Running balance for this new row = current outstanding
    stats = _compute_stats(customer_id, db)
    running_balance = stats["outstanding"]

    response = templates.TemplateResponse(
        request=request, name="vision/partials/transaction_row.html",
        context={"txn": txn, "running_balance": running_balance},
    )
    response.headers["HX-Trigger"] = "transactionAdded"
    return response


# ── 7. Stats partial (HTMX refresh) ────────────────────────────
@router.get("/customer/{customer_id}/stats", response_class=HTMLResponse)
async def customer_stats(
    request: Request,
    customer_id: int,
    db: Session = Depends(get_db),
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    stats    = _compute_stats(customer_id, db)
    return templates.TemplateResponse(
        request=request, name="vision/partials/customer_stats.html",
        context={"customer": customer, "stats": stats},
    )


# ── 8. Paginated transactions partial ──────────────────────────
@router.get("/customer/{customer_id}/transactions", response_class=HTMLResponse)
async def customer_transactions(
    request: Request,
    customer_id: int,
    page: int = 1,
    db: Session = Depends(get_db),
):
    per_page    = 10
    offset      = (page - 1) * per_page
    total       = db.query(Transaction).filter(Transaction.customer_id == customer_id).count()
    txns        = (
        db.query(Transaction).filter(Transaction.customer_id == customer_id)
        .order_by(Transaction.created_at.desc())
        .offset(offset).limit(per_page).all()
    )
    stats       = _compute_stats(customer_id, db)
    balance_map = _compute_running_balances(customer_id, db)

    return templates.TemplateResponse(
        request=request, name="vision/partials/transaction_table.html",
        context={
            "transactions": txns,
            "stats": stats,
            "running_balances": balance_map,
            "page": page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
            "customer_id": customer_id,
        },
    )


# ── 9. Edit transaction ─────────────────────────────────────────
@router.post("/customer/{customer_id}/transaction/{txn_id}/edit", response_class=HTMLResponse)
async def edit_transaction(
    request: Request,
    customer_id: int,
    txn_id: int,
    amount: float = Form(...),
    txn_type: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.customer_id == customer_id,
    ).first()
    if not txn:
        return HTMLResponse("Not found", status_code=404)

    txn.amount = amount
    txn.type   = txn_type
    db.commit(); db.refresh(txn)

    balance_map     = _compute_running_balances(customer_id, db)
    running_balance = balance_map.get(txn.id, 0)

    response = templates.TemplateResponse(
        request=request, name="vision/partials/transaction_row.html",
        context={"txn": txn, "running_balance": running_balance},
    )
    response.headers["HX-Trigger"] = "transactionAdded"
    return response


# ── 10. Delete transaction ──────────────────────────────────────
@router.post("/customer/{customer_id}/transaction/{txn_id}/delete", response_class=HTMLResponse)
async def delete_transaction(
    customer_id: int,
    txn_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    txn = db.query(Transaction).filter(
        Transaction.id == txn_id,
        Transaction.customer_id == customer_id,
    ).first()
    if txn:
        db.delete(txn); db.commit()

    # Return empty string — JS will remove the row and refresh stats
    response = HTMLResponse("")
    response.headers["HX-Trigger"] = "transactionAdded"
    return response
