"""
Seed script to populate the database with initial data.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, engine, Base
from app.models.models import User, Category, Supplier, Product, ExpenseCategory, UserRole
from app.core.security import get_password_hash

Base.metadata.create_all(bind=engine)

db = SessionLocal()

try:
    # Super Admin
    if not db.query(User).filter(User.email == "admin@stockpilot.com").first():
        db.add(User(
            full_name="Super Admin",
            email="admin@stockpilot.com",
            hashed_password=get_password_hash("Admin@123"),
            role=UserRole.SUPER_ADMIN,
        ))

    if not db.query(User).filter(User.email == "manager@stockpilot.com").first():
        db.add(User(
            full_name="Store Manager",
            email="manager@stockpilot.com",
            hashed_password=get_password_hash("Manager@123"),
            role=UserRole.MANAGER,
        ))

    if not db.query(User).filter(User.email == "cashier@stockpilot.com").first():
        db.add(User(
            full_name="John Cashier",
            email="cashier@stockpilot.com",
            hashed_password=get_password_hash("Cashier@123"),
            role=UserRole.CASHIER,
        ))

    # Categories
    categories = ["Electronics", "Clothing", "Food & Beverages", "Health & Beauty", "Home & Kitchen", "Sports", "Books", "Toys"]
    for name in categories:
        if not db.query(Category).filter(Category.name == name).first():
            db.add(Category(name=name))

    # Suppliers
    suppliers_data = [
        {"name": "TechSupply Co", "company_name": "TechSupply Ltd", "email": "contact@techsupply.com", "phone": "+1-555-0101"},
        {"name": "Global Goods", "company_name": "Global Goods Inc", "email": "sales@globalgoods.com", "phone": "+1-555-0102"},
        {"name": "FreshMart", "company_name": "FreshMart Wholesale", "email": "orders@freshmart.com", "phone": "+1-555-0103"},
    ]
    for s in suppliers_data:
        if not db.query(Supplier).filter(Supplier.email == s["email"]).first():
            db.add(Supplier(**s))

    # Expense Categories
    exp_cats = ["Rent", "Utilities", "Salaries", "Marketing", "Maintenance", "Transportation", "Miscellaneous"]
    for name in exp_cats:
        if not db.query(ExpenseCategory).filter(ExpenseCategory.name == name).first():
            db.add(ExpenseCategory(name=name))

    db.commit()
    print("✅ Database seeded successfully!")
    print("\n📋 Login Credentials:")
    print("  Super Admin: admin@stockpilot.com / Admin@123")
    print("  Manager:     manager@stockpilot.com / Manager@123")
    print("  Cashier:     cashier@stockpilot.com / Cashier@123")

except Exception as e:
    db.rollback()
    print(f"❌ Seeding failed: {e}")
    raise
finally:
    db.close()
