import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  X,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { productsApi, categoriesApi, suppliersApi } from "@/api/services";
import { formatCurrency, getStockStatus, generateSKU } from "@/utils";
import { useRole } from "@/store/auth";
import type { Product } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  sku: z.string().min(1, "Required"),
  cost_price: z.coerce.number().min(0),
  selling_price: z.coerce.number().min(0),
  quantity: z.coerce.number().int().min(0),
  low_stock_threshold: z.coerce.number().int().min(0).default(10),
  description: z.string().optional(),
  brand: z.string().optional(),
  barcode: z.string().optional(),
  category_id: z.coerce.number().optional().nullable(),
  supplier_id: z.coerce.number().optional().nullable(),
});
type FormData = z.infer<typeof schema>;

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto
                      rounded-t-2xl sm:rounded-2xl shadow-2xl"
        style={{ background: "var(--color-surface)" }}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <h2
            className="font-semibold text-base"
            style={{ color: "var(--color-text)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function ProductForm({
  product,
  onSuccess,
  onCancel,
}: {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const qc = useQueryClient();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });
  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers-all"],
    queryFn: () => suppliersApi.list({ per_page: 100 }).then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku,
          cost_price: product.cost_price,
          selling_price: product.selling_price,
          quantity: product.quantity,
          low_stock_threshold: product.low_stock_threshold,
          description: product.description ?? "",
          brand: product.brand ?? "",
          barcode: product.barcode ?? "",
          category_id: product.category_id ?? null,
          supplier_id: product.supplier_id ?? null,
        }
      : {
          quantity: 0,
          low_stock_threshold: 10,
          cost_price: 0,
          selling_price: 0,
        },
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      product ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(product ? "Product updated!" : "Product created!");
      onSuccess();
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Error saving product"),
  });

  const watchedName = watch("name");

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="label">Product Name *</label>
          <input
            {...register("name")}
            className="input"
            placeholder="e.g. Wireless Earbuds"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label">SKU *</label>
            <button
              type="button"
              onClick={() => setValue("sku", generateSKU(watchedName || "PRD"))}
              className="text-xs text-blue-600 hover:underline mb-1.5"
            >
              Auto-generate
            </button>
          </div>
          <input
            {...register("sku")}
            className="input"
            placeholder="e.g. EAR-WL-001"
          />
          {errors.sku && (
            <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>
          )}
        </div>
        <div>
          <label className="label">Brand</label>
          <input
            {...register("brand")}
            className="input"
            placeholder="e.g. Sony"
          />
        </div>
        <div>
          <label className="label">Cost Price *</label>
          <input
            {...register("cost_price")}
            type="number"
            step="0.01"
            className="input"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="label">Selling Price *</label>
          <input
            {...register("selling_price")}
            type="number"
            step="0.01"
            className="input"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="label">Stock Quantity *</label>
          <input
            {...register("quantity")}
            type="number"
            className="input"
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Low Stock Alert At</label>
          <input
            {...register("low_stock_threshold")}
            type="number"
            className="input"
            placeholder="10"
          />
        </div>
        <div>
          <label className="label">Category</label>
          <select {...register("category_id")} className="input">
            <option value="">Select category</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Supplier</label>
          <select {...register("supplier_id")} className="input">
            <option value="">Select supplier</option>
            {suppliersData?.items?.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Barcode</label>
          <input
            {...register("barcode")}
            className="input"
            placeholder="Optional"
          />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          {...register("description")}
          className="input"
          rows={2}
          placeholder="Optional product description"
        />
      </div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary flex-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="btn btn-primary flex-1"
        >
          {mutation.isPending
            ? "Saving…"
            : product
              ? "Update Product"
              : "Create Product"}
        </button>
      </div>
    </form>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const { canManage } = useRole();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products", { search, page, categoryId, stockStatus }],
    queryFn: () =>
      productsApi
        .list({
          search,
          page,
          per_page: 20,
          category_id: categoryId || undefined,
          stock_status: stockStatus || undefined,
        })
        .then((r) => r.data),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product deactivated");
    },
  });

  const openEdit = (p: Product) => {
    setSelected(p);
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
  };
  const hasFilters = !!(categoryId || stockStatus);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1
            className="text-lg sm:text-xl font-bold"
            style={{ color: "var(--color-text)" }}
          >
            Products
          </h1>
          <p
            className="text-xs sm:text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            {data?.total ?? 0} total products
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setModal("create")}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Search + Filters */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "var(--color-text-muted)" }}
            />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input pl-9"
              placeholder="Search products, SKU, barcode…"
            />
          </div>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`btn btn-secondary relative ${hasFilters ? "ring-2 ring-blue-400" : ""}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
            )}
          </button>
        </div>

        {filtersOpen && (
          <div className="card p-3 flex flex-wrap gap-2">
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setPage(1);
              }}
              className="input min-w-0 flex-1 sm:flex-none sm:w-44"
            >
              <option value="">All Categories</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              value={stockStatus}
              onChange={(e) => {
                setStockStatus(e.target.value);
                setPage(1);
              }}
              className="input min-w-0 flex-1 sm:flex-none sm:w-40"
            >
              <option value="">All Stock</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
            </select>
            {hasFilters && (
              <button
                onClick={() => {
                  setCategoryId("");
                  setStockStatus("");
                }}
                className="btn btn-secondary btn-sm"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th className="hidden sm:table-cell">SKU</th>
                <th className="hidden md:table-cell">Category</th>
                <th>Price</th>
                <th className="hidden sm:table-cell">Stock</th>
                <th>Status</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: canManage ? 7 : 6 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton h-4 w-16" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.items?.length ? (
                data.items.map((product: Product) => {
                  const status = getStockStatus(
                    product.quantity,
                    product.low_stock_threshold,
                  );
                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                              <Package className="w-4 h-4 text-blue-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div
                              className="text-sm font-medium truncate max-w-[120px] sm:max-w-none"
                              style={{ color: "var(--color-text)" }}
                            >
                              {product.name}
                            </div>
                            {product.brand && (
                              <div
                                className="text-xs truncate"
                                style={{ color: "var(--color-text-muted)" }}
                              >
                                {product.brand}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <code
                          className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: "var(--color-surface-3)" }}
                        >
                          {product.sku}
                        </code>
                      </td>
                      <td className="hidden md:table-cell">
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {product.category?.name ?? "—"}
                        </span>
                      </td>
                      <td>
                        <div
                          className="text-sm font-semibold"
                          style={{ color: "var(--color-text)" }}
                        >
                          {formatCurrency(product.selling_price)}
                        </div>
                        <div
                          className="text-xs hidden sm:block"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          Cost: {formatCurrency(product.cost_price)}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span
                          className="font-semibold text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          {product.quantity}
                        </span>
                        <span
                          className="text-xs ml-1"
                          style={{ color: "var(--color-text-faint)" }}
                        >
                          / {product.low_stock_threshold}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      {canManage && (
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteMutation.mutate(product.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={canManage ? 7 : 6} className="py-16 text-center">
                    <Package
                      className="w-10 h-10 mx-auto mb-2 opacity-20"
                      style={{ color: "var(--color-text)" }}
                    />
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      No products found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {data && data.pages > 1 && (
          <div
            className="flex items-center justify-between px-4 py-3 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span
              className="text-xs sm:text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              {(page - 1) * 20 + 1}–{Math.min(page * 20, data.total)} of{" "}
              {data.total}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-secondary btn-sm"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="btn btn-secondary btn-sm"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={modal === "create"}
        onClose={closeModal}
        title="Add New Product"
      >
        <ProductForm onSuccess={closeModal} onCancel={closeModal} />
      </Modal>

      <Modal open={modal === "edit"} onClose={closeModal} title="Edit Product">
        {selected && (
          <ProductForm
            product={selected}
            onSuccess={closeModal}
            onCancel={closeModal}
          />
        )}
      </Modal>
    </div>
  );
}
