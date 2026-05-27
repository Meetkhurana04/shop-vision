"""
seed.py
Run this ONCE after Phase 1 setup to populate the database
with default categories and an owner account.

Usage:
    python seed.py

What it creates:
  - 1 owner user  (username: owner / password: shopvision123)
  - Default income + expense categories

Safe to run multiple times -- uses get-or-create logic.
"""

import sys
import io

# Force UTF-8 stdout on Windows to avoid emoji encoding errors
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, create_all_tables
from app.models.user import User
from app.models.category import Category
from app.services.auth_service import hash_password


def seed():
    create_all_tables()

    db = SessionLocal()
    try:
        _seed_categories(db)
        _seed_owner(db)
        db.commit()
        print("")
        print("Seed complete! You can log in with:")
        print("  Username : owner")
        print("  Password : shopvision123")
        print("")
        print("WARNING: Change the password immediately after first login!")
        print("")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
        raise
    finally:
        db.close()


def _seed_categories(db):
    default_categories = [
        # Income categories
        {"name": "Sales",           "type": "income",  "color": "#10b981", "icon": "shopping-bag"},
        {"name": "Service",         "type": "income",  "color": "#06b6d4", "icon": "wrench"},
        {"name": "Rent Received",   "type": "income",  "color": "#8b5cf6", "icon": "home"},
        {"name": "Other Income",    "type": "income",  "color": "#6366f1", "icon": "plus-circle"},
        # Expense categories
        {"name": "Stock Purchase",  "type": "expense", "color": "#f43f5e", "icon": "archive"},
        {"name": "Rent Paid",       "type": "expense", "color": "#ef4444", "icon": "home"},
        {"name": "Electricity",     "type": "expense", "color": "#f59e0b", "icon": "bolt"},
        {"name": "Salaries",        "type": "expense", "color": "#ec4899", "icon": "user-group"},
        {"name": "Transport",       "type": "expense", "color": "#84cc16", "icon": "truck"},
        {"name": "Repairs",         "type": "expense", "color": "#fb923c", "icon": "wrench-screwdriver"},
        {"name": "Other Expense",   "type": "expense", "color": "#6b7280", "icon": "minus-circle"},
    ]

    created = 0
    for cat_data in default_categories:
        exists = db.query(Category).filter_by(name=cat_data["name"]).first()
        if not exists:
            db.add(Category(**cat_data))
            created += 1

    if created:
        print(f"  [OK] Created {created} default categories")
    else:
        print("  [OK] Categories already exist -- skipped")


def _seed_owner(db):
    exists = db.query(User).filter_by(username="owner").first()
    if exists:
        print("  [OK] Owner user already exists -- skipped")
        return

    owner = User(
        name="Shop Owner",
        username="owner",
        password_hash=hash_password("shopvision123"),
        role="owner",
        is_active=True,
    )
    db.add(owner)
    print("  [OK] Created owner user")


if __name__ == "__main__":
    seed()
