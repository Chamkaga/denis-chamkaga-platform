import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Loader2, Heart, ArrowRight } from 'lucide-react';
import { publicApi } from '../../../services/api';
import { PageTitle } from '../../../components/atoms/PageTitle/PageTitle';
import { motion } from 'framer-motion';

export const SupportCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('TransactionToken') || searchParams.get('TransToken') || searchParams.get('token');
  const errorParam = searchParams.get('error');

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-support-payment', token],
    queryFn: () => publicApi.verifyPayment(token || ''),
    enabled: !!token && !errorParam,
    retry: false
  });

  const isSuccess = !!data && data.status === 'successful';
  const isFailed = !!errorParam || !!error || (data && data.status !== 'successful');
  const errorMsg = errorParam || (error as any)?.response?.data?.error?.message || (error as any)?.message || 'Transaction verification returned failure.';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center font-body min-h-[70vh] flex flex-col justify-center items-center">
      <PageTitle title="Verifying Donation | Denis Chamkaga" description="Validating transaction status with Direct Pay Online payment gateway aggregator." />

      {/* Loading state */}
      {isLoading && !errorParam && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 flex flex-col items-center"
        >
          <Loader2 size={40} className="animate-spin text-accent-violet" />
          <h2 className="text-lg font-bold dark:text-white light:text-slate-800">Verifying Transaction Status</h2>
          <p className="text-xs text-zinc-500 max-w-sm">Please wait while we secure transaction records with direct bank integration channels...</p>
        </motion.div>
      )}

      {/* Success state */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="p-4 rounded-full bg-green-500/10 text-green-500 animate-pulse">
            <CheckCircle2 size={48} className="fill-green-500/10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold dark:text-white light:text-slate-800 font-display">
              Thank You for Your Support!
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 max-w-md leading-relaxed">
              Your donation payment was processed successfully. It is recorded under transaction ref: <span className="font-mono text-accent-violet font-semibold">{data.paymentNumber}</span>. Your support is instrumental in funding open source database and CRM research!
            </p>
          </div>

          <div className="pt-4 flex gap-4">
            <Link 
              to="/"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all shadow-md shadow-accent-violet/15"
            >
              <span>Return Home</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Error state */}
      {isFailed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6 flex flex-col items-center"
        >
          <div className="p-4 rounded-full bg-red-500/10 text-red-500">
            <XCircle size={48} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold dark:text-white light:text-slate-800 font-display">
              Transaction Settlement Failed
            </h1>
            <p className="text-xs sm:text-sm text-red-400 font-semibold bg-red-500/5 py-2.5 px-4 border border-red-500/10 rounded-2xl max-w-md font-mono leading-normal">
              {errorMsg}
            </p>
            <p className="text-xs text-zinc-500 max-w-sm pt-2">
              If money was debited from your mobile wallet, please contact Denis's operations team with your transaction reference.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <Link 
              to="/support"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all shadow-md"
            >
              Try Again
            </Link>
            <Link 
              to="/"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl text-xs font-semibold dark:text-zinc-400 light:text-slate-600 dark:hover:bg-zinc-800 light:hover:bg-slate-100 transition-all border dark:border-zinc-800 light:border-slate-200"
            >
              Return Home
            </Link>
          </div>
        </motion.div>
      )}

      {/* No token query state */}
      {!token && !isLoading && !isSuccess && !isFailed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6 flex flex-col items-center"
        >
          <Heart size={40} className="text-zinc-600 animate-pulse" />
          <h2 className="text-lg font-bold dark:text-white">Callback verification pending</h2>
          <p className="text-xs text-zinc-500">No payment transaction token was identified in the browser's redirect URL query payload.</p>
          <Link to="/" className="text-xs text-accent-violet font-semibold hover:underline">Return Home</Link>
        </motion.div>
      )}
    </div>
  );
};

export default SupportCallbackPage;
