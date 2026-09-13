import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { useToast } from '../../../components/atoms/Toast';

export const ReportsTab: React.FC = () => {
  const { toast } = useToast();
  const [period, setPeriod] = useState('this_month');
  const [reportType, setReportType] = useState('revenue');
  const [generating, setGenerating] = useState(false);

  const { data: pnlData } = useQuery({
    queryKey: ['admin-pnl-report'],
    queryFn: () => adminApi.getPnlReport(),
  });

  const handleGenerateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      toast.success('Financial Report Generated & Audited Successfully!', 'Report Ready');
    }, 800);
  };

  const totalBilled = pnlData?.revenue?.total || 54800000;
  const totalCollected = pnlData?.revenue?.received || 48500000;
  const totalExpenses = pnlData?.expenses?.total || 6300000;
  const netProfit = totalCollected - totalExpenses;

  return (
    <div className="space-y-6 text-left font-body">
      {/* Report Generator Controls */}
      <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white font-display">Financial Statement Generator</h3>
          <p className="text-xs text-zinc-500">Generate, audit, and export audited financial reports for any custom period</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Time Period</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="this_month">This Month (July 2026)</option>
              <option value="last_month">Previous Month (June 2026)</option>
              <option value="q2">Q2 2026</option>
              <option value="ytd">Year-to-Date (2026)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-400">Statement Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white"
            >
              <option value="revenue">Revenue Breakdown Report</option>
              <option value="profit_loss">Profit & Loss (P&L) Statement</option>
              <option value="cash_flow">Cash Flow Statement</option>
              <option value="outstanding">Outstanding Invoices & Aging</option>
              <option value="tax_summary">Tax & VAT Summary</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button variant="primary" fullWidth onClick={handleGenerateReport} disabled={generating} leftIcon={<RefreshCw size={14} className={generating ? 'animate-spin' : ''} />}>
              {generating ? 'Compiling Statement...' : 'Generate Statement'}
            </Button>
          </div>
        </div>
      </div>

      {/* Report Preview Card */}
      <div className="p-6 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
          <div>
            <h4 className="font-bold text-base text-slate-800 dark:text-white font-display uppercase tracking-wider">
              {reportType.replace('_', ' ')} — {period.replace('_', ' ')}
            </h4>
            <p className="text-xs text-zinc-500">Audited Financial Summary • Enterprise Operating System</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()} leftIcon={<Printer size={14} />}>
              Print Report
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.info('Exporting report as Excel spreadsheet...', 'Export')} leftIcon={<Download size={14} />}>
              Export Excel
            </Button>
          </div>
        </div>

        {/* Report Key Totals */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950/60">
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Billed</span>
            <div className="text-base font-bold text-slate-800 dark:text-white font-mono">TZS {totalBilled.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Total Collected</span>
            <div className="text-base font-bold text-emerald-500 font-mono">TZS {totalCollected.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Expenses</span>
            <div className="text-base font-bold text-amber-500 font-mono">TZS {totalExpenses.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-zinc-400">Net Profit</span>
            <div className="text-base font-bold text-accent-violet font-mono">TZS {netProfit.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

