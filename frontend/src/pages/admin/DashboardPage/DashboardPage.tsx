import React from 'react';
import { Users, AlertCircle, FolderGit, MessageSquare, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../components/atoms/Button';
import { cn } from '../../../lib/cn';

export const DashboardPage: React.FC = () => {
  const stats = [
    { name: 'Total Leads', value: '156', icon: <Users size={20} />, change: '+12% this week' },
    { name: 'Hot Leads', value: '32', icon: <AlertCircle size={20} />, change: 'Immediate action' },
    { name: 'Total Projects', value: '20', icon: <FolderGit size={20} />, change: '2 active sprints' },
    { name: 'Unread Messages', value: '45', icon: <MessageSquare size={20} />, change: '15 hours SLA limit' },
  ];

  const recentLeads = [
    { name: 'John Doe', email: 'john@abc.com', temp: 'Hot', time: '2m ago' },
    { name: 'Jane Smith', email: 'jane@logistics.co.tz', temp: 'Warm', time: '1h ago' },
    { name: 'Peter M.', email: 'peter@security.com', temp: 'Cold', time: '3h ago' },
  ];

  const recentProjects = [
    { name: 'Finance System', category: 'Commercial', status: 'In Progress' },
    { name: 'School System', category: 'Academic', status: 'Completed' },
    { name: 'Inventory System', category: 'Commercial', status: 'In Progress' },
  ];

  return (
    <div className="space-y-8 text-left font-body">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white light:text-slate-800 tracking-tight font-display">
            Dashboard
          </h1>
          <p className="text-sm dark:text-zinc-500 light:text-slate-500 mt-1">
            Denis Chamkaga Business Platform Overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export CSV
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={16} />}>
            Add Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-2xl border glass-panel shadow-md space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold dark:text-zinc-400 light:text-slate-500">
                {stat.name}
              </span>
              <div className="p-2 rounded-lg bg-accent-violet/10 text-accent-violet">
                {stat.icon}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-3xl font-extrabold dark:text-white light:text-slate-800">
                {stat.value}
              </span>
              <span className="block text-[10px] dark:text-zinc-500 light:text-slate-400 font-medium">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Grid: Leads & Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Leads */}
        <div className="lg:col-span-6 p-6 rounded-2xl border glass-panel shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white light:text-slate-800">Recent Leads</h3>
            <button className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
          
          <div className="space-y-4">
            {recentLeads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl dark:bg-zinc-900/60 light:bg-slate-100 border dark:border-zinc-800/40 light:border-slate-200"
              >
                <div>
                  <h4 className="font-semibold text-sm dark:text-white light:text-slate-800">{lead.name}</h4>
                  <p className="text-xs dark:text-zinc-500 light:text-slate-400">{lead.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider",
                    {
                      "bg-red-500/10 text-red-500": lead.temp === 'Hot',
                      "bg-amber-500/10 text-amber-500": lead.temp === 'Warm',
                      "bg-zinc-500/10 text-zinc-500": lead.temp === 'Cold',
                    }
                  )}>
                    {lead.temp}
                  </span>
                  <span className="text-[10px] dark:text-zinc-500 light:text-slate-400">{lead.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="lg:col-span-6 p-6 rounded-2xl border glass-panel shadow-md space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white light:text-slate-800">Recent Projects</h3>
            <button className="text-xs font-semibold text-accent-violet hover:underline flex items-center gap-1 cursor-pointer">
              <span>View All</span>
              <ArrowUpRight size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {recentProjects.map((p, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl dark:bg-zinc-900/60 light:bg-slate-100 border dark:border-zinc-800/40 light:border-slate-200"
              >
                <div>
                  <h4 className="font-semibold text-sm dark:text-white light:text-slate-800">{p.name}</h4>
                  <p className="text-xs dark:text-zinc-500 light:text-slate-400">{p.category}</p>
                </div>
                <span className={cn(
                  "text-[10px] py-0.5 px-2.5 rounded-full font-bold uppercase tracking-wider",
                  p.status === 'Completed'
                    ? "bg-green-500/10 text-green-500"
                    : "bg-amber-500/10 text-amber-500"
                )}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
export default DashboardPage;
