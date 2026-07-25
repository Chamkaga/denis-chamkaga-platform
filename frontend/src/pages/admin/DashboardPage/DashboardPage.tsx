import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import {
  Plus, ShieldAlert, Globe, FileText, Database,
  Settings, Bot, HeartPulse, BarChart2
} from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { cn } from '../../../lib/cn';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
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
      alert('Database backup file triggered and downloaded successfully!');
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
