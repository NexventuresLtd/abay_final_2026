"""
Seed script — run once to populate the database with test data.
Run: python seed.py
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.db.database import SessionLocal, engine, Base
from app.models.models import (
    User, Category, Supplier, Product, ExpenseCategory,
    Expense, Sale, SaleItem, StockMovement,
    UserRole, StockMovementType, SaleStatus
)
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import random
import uuid

Base.metadata.create_all(bind=engine)
db = SessionLocal()

def generate_reference():
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"

try:
    # ─── Users ────────────────────────────────────────────────────────────────
    print("🌱 Seeding users...")
    users_data = [
        {"full_name": "Super Admin",   "email": "admin@stockpilot.com",   "password": "Admin@123",   "role": UserRole.SUPER_ADMIN},
        {"full_name": "Store Manager", "email": "manager@stockpilot.com", "password": "Manager@123", "role": UserRole.MANAGER},
        {"full_name": "John Cashier",  "email": "cashier@stockpilot.com", "password": "Cashier@123", "role": UserRole.CASHIER},
    ]
    users = {}
    for u in users_data:
        existing = db.query(User).filter(User.email == u["email"]).first()
        if not existing:
            user = User(
                full_name=u["full_name"],
                email=u["email"],
                hashed_password=get_password_hash(u["password"]),
                role=u["role"],
            )
            db.add(user)
            db.flush()
            users[u["email"]] = user
        else:
            users[u["email"]] = existing
    db.commit()

    # ─── Categories ───────────────────────────────────────────────────────────
    print("🌱 Seeding categories...")
    categories_data = [
        {"name": "Electronics",       "description": "Phones, laptops, accessories"},
        {"name": "Clothing",          "description": "Men and women apparel"},
        {"name": "Food & Beverages",  "description": "Groceries and drinks"},
        {"name": "Health & Beauty",   "description": "Personal care products"},
        {"name": "Home & Kitchen",    "description": "Household items"},
        {"name": "Sports",            "description": "Sports and fitness equipment"},
        {"name": "Books",             "description": "Books and stationery"},
        {"name": "Toys",              "description": "Children toys and games"},
    ]
    categories = {}
    for c in categories_data:
        existing = db.query(Category).filter(Category.name == c["name"]).first()
        if not existing:
            cat = Category(**c)
            db.add(cat)
            db.flush()
            categories[c["name"]] = cat
        else:
            categories[c["name"]] = existing
    db.commit()

    # ─── Suppliers ────────────────────────────────────────────────────────────
    print("🌱 Seeding suppliers...")
    suppliers_data = [
        {"name": "TechSupply Co",   "company_name": "TechSupply Ltd",       "email": "contact@techsupply.com",  "phone": "+1-555-0101", "address": "123 Tech Street, NY"},
        {"name": "Global Goods",    "company_name": "Global Goods Inc",      "email": "sales@globalgoods.com",   "phone": "+1-555-0102", "address": "456 Trade Ave, CA"},
        {"name": "FreshMart",       "company_name": "FreshMart Wholesale",   "email": "orders@freshmart.com",    "phone": "+1-555-0103", "address": "789 Market Rd, TX"},
        {"name": "StyleWorld",      "company_name": "StyleWorld Fashion",    "email": "info@styleworld.com",     "phone": "+1-555-0104", "address": "321 Fashion Blvd, FL"},
        {"name": "HomeBase",        "company_name": "HomeBase Distributors", "email": "supply@homebase.com",     "phone": "+1-555-0105", "address": "654 Home Lane, IL"},
    ]
    suppliers = {}
    for s in suppliers_data:
        existing = db.query(Supplier).filter(Supplier.email == s["email"]).first()
        if not existing:
            sup = Supplier(**s)
            db.add(sup)
            db.flush()
            suppliers[s["name"]] = sup
        else:
            suppliers[s["name"]] = existing
    db.commit()

    # ─── Expense Categories ───────────────────────────────────────────────────
    print("🌱 Seeding expense categories...")
    exp_cat_names = ["Rent", "Utilities", "Salaries", "Marketing", "Maintenance", "Transportation", "Miscellaneous"]
    exp_cats = {}
    for name in exp_cat_names:
        existing = db.query(ExpenseCategory).filter(ExpenseCategory.name == name).first()
        if not existing:
            ec = ExpenseCategory(name=name)
            db.add(ec)
            db.flush()
            exp_cats[name] = ec
        else:
            exp_cats[name] = existing
    db.commit()

    # ─── Products ─────────────────────────────────────────────────────────────
    print("🌱 Seeding products...")
    products_data = [
        # Electronics
        {"name": "iPhone 15 Pro",        "sku": "IPH-15P-001", "brand": "Apple",    "cost_price": 850.00,  "selling_price": 1099.00, "quantity": 25,  "low_stock_threshold": 5,  "category": "Electronics",      "supplier": "TechSupply Co"},
        {"name": "Samsung Galaxy S24",   "sku": "SAM-S24-001", "brand": "Samsung",  "cost_price": 650.00,  "selling_price": 899.00,  "quantity": 18,  "low_stock_threshold": 5,  "category": "Electronics",      "supplier": "TechSupply Co"},
        {"name": "MacBook Air M3",       "sku": "MAC-AIR-001", "brand": "Apple",    "cost_price": 1050.00, "selling_price": 1299.00, "quantity": 10,  "low_stock_threshold": 3,  "category": "Electronics",      "supplier": "TechSupply Co"},
        {"name": "Sony WH-1000XM5",      "sku": "SNY-WH5-001", "brand": "Sony",     "cost_price": 220.00,  "selling_price": 349.00,  "quantity": 30,  "low_stock_threshold": 8,  "category": "Electronics",      "supplier": "TechSupply Co"},
        {"name": "iPad Pro 12.9",        "sku": "IPD-PRO-001", "brand": "Apple",    "cost_price": 750.00,  "selling_price": 999.00,  "quantity": 3,   "low_stock_threshold": 5,  "category": "Electronics",      "supplier": "TechSupply Co"},
        {"name": "USB-C Charging Cable", "sku": "CBL-USC-001", "brand": "Anker",    "cost_price": 8.00,    "selling_price": 19.99,   "quantity": 150, "low_stock_threshold": 20, "category": "Electronics",      "supplier": "TechSupply Co"},
        # Clothing
        {"name": "Men's Slim Fit Jeans", "sku": "CLT-JNS-001", "brand": "Levi's",  "cost_price": 35.00,   "selling_price": 79.99,   "quantity": 60,  "low_stock_threshold": 10, "category": "Clothing",         "supplier": "StyleWorld"},
        {"name": "Women's Summer Dress", "sku": "CLT-DRS-001", "brand": "Zara",     "cost_price": 28.00,   "selling_price": 64.99,   "quantity": 45,  "low_stock_threshold": 10, "category": "Clothing",         "supplier": "StyleWorld"},
        {"name": "Nike Running Shoes",   "sku": "CLT-SHO-001", "brand": "Nike",     "cost_price": 65.00,   "selling_price": 129.99,  "quantity": 4,   "low_stock_threshold": 8,  "category": "Clothing",         "supplier": "StyleWorld"},
        {"name": "Classic White T-Shirt","sku": "CLT-TSH-001", "brand": "H&M",      "cost_price": 8.00,    "selling_price": 19.99,   "quantity": 100, "low_stock_threshold": 20, "category": "Clothing",         "supplier": "StyleWorld"},
        # Food & Beverages
        {"name": "Organic Coffee Beans", "sku": "FDB-COF-001", "brand": "Lavazza",  "cost_price": 12.00,   "selling_price": 24.99,   "quantity": 80,  "low_stock_threshold": 15, "category": "Food & Beverages", "supplier": "FreshMart"},
        {"name": "Green Tea Pack",       "sku": "FDB-TEA-001", "brand": "Lipton",   "cost_price": 5.00,    "selling_price": 11.99,   "quantity": 6,   "low_stock_threshold": 10, "category": "Food & Beverages", "supplier": "FreshMart"},
        {"name": "Mineral Water 24pk",   "sku": "FDB-WAT-001", "brand": "Evian",    "cost_price": 10.00,   "selling_price": 18.99,   "quantity": 50,  "low_stock_threshold": 10, "category": "Food & Beverages", "supplier": "FreshMart"},
        {"name": "Protein Bar Box",      "sku": "FDB-PRB-001", "brand": "Clif Bar", "cost_price": 18.00,   "selling_price": 34.99,   "quantity": 2,   "low_stock_threshold": 5,  "category": "Food & Beverages", "supplier": "FreshMart"},
        # Health & Beauty
        {"name": "Vitamin C Supplement", "sku": "HLT-VTC-001", "brand": "Nature",   "cost_price": 12.00,   "selling_price": 24.99,   "quantity": 55,  "low_stock_threshold": 10, "category": "Health & Beauty",  "supplier": "Global Goods"},
        {"name": "Face Moisturizer SPF", "sku": "HLT-FCM-001", "brand": "Neutrogena","cost_price": 14.00,  "selling_price": 28.99,   "quantity": 0,   "low_stock_threshold": 8,  "category": "Health & Beauty",  "supplier": "Global Goods"},
        # Home & Kitchen
        {"name": "Air Fryer 5.5L",       "sku": "HMK-AFR-001", "brand": "Philips",  "cost_price": 70.00,   "selling_price": 129.99,  "quantity": 15,  "low_stock_threshold": 4,  "category": "Home & Kitchen",   "supplier": "HomeBase"},
        {"name": "Non-Stick Pan Set",    "sku": "HMK-PAN-001", "brand": "Tefal",    "cost_price": 40.00,   "selling_price": 79.99,   "quantity": 3,   "low_stock_threshold": 5,  "category": "Home & Kitchen",   "supplier": "HomeBase"},
        {"name": "Coffee Maker",         "sku": "HMK-CFM-001", "brand": "DeLonghi", "cost_price": 95.00,   "selling_price": 179.99,  "quantity": 8,   "low_stock_threshold": 3,  "category": "Home & Kitchen",   "supplier": "HomeBase"},
        # Sports
        {"name": "Yoga Mat Premium",     "sku": "SPT-YGA-001", "brand": "Manduka",  "cost_price": 45.00,   "selling_price": 89.99,   "quantity": 20,  "low_stock_threshold": 5,  "category": "Sports",           "supplier": "Global Goods"},
        {"name": "Dumbbells Set 20kg",   "sku": "SPT-DMB-001", "brand": "Bowflex",  "cost_price": 80.00,   "selling_price": 149.99,  "quantity": 0,   "low_stock_threshold": 4,  "category": "Sports",           "supplier": "Global Goods"},
    ]

    products = {}
    for p in products_data:
        existing = db.query(Product).filter(Product.sku == p["sku"]).first()
        if not existing:
            cat = categories.get(p["category"])
            sup = suppliers.get(p["supplier"])
            product = Product(
                name=p["name"],
                sku=p["sku"],
                brand=p["brand"],
                cost_price=p["cost_price"],
                selling_price=p["selling_price"],
                quantity=p["quantity"],
                low_stock_threshold=p["low_stock_threshold"],
                category_id=cat.id if cat else None,
                supplier_id=sup.id if sup else None,
                description=f"{p['brand']} {p['name']} — quality product",
            )
            db.add(product)
            db.flush()
            products[p["sku"]] = product
        else:
            products[p["sku"]] = existing
    db.commit()

    # ─── Expenses ─────────────────────────────────────────────────────────────
    print("🌱 Seeding expenses...")
    expenses_data = [
        {"title": "Monthly Rent",         "amount": 2500.00, "category": "Rent",           "description": "Shop rent for the month"},
        {"title": "Electricity Bill",     "amount": 320.00,  "category": "Utilities",      "description": "Monthly electricity"},
        {"title": "Staff Salaries",       "amount": 4800.00, "category": "Salaries",       "description": "Monthly payroll"},
        {"title": "Facebook Ads",         "amount": 250.00,  "category": "Marketing",      "description": "Social media advertising"},
        {"title": "AC Maintenance",       "amount": 150.00,  "category": "Maintenance",    "description": "Air conditioning service"},
        {"title": "Delivery Fees",        "amount": 180.00,  "category": "Transportation", "description": "Product delivery costs"},
        {"title": "Internet Bill",        "amount": 89.00,   "category": "Utilities",      "description": "Monthly internet"},
        {"title": "Google Ads",           "amount": 300.00,  "category": "Marketing",      "description": "Search advertising"},
        {"title": "Office Supplies",      "amount": 75.00,   "category": "Miscellaneous",  "description": "Pens, paper, etc."},
        {"title": "Water Bill",           "amount": 45.00,   "category": "Utilities",      "description": "Monthly water"},
    ]
    for i, e in enumerate(expenses_data):
        ec = exp_cats.get(e["category"])
        expense = Expense(
            title=e["title"],
            amount=e["amount"],
            category_id=ec.id if ec else None,
            description=e["description"],
            expense_date=datetime.now() - timedelta(days=random.randint(0, 25)),
        )
        db.add(expense)
    db.commit()

    # ─── Sales ────────────────────────────────────────────────────────────────
    print("🌱 Seeding sales...")
    cashier = users.get("cashier@stockpilot.com")
    manager = users.get("manager@stockpilot.com")

    product_list = list(products.values())

    sale_scenarios = [
        # [list of (sku, qty), payment_method, days_ago]
        ([("IPH-15P-001", 1), ("CBL-USC-001", 2)],       "cash",   0),
        ([("SAM-S24-001", 1)],                             "card",   0),
        ([("CLT-JNS-001", 2), ("CLT-TSH-001", 3)],        "cash",   1),
        ([("FDB-COF-001", 2), ("FDB-WAT-001", 1)],        "mobile", 1),
        ([("SNY-WH5-001", 1), ("CBL-USC-001", 1)],        "card",   2),
        ([("HLT-VTC-001", 3)],                             "cash",   2),
        ([("HMK-AFR-001", 1)],                             "card",   3),
        ([("SPT-YGA-001", 2)],                             "cash",   3),
        ([("CLT-DRS-001", 1), ("CLT-SHO-001", 1)],        "card",   4),
        ([("MAC-AIR-001", 1)],                             "card",   5),
        ([("FDB-TEA-001", 3), ("FDB-PRB-001", 2)],        "cash",   5),
        ([("HMK-PAN-001", 1), ("HMK-CFM-001", 1)],        "mobile", 6),
        ([("IPD-PRO-001", 1), ("CBL-USC-001", 3)],         "card",   7),
        ([("CLT-TSH-001", 5)],                             "cash",   8),
        ([("FDB-COF-001", 1), ("HLT-VTC-001", 2)],        "cash",   10),
    ]

    for scenario in sale_scenarios:
        items_data, payment_method, days_ago = scenario
        subtotal = 0.0
        sale_items_to_add = []
        skip = False

        for sku, qty in items_data:
            product = products.get(sku)
            if not product or product.quantity < qty:
                skip = True
                break
            item_total = product.selling_price * qty
            subtotal += item_total
            sale_items_to_add.append((product, qty, item_total))

        if skip:
            continue

        discount = round(subtotal * 0.05, 2) if random.random() > 0.7 else 0.0
        total = subtotal - discount
        amount_paid = total + random.choice([0, 0.01, 5.00, 10.00])

        sale = Sale(
            reference=generate_reference(),
            cashier_id=cashier.id,
            subtotal=subtotal,
            discount_amount=discount,
            tax_amount=0.0,
            total_amount=total,
            amount_paid=amount_paid,
            change_amount=amount_paid - total,
            payment_method=payment_method,
            status=SaleStatus.COMPLETED,
            created_at=datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 8)),
        )
        db.add(sale)
        db.flush()

        for product, qty, item_total in sale_items_to_add:
            before = product.quantity
            product.quantity -= qty

            db.add(SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=qty,
                unit_price=product.selling_price,
                cost_price=product.cost_price,
                discount=0.0,
                total=item_total,
            ))
            db.add(StockMovement(
                product_id=product.id,
                movement_type=StockMovementType.OUT,
                quantity=qty,
                quantity_before=before,
                quantity_after=product.quantity,
                reference=sale.reference,
            ))

    db.commit()

    print("\n✅ Database seeded successfully!")
    print("\n📋 Login Credentials:")
    print("  Super Admin : admin@stockpilot.com    / Admin@123")
    print("  Manager     : manager@stockpilot.com  / Manager@123")
    print("  Cashier     : cashier@stockpilot.com  / Cashier@123")
    print("\n📦 Products seeded  : 21")
    print("🛒 Sales seeded     : up to 15")
    print("💸 Expenses seeded  : 10")
    print("🏷️  Categories       : 8")
    print("🚚 Suppliers        : 5")

except Exception as e:
    db.rollback()
    print(f"\n❌ Seeding failed: {e}")
    raise
finally:
    db.close()