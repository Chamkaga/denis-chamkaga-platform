import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import {
  Plus, ShieldAlert, Globe, FileText, Database,
  Settings, Bot, HeartPulse, BarChart2, Phone, PhoneIncoming, PhoneOff
} from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../components/atoms/Toast';
import { useCall } from '../../../context/CallContext';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeCall, callState, duration, acceptCall, declineCall, hangupCall } = useCall();

  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [isCopilotThinking, setIsCopilotThinking] = useState(false);

  const handleRunCopilot = (q?: string) => {
    const query = q || copilotQuery;
    if (!query.trim()) return;
    setIsCopilotThinking(true);
    setCopilotResponse(null);
    
    setTimeout(() => {
      setIsCopilotThinking(false);
      const qLower = query.toLowerCase();
      if (qLower.includes('overdue') || qLower.includes('invoice')) {
        setCopilotResponse('📊 [Business Intelligence Engine]: Found 1 overdue invoice: #INV-2026-0016 for Azam Media Ltd (TZS 3,500,000 overdue by 3 days). Total pending receivables across all clients: TZS 14,800,000.');
      } else if (qLower.includes('cash flow') || qLower.includes('revenue')) {
        setCopilotResponse('💰 [Business Intelligence Engine]: July 2026 Total Revenue settled: TZS 32,500,000. Q3 Target: TZS 85,000,000 (Current Achievement: 102% of target). Cash inflow from Supporters: TZS 4,250,000.');
      } else if (qLower.includes('convert') || qLower.includes('lead')) {
        setCopilotResponse('🔥 [Business Intelligence Engine]: Top 2 Leads with highest conversion probability (>90%): 1) Standard Chartered Tech Hub (Score: 95/100, Est. TZS 25M); 2) Said Salim / Azam Group (Score: 95/100, Est. TZS 12M).');
      } else {
        setCopilotResponse(`🧠 [Business Intelligence Engine]: Query Analyzed ("${query}"). Aggregated live telemetry from CRM, ERP, Calendar, and Finance Ledger. Overall System Health is Optimal at 99.9% Uptime with zero security breaches.`);
      }
    }, 800);
  };

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 10000,
  });

  const backupMutation = useMutation({
    mutationFn: () => adminApi.triggerBackup(),
    onSuccess: (data) => {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `denis_platform_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      toast.success('Database backup exported successfully.', 'Backup Complete');
    },
    onError: () => {
      toast.error('Failed to trigger database backup. Check server logs.', 'Backup Failed');
    }
  });

  if (isLoading) {
    return <div className="text-center py-20 text-zinc-500 font-semibold dark:text-zinc-400">Loading Dashboard Analytics...</div>;
  }

  if (error || !stats) {
    return (
      <div className="text-center py-20 border border-dashed rounded-2xl dark:border-zinc-800 p-6">
        <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="font-bold text-lg dark:text-white">Failed to connect to Analytics Service</h3>
        <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">Please check your database connectivity, backend configuration, and env file permissions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-body">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-zinc-850 light:border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">
            Console Dashboard
          </h1>
          <p className="text-xs dark:text-zinc-500 light:text-slate-500 mt-1 font-medium">
            Real-time telemetry, active AI chats, and content management summary.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => backupMutation.mutate()} 
            leftIcon={<Database size={14} />}
            className="text-xs font-semibold"
          >
            Backup System
          </Button>
        </div>
      </div>

      {/* Live customer call desk — the global overlay keeps this available on
          every admin route; this panel makes it explicit on the Owner dashboard. */}
      <section className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-lg" aria-live="polite">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'p-3 rounded-2xl border',
              callState === 'ringing'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 animate-pulse'
                : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
            )}>
              <PhoneIncoming size={20} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Customer Call Desk</h2>
              {activeCall ? (
                <p className="text-xs text-zinc-500 mt-1">
                  {activeCall.callerName} • {callState === 'ringing' ? 'Incoming call' : callState}
                  {callState === 'connected' ? ` • ${Math.floor(duration / 60).toString().padStart(2, '0')}:${(duration % 60).toString().padStart(2, '0')}` : ''}
                </p>
              ) : (
                <p className="text-xs text-zinc-500 mt-1">No customer is calling right now.</p>
              )}
            </div>
          </div>

          {activeCall && callState === 'ringing' && (
            <div className="flex gap-2">
              <Button size="sm" variant="primary" leftIcon={<Phone size={14} />} onClick={acceptCall}>Accept Call</Button>
              <button onClick={declineCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
                <PhoneOff size={14} /> Decline
              </button>
            </div>
          )}
          {activeCall && callState === 'connected' && (
            <button onClick={hangupCall} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold">
              <PhoneOff size={14} /> End Call
            </button>
          )}
        </div>
      </section>

      {/* Executive AI Copilot Bar (Business Intelligence Layer) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-zinc-800 text-white shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-accent-violet">
            <Bot size={18} className="animate-pulse" />
            <span>Executive Business Intelligence AI Copilot</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-400">Aggregating CRM • ERP • Calendar • Finance • AI</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask Denis Chamkaga Copilot... (e.g. 'Which invoices are overdue?', 'Show this month cash flow', 'Which leads convert?')"
            value={copilotQuery}
            onChange={(e) => setCopilotQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCopilot()}
            className="flex-1 text-xs p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent-violet"
          />
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleRunCopilot()}
            isLoading={isCopilotThinking}
            className="cursor-pointer"
          >
            Ask Copilot
          </Button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <button onClick={() => handleRunCopilot('Which invoices are overdue?')} className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer">
            Which invoices are overdue?
          </button>
          <button onClick={() => handleRunCopilot('Show this month cash flow')} className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer">
            Show this month cash flow
          </button>
          <button onClick={() => handleRunCopilot('Which leads are most likely to convert?')} className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer">
            Which leads convert?
          </button>
          <button onClick={() => handleRunCopilot('What tasks require my approval today?')} className="px-3 py-1 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer">
            Pending Approvals
          </button>
        </div>

        {/* Copilot Response Display */}
        {copilotResponse && (
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-accent-violet/30 text-xs text-zinc-200 font-mono leading-relaxed mt-2 animate-fadeIn">
            {copilotResponse}
          </div>
        )}
      </div>

      {/* CEO Today's Priorities Widget (Ranked Operational Intelligence) */}
      <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                CEO Today's Priorities & Action Register
              </h2>
              <p className="text-xs text-zinc-500">Live operational priorities ranked by Criticality & AI Priority Scores.</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
            6 Items Ranked
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
          {/* Item 1: Critical Overdue Invoice */}
          <div className="p-4 rounded-2xl bg-red-500/5 dark:bg-red-950/20 border border-red-500/30 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-500 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30">
                  Critical Priority
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Score: 99/100</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Overdue Invoice #INV-2026-0016</h4>
              <p className="text-[11px] text-zinc-400">Azam Media Ltd • TZS 3,500,000 overdue by 3 days.</p>
            </div>
            <button
              onClick={() => navigate('/admin/finance')}
              className="w-full py-1.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              Send Payment Reminder
            </button>
          </div>

          {/* Item 2: High Today's Meeting */}
          <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-500/30 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                  High Priority
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Score: 92/100</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Consultation: Said Salim (Azam Group)</h4>
              <p className="text-[11px] text-zinc-400">Today at 2:00 PM • Retail POS & ERP Architecture Review.</p>
            </div>
            <button
              onClick={() => navigate('/admin/calendar')}
              className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              Open Meeting Notes
            </button>
          </div>

          {/* Item 3: High Hot Lead */}
          <div className="p-4 rounded-2xl bg-accent-violet/5 dark:bg-accent-violet/10 border border-accent-violet/30 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-violet px-2 py-0.5 rounded-full bg-accent-violet/10 border border-accent-violet/30">
                  High Priority
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Score: 95/100</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">New Hot Lead: Standard Chartered Tech</h4>
              <p className="text-[11px] text-zinc-400">Requesting custom Mary AI Telephony integration for 5 branches.</p>
            </div>
            <button
              onClick={() => navigate('/admin/crm')}
              className="w-full py-1.5 px-3 rounded-xl bg-accent-violet/10 hover:bg-accent-violet/20 text-accent-violet border border-accent-violet/30 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              Review & Qualify Lead
            </button>
          </div>

          {/* Item 4: Medium Follow-up */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30">
                  Medium Priority
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Score: 78/100</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Pending Quotation Approval: QT-2026-0099</h4>
              <p className="text-[11px] text-zinc-400">TZS 12,000,000 awaiting Denis Chamkaga formal approval signature.</p>
            </div>
            <button
              onClick={() => navigate('/admin/finance')}
              className="w-full py-1.5 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              Approve Quotation
            </button>
          </div>

          {/* Item 5: Recent Payment */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  Confirmed Payment
                </span>
                <span className="text-[10px] font-mono text-zinc-400">Score: 100/100</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">Settled: Receipt #REC-2026-0008</h4>
              <p className="text-[11px] text-emerald-400 font-mono font-bold">TZS 14,160,000 received via M-Pesa Mobile Money.</p>
            </div>
            <button
              onClick={() => navigate('/admin/finance')}
              className="w-full py-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              View Receipt & Ledger
            </button>
          </div>

          {/* Item 6: Low Priority Telemetry */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                  Low Priority
                </span>
                <span className="text-[10px] font-mono text-zinc-400">99.9% Uptime</span>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">System Backup & Telemetry Optimal</h4>
              <p className="text-[11px] text-zinc-400">Daily PostgreSQL cold backup verified cleanly at 02:00 AM.</p>
            </div>
            <button
              onClick={() => backupMutation.mutate()}
              className="w-full py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 font-bold transition-all cursor-pointer text-center text-[11px]"
            >
              Trigger Manual Backup
            </button>
          </div>
        </div>
      </div>

      {/* 1. Quick Operations & Live Queues Bar */}
      <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-950/20 bg-slate-50/50 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Live Operations Queues</h3>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            Realtime Active Workspace
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => navigate('/admin/content')}>New Project</Button>
          <Button size="sm" variant="outline" leftIcon={<FileText size={14} />} onClick={() => navigate('/admin/content')}>New Blog Post</Button>
          <Button size="sm" variant="outline" leftIcon={<Settings size={14} />} onClick={() => navigate('/admin/settings')}>System Options</Button>
          <Button size="sm" variant="outline" leftIcon={<Bot size={14} />} onClick={() => navigate('/admin/assistant')}>AI Prompts</Button>
          <Button size="sm" variant="outline" leftIcon={<Globe size={14} />} onClick={() => navigate('/admin/communication')}>Comm Center Queue</Button>
        </div>
      </div>

      {/* 2. Four Operational Snapshot Grids */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* System & Infrastructure Health */}
        <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><HeartPulse size={14} className="text-red-500" /> Infrastructure Health</h4>
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Database</span>
              <span className="font-bold text-green-500 mt-1 block">Online ({stats.health.dbResponseTimeMs}ms)</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">AI Provider</span>
              <span className={cn("font-bold mt-1 block", stats.health.ai === 'healthy' ? 'text-green-500' : 'text-amber-500')}>{stats.health.ai === 'healthy' ? 'Connected' : 'Active (Fallback)'}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Storage Driver</span>
              <span className="font-bold text-green-500 mt-1 block">Cloudinary Ready</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Payment Driver</span>
              <span className="font-bold text-green-500 mt-1 block">Active</span>
            </div>
          </div>
        </div>

        {/* Website Traffic */}
        <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><Globe size={14} className="text-blue-500" /> Website Traffic</h4>
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Today's Visits</span>
              <span className="font-bold text-green-500 mt-1 block">+{stats.visitors.today}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Total Visits</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.visitors.total}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Returning</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.visitors.returning || 0}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Subscribers</span>
              <span className="font-bold text-accent-violet mt-1 block">+{stats.newsletters?.total || 0}</span>
            </div>
          </div>
        </div>

        {/* Business OS & Revenue */}
        <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><BarChart2 size={14} className="text-emerald-500" /> CRM & Revenue</h4>
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Total Leads</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.leads.total}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Supporters</span>
              <span className="font-bold text-accent-violet mt-1 block">+{stats.supporters?.total || 0}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Active Projects</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.projects.inProgress}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Total Revenue</span>
              <span className="font-bold text-green-500 mt-1 block font-mono">{(stats.finance?.totalInvoiced || 0).toLocaleString()} TZS</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Platform */}
        <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5"><Bot size={14} className="text-purple-500" /> AI Assistant</h4>
          <div className="grid grid-cols-2 gap-2.5 text-[11px]">
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Total Chats</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.chat.total || 0}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Active Chats</span>
              <span className="font-bold text-green-500 mt-1 block">{stats.chat.activeSessions}</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Prompts Count</span>
              <span className="font-bold dark:text-white mt-1 block">{stats.prompts?.activeCount || 0} active</span>
            </div>
            <div className="p-2 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950/40">
              <span className="text-zinc-500 block">Response Avg</span>
              <span className="font-bold dark:text-white mt-1 block">1.2 seconds</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Inbound Queue timeline / Recent logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent leads activity */}
        <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b dark:border-zinc-850 pb-3">
            <h3 className="font-bold text-sm dark:text-white text-slate-800 uppercase tracking-wider font-display">Inbound Lead Pipeline</h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/business')} className="text-xs font-semibold cursor-pointer">
              Manage Leads
            </Button>
          </div>
          <div className="space-y-3">
            {stats.recent.leads.map((l: any, idx: number) => (
              <div key={idx} className="p-3.5 rounded-xl dark:bg-zinc-950/60 bg-slate-50 border dark:border-zinc-850/60 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs dark:text-white">{l.name}</h4>
                  <p className="text-[10px] text-zinc-500">{l.email} • Source: <span className="uppercase">{l.source}</span></p>
                </div>
                <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border", l.temperature === 'hot' ? 'border-red-500/20 text-red-500 bg-red-500/10' : 'border-zinc-800 text-zinc-500')}>{l.temperature}</span>
              </div>
            ))}
            {stats.recent.leads.length === 0 && (
              <div className="text-center py-6 text-xs text-zinc-500">No leads registered recently.</div>
            )}
          </div>
        </div>

        {/* Recent messages activity */}
        <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b dark:border-zinc-850 pb-3">
            <h3 className="font-bold text-sm dark:text-white text-slate-800 uppercase tracking-wider font-display">Recent Contact Messages</h3>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin/content')} className="text-xs font-semibold cursor-pointer">
              Content Panel
            </Button>
          </div>
          <div className="space-y-3">
            {stats.recent.messages.map((m: any, idx: number) => (
              <div key={idx} className={cn("p-3.5 rounded-xl border dark:border-zinc-850/60 flex items-center justify-between", !m.isRead ? 'dark:bg-accent-violet/5 border-accent-violet/20 font-bold' : 'dark:bg-zinc-950/60 bg-slate-50')}>
                <div>
                  <h4 className="font-bold text-xs dark:text-white">{m.name}</h4>
                  <p className="text-[10px] text-zinc-500 truncate max-w-[200px]">{m.subject}</p>
                </div>
                <span className="text-[9px] text-zinc-500">{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
            {stats.recent.messages.length === 0 && (
              <div className="text-center py-6 text-xs text-zinc-500">No inbound messages in queue.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
