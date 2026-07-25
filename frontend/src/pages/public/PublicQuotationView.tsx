// src/pages/public/PublicQuotationView.tsx
// Premium, print-friendly public viewer page for Quotations.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { publicDocsApi } from '../../services/api';
import { Check, AlertCircle, RefreshCw, Printer, Download, X } from 'lucide-react';

export const PublicQuotationView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Modals status
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Form parameters
  const [responderName, setResponderName] = useState('');
  const [responderEmail, setResponderEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleAction = async (type: 'accepted' | 'rejected' | 'revision_requested', notesText: string) => {
    if (!token) return;
    try {
      setActionLoading(true);
      await publicDocsApi.submitPublicResponse(token, {
        responseType: type,
        notes: notesText,
        responderName: responderName || undefined,
        responderEmail: responderEmail || undefined
      });
      setShowApproveModal(false);
      setShowRevisionModal(false);
      // Refresh details
      await fetchDoc();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Failed to submit response.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white font-body">
        <RefreshCw className="w-8 h-8 text-violet-500 animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading secure proposal details...</p>
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

      {/* Main Quotation Sheet */}
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
            <span className="text-xs uppercase tracking-widest font-bold text-violet-500 print:text-slate-800">Quotation Proposal</span>
            <h2 className="text-xl font-bold text-zinc-200 mt-1 print:text-slate-800">#{document.quotationNumber}-V{document.version}</h2>
            <p className="text-[11px] text-zinc-500 mt-2 print:text-slate-500">Issued: {new Date(document.createdAt).toLocaleDateString()}</p>
            <p className="text-[11px] text-zinc-500 print:text-slate-500">Valid Until: {new Date(document.validUntil).toLocaleDateString()}</p>
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
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3 print:text-slate-400">Summary</h3>
            <p className="text-xs text-zinc-400 print:text-slate-500">Status: <span className="font-bold uppercase text-violet-400 print:text-slate-800">{document.status}</span></p>
            <p className="text-xs text-zinc-400 mt-1 print:text-slate-500">Project Type: <span className="font-semibold text-zinc-200 print:text-slate-700">{document.title}</span></p>
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
          <div className="w-72 flex justify-between text-sm font-bold text-white pt-2 border-t border-zinc-800 print:border-slate-200 print:text-slate-900">
            <span>Grand Total:</span>
            <span>{document.currency} {Number(document.total).toLocaleString()}</span>
          </div>
        </div>

        {/* Terms & Notes */}
        <div className="space-y-4 mb-10 text-[11px] text-zinc-500 print:text-slate-500">
          <div>
            <h4 className="font-bold text-zinc-400 uppercase tracking-wider print:text-slate-800">Terms & Instructions</h4>
            <p className="mt-1 leading-relaxed">{document.terms || 'This quotation remains valid until the date listed above. Development begins upon formal signature approval.'}</p>
          </div>
          {document.notes && (
            <div>
              <h4 className="font-bold text-zinc-400 uppercase tracking-wider print:text-slate-800">Client Notes</h4>
              <p className="mt-1 leading-relaxed">{document.notes}</p>
            </div>
          )}
        </div>

        {/* Response / Action Section */}
        <div className="mt-12 bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl print:hidden">
          {document.status === 'approved' ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl">
              <Check className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Proposal Accepted & Signed</p>
                <p className="text-[10px] text-emerald-400/80 mt-0.5">Approved on {document.approvedAt ? new Date(document.approvedAt).toLocaleDateString() : 'N/A'}. Project creation and initial invoicing have been scheduled.</p>
              </div>
            </div>
          ) : document.status === 'rejected' ? (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
              <X className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold">Proposal Rejected</p>
                <p className="text-[10px] text-red-400/80 mt-0.5">This quotation version has been flagged as declined. Please contact Denis to request a new revision.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-white">Review Decisions</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Accept the quotation terms to spawn project scheduling, decline, or request corrections.</p>
              </div>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowRevisionModal(true)}
                  className="flex-1 sm:flex-initial text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2.5 rounded-xl transition-all"
                >
                  Request Revision
                </button>
                <button
                  onClick={() => handleAction('rejected', 'Declined via secure public viewer.')}
                  className="flex-1 sm:flex-initial text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl transition-all"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="flex-1 sm:flex-initial text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20"
                >
                  Accept & Sign
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* APPROVAL MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button 
              onClick={() => setShowApproveModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white mb-2">Accept & Sign Proposal</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Accepting this quotation triggers project scheduling and generates the corresponding billing invoice.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAction('accepted', notes); }} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Your Name</label>
                <input 
                  type="text" 
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-500"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Your Email</label>
                <input 
                  type="email" 
                  value={responderEmail}
                  onChange={(e) => setResponderEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-500"
                  placeholder="e.g. john@company.com"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Approval Notes (Optional)</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Signature remarks..."
                  rows={3}
                />
              </div>
              
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white p-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Signing Proposal...' : 'Sign & Submit Approval'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* REVISION REQUEST MODAL */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in print:hidden">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md relative">
            <button 
              onClick={() => setShowRevisionModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-sm font-bold text-white mb-2">Request Revision Corrections</h3>
            <p className="text-[11px] text-zinc-400 mb-4">Detail the changes or corrections you would like made to this quotation. Denis will be notified.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAction('revision_requested', notes); }} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Your Name</label>
                <input 
                  type="text" 
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-500"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider block">Correction Details</label>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-white focus:outline-none focus:border-violet-500"
                  placeholder="Please update item 2 quantity to..."
                  rows={4}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-zinc-850 hover:bg-zinc-800 text-zinc-200 p-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Submitting Details...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PublicQuotationView;
