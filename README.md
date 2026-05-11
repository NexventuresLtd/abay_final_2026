# 🏪 StockPilot & Sales Management System

**Candidate:** Abay Tessema 
**Issued By:** NexVentures Ltd  
**Due Date:** 21st May 2026 – 11:59 PM (CAT)

A modern, full-stack **Inventory & Sales Management System** built for small businesses, retail shops, and wholesalers. Manage products, suppliers, sales, expenses, and generate detailed reports — all from a responsive, mobile-first dashboard.

---

## ✨ Features

### Core
- 🔐 **Authentication & RBAC** — JWT-based auth with 3 roles: Super Admin, Manager, Cashier
- 📊 **Dashboard Analytics** — Live stats, revenue charts, top products, low stock alerts
- 📦 **Product Management** — Full CRUD, image upload, barcode generation, SKU tracking
- 🏷️ **Category Management** — Visual category cards with full CRUD
- 🚚 **Supplier Management** — Track suppliers linked to products
- 🛒 **POS / Sales Module** — Cart, discounts, receipt modal, transaction history
- 💸 **Expense Tracking** — Categorized expense recording with date filters
- 📉 **Inventory Tracking** — Automatic stock deduction on sale, movement logs
- 🔍 **Search & Filtering** — By name, SKU, barcode, category, supplier, stock status
- 📈 **Reports** — Sales & product reports exportable as **PDF** and **Excel**

### Bonus
- 🌙 **Dark / Light Mode** — Persistent theme toggle
- 🏷️ **Barcode Generation** — Code128 barcodes for any product
- 🐳 **Docker Support** — One-command `docker-compose up` deployment
- 📱 **Mobile-First** — Bottom nav, slide-out drawer, touch-optimized UI

---

## 🛠 Technologies

### Frontend
| Tech | Version | Purpose |
|------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Utility-first styling |
| React Router | 6 | Client-side routing |
| TanStack Query | 5 | Server state management |
| Zustand | 5 | Client state (auth, theme) |
| React Hook Form + Zod | latest | Form validation |
| Recharts | 2 | Charts & analytics |
| Axios | 1 | HTTP client |
| Lucide React | latest | Icons |

### Backend
| Tech | Version | Purpose |
|------|---------|---------|
| FastAPI | 0.115 | REST API framework |
| SQLAlchemy | 2 | ORM |
| Alembic | 1.13 | Database migrations |
| PostgreSQL | 16 | Primary database |
| Pydantic | 2 | Schema validation |
| python-jose | 3.3 | JWT tokens |
| passlib/bcrypt | 1.7 | Password hashing |
| python-barcode | 0.15 | Barcode generation |
| reportlab | 4.2 | PDF export |
| openpyxl | 3.1 | Excel export |
| Pillow | 10 | Image processing |

---

## 📁 Folder Structure

```
stockpilot/
├── backend/
│   ├── app/
│   │   ├── api/routes/         # auth, products, sales, users, misc
│   │   ├── core/               # config, security, deps
│   │   ├── db/                 # database connection
│   │   ├── models/             # SQLAlchemy ORM models
│   │   └── schemas/            # Pydantic schemas
│   ├── alembic/                # DB migrations
│   ├── seed.py                 # Database seeder
│   ├── requirements.txt
│   ├── Dockerfile
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios client + service functions
│   │   ├── components/         # Layout, shared UI components
│   │   ├── pages/              # All page components
│   │   ├── store/              # Zustand (auth, theme)
│   │   ├── types/              # TypeScript interfaces
│   │   └── utils/              # Helpers (formatCurrency, etc.)
│   ├── index.html
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js ≥ 20
- Python ≥ 3.11
- PostgreSQL 15+ (or Docker)
- Git

---

### Option A — Docker (Recommended)

```bash
# 1. Clone the repo
git clone https://github.com/NexventuresLtd/abay_final_2026.git
cd abay_final_2026

# 2. Start all services (DB + backend + frontend)
docker-compose up --build

# 3. Open the app
open http://localhost
# API docs: http://localhost:8000/api/docs
```

---

### Option B — Manual Setup

#### 1. Database Setup

```bash
# Create PostgreSQL database
psql -U postgres -c "CREATE DATABASE stockpilot;"
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, SECRET_KEY

# Run migrations
alembic upgrade head

# Seed the database
python seed.py

# Start the API server
uvicorn app.main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Swagger docs: `http://localhost:8000/api/docs`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if needed

# Start the dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 🔧 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/stockpilot` | PostgreSQL connection string |
| `SECRET_KEY` | *(required)* | JWT signing secret (min 32 chars) |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `7` | Refresh token lifetime |
| `UPLOAD_DIR` | `uploads` | Directory for uploaded images |
| `ALLOWED_ORIGINS` | `http://localhost:5173` | CORS allowed origins |

### Frontend (`frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

---

## 👤 Default Credentials

After running `seed.py`, these accounts are available:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@stockpilot.com` | `Admin@123` |
| **Manager** | `manager@stockpilot.com` | `Manager@123` |
| **Cashier** | `cashier@stockpilot.com` | `Cashier@123` |

---

## 📱 Pages

| Page | Route | Access |
|------|-------|--------|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Forgot Password | `/forgot-password` | Public |
| Dashboard | `/dashboard` | All roles |
| Products | `/products` | All roles |
| Categories | `/categories` | All roles |
| Suppliers | `/suppliers` | All roles |
| Sales / POS | `/sales` | All roles |
| Expenses | `/expenses` | Admin, Manager |
| Reports | `/reports` | Admin, Manager |
| Users | `/users` | Admin, Manager |
| Settings | `/settings` | All roles |

---

## 🗄️ Database Schema

```
users          → id, full_name, email, hashed_password, role, is_active
categories     → id, name, description
suppliers      → id, name, company_name, email, phone, address, is_active
products       → id, name, sku, barcode, cost_price, selling_price, quantity,
                 low_stock_threshold, category_id, supplier_id, image_url
sales          → id, reference, cashier_id, subtotal, discount, total, payment_method, status
sale_items     → id, sale_id, product_id, quantity, unit_price, cost_price, total
stock_movements→ id, product_id, movement_type, quantity, before, after, reference
expense_categories → id, name
expenses       → id, title, amount, category_id, expense_date
```

---

## 🔌 API Endpoints

Base URL: `http://localhost:8000/api`  
Full Swagger docs: `http://localhost:8000/api/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/register` | Register |
| GET | `/auth/me` | Current user |
| GET | `/products` | List products (paginated) |
| POST | `/products` | Create product |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Deactivate product |
| POST | `/products/{id}/image` | Upload product image |
| GET | `/products/{id}/barcode` | Generate barcode |
| GET | `/sales` | List sales |
| POST | `/sales` | Create sale (deducts stock) |
| POST | `/sales/{id}/refund` | Refund sale |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/reports/export/excel` | Export Excel |
| GET | `/reports/export/pdf` | Export PDF |
| GET | `/categories` | List categories |
| GET | `/suppliers` | List suppliers |
| GET | `/expenses` | List expenses |
| GET | `/users` | List users (admin) |

---

## 🏗️ Architecture Decisions

- **Modular FastAPI** — each domain has its own route file
- **SQLAlchemy ORM** — relationships, indexes, proper FK constraints
- **JWT dual-token flow** — short-lived access + long-lived refresh
- **Automatic stock management** — every sale creates a `StockMovement` record
- **Zustand persist** — auth state survives page reload
- **React Query** — all server state cached, auto-refetch, stale-while-revalidate
- **Mobile-first CSS** — bottom nav on mobile, sidebar on desktop; `lg:` breakpoints throughout

---

## 📸 Screenshots

> Run the app and visit `http://localhost:5173` to see the full UI.

---

## 📄 License

This project was built as an assessment for **NexVentures Ltd**.

---

*Built with ❤️ by Abay Tessema*
