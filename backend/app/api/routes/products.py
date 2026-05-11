from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from typing import Optional
import os, uuid, barcode
from barcode.writer import ImageWriter
from app.db.database import get_db
from app.models.models import Product, StockMovement, StockMovementType
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut
from app.core.deps import get_current_user, admin_or_manager
from app.core.config import settings

router = APIRouter(prefix="/products", tags=["Products"])


def _query(db, search=None, category_id=None, supplier_id=None, stock_status=None):
    q = db.query(Product).options(
        joinedload(Product.category), joinedload(Product.supplier)
    )
    if search:
        q = q.filter(
            or_(
                Product.name.ilike(f"%{search}%"),
                Product.sku.ilike(f"%{search}%"),
                Product.barcode.ilike(f"%{search}%"),
            )
        )
    if category_id:
        q = q.filter(Product.category_id == category_id)
    if supplier_id:
        q = q.filter(Product.supplier_id == supplier_id)
    if stock_status == "low":
        q = q.filter(Product.quantity <= Product.low_stock_threshold, Product.quantity > 0)
    elif stock_status == "out":
        q = q.filter(Product.quantity == 0)
    elif stock_status == "in":
        q = q.filter(Product.quantity > Product.low_stock_threshold)
    return q


@router.get("/", response_model=dict)
def list_products(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    supplier_id: Optional[int] = None,
    stock_status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = _query(db, search, category_id, supplier_id, stock_status)
    total = q.count()
    items = q.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [ProductOut.model_validate(p) for p in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.post("/", response_model=ProductOut, status_code=201)
def create_product(
    payload: ProductCreate,
    db: Session = Depends(get_db),
    _=Depends(admin_or_manager),
):
    if db.query(Product).filter(Product.sku == payload.sku).first():
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    product = db.query(Product).options(
        joinedload(Product.category), joinedload(Product.supplier)
    ).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(admin_or_manager),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    _=Depends(admin_or_manager),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product.is_active = False
    db.commit()
    return {"message": "Product deactivated"}


@router.post("/{product_id}/image")
def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _=Depends(admin_or_manager),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    os.makedirs(f"{settings.UPLOAD_DIR}/products", exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    path = f"{settings.UPLOAD_DIR}/products/{filename}"

    with open(path, "wb") as f:
        f.write(file.file.read())

    product.image_url = f"/uploads/products/{filename}"
    db.commit()
    return {"image_url": product.image_url}


@router.get("/{product_id}/barcode")
def generate_barcode(product_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    os.makedirs(f"{settings.UPLOAD_DIR}/barcodes", exist_ok=True)
    code_value = product.barcode or product.sku
    try:
        EAN = barcode.get_barcode_class("code128")
        ean = EAN(code_value, writer=ImageWriter())
        filepath = f"{settings.UPLOAD_DIR}/barcodes/{product.id}"
        ean.save(filepath)
        return {"barcode_url": f"/uploads/barcodes/{product.id}.png", "value": code_value}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Barcode generation failed: {str(e)}")


@router.post("/{product_id}/adjust-stock")
def adjust_stock(
    product_id: int,
    quantity: int,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(admin_or_manager),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    before = product.quantity
    product.quantity = max(0, product.quantity + quantity)
    movement = StockMovement(
        product_id=product_id,
        movement_type=StockMovementType.ADJUSTMENT,
        quantity=abs(quantity),
        quantity_before=before,
        quantity_after=product.quantity,
        notes=notes,
    )
    db.add(movement)
    db.commit()
    return {"message": "Stock adjusted", "new_quantity": product.quantity}
