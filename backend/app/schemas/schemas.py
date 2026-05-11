from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.models import UserRole, SaleStatus, StockMovementType


# ─── Auth Schemas ─────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.CASHIER

    @field_validator("password")
    @classmethod
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    full_name: str
    email: str
    role: UserRole
    is_active: bool
    avatar_url: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


# ─── Category Schemas ─────────────────────────────────────────────────────────

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Supplier Schemas ─────────────────────────────────────────────────────────

class SupplierCreate(BaseModel):
    name: str
    company_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class SupplierUpdate(SupplierCreate):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class SupplierOut(BaseModel):
    id: int
    name: str
    company_name: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Product Schemas ──────────────────────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    sku: str
    barcode: Optional[str] = None
    brand: Optional[str] = None
    cost_price: float
    selling_price: float
    quantity: int = 0
    low_stock_threshold: int = 10
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    brand: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    quantity: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    category_id: Optional[int] = None
    supplier_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOut(BaseModel):
    id: int
    name: str
    description: Optional[str]
    sku: str
    barcode: Optional[str]
    brand: Optional[str]
    image_url: Optional[str]
    cost_price: float
    selling_price: float
    quantity: int
    low_stock_threshold: int
    is_active: bool
    category_id: Optional[int]
    supplier_id: Optional[int]
    category: Optional[CategoryOut]
    supplier: Optional[SupplierOut]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


# ─── Sale Schemas ─────────────────────────────────────────────────────────────

class SaleItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float
    discount: float = 0.0


class SaleCreate(BaseModel):
    items: List[SaleItemCreate]
    discount_amount: float = 0.0
    tax_amount: float = 0.0
    amount_paid: float
    payment_method: str = "cash"
    notes: Optional[str] = None


class SaleItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    cost_price: float
    discount: float
    total: float
    product: Optional[ProductOut]

    class Config:
        from_attributes = True


class SaleOut(BaseModel):
    id: int
    reference: str
    cashier_id: int
    subtotal: float
    discount_amount: float
    tax_amount: float
    total_amount: float
    amount_paid: float
    change_amount: float
    payment_method: str
    status: SaleStatus
    notes: Optional[str]
    created_at: datetime
    cashier: Optional[UserOut]
    items: List[SaleItemOut] = []

    class Config:
        from_attributes = True


# ─── Expense Schemas ──────────────────────────────────────────────────────────

class ExpenseCategoryCreate(BaseModel):
    name: str


class ExpenseCategoryOut(BaseModel):
    id: int
    name: str
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category_id: Optional[int] = None
    description: Optional[str] = None
    expense_date: Optional[datetime] = None


class ExpenseUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = None
    category_id: Optional[int] = None
    description: Optional[str] = None


class ExpenseOut(BaseModel):
    id: int
    title: str
    amount: float
    category_id: Optional[int]
    description: Optional[str]
    expense_date: datetime
    created_at: datetime
    category: Optional[ExpenseCategoryOut]

    class Config:
        from_attributes = True


# ─── Stock Movement Schemas ───────────────────────────────────────────────────

class StockMovementOut(BaseModel):
    id: int
    product_id: int
    movement_type: StockMovementType
    quantity: int
    quantity_before: int
    quantity_after: int
    reference: Optional[str]
    notes: Optional[str]
    created_at: datetime
    product: Optional[ProductOut]

    class Config:
        from_attributes = True


# ─── Dashboard Schema ─────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    total_products: int
    total_sales_today: int
    revenue_today: float
    revenue_month: float
    low_stock_count: int
    out_of_stock_count: int
    total_expenses_month: float
    profit_month: float
    total_suppliers: int
    recent_sales: List[SaleOut]
    low_stock_products: List[ProductOut]
    monthly_revenue: List[dict]
    top_products: List[dict]


# ─── Pagination ───────────────────────────────────────────────────────────────

class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    per_page: int
    pages: int
