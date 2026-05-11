import { Link } from 'react-router-dom';
import { Store, Mail, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit } = useForm<{ email: string }>();

  const onSubmit = (data: { email: string }) => {
    // In a real system this would call a reset API
    console.log('Reset requested for:', data.email);
    setSent(true);
    toast.success('If that email exists, a reset link was sent.');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-surface-2)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            <Store className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl" style={{ color: 'var(--color-text)' }}>StockPilot</span>
        </div>

        {sent ? (
          <div className="card text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text)' }}>Check your email</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              If an account exists with that email, we've sent a password reset link.
            </p>
            <Link to="/login" className="btn btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>Forgot password?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
              Enter your email and we'll send a reset link.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input
                  {...register('email', { required: true })}
                  type="email"
                  className="input"
                  placeholder="you@company.com"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg w-full justify-center">
                Send Reset Link
              </button>
            </form>
            <Link to="/login"
              className="flex items-center justify-center gap-2 mt-4 text-sm"
              style={{ color: 'var(--color-text-muted)' }}>
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
