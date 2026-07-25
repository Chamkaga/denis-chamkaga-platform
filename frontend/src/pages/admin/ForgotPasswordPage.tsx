import React from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { Logo } from '../../components/atoms/Logo';
import { api } from '../../services/api';

interface ForgotPasswordInput {
  email: string;
}

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>();

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await api.post('/auth/forgot-password', data);
      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error?.message || 'Failed to request password reset.');
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
            Forgot Password
          </h2>
          <p className="text-xs dark:text-zinc-500 light:text-slate-400">
            Enter your email to receive a password reset link
          </p>
        </div>

        {submitted ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center space-y-2">
            <p className="text-sm font-semibold text-emerald-400">Reset instructions sent!</p>
            <p className="text-xs text-zinc-400">If an account matches that email, check your inbox for reset instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-semibold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-zinc-500">
                  <Mail size={16} />
                </span>
                <input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  placeholder="admin@denischamkaga.com"
                />
              </div>
              {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <Button variant="primary" type="submit" fullWidth disabled={loading} leftIcon={<Send size={16} />}>
              {loading ? 'Sending Request...' : 'Send Reset Link'}
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
export default ForgotPasswordPage;
