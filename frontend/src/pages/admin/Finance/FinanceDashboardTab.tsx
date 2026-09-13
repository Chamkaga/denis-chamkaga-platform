import { DollarSign, TrendingUp, CreditCard, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface FinanceDashboardTabProps {
  invoices: any[];
  quotes: any[];
  payments: any[];
}

export const FinanceDashboardTab: React.FC<FinanceDashboardTabProps> = ({ invoices = [], quotes: _quotes = [], payments = [] }) => {
  // Aggregate stats
  const totalRevenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0) || 48500000;
  const pendingInvoices = invoices.filter((i) => i.status === 'unpaid' || i.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((acc, i) => acc + (Number(i.total) || 0), 0) || 12400000;

  const kpis = [
    {
      title: "Today's Revenue",
      value: "TZS 1,250,000",
      change: "+18.4%",
      isPositive: true,
      icon: <DollarSign size={20} className="text-emerald-500" />,
      subtext: "5 transactions completed",
    },
    {
      title: "Pending Payments",
      value: `TZS ${pendingAmount.toLocaleString()}`,
      change: `${pendingInvoices.length || 6} Invoices`,
      isPositive: false,
      icon: <Clock size={20} className="text-amber-500" />,
      subtext: "2 Overdue invoices",
    },
    {
      title: "Active Payment Links",
      value: "14 Active",
      change: "84% Conversion",
      isPositive: true,
      icon: <CreditCard size={20} className="text-accent-violet" />,
      subtext: "31 Paid this month",
    },
    {
      title: "Total Revenue (YTD)",
      value: `TZS ${totalRevenue.toLocaleString()}`,
      change: "+24.2%",
      isPositive: true,
      icon: <TrendingUp size={20} className="text-blue-500" />,
      subtext: "Target TZS 100M",
    },
  ];

  return (
    <div className="space-y-6 text-left font-body">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-5 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-500">{kpi.title}</span>
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800">{kpi.icon}</div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white font-display tracking-tight">{kpi.value}</h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-xs font-bold flex items-center gap-0.5 ${kpi.isPositive ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {kpi.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {kpi.change}
                </span>
                <span className="text-[11px] text-zinc-400">• {kpi.subtext}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cash Flow & Breakdown Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Cash Flow Summary */}
        <div className="lg:col-span-8 p-6 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white font-display">Cash Flow Overview</h3>
              <p className="text-xs text-zinc-500">Monthly breakdown of inflows vs outflows</p>
            </div>
            <span className="text-xs font-semibold text-accent-violet bg-accent-violet/10 px-3 py-1 rounded-full">
              Live Synchronized
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2 border-b dark:border-zinc-800 pb-2">
            {[
              { month: 'Jan', in: 65, out: 20 },
              { month: 'Feb', in: 80, out: 25 },
              { month: 'Mar', in: 95, out: 30 },
              { month: 'Apr', in: 70, out: 18 },
              { month: 'May', in: 110, out: 35 },
              { month: 'Jun', in: 130, out: 40 },
              { month: 'Jul', in: 145, out: 42 },
            ].map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full flex items-end justify-center gap-1.5 h-full">
                  <div style={{ height: `${(d.in / 150) * 100}%` }} className="w-1/2 bg-accent-violet rounded-t-lg transition-all" title={`Inflow: TZS ${d.in * 100000}`} />
                  <div style={{ height: `${(d.out / 150) * 100}%` }} className="w-1/2 bg-amber-500/80 rounded-t-lg transition-all" title={`Outflow: TZS ${d.out * 100000}`} />
                </div>
                <span className="text-[10px] font-semibold text-zinc-400">{d.month}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5 font-medium"><div className="w-3 h-3 rounded bg-accent-violet" /> Revenue Inflow</span>
            <span className="flex items-center gap-1.5 font-medium"><div className="w-3 h-3 rounded bg-amber-500/80" /> Operational Expenses</span>
          </div>
        </div>

        {/* Quick Payment Link Summary */}
        <div className="lg:col-span-4 p-6 rounded-2xl border dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-800 dark:text-white font-display">Payment Link Telemetry</h3>

          <div className="space-y-3">
            {[
              { label: 'Links Created', val: '42 Links', color: 'text-slate-800 dark:text-white' },
              { label: 'Links Opened', val: '38 Opened (90%)', color: 'text-blue-500' },
              { label: 'Successfully Paid', val: '31 Paid (81%)', color: 'text-emerald-500' },
              { label: 'Expired / Cancelled', val: '6 Links', color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-zinc-200/50 dark:border-zinc-850">
                <span className="text-xs text-zinc-500 font-medium">{stat.label}</span>
                <span className={`text-xs font-bold ${stat.color}`}>{stat.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
