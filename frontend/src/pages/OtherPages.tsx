import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Plus, Eye, EyeOff, Loader2, X, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, usersApi } from '@/api/services';
import { useAuthStore, useThemeStore } from '@/store/auth';
import type { User } from '@/types';

// ─── Shared Modal ─────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto
                      rounded-t-2xl sm:rounded-2xl shadow-2xl"
        style={{ background: 'var(--color-surface)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3.5 border-b"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h2>
          <button onClick={onClose}>
            <X className="w-5 h-5" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ─── Register Page ────────────────────────────────────────────────────────────
export function RegisterPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<any>();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authApi.register(data);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5"
      style={{ background: 'var(--color-surface-2)' }}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" fill="white" />
          </div>
          <span className="font-extrabold text-xl" style={{ color: 'var(--color-text)' }}>
            Stock<span className="text-blue-600">Pilot</span>
          </span>
        </div>

        <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Create account</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
          Fill in your details to get started
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input {...register('full_name', { required: true })} className="input"
              placeholder="John Doe" autoComplete="name" />
          </div>
          <div>
            <label className="label">Email address *</label>
            <input {...register('email', { required: true })} type="email" className="input"
              placeholder="you@company.com" autoComplete="email" />
          </div>
          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input {...register('password', { required: true, minLength: 8 })}
                type={showPwd ? 'text' : 'password'}
                className="input pr-10"
                placeholder="Min 8 characters"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-muted)' }}>
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">Password must be at least 8 characters</p>
            )}
          </div>
          <button type="submit" disabled={loading}
            className="btn btn-primary btn-lg w-full justify-center mt-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              : 'Create Account'
            }
          </button>
        </form>

        <p className="mt-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────
export function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [tab, setTab] = useState<'profile' | 'security'>('profile');

  const profileForm = useForm<any>({
    defaultValues: { full_name: user?.full_name, email: user?.email },
  });
  const pwdForm = useForm<any>();

  const profileMutation = useMutation({
    mutationFn: (data: object) => authApi.updateMe(data),
    onSuccess: res => { updateUser(res.data); toast.success('Profile updated!'); },
    onError: () => toast.error('Update failed'),
  });

  const pwdMutation = useMutation({
    mutationFn: (data: object) => authApi.changePassword(data),
    onSuccess: () => { toast.success('Password changed!'); pwdForm.reset(); },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Error'),
  });

  const initials = user?.full_name
    ?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() ?? 'U';

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Settings</h1>

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--color-surface-3)' }}>
        {(['profile', 'security'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t ? 'bg-white dark:bg-gray-700 shadow-sm text-blue-700 dark:text-blue-400' : ''
            }`}
            style={{ color: tab === t ? undefined : 'var(--color-text-muted)' }}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 pb-4 border-b"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-blue-600 flex items-center
                            justify-center text-white text-xl sm:text-2xl font-bold shrink-0">
              {initials}
            </div>
            <div>
              <div className="font-semibold text-base sm:text-lg" style={{ color: 'var(--color-text)' }}>
                {user?.full_name}
              </div>
              <span className="badge badge-blue text-xs capitalize mt-1 inline-block">
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))}
            className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...profileForm.register('full_name')} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input {...profileForm.register('email')} type="email" className="input" />
            </div>

            {/* Theme toggle row */}
            <div className="flex items-center justify-between py-3 px-0.5 border-t border-b"
              style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                  Appearance
                </div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {theme === 'dark' ? 'Dark mode enabled' : 'Light mode enabled'}
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  theme === 'dark' ? 'bg-blue-600' : 'bg-gray-200'
                }`}
                aria-label="Toggle theme"
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  theme === 'dark' ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <button type="submit" disabled={profileMutation.isPending} className="btn btn-primary">
              {profileMutation.isPending ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--color-text)' }}>Change Password</h3>
          <form onSubmit={pwdForm.handleSubmit(d => pwdMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input {...pwdForm.register('current_password', { required: true })}
                type="password" className="input" />
            </div>
            <div>
              <label className="label">New Password</label>
              <input {...pwdForm.register('new_password', { required: true, minLength: 8 })}
                type="password" className="input" />
            </div>
            <button type="submit" disabled={pwdMutation.isPending} className="btn btn-primary">
              {pwdMutation.isPending ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ─── Users Page ───────────────────────────────────────────────────────────────
export function UsersPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const { register, handleSubmit, reset } = useForm<any>();

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: object) => usersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created!');
      setModal(false); reset();
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Error'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => usersApi.deactivate(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User deactivated'); },
  });

  const roleColors: Record<string, string> = {
    super_admin: 'badge-red',
    manager: 'badge-blue',
    cashier: 'badge-green',
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--color-text)' }}>Users</h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Manage system access and roles
          </p>
        </div>
        <button onClick={() => { reset(); setModal(true); }} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th className="hidden sm:table-cell">Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 5 }).map((_, j) => <td key={j}><div className="skeleton h-4 w-20" /></td>)}</tr>
                  ))
                : data?.items?.map((u: User) => (
                    <tr key={u.id}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
                                          text-white text-xs font-bold shrink-0">
                            {u.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>
                              {u.full_name}
                            </div>
                            {/* Show email inline on mobile */}
                            <div className="text-xs truncate sm:hidden"
                              style={{ color: 'var(--color-text-muted)' }}>
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell">
                        <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          {u.email}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs capitalize ${roleColors[u.role] ?? 'badge-gray'}`}>
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`badge text-xs ${u.is_active ? 'badge-green' : 'badge-gray'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => deactivateMutation.mutate(u.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Deactivate user"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modal} onClose={() => { setModal(false); reset(); }} title="Create User">
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Full Name *</label>
            <input {...register('full_name', { required: true })} className="input" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input {...register('email', { required: true })} type="email" className="input" />
          </div>
          <div>
            <label className="label">Password *</label>
            <input {...register('password', { required: true })} type="password" className="input" />
          </div>
          <div>
            <label className="label">Role</label>
            <select {...register('role')} className="input">
              <option value="cashier">Cashier</option>
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => { setModal(false); reset(); }}
              className="btn btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn btn-primary flex-1">
              {createMutation.isPending ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
