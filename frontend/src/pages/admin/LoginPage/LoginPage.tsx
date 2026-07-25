import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Key, Mail, Lock } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { useAuthStore } from '../../../store/useAuthStore';
import { ROUTES } from '../../../config/routes';
import { Logo } from '../../../components/atoms/Logo';
import { api } from '../../../services/api';

interface LoginInput {
  email: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [loginError, setLoginError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>();

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setLoginError(null);
    try {
      const res = await api.post('/auth/login', data);
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate(ROUTES.ADMIN_DASHBOARD);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Authentication failed. Please verify credentials.';
      setLoginError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 font-body">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-2xl border glass-panel shadow-2xl space-y-6 text-left">
        
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <Logo size="lg" hideText={true} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white light:text-slate-800 tracking-tight font-display">
            Admin Console Login
          </h2>
          <p className="text-xs dark:text-zinc-500 light:text-slate-400">
            Secure authentication portal for Denis Chamkaga Brand Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">
              Email Address
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

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-xs font-semibold dark:text-zinc-400 light:text-slate-600 uppercase tracking-wider">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-zinc-500">
                <Lock size={16} />
              </span>
              <input
                id="password"
                type="password"
                {...register('password', { required: 'Password is required' })}
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          {loginError && (
            <div className="p-3.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-xs font-semibold">
              {loginError}
            </div>
          )}

          <Button
            variant="primary"
            type="submit"
            fullWidth
            disabled={loading}
            leftIcon={<Key size={16} />}
          >
            {loading ? 'Authenticating...' : 'Authenticate'}
          </Button>

        </form>

        <div className="text-center pt-4 border-t dark:border-zinc-800/80 light:border-slate-200">
          <Link
            to={ROUTES.HOME}
            className="text-xs font-semibold text-zinc-500 hover:text-accent-violet transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
