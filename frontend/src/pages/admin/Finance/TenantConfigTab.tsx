import React, { useState } from 'react';
import { Settings, CreditCard, Check } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { useToast } from '../../../components/atoms/Toast';

interface TenantConfigTabProps {
  tenant?: any;
}

export const TenantConfigTab: React.FC<TenantConfigTabProps> = ({ tenant }) => {
  const { toast } = useToast();
  const [currency, setCurrency] = useState(tenant?.currency || 'TZS');
  const [taxRate, setTaxRate] = useState(tenant?.taxRate || 18);
  const [companyName, setCompanyName] = useState(tenant?.companyName || 'Denis Chamkaga Enterprise');

  const handleSave = () => {
    toast.success('Finance Configuration & Tenant Settings Saved', 'Saved');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl font-body">
      <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b dark:border-zinc-800 pb-4">
          <div className="p-2.5 rounded-2xl bg-accent-violet/10 text-accent-violet">
            <Settings size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Finance ERP Configuration</h3>
            <p className="text-xs text-zinc-500">Configure default currencies, payment gateway tokens, and tax defaults</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Legal Entity Name</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Base Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            >
              <option value="TZS">TZS (Tanzanian Shilling)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="KES">KES (Kenyan Shilling)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Default Tax Rate (%)</label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Gateway Integration Status */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-850 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <CreditCard size={14} className="text-emerald-500" /> Connected Payment Providers
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">DPO Pay Group</div>
                <div className="text-[10px] text-zinc-400">M-Pesa, Airtel, Tigo, Visa, Mastercard</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500 text-white">Active</span>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-white">Direct Bank Transfer (CRDB)</div>
                <div className="text-[10px] text-zinc-400">Manual Verification / Swift</div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-200 dark:bg-zinc-800 text-zinc-400">Active</span>
            </div>
          </div>
        </div>

        <Button variant="primary" onClick={handleSave} leftIcon={<Check size={14} />}>
          Save Finance Configuration
        </Button>
      </div>
    </div>
  );
};
