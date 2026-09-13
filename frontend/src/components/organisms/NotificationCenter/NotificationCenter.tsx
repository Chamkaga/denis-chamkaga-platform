import React, { useState } from 'react';
import {
  Bell,
  X,
  Trash2
} from 'lucide-react';
import { cn } from '../../../lib/cn';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Lead' | 'Finance' | 'AI' | 'Backup' | 'Security' | 'System';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
  isRead: boolean;
}

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Hot Corporate Lead Registered',
      message: 'Acme Corp submitted high-intent consultation request ($45,000 potential value).',
      category: 'Lead',
      priority: 'High',
      timestamp: '10 minutes ago',
      isRead: false
    },
    {
      id: 'n-2',
      title: 'Quotation Approved',
      message: 'Quotation #QT-2026-089 has been accepted by client.',
      category: 'Finance',
      priority: 'Medium',
      timestamp: '1 hour ago',
      isRead: false
    },
    {
      id: 'n-3',
      title: 'Automated Database Backup Successful',
      message: 'PostgreSQL daily snapshot backed up to encrypted cold storage.',
      category: 'Backup',
      priority: 'Low',
      timestamp: '3 hours ago',
      isRead: true
    },
    {
      id: 'n-4',
      title: 'SOC Security Alert: Failed Auth Spikes',
      message: '5 failed login attempts detected from IP 197.234.12.90. Rate limit active.',
      category: 'Security',
      priority: 'Critical',
      timestamp: '5 hours ago',
      isRead: false
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Unread' | 'Critical'>('All');

  const filtered = notifications.filter(n => {
    if (activeFilter === 'Unread') return !n.isRead;
    if (activeFilter === 'Critical') return n.priority === 'Critical' || n.priority === 'High';
    return true;
  });

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <aside className="fixed top-0 bottom-0 right-0 w-full sm:w-[420px] z-50 flex flex-col bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl animate-slide-in-right">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-accent-violet/10 border border-accent-violet/20">
              <Bell size={16} className="text-accent-violet animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-bold dark:text-white text-zinc-900 uppercase tracking-wider">
                Notification Center
              </h3>
              <p className="text-[10px] text-zinc-500 font-mono">
                {notifications.filter(n => !n.isRead).length} Unread Alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={markAllAsRead}
              title="Mark All Read"
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 text-xs font-semibold"
            >
              Mark Read
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center gap-2">
          {(['All', 'Unread', 'Critical'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "px-3 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer",
                activeFilter === tab
                  ? "bg-accent-violet text-white"
                  : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
              )}
            >
              {tab}
            </button>
          ))}
          <button
            onClick={clearAll}
            className="ml-auto text-[10px] text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No notifications matching current filter.
            </div>
          ) : (
            filtered.map(item => (
              <div
                key={item.id}
                className={cn(
                  "p-3 rounded-2xl border transition-all text-xs flex flex-col gap-1.5 shadow-xs",
                  item.isRead
                    ? "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-850 opacity-80"
                    : "bg-accent-violet/5 dark:bg-zinc-900 border-accent-violet/30"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md",
                    item.priority === 'Critical' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    item.priority === 'High' ? "bg-amber-500/20 text-amber-400" :
                    "bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 text-zinc-600"
                  )}>
                    {item.category} • {item.priority}
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">{item.timestamp}</span>
                </div>
                <h4 className="font-bold dark:text-white text-zinc-900 leading-snug">{item.title}</h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed">{item.message}</p>
              </div>
            ))
          )}
        </div>

      </aside>
    </>
  );
};
