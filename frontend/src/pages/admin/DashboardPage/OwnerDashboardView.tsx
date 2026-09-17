import React, { useEffect, useMemo, useState } from 'react';
import { Activity, BarChart3, Bot, Briefcase, BookOpen, Database, FileText, Globe, LayoutDashboard, LineChart, MessageSquare, Phone, PhoneIncoming, PhoneOff, PieChart, Printer, RefreshCw, ShieldCheck, Users } from 'lucide-react';
import { adminApi } from '../../../services/api';
import { cn } from '../../../lib/cn';
import { useCall } from '../../../context/CallContext';

const number = (value: unknown) => typeof value === 'number' ? value.toLocaleString() : '—';
const money = (value: unknown) => typeof value === 'number' ? `TZS ${value.toLocaleString()}` : '—';
const formatDate = (value: unknown) => typeof value === 'string' || value instanceof Date
  ? new Date(value).toLocaleString()
  : '—';

interface DashboardStats {
  finance?: { totalInvoiced?: number };
  leads?: { total?: number; hot?: number };
  projects?: { total?: number; inProgress?: number };
  appointments?: { total?: number };
  messages?: { total?: number };
  chat?: { total?: number };
  pendingRequests?: number;
  recent?: { leads?: any[]; messages?: any[] };
  health?: { api?: string; database?: string; ai?: string; dbResponseTimeMs?: number };
}

type ReportPeriod = 'today' | 'yesterday' | 'this_week' | 'last_7_days' | 'this_month' | 'quarter' | 'half_year' | 'year' | 'custom';
type ChartType = 'bar' | 'line' | 'pie';

function reportRange(period: ReportPeriod, customFrom: string, customTo: string) {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  let from = new Date(start); let to = new Date(now.getTime() + 1);
  if (period === 'yesterday') { from.setDate(from.getDate() - 1); to = new Date(start); }
  if (period === 'this_week') from.setDate(from.getDate() - ((from.getDay() + 6) % 7));
  if (period === 'last_7_days') from.setDate(from.getDate() - 6);
  if (period === 'this_month') from.setDate(1);
  if (period === 'quarter') { from.setMonth(Math.floor(from.getMonth() / 3) * 3, 1); }
  if (period === 'half_year') { from.setMonth(from.getMonth() < 6 ? 0 : 6, 1); }
  if (period === 'year') { from.setMonth(0, 1); }
  if (period === 'custom' && customFrom && customTo) { from = new Date(`${customFrom}T00:00:00`); to = new Date(`${customTo}T23:59:59.999`); }
  return { from: from.toISOString(), to: to.toISOString() };
}

export const OwnerDashboardView: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState(false);
  const [period, setPeriod] = useState<ReportPeriod>('this_month');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { activeCall, callState, duration, acceptCall, declineCall, hangupCall } = useCall();
  const loadStats = () => {
    setError(false);
    const range = reportRange(period, customFrom, customTo);
    adminApi.getDashboardStats(range).then((data: DashboardStats) => setStats(data)).catch(() => setError(true));
  };
  useEffect(loadStats, [period, customFrom, customTo]);

  const chart = useMemo(() => [
    { label: 'Leads', value: stats?.leads?.total ?? 0, color: 'bg-blue-500' },
    { label: 'Projects', value: stats?.projects?.total ?? 0, color: 'bg-violet-500' },
    { label: 'Appointments', value: stats?.appointments?.total ?? 0, color: 'bg-amber-500' },
    { label: 'Messages', value: stats?.messages?.total ?? 0, color: 'bg-emerald-500' },
    { label: 'Mary chats', value: stats?.chat?.total ?? 0, color: 'bg-fuchsia-500' },
  ], [stats]);
  const chartMax = Math.max(1, ...chart.map(item => item.value));
  const recent = useMemo(() => [
    ...(stats?.recent?.leads ?? []).map((item: any) => ({ id: `lead-${item.id}`, title: `Lead: ${item.name}`, detail: item.email || item.source || 'No contact detail', date: item.createdAt })),
    ...(stats?.recent?.messages ?? []).map((item: any) => ({ id: `message-${item.id}`, title: `Message: ${item.subject || 'No subject'}`, detail: item.name || item.email || 'Unknown sender', date: item.createdAt })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8), [stats]);
  const modules = [
    { label: 'Website CMS', icon: Globe, href: '/admin/content' }, { label: 'Portfolio', icon: Briefcase, href: '/admin/content' },
    { label: 'Knowledge', icon: BookOpen, href: '/admin/knowledge' }, { label: 'Blog CMS', icon: FileText, href: '/admin/content' },
    { label: 'CRM & Leads', icon: Users, href: '/admin/business' }, { label: 'Mary', icon: Bot, href: '/admin/assistant' },
  ];

  return <div className="space-y-5 animate-fade-in pb-12" data-testid="owner-dashboard">
    <style>{`@media print { body { background:#fff !important; color:#0f172a !important; } [data-testid="owner-dashboard"] { padding:0 !important; } [data-print-hide="true"] { display:none !important; } [data-print-only="true"] { display:block !important; } section, article { break-inside:avoid; box-shadow:none !important; } }`}</style>
    <div data-print-only="true" className="hidden border-b-4 border-violet-600 pb-4 mb-5">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold">DC</div><div><h1 className="text-xl font-bold text-slate-900">Denis Chamkaga Business Platform</h1><p className="text-xs text-slate-500">Owner Business Performance Report</p></div></div><div className="text-right text-xs text-slate-500"><p>Generated {new Date().toLocaleString()}</p><p>Period: {period.replaceAll('_', ' ')}</p></div></div>
    </div>
    <header data-print-hide="true" className="rounded-2xl px-5 py-4 border bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-700 border-violet-500/30 text-white shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 text-[9px] uppercase font-bold tracking-wider"><LayoutDashboard size={9}/> Owner Dashboard</span>
        <h1 className="mt-1 text-lg sm:text-xl font-extrabold">Welcome back, Denis Chamkaga</h1><p className="text-[11px] text-purple-100">Live business information from the platform database.</p>
      </div><div className="flex gap-2"><button onClick={() => window.print()} className="self-start sm:self-auto px-3 py-2 rounded-xl bg-white text-violet-800 text-xs font-semibold flex items-center gap-1.5"><Printer size={12}/> Print report</button><button onClick={loadStats} className="self-start sm:self-auto px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 border border-white/15"><RefreshCw size={12}/> Refresh</button></div></div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700">Dashboard data could not be loaded. Retry to check the current platform state.</div>}

    <section data-print-hide="true" className="print:hidden flex flex-wrap items-end gap-3 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-4">
      <label className="text-[10px] font-bold uppercase text-zinc-500">Report period<select value={period} onChange={e => setPeriod(e.target.value as ReportPeriod)} className="mt-1 block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs normal-case dark:text-white"><option value="today">Today</option><option value="yesterday">Yesterday</option><option value="this_week">This week</option><option value="last_7_days">Last 7 days</option><option value="this_month">This month</option><option value="quarter">Current quarter (Q1–Q4)</option><option value="half_year">Current half year (H1/H2)</option><option value="year">Financial year</option><option value="custom">Custom dates</option></select></label>
      {period === 'custom' && <><label className="text-[10px] font-bold uppercase text-zinc-500">From<input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)} className="mt-1 block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs dark:text-white"/></label><label className="text-[10px] font-bold uppercase text-zinc-500">To<input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)} className="mt-1 block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent px-3 py-2 text-xs dark:text-white"/></label></>}
      <p className="ml-auto text-[10px] text-zinc-500">Period filters use recorded database timestamps.</p>
    </section>

    <section data-print-hide="true" className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm" aria-live="polite"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3"><div className={cn('p-2.5 rounded-xl border', callState === 'ringing' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400')}><PhoneIncoming size={18}/></div><div><h2 className="text-sm font-bold dark:text-white">Customer Call Desk</h2><p className="text-[11px] text-zinc-500 mt-0.5">{activeCall ? `${activeCall.callerName} • ${callState}${callState === 'connected' ? ` • ${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}` : ''}` : 'No Mary-authorized customer call is waiting.'}</p></div></div>
      {activeCall && callState === 'ringing' && <div className="flex gap-2"><button onClick={acceptCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold"><Phone size={13}/> Accept</button><button onClick={declineCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"><PhoneOff size={13}/> Decline</button></div>}
      {activeCall && callState === 'connected' && <button onClick={hangupCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold"><PhoneOff size={13}/> End Call</button>}
    </div></section>

    <nav data-print-hide="true" className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">{modules.map(mod => <a key={mod.label} href={mod.href} className="flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-violet-400 transition-colors"><mod.icon size={18} className="text-violet-500"/><span className="text-[9px] font-bold uppercase text-center">{mod.label}</span></a>)}</nav>

    <section aria-labelledby="owner-kpi-heading">
      <div className="mb-3"><h2 id="owner-kpi-heading" className="text-sm font-bold dark:text-white">Business snapshot</h2><p className="text-[10px] text-zinc-500">Verified totals from CRM, Finance and Projects. A dash means the source has not returned a value.</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[
      ['Paid invoice revenue', money(stats?.finance?.totalInvoiced), 'Verified paid invoices'], ['Hot leads', number(stats?.leads?.hot), `${number(stats?.leads?.total)} total leads`],
      ['Open requests', number(stats?.pendingRequests), 'Unread, pending and new'], ['Active projects', number(stats?.projects?.inProgress), `${number(stats?.projects?.total)} total projects`],
    ].map(([label, value, detail]) => <article key={label} className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{label}</p><p className="mt-3 text-xl font-extrabold dark:text-white">{value}</p><p className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-500">{detail}</p></article>)}</div>
    </section>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5"><section className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h3 className="text-sm font-bold dark:text-white flex items-center gap-2"><Activity size={15} className="text-violet-500"/> Business volumes for selected period</h3><p className="text-[10px] text-zinc-500 mt-1">One verified dataset, displayed as bar, line or share chart.</p></div><div className="print:hidden flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-1">{([['bar',BarChart3],['line',LineChart],['pie',PieChart]] as const).map(([type,Icon]) => <button key={type} onClick={() => setChartType(type)} aria-label={`${type} chart`} className={cn('p-1.5 rounded', chartType === type ? 'bg-violet-600 text-white' : 'text-zinc-500')}><Icon size={13}/></button>)}</div></div>
      {chartType === 'bar' && <div className="mt-5 space-y-4">{chart.map(item => <div key={item.label}><div className="mb-1 flex justify-between text-xs"><span className="text-zinc-600 dark:text-zinc-300">{item.label}</span><strong className="dark:text-white">{number(item.value)}</strong></div><div className="h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden" role="meter" aria-label={item.label} aria-valuenow={item.value} aria-valuemin={0} aria-valuemax={chartMax}><div className={cn('h-full rounded-full', item.color)} style={{width: `${item.value ? Math.max(4, item.value / chartMax * 100) : 0}%`}}/></div></div>)}</div>}
      {chartType === 'line' && <div className="mt-5"><svg viewBox="0 0 500 180" role="img" aria-label="Selected period business volume line chart" className="w-full h-44"><polyline fill="none" stroke="currentColor" strokeWidth="3" className="text-violet-500" points={chart.map((item, index) => `${20 + index * 115},${160 - item.value / chartMax * 130}`).join(' ')}/>{chart.map((item,index) => <g key={item.label}><circle cx={20 + index * 115} cy={160 - item.value / chartMax * 130} r="5" fill="currentColor" className="text-violet-500"/><text x={20 + index * 115} y="176" textAnchor="middle" fontSize="10" fill="currentColor">{item.label}</text></g>)}</svg></div>}
      {chartType === 'pie' && <div className="mt-5 flex flex-col sm:flex-row items-center gap-6"><div className="w-40 h-40 rounded-full" style={{background: `conic-gradient(var(--color-accent-violet) 0 ${chart[0].value / Math.max(1, chart.reduce((s,i)=>s+i.value,0))*100}%, #3b82f6 0 55%, #f59e0b 0 72%, #10b981 0 88%, #d946ef 0 100%)`}}/><div className="grid gap-2">{chart.map(item => <div key={item.label} className="text-xs flex gap-3 justify-between"><span>{item.label}</span><strong>{number(item.value)}</strong></div>)}</div></div>}
    </section><section className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <h3 className="text-sm font-bold dark:text-white flex items-center gap-2"><ShieldCheck size={15} className="text-emerald-500"/> Platform status</h3><div className="mt-4 space-y-3">{[
        ['API', stats?.health?.api, Activity], ['Database', stats?.health?.database, Database], ['OpenAI', stats?.health?.ai, Bot],
      ].map(([label, status, Icon]: any) => <div key={label} className="flex items-center justify-between rounded-xl border border-zinc-100 dark:border-zinc-800 p-3"><span className="flex items-center gap-2 text-xs dark:text-zinc-200"><Icon size={14}/>{label}</span><span className={cn('text-[10px] font-bold uppercase', status === 'healthy' ? 'text-emerald-500' : status ? 'text-rose-500' : 'text-zinc-400')}>{status || 'Unavailable'}</span></div>)}</div>
      {typeof stats?.health?.dbResponseTimeMs === 'number' && <p className="mt-3 text-[10px] text-zinc-500">Database response: {stats.health.dbResponseTimeMs} ms</p>}
    </section></div>

    <section className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm"><h3 className="text-sm font-bold dark:text-white flex items-center gap-2"><MessageSquare size={15} className="text-blue-500"/> Recent platform activity</h3><p className="mt-1 text-[10px] text-zinc-500">Newest CRM leads and customer messages, ordered by recorded time.</p><div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800">{recent.length ? recent.map((item: any) => <div key={item.id} className="py-3 flex justify-between gap-4"><div><span className="inline-block mb-1 rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[8px] font-bold uppercase text-zinc-500">{item.id.startsWith('lead-') ? 'CRM lead' : 'Message'}</span><p className="text-xs font-semibold dark:text-white">{item.title}</p><p className="text-[10px] text-zinc-500">{item.detail}</p></div><time dateTime={typeof item.date === 'string' ? item.date : undefined} className="text-[10px] text-zinc-400 shrink-0">{formatDate(item.date)}</time></div>) : <p className="py-8 text-center text-xs text-zinc-500">No recorded lead or message activity yet.</p>}</div></section>
  </div>;
};

export default OwnerDashboardView;
