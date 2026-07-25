import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Logo } from '../../components/atoms/Logo';
import { api } from '../../services/api';

interface ResetPasswordInput {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordInput>();

  const newPasswordVal = watch('newPassword');

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      setSubmitted(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-body">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border glass-panel shadow-2xl space-y-6 text-left">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" hideText={true} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white light:text-slate-800 tracking-tight font-display">
            Set New Password
          </h2>
          <p className="text-xs dark:text-zinc-500 light:text-slate-400">
            Create a strong new password for your account
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <p className="text-sm font-semibold text-emerald-400">Password reset successful!</p>
            <p className="text-xs text-zinc-400">Redirecting to login portal...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-xs font-semibold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="newPassword"
                  type="password"
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                  })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  placeholder="••••••••"
                />
              </div>
              {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword.message}</span>}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-xs font-semibold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-zinc-500">
                  <Lock size={16} />
                </span>
                <input
                  id="confirmPassword"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm password',
                    validate: (val) => val === newPasswordVal || 'Passwords do not match',
                  })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword.message}</span>}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <Button variant="primary" type="submit" fullWidth disabled={loading} leftIcon={<KeyRound size={16} />}>
              {loading ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </form>
        )}

        <div className="text-center pt-4 border-t dark:border-zinc-800/80 light:border-slate-200">
          <Link to="/login" className="text-xs font-semibold text-zinc-500 hover:text-accent-violet transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
