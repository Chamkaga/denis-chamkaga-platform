import React, { useState } from 'react';
import {
  X, Building, Mail, Phone, CheckCircle2, FileText, Activity
} from 'lucide-react';

interface Customer360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
}

export const Customer360Drawer: React.FC<Customer360DrawerProps> = ({ isOpen, onClose, customer }) => {
  const [activeTab, setActiveTab] = useState<'journey' | 'timeline' | 'invoices' | 'notes'>('journey');

  if (!isOpen || !customer) return null;

  const journeySteps = [
    { label: 'Lead Captured', date: customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '2026-07-01', done: true },
    { label: 'Consultation Scheduled', date: '2026-07-05', done: true },
    { label: 'Quotation Sent', date: '2026-07-10', done: true },
    { label: 'Invoice Generated', date: '2026-07-15', done: true },
    { label: 'Payment Completed', date: '2026-07-18', done: true },
    { label: 'Project Started', date: '2026-07-20', done: true },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 space-y-6 overflow-y-auto text-left font-body">
          {/* Header */}
          <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-accent-violet/10 text-accent-violet flex items-center justify-center font-bold text-lg font-display">
                {(customer.firstName?.[0] || customer.name?.[0] || 'C').toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">
                  {customer.firstName ? `${customer.firstName} ${customer.lastName || ''}` : customer.name || 'Customer Profile'}
                </h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1.5 mt-0.5">
                  <Building size={12} /> {customer.organization?.name || customer.organizationName || 'Independent Account'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800">
              <X size={18} />
            </button>
          </div>

          {/* Quick Contact Info Strip */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-850 text-xs">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-zinc-400" />
              <span className="truncate text-slate-800 dark:text-zinc-300 font-medium">{customer.email || 'No email'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-zinc-400" />
              <span className="truncate text-slate-800 dark:text-zinc-300 font-medium">{customer.phone || 'No phone'}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b dark:border-zinc-800 pb-2">
            {[
              { id: 'journey', label: 'Customer Journey', icon: <CheckCircle2 size={13} /> },
              { id: 'timeline', label: 'Activity Feed', icon: <Activity size={13} /> },
              { id: 'invoices', label: 'Billing History', icon: <FileText size={13} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? 'bg-accent-violet text-white shadow-sm'
                    : 'text-zinc-400 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Journey */}
          {activeTab === 'journey' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lifecycle Progress</h4>
              <div className="relative pl-6 space-y-6 border-l-2 border-accent-violet/30 ml-2">
                {journeySteps.map((step, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-accent-violet text-white flex items-center justify-center text-[10px]">
                      <CheckCircle2 size={12} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-white">{step.label}</h5>
                      <span className="text-[10px] text-zinc-500 font-mono">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Activity Timeline */}
          {activeTab === 'timeline' && (
            <div className="space-y-3 text-xs">
              {[
                { title: 'Payment received for Invoice #INV-2026-015', time: 'Yesterday at 14:22', type: 'payment' },
                { title: 'Quotation #QT-2026-088 approved by client', time: '3 days ago', type: 'quote' },
                { title: 'Consultation call completed with Denis Chamkaga', time: '1 week ago', type: 'meeting' },
              ].map((act, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-850">
                  <div className="font-semibold text-slate-800 dark:text-white">{act.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-1">{act.time}</div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 3: Billing */}
          {activeTab === 'invoices' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-850 flex items-center justify-between">
                <div>
                  <div className="font-mono font-bold text-slate-800 dark:text-white">INV-2026-015</div>
                  <div className="text-[10px] text-zinc-400">Website Development Phase 1</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-500">TZS 850,000</div>
                  <span className="text-[10px] uppercase font-bold text-emerald-500">PAID</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
