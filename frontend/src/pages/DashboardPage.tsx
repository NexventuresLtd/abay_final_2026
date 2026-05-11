import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  Package, ShoppingCart, TrendingUp, AlertTriangle,
  DollarSign, Truck, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { dashboardApi } from '@/api/services';
import { formatCurrency, formatDate, getStockStatus, MONTHS } from '@/utils';
import { Link } from 'react-router-dom';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  trend?: number;
  trendLabel?: string;
}

const COLOR_MAP: Record<string, { bg: string; icon: string }> = {
  blue:   { bg: '#dbeafe', icon: '#2563eb' },
  green:  { bg: '#dcfce7', icon: '#16a34a' },
  yellow: { bg: '#fef9c3', icon: '#ca8a04' },
  red:    { bg: '#fee2e2', icon: '#dc2626' },
  purple: { bg: '#f3e8ff', icon: '#9333ea' },
  orange: { bg: '#ffedd5', icon: '#ea580c' },
};

function StatCard({ icon: Icon, label, value, sub, color = 'blue', trend, trendLabel }: StatCardProps) {
  const c = COLOR_MAP[color];
  const positive = (trend ?? 0) >= 0;
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: c.bg }}>
          <Icon className="w-5 h-5" style={{ color: c.icon }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
            positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {positive
              ? <ArrowUpRight className="w-3 h-3" />
              : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-xl sm:text-2xl font-bold mb-0.5 truncate" style={{ color: 'var(--color-text)' }}>
        {value}
      </div>
      <div className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
      {sub && <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-faint)' }}>{sub}</div>}
      {trendLabel && <div className="text-xs mt-1" style={{ color: 'var(--color-text-faint)' }}>{trendLabel}</div>}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="stat-card space-y-3">
      <div className="skeleton w-10 h-10 rounded-xl" />
      <div className="skeleton w-28 h-6" />
      <div className="skeleton w-20 h-3" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getStats().then(r => r.data),
    refetchInterval: 30_000,
  });

  const chartData = stats?.monthly_revenue.map(m => ({
    month: MONTHS[m.month - 1],
    Revenue: m.revenue,
    Expenses: m.expenses,
    Profit: Math.max(0, m.revenue - m.expenses),
  })) ?? [];

  const tooltipStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '12px',
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats — 2 cols mobile → 4 cols desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : <>
            <StatCard icon={Package}     label="Total Products"    value={stats?.total_products ?? 0}                    color="blue"   />
            <StatCard icon={ShoppingCart} label="Sales Today"      value={stats?.total_sales_today ?? 0}                color="green"  />
            <StatCard icon={TrendingUp}  label="Revenue Today"     value={formatCurrency(stats?.revenue_today ?? 0)}    color="purple" />
            <StatCard icon={DollarSign}  label="Monthly Revenue"   value={formatCurrency(stats?.revenue_month ?? 0)}   color="orange" />
            <StatCard icon={TrendingUp}  label="Monthly Profit"    value={formatCurrency(stats?.profit_month ?? 0)}    color="green"  />
            <StatCard icon={DollarSign}  label="Monthly Expenses"  value={formatCurrency(stats?.total_expenses_month ?? 0)} color="red" />
            <StatCard icon={AlertTriangle} label="Low Stock Items" value={stats?.low_stock_count ?? 0}
              sub={`${stats?.out_of_stock_count ?? 0} out of stock`} color="yellow" />
            <StatCard icon={Truck}       label="Active Suppliers"  value={stats?.total_suppliers ?? 0}                 color="blue"   />
          </>
        }
      </div>

      {/* Charts — stacked mobile, side-by-side on lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue / Expenses area chart */}
        <div className="card">
          <h3 className="font-semibold text-sm sm:text-base mb-4" style={{ color: 'var(--color-text)' }}>
            Revenue &amp; Expenses
          </h3>
          <div className="h-48 sm:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="grad-rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}    />
                  </linearGradient>
                  <linearGradient id="grad-exp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={tooltipStyle}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#2563eb" fill="url(#grad-rev)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#grad-exp)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top products bar chart */}
        <div className="card">
          <h3 className="font-semibold text-sm sm:text-base mb-4" style={{ color: 'var(--color-text)' }}>
            Top Selling Products
          </h3>
          {stats?.top_products?.length ? (
            <div className="h-48 sm:h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.top_products} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'var(--color-text-muted)' }}
                    interval={0} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sold" name="Units Sold" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 sm:h-56 flex items-center justify-center text-sm"
              style={{ color: 'var(--color-text-faint)' }}>
              No sales data yet
            </div>
          )}
        </div>
      </div>

      {/* Recent sales + Low stock — stacked mobile, side-by-side lg */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Recent Sales */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
              Recent Sales
            </h3>
            <Link to="/sales" className="text-xs text-blue-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-0">
            {stats?.recent_sales?.length ? stats.recent_sales.map(sale => (
              <div key={sale.id}
                className="flex items-center justify-between py-2.5 border-b last:border-0"
                style={{ borderColor: 'var(--color-border)' }}>
                <div className="min-w-0 mr-3">
                  <div className="text-xs sm:text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                    {sale.reference}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {sale.cashier?.full_name} · {formatDate(sale.created_at, 'datetime')}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(sale.total_amount)}
                  </div>
                  <span className={`badge text-xs ${
                    sale.status === 'completed' ? 'badge-green'
                    : sale.status === 'refunded' ? 'badge-red' : 'badge-yellow'
                  }`}>
                    {sale.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--color-text-faint)' }}>
                No recent sales
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
              Low Stock Alerts
            </h3>
            <Link to="/products?stock_status=low" className="text-xs text-blue-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="space-y-0">
            {stats?.low_stock_products?.length ? stats.low_stock_products.map(product => {
              const status = getStockStatus(product.quantity, product.low_stock_threshold);
              return (
                <div key={product.id}
                  className="flex items-center justify-between py-2.5 border-b last:border-0"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div className="min-w-0 mr-3">
                    <div className="text-xs sm:text-sm font-medium truncate"
                      style={{ color: 'var(--color-text)' }}>{product.name}</div>
                    <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {product.category?.name ?? 'Uncategorized'}
                    </div>
                  </div>
                  <div className="text-right shrink-0 space-y-0.5">
                    <span className={`badge text-xs ${status.color}`}>{status.label}</span>
                    <div className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>
                      {product.quantity} left
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="py-10 text-center text-sm" style={{ color: 'var(--color-text-faint)' }}>
                All products are well-stocked ✓
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
