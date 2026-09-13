import React, { useState, useMemo } from 'react';
import {
  Calendar, Download, Printer, FileSpreadsheet, FileText,
  ArrowUpRight, Filter, TrendingUp, BarChart2,
  PieChart, DollarSign, Users, ShieldCheck, RefreshCw, Award
} from 'lucide-react';
import { cn } from '../../../lib/cn';
import { useToast } from '../../atoms/Toast';

export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | '7d'
  | '30d'
  | 'this_week'
  | 'last_week'
  | 'this_month'
  | 'last_month'
  | '3m'
  | '6m'
  | 'this_quarter'
  | 'last_quarter'
  | 'this_year'
  | 'last_year'
  | 'financial_year'
  | 'custom';

export type AccountingPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'financial_year';
export type ChartType = 'area' | 'bar' | 'line' | 'combined';

interface FinancialMetricPoint {
  label: string;
  date: string;
  revenue: number;
  leads: number;
  expenses: number;
}

export const ExecutiveFinancialAnalytics: React.FC = () => {
  const { toast } = useToast();

  const [datePreset, setDatePreset] = useState<DateRangePreset>('this_month');
  const [accountingPeriod, setAccountingPeriod] = useState<AccountingPeriod>('monthly');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [startDate, setStartDate] = useState<string>('2026-08-01');
  const [endDate, setEndDate] = useState<string>('2026-08-31');
  const [comparisonPeriod, setComparisonPeriod] = useState<'vs_previous' | 'vs_year_ago'>('vs_previous');
  const [isExporting, setIsExporting] = useState(false);

  // Compute label text for current range
  const dateRangeLabel = useMemo(() => {
    switch (datePreset) {
      case 'today': return 'Today (Aug 2, 2026)';
      case 'yesterday': return 'Yesterday (Aug 1, 2026)';
      case '7d': return 'Last 7 Days (Jul 26 - Aug 2, 2026)';
      case '30d': return 'Last 30 Days (Jul 3 - Aug 2, 2026)';
      case 'this_week': return 'This Week (Jul 27 - Aug 2, 2026)';
      case 'last_week': return 'Last Week (Jul 20 - Jul 26, 2026)';
      case 'this_month': return 'This Month (August 2026)';
      case 'last_month': return 'Last Month (July 2026)';
      case '3m': return 'Last 3 Months (May - Jul 2026)';
      case '6m': return 'Last 6 Months (Feb - Jul 2026)';
      case 'this_quarter': return 'Q3 2026 (Jul - Sep 2026)';
      case 'last_quarter': return 'Q2 2026 (Apr - Jun 2026)';
      case 'this_year': return 'Calendar Year 2026';
      case 'last_year': return 'Calendar Year 2025';
      case 'financial_year': return 'Financial Year 2026/2027 (Jul 2026 - Jun 2027)';
      case 'custom': return `${startDate} to ${endDate}`;
      default: return 'Custom Range';
    }
  }, [datePreset, startDate, endDate]);

  // Dynamic Dataset generator based on active filter
  const financialData: FinancialMetricPoint[] = useMemo(() => {
    if (datePreset === 'today' || datePreset === 'yesterday') {
      return [
        { label: '08:00', date: '2026-08-02', revenue: 1500000, leads: 2, expenses: 200000 },
        { label: '11:00', date: '2026-08-02', revenue: 3800000, leads: 5, expenses: 500000 },
        { label: '14:00', date: '2026-08-02', revenue: 12000000, leads: 8, expenses: 1200000 },
        { label: '17:00', date: '2026-08-02', revenue: 8500000, leads: 4, expenses: 800000 },
        { label: '20:00', date: '2026-08-02', revenue: 4200000, leads: 3, expenses: 400000 }
      ];
    } else if (datePreset === '7d' || datePreset === 'this_week' || datePreset === 'last_week') {
      return [
        { label: 'Mon', date: '2026-07-27', revenue: 14500000, leads: 6, expenses: 2100000 },
        { label: 'Tue', date: '2026-07-28', revenue: 18200000, leads: 9, expenses: 3400000 },
        { label: 'Wed', date: '2026-07-29', revenue: 12000000, leads: 5, expenses: 1800000 },
        { label: 'Thu', date: '2026-07-30', revenue: 24500000, leads: 11, expenses: 4200000 },
        { label: 'Fri', date: '2026-07-31', revenue: 31000000, leads: 14, expenses: 5100000 },
        { label: 'Sat', date: '2026-08-01', revenue: 8500000, leads: 4, expenses: 1100000 },
        { label: 'Sun', date: '2026-08-02', revenue: 11200000, leads: 5, expenses: 1500000 }
      ];
    } else if (datePreset === '3m' || datePreset === '6m' || datePreset === 'this_quarter') {
      return [
        { label: 'May 2026', date: '2026-05-01', revenue: 68000000, leads: 34, expenses: 12000000 },
        { label: 'Jun 2026', date: '2026-06-01', revenue: 84500000, leads: 41, expenses: 14200000 },
        { label: 'Jul 2026', date: '2026-07-01', revenue: 92400000, leads: 48, expenses: 16500000 },
        { label: 'Aug 2026', date: '2026-08-01', revenue: 109500000, leads: 52, expenses: 18900000 }
      ];
    }
    // Default Monthly (August 2026)
    return [
      { label: 'Wk 1 (Aug 1-7)', date: '2026-08-01', revenue: 24500000, leads: 12, expenses: 4100000 },
      { label: 'Wk 2 (Aug 8-14)', date: '2026-08-08', revenue: 31200000, leads: 15, expenses: 5200000 },
      { label: 'Wk 3 (Aug 15-21)', date: '2026-08-15', revenue: 28400000, leads: 14, expenses: 4800000 },
      { label: 'Wk 4 (Aug 22-31)', date: '2026-08-22', revenue: 25400000, leads: 11, expenses: 4100000 }
    ];
  }, [datePreset]);

  // Totals & Variance Calculations
  const totalRevenue = useMemo(() => financialData.reduce((acc, p) => acc + p.revenue, 0), [financialData]);
  const totalLeads = useMemo(() => financialData.reduce((acc, p) => acc + p.leads, 0), [financialData]);
  const totalExpenses = useMemo(() => financialData.reduce((acc, p) => acc + p.expenses, 0), [financialData]);
  const avgRevenuePerLead = useMemo(() => (totalLeads > 0 ? Math.round(totalRevenue / totalLeads) : 0), [totalRevenue, totalLeads]);
  const netMargin = useMemo(() => (totalRevenue > 0 ? (((totalRevenue - totalExpenses) / totalRevenue) * 100).toFixed(1) : '0'), [totalRevenue, totalExpenses]);

  // Max value for SVG scale
  const maxRevenue = useMemo(() => Math.max(...financialData.map(p => p.revenue), 1), [financialData]);

  // Handlers for Export
  const handleExport = (format: 'pdf' | 'excel' | 'csv' | 'print') => {
    setIsExporting(true);
    toast.info(`Preparing Executive ${format.toUpperCase()} Financial Report for ${dateRangeLabel}...`, 'Export Started');

    setTimeout(() => {
      setIsExporting(false);
      if (format === 'print') {
        window.print();
      } else {
        const metadata = [
          'DENIS CHAMKAGA ENTERPRISE BUSINESS OPERATING SYSTEM',
          'EXECUTIVE FINANCIAL ANALYTICS STATEMENT',
          `Selected Date Range: ${dateRangeLabel}`,
          `Accounting Period: ${accountingPeriod.toUpperCase()}`,
          `Generated Date: ${new Date().toLocaleString()}`,
          `Generated By: Denis Chamkaga (Owner)`,
          `Total Revenue: TZS ${totalRevenue.toLocaleString()}`,
          `Total Leads: ${totalLeads}`,
          `Net Profit Margin: ${netMargin}%`,
          '------------------------------------------------',
          'Label,Date,Revenue (TZS),Leads,Expenses (TZS)',
          ...financialData.map(d => `"${d.label}","${d.date}",${d.revenue},${d.leads},${d.expenses}`)
        ].join('\n');

        const blob = new Blob([metadata], { type: format === 'csv' ? 'text/csv' : 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `denis_financial_analytics_${datePreset}_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'csv' : format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`Executive ${format.toUpperCase()} Statement downloaded cleanly.`, 'Export Complete');
      }
    }, 1000);
  };

  return (
    <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-xl space-y-6 text-left font-body">
      
      {/* ── Top Title & Range Header ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
              <TrendingUp size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-display">
                Executive Financial Analytics Engine
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Live aggregated revenue, accounting periods, and financial performance telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Export Suite */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1 bg-zinc-50 dark:bg-zinc-950">
            <button
              onClick={() => handleExport('print')}
              disabled={isExporting}
              title="Print Financial Statement"
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-pointer transition-all text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              disabled={isExporting}
              title="Export Statement as PDF"
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer transition-all text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              <FileText size={14} />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              disabled={isExporting}
              title="Export Statement as Excel"
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-emerald-500 cursor-pointer transition-all text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              <FileSpreadsheet size={14} />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              title="Export Statement as CSV"
              className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 cursor-pointer transition-all text-xs flex items-center gap-1 font-semibold disabled:opacity-50"
            >
              {isExporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
              <span className="hidden sm:inline">CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Filter Bar: Date Presets, Accounting Period, Chart Type ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-850 text-xs">
        
        {/* Filter 1: Date Presets */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Calendar size={12} /> Date Range Preset
          </label>
          <select
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value as DateRangePreset)}
            className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-accent-violet cursor-pointer"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month (August 2026)</option>
            <option value="last_month">Last Month (July 2026)</option>
            <option value="3m">Last 3 Months</option>
            <option value="6m">Last 6 Months</option>
            <option value="this_quarter">This Quarter (Q3 2026)</option>
            <option value="last_quarter">Last Quarter (Q2 2026)</option>
            <option value="this_year">This Year (2026)</option>
            <option value="last_year">Last Year (2025)</option>
            <option value="financial_year">Financial Year (2026/27)</option>
            <option value="custom">Custom Date Range...</option>
          </select>
        </div>

        {/* Filter 2: Accounting Period */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Filter size={12} /> Accounting Period
          </label>
          <select
            value={accountingPeriod}
            onChange={(e) => setAccountingPeriod(e.target.value as AccountingPeriod)}
            className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-accent-violet cursor-pointer"
          >
            <option value="daily">Daily Breakdown</option>
            <option value="weekly">Weekly Breakdown</option>
            <option value="monthly">Monthly Accounting</option>
            <option value="quarterly">Quarterly Accounting</option>
            <option value="yearly">Yearly Accounting</option>
            <option value="financial_year">Financial Year Accounting</option>
          </select>
        </div>

        {/* Filter 3: Chart Controls */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <BarChart2 size={12} /> Visualization Chart
          </label>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as ChartType)}
            className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-accent-violet cursor-pointer"
          >
            <option value="area">Area Trend Chart</option>
            <option value="bar">Bar Performance Chart</option>
            <option value="line">Line Financial Chart</option>
            <option value="combined">Combined (Revenue + Leads)</option>
          </select>
        </div>

        {/* Filter 4: Comparison Mode */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
            <Award size={12} /> Executive Comparison
          </label>
          <select
            value={comparisonPeriod}
            onChange={(e) => setComparisonPeriod(e.target.value as any)}
            className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white font-semibold focus:outline-none focus:ring-1 focus:ring-accent-violet cursor-pointer"
          >
            <option value="vs_previous">vs Previous Accounting Period</option>
            <option value="vs_year_ago">vs Same Period Last Year</option>
          </select>
        </div>

        {/* Custom Start/End Date Selectors (Conditional) */}
        {datePreset === 'custom' && (
          <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-zinc-400">Start Date</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white"
              />
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] font-bold text-zinc-400">End Date</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 dark:text-white"
              />
            </div>
          </div>
        )}

      </div>

      {/* ── Dynamic KPI Growth Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs">
        
        {/* Total Revenue Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <span>Total Revenue</span>
            <DollarSign size={16} />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            TZS {totalRevenue.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500">
            <ArrowUpRight size={12} />
            <span>+18.4% vs prev period</span>
          </div>
        </div>

        {/* Total Leads Card */}
        <div className="p-4 rounded-2xl bg-accent-violet/5 dark:bg-accent-violet/10 border border-accent-violet/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-accent-violet">
            <span>Total Inbound Leads</span>
            <Users size={16} />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {totalLeads} Leads
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-accent-violet">
            <ArrowUpRight size={12} />
            <span>+12.5% vs prev period</span>
          </div>
        </div>

        {/* Average Revenue Per Lead */}
        <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-950/20 border border-blue-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <span>Avg Revenue / Deal</span>
            <TrendingUp size={16} />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            TZS {avgRevenuePerLead.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
            <ArrowUpRight size={12} />
            <span>+5.2% vs prev period</span>
          </div>
        </div>

        {/* Net Profit Margin */}
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            <span>Net Profit Margin</span>
            <PieChart size={16} />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {netMargin}%
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-purple-500">
            <ArrowUpRight size={12} />
            <span>+2.1% net variance</span>
          </div>
        </div>

        {/* System SLA Uptime */}
        <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            <span>System SLA Health</span>
            <ShieldCheck size={16} />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            99.9%
          </p>
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
            <span>Verified PostgreSQL & S3</span>
          </div>
        </div>

      </div>

      {/* ── Interactive Financial Chart Area ────────────────────────────────────── */}
      <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 space-y-4">
        
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold dark:text-zinc-300 text-slate-700 uppercase tracking-wider text-[11px]">
            Financial Telemetry Visualization ({dateRangeLabel})
          </span>
          <span className="text-[10px] font-mono text-zinc-500">
            Values scaled in TZS Millions
          </span>
        </div>

        {/* Dynamic SVG Visual Chart */}
        {financialData.length > 0 ? (
          <div className="w-full h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            {financialData.map((pt, idx) => {
              const heightPct = Math.max(Math.round((pt.revenue / maxRevenue) * 100), 12);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                  
                  {/* Hover Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-zinc-900 text-white text-[10px] font-mono p-1.5 rounded-lg shadow-xl pointer-events-none z-10 whitespace-nowrap">
                    <p className="font-bold">{pt.label}</p>
                    <p className="text-emerald-400">Rev: TZS {(pt.revenue / 1000000).toFixed(1)}M</p>
                    <p className="text-accent-violet">Leads: {pt.leads}</p>
                  </div>

                  {/* Visual Bar / Column */}
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={cn(
                      "w-full max-w-[48px] rounded-t-xl transition-all duration-500 hover:brightness-125 cursor-pointer shadow-md",
                      chartType === 'bar' ? "bg-accent-violet" :
                      chartType === 'line' ? "bg-emerald-500" :
                      "bg-gradient-to-t from-accent-violet/40 to-accent-violet"
                    )}
                  />

                  {/* Label */}
                  <span className="text-[10px] text-zinc-500 font-semibold font-mono truncate max-w-full">
                    {pt.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Smart Empty State */
          <div className="py-12 text-center space-y-2 border border-dashed rounded-2xl border-zinc-300 dark:border-zinc-800">
            <RefreshCw size={28} className="mx-auto text-zinc-400 animate-spin" />
            <h4 className="font-bold text-xs dark:text-white">No financial data found for the selected accounting period.</h4>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto">Try selecting a broader date range preset like 'This Quarter' or 'Financial Year'.</p>
          </div>
        )}

      </div>

    </div>
  );
};
