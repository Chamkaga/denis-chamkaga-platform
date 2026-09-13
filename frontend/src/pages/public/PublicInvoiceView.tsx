// src/pages/public/PublicInvoiceView.tsx
// Premium, print-friendly public viewer page for Invoices with Flutterwave checkout integration.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicDocsApi } from '../../services/api';
import { CreditCard, AlertCircle, RefreshCw, Printer, Download, CheckCircle, Smartphone, Building2, ShieldCheck, Lock } from 'lucide-react';
import { useToast } from '../../components/atoms/Toast';

export const PublicInvoiceView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'mobile' | 'bank' | 'card' | 'gateway'>('mobile');
  const [selectedMethod, setSelectedMethod] = useState<string>('m-pesa');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const { toast } = useToast();

  const fetchDoc = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await publicDocsApi.getPublicDoc(token);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.error?.message || 'Failed to retrieve document.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'The secure link is invalid, expired, or has been revoked.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [token]);

  const handleCheckout = async () => {
    if (!token) return;
    try {
      setCheckoutLoading(true);
      const res = await publicDocsApi.initializePublicPayment(token);
      if (res.checkoutUrl) {
        // Redirect to Flutterwave checkout page
        window.location.href = res.checkoutUrl;
      } else {
        toast.error('Failed to obtain payment gateway redirect link. Please try again.', 'Checkout Error');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error?.message || 'Payment checkout initialization failed.', 'Payment Error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-body">
        <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading secure invoice details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white px-4 font-body">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Access Link Invalid or Expired</h1>
        <p className="text-sm text-zinc-500 text-center max-w-sm mt-2">
          {error || 'This link has expired, exceeded its maximum views, or been revoked. Please contact Denis directly to request a new link.'}
        </p>
      </div>
    );
  }

  const { document, tenant } = data;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.open(`/api/public/docs/${token}/pdf`, '_blank');
  };

  const isPaid = Number(document.balanceDue) <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-zinc-100 font-body py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:text-slate-900 print:py-0 print:px-0">
      
      {/* Action Toolbar */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800 p-4 rounded-2xl print:hidden">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-zinc-400 font-medium">Secure Link (Active till {new Date(data.access.expiresAt).toLocaleDateString()})</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
        </div>
      </div>

      {/* Main Invoice Sheet */}
      <div className="max-w-4xl mx-auto bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 p-8 sm:p-12 rounded-3xl shadow-2xl relative overflow-hidden print:border-none print:bg-white print:p-0 print:shadow-none">
        
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 print:hidden" />

        {/* Branding & Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10 pb-10 border-b border-zinc-800 print:border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight dark:text-white print:text-slate-900">{tenant.name.toUpperCase()}</h1>
            <p className="text-xs text-zinc-500 mt-1 print:text-slate-500">{tenant.address}</p>
            <p className="text-[11px] text-zinc-400 mt-1 print:text-slate-500">Email: {tenant.email} | Phone: {tenant.phone}</p>
          </div>
          <div className="md:text-right">
            <span className="text-xs uppercase tracking-widest font-bold text-violet-500 print:text-slate-800">Billing Statement</span>
            <h2 className="text-xl font-bold text-zinc-200 mt-1 print:text-slate-800">#{document.invoiceNumber}</h2>
            <p className="text-[11px] text-zinc-500 mt-2 print:text-slate-500">Issued: {new Date(document.issueDate).toLocaleDateString()}</p>
            <p className="text-[11px] text-zinc-500 print:text-slate-500">Due Date: {new Date(document.dueDate).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Billing details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div>
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 print:text-slate-400">Client Billing</h3>
            <p className="text-sm font-bold text-white print:text-slate-800">{document.organization.name}</p>
            {document.organization.address && <p className="text-xs text-zinc-400 mt-1 print:text-slate-500">{document.organization.address}</p>}
            {document.organization.email && <p className="text-xs text-zinc-400 mt-1 print:text-slate-500">Email: {document.organization.email}</p>}
          </div>
          <div className="md:text-right">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 print:text-slate-400">Payment Status</h3>
            <span className={`inline-block text-[10px] uppercase font-bold px-3 py-1 rounded-full ${
              isPaid 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : document.status === 'partially_paid'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
            }`}>
              {isPaid ? 'PAID' : document.status.replace('_', ' ')}
            </span>
            <p className="text-xs text-zinc-500 mt-2 print:text-slate-500">Terms: {document.paymentTerms || 'Due on Receipt'}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mb-10 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 print:border-slate-200 print:text-slate-600">
                <th className="py-3 font-semibold uppercase tracking-wider">Line Description</th>
                <th className="py-3 font-semibold uppercase tracking-wider text-center w-16">Qty</th>
                <th className="py-3 font-semibold uppercase tracking-wider text-right w-28">Unit Price</th>
                <th className="py-3 font-semibold uppercase tracking-wider text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {document.items.map((item: any) => (
                <tr key={item.id} className="border-b border-zinc-800/40 print:border-slate-100">
                  <td className="py-4 text-zinc-300 font-medium print:text-slate-800">{item.description}</td>
                  <td className="py-4 text-zinc-400 text-center print:text-slate-600">{Number(item.quantity)}</td>
                  <td className="py-4 text-zinc-400 text-right print:text-slate-600">{document.currency} {Number(item.unitPrice).toLocaleString()}</td>
                  <td className="py-4 text-zinc-200 text-right font-medium print:text-slate-800">{document.currency} {Number(item.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Block */}
        <div className="flex flex-col items-end gap-2 mb-10 pb-6 border-b border-zinc-800 print:border-slate-200">
          <div className="w-72 flex justify-between text-xs text-zinc-400 print:text-slate-600">
            <span>Subtotal:</span>
            <span>{document.currency} {Number(document.subtotal).toLocaleString()}</span>
          </div>
          {Number(document.discountAmount) > 0 && (
            <div className="w-72 flex justify-between text-xs text-emerald-400">
              <span>Discounts:</span>
              <span>- {document.currency} {Number(document.discountAmount).toLocaleString()}</span>
            </div>
          )}
          {Number(document.taxAmount) > 0 && (
            <div className="w-72 flex justify-between text-xs text-zinc-400 print:text-slate-600">
              <span>VAT ({Number(document.taxRate)}%):</span>
              <span>{document.currency} {Number(document.taxAmount).toLocaleString()}</span>
            </div>
          )}
          <div className="w-72 flex justify-between text-xs text-zinc-400 print:text-slate-600">
            <span>Total Value:</span>
            <span>{document.currency} {Number(document.total).toLocaleString()}</span>
          </div>
          
          {/* Successful Payments */}
          {document.payments && document.payments.filter((p: any) => p.status === 'successful').length > 0 && (
            <div className="w-72 flex justify-between text-xs text-emerald-400">
              <span>Total Paid:</span>
              <span>- {document.currency} {document.payments.filter((p: any) => p.status === 'successful').reduce((acc: number, p: any) => acc + Number(p.amount), 0).toLocaleString()}</span>
            </div>
          )}

          {/* Credit Notes */}
          {document.creditNotes && document.creditNotes.filter((c: any) => c.status === 'issued').length > 0 && (
            <div className="w-72 flex justify-between text-xs text-emerald-400 font-semibold">
              <span>Credit Adjustments:</span>
              <span>- {document.currency} {document.creditNotes.filter((c: any) => c.status === 'issued').reduce((acc: number, c: any) => acc + Number(c.amount), 0).toLocaleString()}</span>
            </div>
          )}

          {/* Balance Due */}
          <div className="w-72 flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800 print:border-slate-200 print:text-slate-900">
            <span>Balance Due:</span>
            <span className={Number(document.balanceDue) > 0 ? 'text-red-400 print:text-slate-900' : 'text-emerald-400'}>
              {document.currency} {Number(document.balanceDue).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Payments ledger log (if any payments are logged) */}
        {document.payments && document.payments.filter((p: any) => p.status === 'successful').length > 0 && (
          <div className="mb-10 p-6 bg-zinc-900/20 border border-zinc-800/60 rounded-2xl print:hidden">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-3">Settlement History Log</h4>
            <div className="space-y-3 text-xs">
              {document.payments.filter((p: any) => p.status === 'successful').map((p: any) => (
                <div key={p.id} className="flex justify-between items-center text-zinc-400 border-b border-zinc-800/40 pb-2 last:border-b-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-zinc-200">Ref: {p.paymentNumber}</p>
                    <p className="text-[10px] text-zinc-500">{new Date(p.paymentDate).toLocaleDateString()} via {p.gatewayName.toUpperCase()}</p>
                  </div>
                  <span className="font-medium text-zinc-200">{document.currency} {Number(p.amount).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Unified Payment Gateway Selection Section */}
        <div className="mt-12 p-6 sm:p-8 bg-zinc-900/90 border border-zinc-800 rounded-3xl print:hidden shadow-2xl relative overflow-hidden">
          {isPaid ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-5 rounded-2xl">
              <CheckCircle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold">Billing Settled Successfully</p>
                <p className="text-xs text-emerald-400/80 mt-0.5">This invoice has been fully paid. A copy of the receipt has been emailed to your billing contact.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header & Gateway Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/80 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-extrabold text-white tracking-tight">Unified Payment Gateway</h3>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">Select your preferred payment channel to settle {document.currency} {Number(document.balanceDue).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold self-start sm:self-auto">
                  <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
                </div>
              </div>

              {/* Payment Categories Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'mobile', name: 'Mobile Money', icon: Smartphone, subtitle: 'M-Pesa, Airtel, Tigo' },
                  { id: 'bank', name: 'Bank Payment', icon: Building2, subtitle: 'Transfer & Wire' },
                  { id: 'card', name: 'Cards', icon: CreditCard, subtitle: 'Visa, MC, AMEX' },
                  { id: 'gateway', name: 'DPO Gateway', icon: ShieldCheck, subtitle: 'Mobile, cards & banks' }
                ].map((cat) => {
                  const IconComp = cat.icon;
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id as any);
                        if (cat.id === 'mobile') setSelectedMethod('m-pesa');
                        else if (cat.id === 'bank') setSelectedMethod('bank-transfer');
                        else if (cat.id === 'card') setSelectedMethod('visa');
                        else setSelectedMethod('dpo-gateway');
                      }}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        active
                          ? 'border-violet-500 bg-violet-600/10 text-white shadow-lg shadow-violet-500/10 ring-1 ring-violet-500/50'
                          : 'border-zinc-800/80 bg-zinc-950/40 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <IconComp className={`w-4 h-4 ${active ? 'text-violet-400' : 'text-zinc-500'}`} />
                        {active && <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${active ? 'text-white' : 'text-zinc-300'}`}>{cat.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{cat.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Specific Payment Method Channel Cards */}
              <div className="p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800 space-y-4">
                <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Available {selectedCategory === 'mobile' ? 'Mobile Money Operators' : selectedCategory === 'bank' ? 'Bank Channels' : selectedCategory === 'card' ? 'Accepted Card Networks' : 'Gateway Providers'}
                </h4>

                {/* Mobile Money Options */}
                {selectedCategory === 'mobile' && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'm-pesa', name: 'Vodacom M-Pesa', badge: 'Popular', color: 'border-red-500/30 text-red-400' },
                      { id: 'airtel-money', name: 'Airtel Money', badge: 'Instant', color: 'border-red-500/30 text-red-400' },
                      { id: 'mixx-by-yas', name: 'Mixx by Yas (Tigo Pesa)', badge: 'Instant', color: 'border-blue-500/30 text-blue-400' },
                      { id: 'halopesa', name: 'HaloPesa (Halotel)', badge: 'Fast', color: 'border-orange-500/30 text-orange-400' },
                      { id: 't-pesa', name: 'T-Pesa (TTCL)', badge: 'Supported', color: 'border-emerald-500/30 text-emerald-400' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedMethod(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedMethod === opt.id
                            ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span>{opt.name}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border bg-zinc-950 ${opt.color}`}>{opt.badge}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Bank Options */}
                {selectedCategory === 'bank' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      { id: 'bank-transfer', name: 'CRDB / NMB Direct Transfer', detail: 'Acc: 0150998822100' },
                      { id: 'internet-banking', name: 'Internet Banking / EFT', detail: 'Instant Electronic Transfer' },
                      { id: 'wire-transfer', name: 'SWIFT Direct Wire', detail: 'Code: CORUTZTZ' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedMethod(opt.id)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedMethod === opt.id
                            ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <p className="text-xs font-semibold">{opt.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{opt.detail}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Card Options */}
                {selectedCategory === 'card' && (
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'visa', name: 'Visa Credit & Debit', network: 'VISA' },
                      { id: 'mastercard', name: 'Mastercard', network: 'MASTERCARD' },
                      { id: 'american-express', name: 'American Express', network: 'AMEX' }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedMethod(opt.id)}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                          selectedMethod === opt.id
                            ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.name}</p>
                        <p className="text-[9px] text-zinc-500 uppercase mt-0.5 tracking-wider">{opt.network}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Digital Gateway Options */}
                {selectedCategory === 'gateway' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { id: 'dpo-gateway', name: 'DPO Group Gateway', desc: 'Pan-African Payment Engine' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSelectedMethod(opt.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedMethod === opt.id
                            ? 'border-violet-500 bg-violet-500/10 text-white font-bold'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        <p className="text-xs font-bold">{opt.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-1">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Inputs for Mobile Money phone or Bank Account instructions */}
                {selectedCategory === 'mobile' && (
                  <div className="pt-2 border-t border-zinc-800/60">
                    <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Payer Mobile Number (Optional for Push Prompt)</label>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +255 713 000 000"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                )}

                {selectedCategory === 'bank' && (
                  <div className="pt-2 border-t border-zinc-800/60 text-xs text-zinc-400 space-y-1">
                    <p className="font-semibold text-zinc-200">Bank Details for Direct Settlement:</p>
                    <p className="text-[11px]">Bank: CRDB Bank Tanzania | Account Name: Denis Chamkaga Enterprise</p>
                    <p className="text-[11px]">Account No: <span className="font-mono text-violet-400">0150998822100</span> | SWIFT: CORUTZTZ</p>
                    <p className="text-[10px] text-zinc-500">Reference: Invoice #{document.invoiceNumber}</p>
                  </div>
                )}
              </div>

              {/* Checkout Action Button */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="text-xs text-zinc-400">
                  <span>Selected Method: </span>
                  <span className="font-bold text-white uppercase">{selectedMethod.replace(/-/g, ' ')}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-violet-600/25 disabled:opacity-50 cursor-pointer"
                >
                  {checkoutLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Connecting to Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay {document.currency} {Number(document.balanceDue).toLocaleString()} via Gateway
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PublicInvoiceView;
