export type UserRole = 'super_admin' | 'manager' | 'cashier';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  company_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  brand?: string;
  image_url?: string;
  cost_price: number;
  selling_price: number;
  quantity: number;
  low_stock_threshold: number;
  is_active: boolean;
  category_id?: number;
  supplier_id?: number;
  category?: Category;
  supplier?: Supplier;
  created_at: string;
  updated_at?: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount: number;
  total: number;
  product?: Product;
}

export type SaleStatus = 'completed' | 'refunded' | 'pending';

export interface Sale {
  id: number;
  reference: string;
  cashier_id: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  change_amount: number;
  payment_method: string;
  status: SaleStatus;
  notes?: string;
  created_at: string;
  cashier?: User;
  items: SaleItem[];
}

export interface ExpenseCategory {
  id: number;
  name: string;
  created_at: string;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  category_id?: number;
  description?: string;
  expense_date: string;
  created_at: string;
  category?: ExpenseCategory;
}

export interface DashboardStats {
  total_products: number;
  total_sales_today: number;
  revenue_today: number;
  revenue_month: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_expenses_month: number;
  profit_month: number;
  total_suppliers: number;
  recent_sales: Sale[];
  low_stock_products: Product[];
  monthly_revenue: { month: number; revenue: number; expenses: number }[];
  top_products: { name: string; sold: number; revenue: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// Cart for POS
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  discount: number;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isAuthenticated: boolean;
}
