from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import Optional
from datetime import datetime, date
import uuid
from app.db.database import get_db
from app.models.models import Sale, SaleItem, Product, StockMovement, StockMovementType, SaleStatus
from app.schemas.schemas import SaleCreate, SaleOut
from app.core.deps import get_current_user, admin_or_manager

router = APIRouter(prefix="/sales", tags=["Sales"])


def generate_reference() -> str:
    return f"INV-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


@router.post("/", response_model=SaleOut, status_code=201)
def create_sale(
    payload: SaleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Sale must have at least one item")

    subtotal = 0.0
    sale_items = []

    for item_data in payload.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item_data.product_id} not found")
        if product.quantity < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}. Available: {product.quantity}",
            )
        item_total = (item_data.unit_price * item_data.quantity) - item_data.discount
        subtotal += item_total
        sale_items.append((item_data, product, item_total))

    total = subtotal - payload.discount_amount + payload.tax_amount
    change = payload.amount_paid - total

    if change < 0:
        raise HTTPException(status_code=400, detail="Insufficient payment amount")

    sale = Sale(
        reference=generate_reference(),
        cashier_id=current_user.id,
        subtotal=subtotal,
        discount_amount=payload.discount_amount,
        tax_amount=payload.tax_amount,
        total_amount=total,
        amount_paid=payload.amount_paid,
        change_amount=change,
        payment_method=payload.payment_method,
        notes=payload.notes,
    )
    db.add(sale)
    db.flush()

    for item_data, product, item_total in sale_items:
        before_qty = product.quantity
        product.quantity -= item_data.quantity

        si = SaleItem(
            sale_id=sale.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            cost_price=product.cost_price,
            discount=item_data.discount,
            total=item_total,
        )
        db.add(si)

        sm = StockMovement(
            product_id=item_data.product_id,
            movement_type=StockMovementType.OUT,
            quantity=item_data.quantity,
            quantity_before=before_qty,
            quantity_after=product.quantity,
            reference=sale.reference,
        )
        db.add(sm)

    db.commit()
    db.refresh(sale)

    return db.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product).joinedload(Product.category),
        joinedload(Sale.cashier),
    ).filter(Sale.id == sale.id).first()


@router.get("/", response_model=dict)
def list_sales(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    cashier_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    q = db.query(Sale).options(
        joinedload(Sale.cashier),
        joinedload(Sale.items).joinedload(SaleItem.product),
    )
    if date_from:
        q = q.filter(func.date(Sale.created_at) >= date_from)
    if date_to:
        q = q.filter(func.date(Sale.created_at) <= date_to)
    if cashier_id:
        q = q.filter(Sale.cashier_id == cashier_id)
    if status:
        q = q.filter(Sale.status == status)

    total = q.count()
    items = q.order_by(Sale.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [SaleOut.model_validate(s) for s in items],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page,
    }


@router.get("/{sale_id}", response_model=SaleOut)
def get_sale(sale_id: int, db: Session = Depends(get_db), _=Depends(get_current_user)):
    sale = db.query(Sale).options(
        joinedload(Sale.items).joinedload(SaleItem.product),
        joinedload(Sale.cashier),
    ).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("/{sale_id}/refund")
def refund_sale(
    sale_id: int,
    db: Session = Depends(get_db),
    _=Depends(admin_or_manager),
):
    sale = db.query(Sale).options(joinedload(Sale.items)).filter(Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    if sale.status == SaleStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Sale already refunded")

    for item in sale.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            before = product.quantity
            product.quantity += item.quantity
            db.add(StockMovement(
                product_id=item.product_id,
                movement_type=StockMovementType.IN,
                quantity=item.quantity,
                quantity_before=before,
                quantity_after=product.quantity,
                reference=f"REFUND-{sale.reference}",
            ))

    sale.status = SaleStatus.REFUNDED
    db.commit()
    return {"message": "Sale refunded successfully"}
