import api from "./client";
import type {
  User,
  Product,
  Supplier,
  Category,
  Sale,
  Expense,
  ExpenseCategory,
  DashboardStats,
  PaginatedResponse,
} from "@/types";

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  register: (data: object) => api.post("/auth/register/", data),
  me: () => api.get<User>("/auth/me"),
  updateMe: (data: object) => api.put<User>("/auth/me", data),
  changePassword: (data: object) => api.post("/auth/change-password/", data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<DashboardStats>("/dashboard/stats"),
};

// ─── Products ────────────────────────────────────────────────────────────────
export const productsApi = {
  list: (params?: object) =>
    api.get<PaginatedResponse<Product>>("/products/", { params }),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  create: (data: object) => api.post<Product>("/products/", data),
  update: (id: number, data: object) =>
    api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
  uploadImage: (id: number, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/products/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getBarcode: (id: number) => api.get(`/products/${id}/barcode`),
  adjustStock: (id: number, quantity: number, notes?: string) =>
    api.post(`/products/${id}/adjust-stock`, null, {
      params: { quantity, notes },
    }),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () => api.get<Category[]>("/categories/"),
  create: (data: object) => api.post<Category>("/categories/", data),
  update: (id: number, data: object) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
};

// ─── Suppliers ───────────────────────────────────────────────────────────────
export const suppliersApi = {
  list: (params?: object) =>
    api.get<PaginatedResponse<Supplier>>("/suppliers/", { params }),
  get: (id: number) => api.get<Supplier>(`/suppliers/${id}`),
  create: (data: object) => api.post<Supplier>("/suppliers/", data),
  update: (id: number, data: object) =>
    api.put<Supplier>(`/suppliers/${id}`, data),
  delete: (id: number) => api.delete(`/suppliers/${id}`),
};

// ─── Sales ───────────────────────────────────────────────────────────────────
export const salesApi = {
  list: (params?: object) =>
    api.get<PaginatedResponse<Sale>>("/sales/", { params }),
  get: (id: number) => api.get<Sale>(`/sales/${id}`),
  create: (data: object) => api.post<Sale>("/sales/", data),
  refund: (id: number) => api.post(`/sales/${id}/refund`),
};

// ─── Expenses ────────────────────────────────────────────────────────────────
export const expensesApi = {
  list: (params?: object) =>
    api.get<PaginatedResponse<Expense>>("/expenses/", { params }),
  create: (data: object) => api.post<Expense>("/expenses/", data),
  update: (id: number, data: object) =>
    api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: number) => api.delete(`/expenses/${id}`),
  categories: () => api.get<ExpenseCategory[]>("/expense-categories/"),
  createCategory: (data: object) =>
    api.post<ExpenseCategory>("/expense-categories/", data),
};

// ─── Users ───────────────────────────────────────────────────────────────────
export const usersApi = {
  list: (params?: object) =>
    api.get<PaginatedResponse<User>>("/users/", { params }),
  create: (data: object) => api.post<User>("/users/", data),
  update: (id: number, data: object) => api.put<User>(`/users/${id}`, data),
  deactivate: (id: number) => api.delete(`/users/${id}`),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportsApi = {
  sales: (params?: object) => api.get("/reports/sales", { params }),
  exportExcel: (report_type: string, params?: object) =>
    api.get("/reports/export/excel", {
      params: { report_type, ...params },
      responseType: "blob",
    }),
  exportPdf: (report_type: string, params?: object) =>
    api.get("/reports/export/pdf", {
      params: { report_type, ...params },
      responseType: "blob",
    }),
};
