import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '@/api/services';
import { useAuthStore } from '@/store/auth';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (email: string, password: string) => {
    setValue('email', email);
    setValue('password', password);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--color-surface-2)' }}>

      {/* ── LEFT HERO — hidden on mobile ───────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 xl:w-1/2 bg-blue-700 p-12 text-white">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap className="w-6 h-6" fill="white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight">StockPilot</span>
        </div>

        {/* Hero copy */}
        <div className="space-y-6">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight">
            Run your business<br />
            <span className="text-blue-300">on autopilot.</span>
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed max-w-sm">
            Real-time inventory, POS sales, expense tracking and PDF/Excel reports — all in one place.
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              ['📦', 'Live Inventory', 'Auto-adjusts on every sale'],
              ['🛒', 'Built-in POS',   'Receipts in seconds'],
              ['📊', 'Reports',        'PDF & Excel export'],
              ['🌙', 'Dark Mode',      'Easy on the eyes'],
            ].map(([emoji, title, desc]) => (
              <div key={title} className="bg-white/10 rounded-xl p-3.5">
                <div className="text-lg mb-1">{emoji}</div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-blue-200 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-blue-300/70 text-sm">© 2026 StockPilot — NexVentures Ltd</p>
      </div>

      {/* ── RIGHT FORM ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-xl" style={{ color: 'var(--color-text)' }}>
              Stock<span className="text-blue-600">Pilot</span>
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
            Sign in
          </h2>
          <p className="text-sm mb-7" style={{ color: 'var(--color-text-muted)' }}>
            Welcome back — enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                {...register('email')}
                type="email"
                className="input"
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="label" style={{ marginBottom: 0 }}>Password</label>
                <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPwd ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full justify-center mt-2"
            >
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : 'Sign in to StockPilot'
              }
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Create account
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl p-3.5 text-xs space-y-1.5"
            style={{ background: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}>
            <p className="font-semibold text-xs mb-2" style={{ color: 'var(--color-text)' }}>
              🔑 Quick demo logins
            </p>
            {[
              { label: 'Super Admin', email: 'admin@stockpilot.com', pass: 'Admin@123' },
              { label: 'Manager',     email: 'manager@stockpilot.com', pass: 'Manager@123' },
              { label: 'Cashier',     email: 'cashier@stockpilot.com', pass: 'Cashier@123' },
            ].map(({ label, email, pass }) => (
              <button
                key={label}
                type="button"
                onClick={() => fillDemo(email, pass)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
                {' — '}{email}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
