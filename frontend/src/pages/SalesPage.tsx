import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Receipt,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import { productsApi, salesApi } from "@/api/services";
import { formatCurrency, formatDate } from "@/utils";
import type { Product, CartItem, Sale } from "@/types";

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Cart Panel — defined OUTSIDE so it never remounts ────────────────────────
interface CartPanelProps {
  cart: CartItem[];
  discount: number;
  paymentMethod: string;
  amountPaid: string;
  subtotal: number;
  total: number;
  change: number;
  isPending: boolean;
  onUpdateQty: (productId: number, qty: number) => void;
  onRemove: (productId: number) => void;
  onDiscountChange: (v: number) => void;
  onPaymentMethodChange: (m: string) => void;
  onAmountPaidChange: (v: string) => void;
  onCheckout: () => void;
}

function CartPanel({
  cart,
  discount,
  paymentMethod,
  amountPaid,
  subtotal,
  total,
  change,
  isPending,
  onUpdateQty,
  onRemove,
  onDiscountChange,
  onPaymentMethodChange,
  onAmountPaidChange,
  onCheckout,
}: CartPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <ShoppingCart className="w-5 h-5 text-blue-600 shrink-0" />
        <h3
          className="font-semibold text-sm"
          style={{ color: "var(--color-text)" }}
        >
          Cart ({cart.length} items)
        </h3>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {cart.length === 0 ? (
          <div
            className="py-10 text-center"
            style={{ color: "var(--color-text-faint)" }}
          >
            <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Add products to start a sale</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center gap-2 py-2.5 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.product.name}
                </div>
                <div className="text-xs text-blue-600">
                  {formatCurrency(item.unit_price)}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    onUpdateQty(item.product.id, item.quantity - 1)
                  }
                  className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: "var(--color-surface-3)" }}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span
                  className="text-sm font-bold w-5 text-center"
                  style={{ color: "var(--color-text)" }}
                >
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    onUpdateQty(item.product.id, item.quantity + 1)
                  }
                  className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <div
                className="text-xs font-semibold w-14 text-right shrink-0"
                style={{ color: "var(--color-text)" }}
              >
                {formatCurrency(item.unit_price * item.quantity)}
              </div>
              <button
                onClick={() => onRemove(item.product.id)}
                className="p-1 text-red-400 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals + checkout */}
      <div
        className="shrink-0 pt-3 space-y-3 border-t mt-2"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex justify-between text-sm">
          <span style={{ color: "var(--color-text-muted)" }}>Subtotal</span>
          <span style={{ color: "var(--color-text)" }}>
            {formatCurrency(subtotal)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span
            className="text-sm shrink-0"
            style={{ color: "var(--color-text-muted)" }}
          >
            Discount ($)
          </span>
          <input
            type="number"
            value={discount || ""}
            placeholder="0"
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            className="input text-right w-28"
          />
        </div>
        <div
          className="flex justify-between font-bold text-base border-t pt-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span style={{ color: "var(--color-text)" }}>Total</span>
          <span className="text-blue-600">{formatCurrency(total)}</span>
        </div>

        {/* Payment method */}
        <div className="flex gap-1.5">
          {["cash", "card", "mobile"].map((m) => (
            <button
              key={m}
              onClick={() => onPaymentMethodChange(m)}
              className={`flex-1 btn btn-sm capitalize ${
                paymentMethod === m ? "btn-primary" : "btn-secondary"
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Amount Paid</label>
          <input
            type="number"
            value={amountPaid}
            onChange={(e) => onAmountPaidChange(e.target.value)}
            className="input text-base font-semibold"
            placeholder={total.toFixed(2)}
          />
        </div>

        {parseFloat(amountPaid) >= total && total > 0 && (
          <div
            className="flex justify-between text-sm px-3 py-2 rounded-lg"
            style={{ background: "var(--color-surface-2)" }}
          >
            <span style={{ color: "var(--color-text-muted)" }}>Change</span>
            <span className="font-bold text-green-600">
              {formatCurrency(change)}
            </span>
          </div>
        )}

        <button
          onClick={onCheckout}
          disabled={isPending || !cart.length}
          className="btn btn-primary btn-lg w-full justify-center"
        >
          <Receipt className="w-4 h-4" />
          {isPending ? "Processing…" : "Complete Sale"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Sales Page ──────────────────────────────────────────────────────────
export default function SalesPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pos" | "history">("pos");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [receipt, setReceipt] = useState<Sale | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [mobileView, setMobileView] = useState<"products" | "cart">("products");

  const { data: productsData } = useQuery({
    queryKey: ["products-pos", debouncedSearch],
    queryFn: () =>
      productsApi
        .list({ search: debouncedSearch, per_page: 24, stock_status: "in" })
        .then((r) => r.data),
    enabled: tab === "pos",
  });

  const { data: salesData } = useQuery({
    queryKey: ["sales", historyPage],
    queryFn: () =>
      salesApi.list({ page: historyPage, per_page: 20 }).then((r) => r.data),
    enabled: tab === "history",
  });

  const saleMutation = useMutation({
    mutationFn: (data: object) => salesApi.create(data),
    onSuccess: (res) => {
      setReceipt(res.data);
      setCart([]);
      setDiscount(0);
      setAmountPaid("");
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["sales"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      setMobileView("products");
      toast.success("Sale completed!");
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.detail ?? "Sale failed"),
  });

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error("Insufficient stock");
          return prev;
        }
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unit_price: product.selling_price,
          discount: 0,
        },
      ];
    });
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.product.id !== productId));
      return;
    }
    setCart((prev) => {
      const item = prev.find((i) => i.product.id === productId);
      if (item && qty > item.product.quantity) {
        toast.error("Insufficient stock");
        return prev;
      }
      return prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: qty } : i,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const subtotal = cart.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
  const total = Math.max(0, subtotal - discount);
  const change = parseFloat(amountPaid || "0") - total;

  const handleCheckout = useCallback(() => {
    if (!cart.length) {
      toast.error("Cart is empty");
      return;
    }
    const paid = parseFloat(amountPaid || "0");
    if (paid < total) {
      toast.error("Amount paid is less than total");
      return;
    }
    saleMutation.mutate({
      items: cart.map((i) => ({
        product_id: i.product.id,
        quantity: i.quantity,
        unit_price: i.unit_price,
        discount: i.discount,
      })),
      discount_amount: discount,
      tax_amount: 0,
      amount_paid: paid,
      payment_method: paymentMethod,
    });
  }, [cart, amountPaid, total, discount, paymentMethod, saleMutation]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header + tab switcher */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1
          className="text-lg sm:text-xl font-bold"
          style={{ color: "var(--color-text)" }}
        >
          Sales &amp; POS
        </h1>
        <div
          className="flex gap-1 p-1 rounded-xl"
          style={{ background: "var(--color-surface-3)" }}
        >
          {(["pos", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                tab === t
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-400"
                  : ""
              }`}
              style={{
                color: tab === t ? undefined : "var(--color-text-muted)",
              }}
            >
              {t === "pos" ? "Point of Sale" : "History"}
            </button>
          ))}
        </div>
      </div>

      {tab === "pos" && (
        <>
          {/* Mobile view toggle */}
          <div
            className="flex lg:hidden gap-1 p-1 rounded-xl w-fit"
            style={{ background: "var(--color-surface-3)" }}
          >
            <button
              onClick={() => setMobileView("products")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                mobileView === "products"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-700"
                  : ""
              }`}
              style={{
                color:
                  mobileView === "products"
                    ? undefined
                    : "var(--color-text-muted)",
              }}
            >
              Products
            </button>
            <button
              onClick={() => setMobileView("cart")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                mobileView === "cart"
                  ? "bg-white dark:bg-gray-700 shadow-sm text-blue-700"
                  : ""
              }`}
              style={{
                color:
                  mobileView === "cart" ? undefined : "var(--color-text-muted)",
              }}
            >
              Cart
              {cart.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </button>
          </div>

          {/* Layout */}
          <div className="flex flex-col lg:grid lg:grid-cols-5 gap-4">
            {/* Products grid */}
            <div
              className={`lg:col-span-3 space-y-3 ${mobileView === "cart" ? "hidden lg:block" : ""}`}
            >
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-9"
                  placeholder="Search products…"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {productsData?.items?.map((product: Product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      addToCart(product);
                      setMobileView("cart");
                    }}
                    className="card text-left hover:border-blue-400 hover:shadow-md transition-all active:scale-95 p-2.5 sm:p-3"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mb-2 shrink-0">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-9 h-9 rounded-lg object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <div
                      className="text-xs font-medium line-clamp-2 mb-1 leading-tight"
                      style={{ color: "var(--color-text)" }}
                    >
                      {product.name}
                    </div>
                    <div className="text-sm font-bold text-blue-600">
                      {formatCurrency(product.selling_price)}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {product.quantity} in stock
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart panel */}
            <div
              className={`lg:col-span-2 ${mobileView === "products" ? "hidden lg:block" : ""}`}
            >
              <div
                className="card lg:sticky lg:top-4"
                style={{ minHeight: "500px" }}
              >
                <CartPanel
                  cart={cart}
                  discount={discount}
                  paymentMethod={paymentMethod}
                  amountPaid={amountPaid}
                  subtotal={subtotal}
                  total={total}
                  change={change}
                  isPending={saleMutation.isPending}
                  onUpdateQty={updateQty}
                  onRemove={removeFromCart}
                  onDiscountChange={setDiscount}
                  onPaymentMethodChange={setPaymentMethod}
                  onAmountPaidChange={setAmountPaid}
                  onCheckout={handleCheckout}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* History tab */}
      {tab === "history" && (
        <div className="card p-0 overflow-hidden">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th className="hidden md:table-cell">Date</th>
                  <th className="hidden sm:table-cell">Cashier</th>
                  <th>Total</th>
                  <th className="hidden sm:table-cell">Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.items?.length ? (
                  salesData.items.map((sale: Sale) => (
                    <tr key={sale.id}>
                      <td>
                        <span className="font-mono text-xs sm:text-sm font-semibold text-blue-600">
                          {sale.reference}
                        </span>
                        <div
                          className="text-xs md:hidden"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {formatDate(sale.created_at, "datetime")}
                        </div>
                      </td>
                      <td className="hidden md:table-cell">
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {formatDate(sale.created_at, "datetime")}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span
                          className="text-sm"
                          style={{ color: "var(--color-text)" }}
                        >
                          {sale.cashier?.full_name}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-sm">
                          {formatCurrency(sale.total_amount)}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="badge badge-blue capitalize">
                          {sale.payment_method}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge text-xs ${
                            sale.status === "completed"
                              ? "badge-green"
                              : sale.status === "refunded"
                                ? "badge-red"
                                : "badge-yellow"
                          }`}
                        >
                          {sale.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-sm"
                      style={{ color: "var(--color-text-faint)" }}
                    >
                      No sales found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {salesData && salesData.pages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span
                className="text-xs sm:text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Page {historyPage} of {salesData.pages}
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="btn btn-secondary btn-sm"
                >
                  ← Prev
                </button>
                <button
                  onClick={() =>
                    setHistoryPage((p) => Math.min(salesData.pages, p + 1))
                  }
                  disabled={historyPage === salesData.pages}
                  className="btn btn-secondary btn-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Receipt Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setReceipt(null)}
          />
          <div
            className="relative w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden"
            style={{ background: "var(--color-surface)" }}
          >
            <div
              className="p-6 text-center border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Receipt className="w-6 h-6 text-green-600" />
              </div>
              <h3
                className="font-bold text-lg"
                style={{ color: "var(--color-text)" }}
              >
                Sale Completed!
              </h3>
              <p
                className="text-sm font-mono"
                style={{ color: "var(--color-text-muted)" }}
              >
                {receipt.reference}
              </p>
            </div>
            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
              {receipt.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-text)" }}>
                    {item.product?.name} × {item.quantity}
                  </span>
                  <span style={{ color: "var(--color-text)" }}>
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
              <div
                className="border-t pt-2 space-y-1.5"
                style={{ borderColor: "var(--color-border)" }}
              >
                {receipt.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span>Discount</span>
                    <span>−{formatCurrency(receipt.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base">
                  <span style={{ color: "var(--color-text)" }}>Total</span>
                  <span className="text-blue-600">
                    {formatCurrency(receipt.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Change</span>
                  <span className="font-semibold">
                    {formatCurrency(receipt.change_amount)}
                  </span>
                </div>
              </div>
            </div>
            <div
              className="p-4 border-t flex gap-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                onClick={() => setReceipt(null)}
                className="btn btn-primary flex-1 justify-center"
              >
                Start New Sale
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
