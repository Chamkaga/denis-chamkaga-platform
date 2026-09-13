import React, { useState } from 'react';
import {
  Link as LinkIcon, Copy, Check, MessageSquare, Mail, X
} from 'lucide-react';
import { Button } from '../atoms/Button';
import { useToast } from '../atoms/Toast';

interface PaymentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceOrQuote?: {
    id: string;
    number: string;
    clientName?: string;
    clientEmail?: string;
    clientPhone?: string;
    amount: number;
    currency?: string;
  } | null;
}

export const PaymentLinkModal: React.FC<PaymentLinkModalProps> = ({
  isOpen,
  onClose,
  invoiceOrQuote,
}) => {
  const { toast } = useToast();
  const [paymentType, setPaymentType] = useState<'full' | 'deposit' | 'installment'>('full');
  const [depositAmount, setDepositAmount] = useState<number>(
    invoiceOrQuote ? Math.round(invoiceOrQuote.amount * 0.5) : 0
  );
  const [installments, setInstallments] = useState<number>(3);
  const [expiryDays, setExpiryDays] = useState<number>(7);
  const [copied, setCopied] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);

  if (!isOpen || !invoiceOrQuote) return null;

  const currency = invoiceOrQuote.currency || 'TZS';

  const handleGenerate = () => {
    const code = Math.random().toString(36).substring(2, 9).toUpperCase();
    const link = `${window.location.origin}/pay/${invoiceOrQuote.number || code}`;
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}`;

    setGeneratedUrl(link);
    setQrUrl(qr);
    toast.success('Payment Link Generated Successfully!', 'Payment Link');
  };

  const handleCopy = () => {
    if (!generatedUrl) return;
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast.info('Payment link copied to clipboard', 'Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!generatedUrl) return;
    const msg = `Hello ${invoiceOrQuote.clientName || 'Customer'},\n\nHere is your payment link for Invoice #${invoiceOrQuote.number} (${currency} ${invoiceOrQuote.amount.toLocaleString()}):\n\n${generatedUrl}\n\nThank you for choosing Denis Chamkaga Enterprise!`;
    const url = `https://wa.me/${(invoiceOrQuote.clientPhone || '').replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    if (!generatedUrl) return;
    const subject = `Payment Link for Invoice #${invoiceOrQuote.number}`;
    const body = `Dear ${invoiceOrQuote.clientName || 'Valued Client'},\n\nPlease find your payment link for Invoice #${invoiceOrQuote.number} below:\n\nAmount: ${currency} ${invoiceOrQuote.amount.toLocaleString()}\nPayment Link: ${generatedUrl}\n\nThank you,\nDenis Chamkaga Enterprise`;
    window.open(`mailto:${invoiceOrQuote.clientEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg p-6 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-5 text-left font-body">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-accent-violet/10 text-accent-violet">
              <LinkIcon size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Generate Payment Link</h3>
              <p className="text-xs text-zinc-500">Invoice #{invoiceOrQuote.number} • {currency} {invoiceOrQuote.amount.toLocaleString()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800">
            <X size={18} />
          </button>
        </div>

        {/* Configurations */}
        {!generatedUrl ? (
          <div className="space-y-4">
            {/* Payment Type Selection */}
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Payment Terms</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full', label: 'Full Amount' },
                  { id: 'deposit', label: 'Deposit / Partial' },
                  { id: 'installment', label: 'Installments' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setPaymentType(type.id as any)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                      paymentType === type.id
                        ? 'border-accent-violet text-accent-violet bg-accent-violet/10 shadow-sm'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Inputs based on type */}
            {paymentType === 'deposit' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Deposit Required ({currency})</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                />
              </div>
            )}

            {paymentType === 'installment' && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Number of Installments</label>
                <select
                  value={installments}
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
                >
                  <option value={2}>2 Monthly Installments</option>
                  <option value={3}>3 Monthly Installments</option>
                  <option value={4}>4 Monthly Installments</option>
                  <option value={6}>6 Monthly Installments</option>
                </select>
              </div>
            )}

            {/* Expiry Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Link Expiry</label>
              <select
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
              >
                <option value={3}>3 Days</option>
                <option value={7}>7 Days (Recommended)</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>

            <Button variant="primary" fullWidth onClick={handleGenerate} className="mt-4">
              Generate Link & QR Code
            </Button>
          </div>
        ) : (
          /* Link Generated Result View */
          <div className="space-y-5 animate-in fade-in">
            {/* Payment URL Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Active Payment Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedUrl}
                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
                />
                <Button variant="outline" onClick={handleCopy} leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
            </div>

            {/* QR Code preview */}
            {qrUrl && (
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                <img src={qrUrl} alt="Payment QR Code" className="w-40 h-40 rounded-xl" />
                <p className="text-[11px] text-zinc-500 mt-2 font-medium">Scan to pay via M-Pesa / Tigo Pesa / Airtel / Card</p>
              </div>
            )}

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" onClick={handleSendWhatsApp} leftIcon={<MessageSquare size={14} className="text-emerald-500" />}>
                WhatsApp
              </Button>
              <Button variant="outline" onClick={handleSendEmail} leftIcon={<Mail size={14} className="text-blue-500" />}>
                Send Email
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
