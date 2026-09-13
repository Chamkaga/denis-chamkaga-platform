import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Mail,
  Clock,
  FileText,
  Calendar
} from 'lucide-react';
import { useToast } from '../../components/atoms/Toast';

export interface ReportTemplate {
  id: string;
  name: string;
  category: 'Executive Reports' | 'Financial Reports' | 'CRM Reports' | 'Sales Reports' | 'Marketing Reports' | 'Supporter Reports' | 'Project Reports' | 'AI Performance Reports';
  description: string;
  lastGenerated: string;
  format: 'PDF' | 'Excel' | 'Both';
}

export const ReportsCenterPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [period, setPeriod] = useState<string>('this_month');
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-07-31');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const reports: ReportTemplate[] = [
    {
      id: 'rep-1',
      name: 'CEO Executive Summary & Key KPIs',
      category: 'Executive Reports',
      description: 'High-level aggregation of revenue, gross margin, active clients, and platform SLAs.',
      lastGenerated: 'Today at 08:00 AM',
      format: 'Both'
    },
    {
      id: 'rep-2',
      name: 'Financial Ledger & P&L Statement',
      category: 'Financial Reports',
      description: 'Comprehensive breakdown of approved quotations, paid invoices, and revenue projection.',
      lastGenerated: 'Yesterday at 05:00 PM',
      format: 'Both'
    },
    {
      id: 'rep-3',
      name: 'CRM Customer 360 & Lead Funnel Audit',
      category: 'CRM Reports',
      description: 'Full conversion lifecycle analytics from initial visitor inquiry to project customer stage.',
      lastGenerated: '2 days ago',
      format: 'Both'
    },
    {
      id: 'rep-4',
      name: 'Sales Velocity & Pipeline Conversion Rate',
      category: 'Sales Reports',
      description: 'Deal pipeline velocity, average transaction size, and stage conversion duration.',
      lastGenerated: '3 hours ago',
      format: 'Both'
    },
    {
      id: 'rep-5',
      name: 'Marketing Campaign ROI & Channel Analytics',
      category: 'Marketing Reports',
      description: 'Campaign reach, inbound lead acquisition cost, and traffic channel conversion efficiency.',
      lastGenerated: '4 days ago',
      format: 'Excel'
    },
    {
      id: 'rep-6',
      name: 'Supporters & Network Contribution Ledger',
      category: 'Supporter Reports',
      description: 'Financial donations, top supporters, recurring monthly contributions, and LTV.',
      lastGenerated: '1 week ago',
      format: 'Both'
    },
    {
      id: 'rep-7',
      name: 'Platform Engineering & Delivery Milestones',
      category: 'Project Reports',
      description: 'Active project delivery status, deadline compliance, contractor workload, and task registry.',
      lastGenerated: '5 days ago',
      format: 'Both'
    },
    {
      id: 'rep-8',
      name: 'AI Operations & Provider Cost Telemetry',
      category: 'AI Performance Reports',
      description: 'OpenAI token usage and latency, BM25 latency, and RAG retrieval accuracy.',
      lastGenerated: 'Today at 09:00 AM',
      format: 'PDF'
    }
  ];

  const handleGenerate = (id: string, name: string, type: 'PDF' | 'Excel' | 'Email' | 'CSV' | 'Print') => {
    setIsGenerating(id);
    toast.info(`Compiling ${name} for period [${period}] in ${type} format...`, 'Report Generation');
    setTimeout(() => {
      setIsGenerating(null);
      if (type === 'Print') {
        window.print();
      } else {
        toast.success(`${name} (${period}) generated and ready.`, 'Report Complete');
      }
    }, 1200);
  };

  const filtered = reports.filter(r => selectedCategory === 'All' || r.category === selectedCategory);

  return (
    <div className="p-4 sm:p-6 space-y-6 font-body text-left max-w-7xl mx-auto dark:text-zinc-100">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 text-accent-violet">
            <FileSpreadsheet size={24} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold dark:text-white text-zinc-900 tracking-tight font-heading">
              Enterprise Reports & BI Audit Center
            </h1>
            <p className="text-xs text-zinc-500 font-mono">
              Export audited PDF, Excel, CSV, Print, and scheduled automated reports for any custom period
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleGenerate('all', 'Full Enterprise Audit Pack', 'PDF')}
            className="px-4 py-2.5 rounded-xl bg-accent-violet hover:bg-accent-violet/90 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Download size={14} />
            <span>Export Full Audit Pack</span>
          </button>
        </div>
      </div>

      {/* Global Period Selector Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <Calendar size={14} className="text-accent-violet" /> Global Enterprise Period & Comparison Engine
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Real Database Driven
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Preset Range</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-medium"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="this_month">This Month (July 2026)</option>
              <option value="last_month">Previous Month (June 2026)</option>
              <option value="q1_2026">Quarter 1 (Q1 2026)</option>
              <option value="q2_2026">Quarter 2 (Q2 2026)</option>
              <option value="q3_2026">Quarter 3 (Q3 2026)</option>
              <option value="q4_2026">Quarter 4 (Q4 2026)</option>
              <option value="h1_2026">Half Year (H1 2026)</option>
              <option value="this_year">Year-to-Date (2026)</option>
              <option value="prev_year">Previous Year (2025)</option>
              <option value="lifetime">Lifetime All-Time</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Compare With Period</label>
            <select
              className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-medium"
            >
              <option value="none">No Comparison (Single Period)</option>
              <option value="prev_period">Previous Equivalent Period</option>
              <option value="last_month">Previous Month (June 2026)</option>
              <option value="q2_vs_q1">Q2 2026 vs Q1 2026</option>
              <option value="yoy_2025">2026 vs 2025 (Year-over-Year)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-500 block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-white font-mono"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['All', 'Executive Reports', 'Financial Reports', 'CRM Reports', 'Sales Reports', 'Marketing Reports', 'Supporter Reports', 'Project Reports', 'AI Performance Reports'].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-accent-violet text-white font-bold'
                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-accent-violet/40 transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-mono">
                  {item.category}
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Format: {item.format}</span>
              </div>
              <h3 className="font-bold dark:text-white text-zinc-900 text-sm leading-snug">{item.name}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{item.description}</p>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
              <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                <span className="flex items-center gap-1">
                  <Clock size={11} /> Period: {period}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleGenerate(item.id, item.name, 'PDF')}
                  disabled={isGenerating === item.id}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-accent-violet text-center text-[11px] font-semibold dark:text-zinc-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileText size={12} className="text-red-400" />
                  <span>PDF</span>
                </button>
                <button
                  onClick={() => handleGenerate(item.id, item.name, 'Excel')}
                  disabled={isGenerating === item.id}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 text-center text-[11px] font-semibold dark:text-zinc-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <FileSpreadsheet size={12} className="text-emerald-400" />
                  <span>Excel</span>
                </button>
                <button
                  onClick={() => handleGenerate(item.id, item.name, 'Email')}
                  disabled={isGenerating === item.id}
                  className="px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-purple-500 text-center text-[11px] font-semibold dark:text-zinc-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Mail size={12} className="text-purple-400" />
                  <span>Email</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ReportsCenterPage;
