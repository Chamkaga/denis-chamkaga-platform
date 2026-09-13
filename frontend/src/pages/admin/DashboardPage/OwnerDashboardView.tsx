import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  Bot,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Zap,
  Server,
  Database,
  Lock,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Globe,
  Briefcase,
  FileText,
  BookOpen,
  LayoutDashboard,
  Download,
  Calendar,
  BarChart3,
  Filter,
  Phone,
  PhoneIncoming,
  PhoneOff
} from 'lucide-react';
import { adminApi } from '../../../services/api';
import { cn } from '../../../lib/cn';
import { useCall } from '../../../context/CallContext';

// ── Period types ──────────────────────────────────────────────────────────────
type Period = '1M' | '3M' | '6M' | '1Y';
type ViewMode = 'daily' | 'monthly';

// ── Generate realistic demo data ──────────────────────────────────────────────
function generateData(period: Period, viewMode: ViewMode, anchorDate: Date) {
  const points: { label: string; revenue: number; leads: number; date: Date }[] = [];

  if (viewMode === 'daily') {
    // Show days in selected month
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const base = 3200;
    for (let d = 1; d <= daysInMonth; d++) {
      const noise = Math.sin(d * 1.3) * 800 + Math.random() * 600;
      points.push({
        label: d.toString(),
        revenue: Math.max(800, Math.round(base + noise)),
        leads: Math.max(1, Math.round(4 + Math.sin(d * 0.8) * 3 + Math.random() * 2)),
        date: new Date(year, month, d)
      });
    }
  } else {
    // Monthly view — how many months back
    const count = period === '1M' ? 1 : period === '3M' ? 3 : period === '6M' ? 6 : 12;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(anchorDate.getFullYear(), anchorDate.getMonth() - i, 1);
      const trend = ((count - i) / count);
      const base = 28000 + trend * 120000;
      const noise = Math.sin(i * 1.7) * 12000 + Math.random() * 8000;
      points.push({
        label: `${monthNames[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`,
        revenue: Math.max(12000, Math.round(base + noise)),
        leads: Math.max(8, Math.round(18 + trend * 60 + Math.random() * 20)),
        date: d
      });
    }
  }
  return points;
}

// ── Export CSV ────────────────────────────────────────────────────────────────
function downloadCSV(data: { label: string; revenue: number; leads: number }[], periodLabel: string) {
  const rows = ['Period,Revenue (USD),Leads', ...data.map(r => `${r.label},${r.revenue},${r.leads}`)];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `business-report-${periodLabel.replace(/\s/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────────────────────
export const OwnerDashboardView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const { activeCall, callState, duration, acceptCall, declineCall, hangupCall } = useCall();

  // Chart state
  const [period, setPeriod] = useState<Period>('1M');
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());

  useEffect(() => {
    adminApi.getDashboardStats()
      .then((data: any) => setStats(data))
      .catch(() => {});
  }, []);

  const chartData = useMemo(
    () => generateData(period, viewMode, anchorDate),
    [period, viewMode, anchorDate]
  );

  const maxRevenue = Math.max(...chartData.map(d => d.revenue));
  const maxLeads   = Math.max(...chartData.map(d => d.leads));

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalLeads   = chartData.reduce((s, d) => s + d.leads, 0);
  const avgRevenue   = Math.round(totalRevenue / chartData.length);

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const periodLabel = viewMode === 'daily'
    ? `${monthNames[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`
    : period === '1M' ? 'Last Month' : period === '3M' ? 'Last Quarter'
    : period === '6M' ? 'Last 6 Months' : 'Last 12 Months';

  const navigateMonth = (dir: number) => {
    const d = new Date(anchorDate);
    d.setMonth(d.getMonth() + dir);
    setAnchorDate(d);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">

      {/* ── Welcome Banner — softer, compact ─────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl px-5 py-4 border
        dark:bg-gradient-to-r dark:from-violet-900/70 dark:via-purple-900/60 dark:to-indigo-900/70
        dark:border-violet-700/25 dark:text-white
        bg-gradient-to-r from-violet-600/90 via-purple-600/90 to-indigo-700/90
        border-violet-500/30 text-white shadow-lg">

        {/* Subtle glow blobs */}
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-white/5 blur-3xl pointer-events-none -mr-10 -mt-10" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-white/15 text-white text-[9px] uppercase font-bold tracking-wider backdrop-blur-md flex items-center gap-1">
                <LayoutDashboard size={9} />
                Owner Clearance
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-200 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Enterprise OS Online
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold tracking-tight font-heading text-white leading-tight">
              Welcome back, Denis Chamkaga
            </h1>
            <p className="text-[11px] text-purple-200/80 max-w-lg leading-relaxed hidden sm:block">
              All business, CRM, AI, infrastructure telemetry, and security protocols are active.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 border border-white/15 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <a
              href="/admin/operations"
              className="px-3 py-2 rounded-xl bg-white text-violet-900 hover:bg-purple-50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Activity size={12} className="text-accent-violet" />
              <span>Platform OS</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── Live Customer Call Desk ───────────────────────────────────── */}
      <section className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm" aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-2.5 rounded-xl border',
              callState === 'ringing'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse'
                : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
            )}>
              <PhoneIncoming size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold dark:text-white text-zinc-900">Customer Call Desk</h2>
              <p className="text-[11px] text-zinc-500 mt-0.5">
                {activeCall
                  ? `${activeCall.callerName} • ${callState === 'ringing' ? 'Incoming call' : callState}${callState === 'connected' ? ` • ${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}` : ''}`
                  : 'No Mary-authorized customer call is waiting.'}
              </p>
            </div>
          </div>
          {activeCall && callState === 'ringing' && (
            <div className="flex gap-2">
              <button onClick={acceptCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold">
                <Phone size={13} /> Accept Call
              </button>
              <button onClick={declineCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
                <PhoneOff size={13} /> Decline
              </button>
            </div>
          )}
          {activeCall && callState === 'connected' && (
            <button onClick={hangupCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
              <PhoneOff size={13} /> End Call
            </button>
          )}
        </div>
      </section>

      {/* ── Owner CMS Quick-Access ──────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
        {[
          { label: 'Website CMS',   icon: Globe,     href: '/admin/content',   color: 'text-blue-500',   bg: 'bg-blue-500/8 hover:bg-blue-500/15 border-blue-500/20' },
          { label: 'Portfolio',     icon: Briefcase, href: '/admin/content',   color: 'text-purple-500', bg: 'bg-purple-500/8 hover:bg-purple-500/15 border-purple-500/20' },
          { label: 'Knowledge',     icon: BookOpen,  href: '/admin/knowledge', color: 'text-emerald-500',bg: 'bg-emerald-500/8 hover:bg-emerald-500/15 border-emerald-500/20' },
          { label: 'Blog CMS',      icon: FileText,  href: '/admin/content',   color: 'text-amber-500',  bg: 'bg-amber-500/8 hover:bg-amber-500/15 border-amber-500/20' },
          { label: 'CRM & Leads',   icon: Users,     href: '/admin/business',  color: 'text-cyan-500',   bg: 'bg-cyan-500/8 hover:bg-cyan-500/15 border-cyan-500/20' },
          { label: 'AI Platform',   icon: Bot,       href: '/admin/assistant', color: 'text-violet-500', bg: 'bg-violet-500/8 hover:bg-violet-500/15 border-violet-500/20' },
        ].map((mod) => (
          <a
            key={mod.href + mod.label}
            href={mod.href}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border transition-all cursor-pointer',
              mod.bg
            )}
          >
            <mod.icon size={18} className={mod.color} />
            <span className={cn('text-[9px] font-bold uppercase tracking-wide text-center leading-tight', mod.color)}>{mod.label}</span>
          </a>
        ))}
      </div>

      {/* ── Executive Revenue & Health Score Strip ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
        {[
          { label: "Today's Revenue", val: 'TZS 1,250,000', change: '+12%', sub: '5 Transactions' },
          { label: 'This Week', val: 'TZS 8,400,000', change: '+18%', sub: '24 Transactions' },
          { label: 'This Month', val: 'TZS 32,500,000', change: '+24%', sub: '81 Transactions' },
          { label: 'This Quarter (Q3)', val: 'TZS 85,000,000', change: '+30%', sub: '210 Transactions' },
          { label: 'This Year (2026)', val: 'TZS 210,000,000', change: '+45%', sub: 'Target TZS 300M' },
          { label: 'Business Health', val: '96 / 100', change: 'EXCELLENT', sub: '99.9% Uptime' },
        ].map((item, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{item.label}</span>
            <div className="text-sm font-extrabold text-slate-800 dark:text-white font-mono">{item.val}</div>
            <div className="flex items-center justify-between text-[10px] pt-1 border-t dark:border-zinc-800/60">
              <span className="font-semibold text-emerald-500">{item.change}</span>
              <span className="text-zinc-400">{item.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Total Pipeline</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><DollarSign size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-zinc-900 font-heading">
              ${stats?.revenue?.total ?? '128,450'}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-500">
              <TrendingUp size={11} /><span>+18.4% this month</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 font-mono">Conversion rate: 84%</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Hot Leads</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500"><Users size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-zinc-900 font-heading">
              {stats?.leads?.hot ?? '42'}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-blue-500">
              <ArrowUpRight size={11} /><span>{stats?.leads?.total ?? '184'} Total Leads</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 font-mono">Avg Lead Score: 92/100</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">AI Health</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500"><Bot size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-zinc-900 font-heading">99.9% SLA</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-purple-500">
              <Zap size={11} /><span>1,420 Requests / 24h</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 font-mono">Avg Latency: 340ms • $14.20</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">SOC Security</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><ShieldCheck size={16} /></div>
          </div>
          <div>
            <h3 className="text-xl font-extrabold dark:text-white text-zinc-900 font-heading">Secure</h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-500">
              <Lock size={11} /><span>0 Critical Threats</span>
            </div>
          </div>
          <p className="text-[9px] text-zinc-500 border-t border-zinc-100 dark:border-zinc-800 pt-2 font-mono">SIEM: 100% Index Coverage</p>
        </div>
      </div>

      {/* ── Main Chart + Status Grid ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Advanced Revenue & Leads Chart ──────────────────────────── */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">

          {/* Chart Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold dark:text-white text-zinc-900 flex items-center gap-2">
                <BarChart3 size={15} className="text-accent-violet" />
                Revenue & Lead Conversion
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">{periodLabel} · {viewMode === 'daily' ? 'Daily' : 'Monthly'} breakdown</p>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 gap-0.5">
                {(['daily', 'monthly'] as ViewMode[]).map(v => (
                  <button
                    key={v}
                    onClick={() => setViewMode(v)}
                    className={cn(
                      'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer',
                      viewMode === v
                        ? 'bg-accent-violet text-white shadow-sm'
                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                    )}
                  >
                    {v === 'daily' ? 'Daily' : 'Monthly'}
                  </button>
                ))}
              </div>

              {/* Period selector (only for monthly) */}
              {viewMode === 'monthly' && (
                <div className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 gap-0.5">
                  {(['1M','3M','6M','1Y'] as Period[]).map(p => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide transition-all cursor-pointer',
                        period === p
                          ? 'bg-accent-violet text-white shadow-sm'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}

              {/* Month navigator (daily view) */}
              {viewMode === 'daily' && (
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-1 py-0.5">
                  <button
                    onClick={() => navigateMonth(-1)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-all"
                  >
                    <ChevronLeft size={12} className="text-zinc-500 dark:text-zinc-400" />
                  </button>
                  <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300 px-1 whitespace-nowrap">
                    <Calendar size={10} className="inline mr-1 text-accent-violet" />
                    {monthNames[anchorDate.getMonth()].slice(0,3)} {anchorDate.getFullYear()}
                  </span>
                  <button
                    onClick={() => navigateMonth(1)}
                    disabled={anchorDate >= new Date()}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 cursor-pointer transition-all disabled:opacity-30"
                  >
                    <ChevronRight size={12} className="text-zinc-500 dark:text-zinc-400" />
                  </button>
                </div>
              )}

              {/* Export CSV */}
              <button
                onClick={() => downloadCSV(chartData, periodLabel)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:border-accent-violet hover:text-accent-violet transition-all cursor-pointer"
              >
                <Download size={11} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Summary KPIs */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total Revenue', value: `$${(totalRevenue / 1000).toFixed(1)}k`, color: 'text-emerald-500' },
              { label: 'Total Leads',   value: totalLeads.toString(),                   color: 'text-blue-500' },
              { label: 'Daily Avg',     value: `$${(avgRevenue / 1000).toFixed(1)}k`,   color: 'text-violet-500' },
            ].map(kpi => (
              <div key={kpi.label} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-wide">{kpi.label}</p>
                <p className={cn('text-base font-extrabold font-heading mt-0.5', kpi.color)}>{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Chart Canvas */}
          <div className="relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between pointer-events-none pr-1 py-1">
              {[100, 75, 50, 25, 0].map(pct => (
                <span key={pct} className="text-[8px] text-zinc-400 font-mono leading-none">
                  ${Math.round((maxRevenue * pct) / 100 / 1000)}k
                </span>
              ))}
            </div>

            <div className="ml-7 h-52 w-full flex items-end gap-px overflow-x-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 pb-6 relative border-b border-zinc-100 dark:border-zinc-800">
              {chartData.map((d, idx) => (
                <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-0.5 group h-full justify-end"
                  style={{ minWidth: viewMode === 'daily' ? '20px' : '36px' }}>

                  {/* Dual bar: Revenue (violet) + Leads (blue accent) */}
                  <div className="w-full flex items-end gap-px justify-center h-full">
                    {/* Revenue bar */}
                    <div
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                      className="flex-1 max-w-[10px] rounded-t-sm bg-gradient-to-t from-accent-violet to-violet-400 group-hover:brightness-125 transition-all relative"
                    >
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[8px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                        Rev: ${(d.revenue / 1000).toFixed(1)}k
                      </div>
                    </div>
                    {/* Leads bar */}
                    <div
                      style={{ height: `${(d.leads / maxLeads) * 100}%` }}
                      className="flex-1 max-w-[10px] rounded-t-sm bg-gradient-to-t from-blue-500 to-blue-300 opacity-60 group-hover:opacity-100 transition-all"
                    />
                  </div>

                  {/* X label */}
                  <span className="text-[8px] text-zinc-400 font-mono absolute bottom-0 truncate"
                    style={{ fontSize: '7px' }}>
                    {viewMode === 'daily' ? (idx % 5 === 0 || idx === chartData.length - 1 ? d.label : '') : d.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Legend + Link */}
          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2 rounded-sm bg-accent-violet" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 font-semibold">
                <span className="w-2.5 h-2 rounded-sm bg-blue-400 opacity-70" /> Leads
              </span>
            </div>
            <a href="/admin/analytics" className="text-accent-violet font-bold hover:underline flex items-center gap-1">
              <Filter size={10} /> Full Analytics
            </a>
          </div>
        </div>

        {/* ── Platform OS Status ───────────────────────────────────────── */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold dark:text-white text-zinc-900">Platform OS Status</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="space-y-2 text-xs">
              {[
                { icon: Server,   label: 'Backend Node.js API',    status: 'Healthy',    color: 'text-accent-violet' },
                { icon: Database, label: 'PostgreSQL Database',     status: 'Synced',     color: 'text-blue-500' },
                { icon: Bot,      label: 'AI Vector Store & RAG',   status: 'Active',     color: 'text-purple-500' },
              ].map(({ icon: Icon, label, status, color }) => (
                <div key={label} className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={13} className={color} />
                    <span className="font-semibold dark:text-zinc-200 text-zinc-700">{label}</span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-500 uppercase">{status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-400">Quick Commands</span>
            <div className="grid grid-cols-2 gap-2">
              <a href="/admin/operations"
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-accent-violet hover:bg-accent-violet/5 text-center text-[10px] font-semibold dark:text-zinc-300 text-zinc-600 transition-all">
                Trigger Backup
              </a>
              <a href="/admin/assistant"
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-accent-violet hover:bg-accent-violet/5 text-center text-[10px] font-semibold dark:text-zinc-300 text-zinc-600 transition-all">
                AI Command
              </a>
              <a href="/admin/business?tab=finance&sub=invoices"
                className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-accent-violet hover:bg-accent-violet/5 text-center text-[10px] font-semibold dark:text-zinc-300 text-zinc-600 transition-all col-span-2">
                View Invoices
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity Feed ─────────────────────────────────────── */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-accent-violet" />
            <h3 className="text-sm font-bold dark:text-white text-zinc-900">Recent Platform Activity</h3>
          </div>
          <a href="/admin/operations" className="text-[10px] font-bold text-accent-violet hover:underline">
            View SIEM Logs →
          </a>
        </div>

        <div className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
          {[
            { action: 'Owner Login Successful',               user: 'denis@denischamkaga.com',    time: '5m ago',  type: 'Security' },
            { action: 'Knowledge Base Vector Re-indexed',     user: 'System Automated Pipeline',  time: '42m ago', type: 'AI' },
            { action: 'New Quotation Generated (#QT-2026-092)',user: 'Sales Assistant Engine',     time: '2h ago',  type: 'Business' },
            { action: 'PostgreSQL Nightly Backup Verified',   user: 'Backup Scheduler',           time: '6h ago',  type: 'System' },
          ].map((act, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  act.type === 'Security' ? 'bg-emerald-500' :
                  act.type === 'AI'       ? 'bg-purple-500'  :
                  act.type === 'Business' ? 'bg-blue-500'    : 'bg-amber-500'
                )} />
                <div>
                  <p className="font-semibold dark:text-zinc-200 text-zinc-800">{act.action}</p>
                  <span className="text-[9px] text-zinc-500 font-mono">{act.user}</span>
                </div>
              </div>
              <span className="text-[9px] text-zinc-400 font-mono whitespace-nowrap ml-2">{act.time}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
