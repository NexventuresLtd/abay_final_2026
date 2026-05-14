import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  BarChart3,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  Zap,
  Tag,
} from "lucide-react";
import { useAuthStore, useThemeStore } from "@/store/auth";
import { cn } from "@/utils";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/products", icon: Package, label: "Products" },
  { to: "/categories", icon: Tag, label: "Categories" },
  { to: "/sales", icon: ShoppingCart, label: "Sales / POS" },
  { to: "/suppliers", icon: Truck, label: "Suppliers" },
  {
    to: "/expenses",
    icon: DollarSign,
    label: "Expenses",
    roles: ["super_admin", "manager"],
  },
  {
    to: "/reports",
    icon: BarChart3,
    label: "Reports",
    roles: ["super_admin", "manager"],
  },
  {
    to: "/users",
    icon: Users,
    label: "Users",
    roles: ["super_admin", "manager"],
  },
  { to: "/settings", icon: Settings, label: "Settings" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
        <Zap className="w-4 h-4 text-white" fill="white" />
      </div>
      <span
        className="font-extrabold text-sm tracking-tight"
        style={{ color: "var(--color-text)" }}
      >
        Stock<span className="text-blue-600">Pilot</span>
      </span>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.role ?? ""),
  );

  // Mobile bottom nav — role aware
  const mobileNav =
    user?.role === "cashier"
      ? [
          { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
          { to: "/products", icon: Package, label: "Products" },
          { to: "/sales", icon: ShoppingCart, label: "POS" },
          { to: "/suppliers", icon: Truck, label: "Suppliers" },
          { to: "/settings", icon: Settings, label: "Settings" },
        ]
      : [
          { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
          { to: "/products", icon: Package, label: "Products" },
          { to: "/sales", icon: ShoppingCart, label: "POS" },
          { to: "/expenses", icon: DollarSign, label: "Expenses" },
          { to: "/settings", icon: Settings, label: "Settings" },
        ];

  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() ?? "U";

  const UserAvatar = ({ size = "sm" }: { size?: "sm" | "md" }) => (
    <div
      className={cn(
        "rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0",
        size === "sm" ? "w-7 h-7 text-xs" : "w-10 h-10 text-sm",
      )}
    >
      {initials}
    </div>
  );

  return (
    <div
      className="flex min-h-screen"
      style={{ background: "var(--color-surface-2)" }}
    >
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-60 fixed inset-y-0 left-0 z-40 border-r"
        style={{
          background: "var(--color-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        <div
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn("sidebar-link", isActive && "active")
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div
          className="shrink-0 p-3 border-t space-y-2"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg"
            style={{ background: "var(--color-surface-2)" }}
          >
            <UserAvatar size="sm" />
            <div className="min-w-0 flex-1">
              <div
                className="text-xs font-semibold truncate"
                style={{ color: "var(--color-text)" }}
              >
                {user?.full_name}
              </div>
              <div
                className="text-xs capitalize"
                style={{ color: "var(--color-text-muted)" }}
              >
                {user?.role?.replace("_", " ")}
              </div>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={toggleTheme}
              className="btn btn-secondary btn-sm flex-1 justify-center"
            >
              {theme === "dark" ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-danger btn-sm flex-1 justify-center"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ───────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />

          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] flex flex-col border-r shadow-2xl"
            style={{
              background: "var(--color-surface)",
              borderColor: "var(--color-border)",
              animation: "slideInLeft .22s ease-out",
            }}
          >
            <div
              className="flex items-center justify-between px-4 h-14 border-b shrink-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1.5 rounded-lg"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-3 pt-3 pb-1 shrink-0">
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--color-surface-2)" }}
              >
                <UserAvatar size="md" />
                <div className="min-w-0">
                  <div
                    className="font-semibold text-sm truncate"
                    style={{ color: "var(--color-text)" }}
                  >
                    {user?.full_name}
                  </div>
                  <div
                    className="text-xs capitalize"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {user?.role?.replace("_", " ")}
                  </div>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn("sidebar-link", isActive && "active")
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                </NavLink>
              ))}
            </nav>

            <div
              className="shrink-0 p-3 border-t flex gap-2"
              style={{ borderColor: "var(--color-border)" }}
            >
              <button
                onClick={toggleTheme}
                className="btn btn-secondary btn-sm flex-1 justify-center gap-1.5"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {theme === "dark" ? "Light" : "Dark"}
              </button>
              <button
                onClick={handleLogout}
                className="btn btn-danger btn-sm px-3"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-60 min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 border-b shrink-0"
          style={{
            background: "var(--color-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-1 rounded-lg"
            style={{ color: "var(--color-text)" }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo />
          <button
            onClick={toggleTheme}
            className="p-2 -mr-1 rounded-lg"
            style={{ color: "var(--color-text-muted)" }}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 pb-24 lg:pb-6 page-enter min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────── */}
      <nav className="bottom-nav lg:hidden">
        {mobileNav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn("bottom-nav-item", isActive && "active")
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0);     }
        }
      `}</style>
    </div>
  );
}
