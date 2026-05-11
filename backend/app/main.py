from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.db.database import Base, engine
from app.api.routes.auth import router as auth_router
from app.api.routes.products import router as products_router
from app.api.routes.sales import router as sales_router
from app.api.routes.users import router as users_router
from app.api.routes.misc import (
    supplier_router, category_router,
    expense_router, expense_cat_router,
    dashboard_router, reports_router
)
import os

# Create DB tables
Base.metadata.create_all(bind=engine)

# Ensure upload directories exist
os.makedirs(f"{settings.UPLOAD_DIR}/products", exist_ok=True)
os.makedirs(f"{settings.UPLOAD_DIR}/barcodes", exist_ok=True)

app = FastAPI(
    title="StockPilot & Sales Management",
    description="A modern full-stack inventory system for small businesses",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    redirects_slashes=False,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploads)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(sales_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(supplier_router, prefix="/api")
app.include_router(category_router, prefix="/api")
app.include_router(expense_router, prefix="/api")
app.include_router(expense_cat_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(reports_router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "StockPilot API",
        "docs": "/api/docs",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
