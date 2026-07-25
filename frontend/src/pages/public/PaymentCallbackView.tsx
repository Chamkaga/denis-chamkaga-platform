// src/pages/public/PaymentCallbackView.tsx
// Verification callback screen redirected from payment checkout gateways.

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicDocsApi } from '../../services/api';
import { CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';

export const PaymentCallbackView: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const transactionId = searchParams.get('transaction_id') || searchParams.get('transactionId');

  useEffect(() => {
    const verify = async () => {
      if (!transactionId) {
        setError('No transaction identifier received from checkout callback.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Query database ledger confirmation (verify direct or poll webhook processing)
        const data = await publicDocsApi.verifyPublicPayment(transactionId);
        
        if (data && data.status === 'successful') {
          setSuccess(true);
          setPaymentDetails(data);
        } else {
          setError('Payment was not marked successful in our transaction ledger.');
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to verify transaction status.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [transactionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-body px-4">
        <RefreshCw className="w-10 h-10 text-violet-500 animate-spin mb-4" />
        <h1 className="text-sm font-bold">Verifying Payment Settlement</h1>
        <p className="text-xs text-zinc-500 text-center mt-1">Polling transaction status directly against payment provider API ledger. Please hold...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4 font-body">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-violet-600/10 rounded-full blur-2xl" />

        {success ? (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Payment Settle Successful!</h1>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto">
              Your invoice balance has been successfully settled. A copy of the receipt has been prepared and dispatched to your billing email address.
            </p>

            <div className="my-6 p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Receipt Ref:</span>
                <span className="font-semibold text-zinc-200">{paymentDetails?.paymentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Transaction ID:</span>
                <span className="font-mono text-zinc-300">{transactionId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Status:</span>
                <span className="font-bold text-emerald-400 uppercase">Cleared</span>
              </div>
            </div>

            <button 
              onClick={() => window.close()} 
              className="w-full text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl transition-all shadow-md shadow-violet-600/15"
            >
              Close Window
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Payment Verification Failed</h1>
            <p className="text-xs text-zinc-400 mt-2 max-w-xs mx-auto">
              {error || 'The gateway payment could not be processed. Please check your payment credentials and try again.'}
            </p>

            <div className="my-6 p-4 bg-zinc-950 border border-zinc-800/80 rounded-2xl text-left text-xs space-y-1">
              <div className="flex items-start gap-2 text-zinc-500">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>If funds were already deducted from your account, please do not double pay. Webhooks are verifying the ledger asynchronously.</span>
              </div>
            </div>

            <button 
              onClick={() => window.close()} 
              className="w-full text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-3 rounded-xl transition-all"
            >
              Close Window
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentCallbackView;
