import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  KeyRound,
  UserCheck,
  UserX,
  Laptop,
  Clock
} from 'lucide-react';
import { EnterpriseDataGrid } from '../EnterpriseDataGrid/EnterpriseDataGrid';
import type { ColumnDef } from '../EnterpriseDataGrid/EnterpriseDataGrid';
import { adminApi } from '../../../services/api';
import { cn } from '../../../lib/cn';

export interface AuditLogRecord {
  id: string;
  userEmail: string;
  userName: string;
  role: string;
  action: string;
  ipAddress: string;
  country: string;
  device: string;
  browser: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  timestamp: string;
}

export const SiemAuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalItems, setTotalItems] = useState(0);

  const fetchLogs = () => {
    setIsLoading(true);
    adminApi.getAuditLogs({ page, limit: pageSize, search: searchQuery })
      .then((res: any) => {
        if (res && res.data) {
          const items: AuditLogRecord[] = (res.data.items || res.data || []).map((item: any) => ({
            id: item.id,
            userEmail: item.userEmail || item.user?.email || '—',
            userName: item.userName || `${item.user?.firstName || 'System'} ${item.user?.lastName || ''}`.trim(),
            role: item.role || item.user?.role?.name || 'system',
            action: item.action || item.event || 'UNKNOWN',
            ipAddress: item.ipAddress || item.ip || '—',
            country: item.country || '—',
            device: item.device || '—',
            browser: item.browser || '—',
            severity: item.severity || (item.action?.includes('FAIL') ? 'High' : 'Low'),
            timestamp: new Date(item.createdAt || Date.now()).toLocaleString()
          }));
          setLogs(items);
          setTotalItems(res.data.meta?.total || items.length);
        } else {
          setLogs([]);
          setTotalItems(0);
        }
      })
      .catch(() => {
        setLogs([]);
        setTotalItems(0);
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [page, pageSize, searchQuery]);

  const columns: ColumnDef<AuditLogRecord>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      render: (item) => (
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
          <Clock size={12} className="text-zinc-400" />
          <span>{item.timestamp}</span>
        </div>
      )
    },
    {
      key: 'userName',
      header: 'User Account',
      render: (item) => (
        <div>
          <p className="font-bold dark:text-white text-zinc-900">{item.userName}</p>
          <span className="text-[10px] text-zinc-500 font-mono">{item.userEmail}</span>
        </div>
      )
    },
    {
      key: 'action',
      header: 'Action / Event',
      render: (item) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-850 dark:text-zinc-200">
          {item.action}
        </span>
      )
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (item) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
          item.severity === 'Critical' ? "bg-red-500/20 text-red-400 border border-red-500/30" :
          item.severity === 'High' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
          item.severity === 'Medium' ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" :
          "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
        )}>
          {item.severity}
        </span>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP & Country',
      render: (item) => (
        <div>
          <p className="font-mono text-xs font-semibold dark:text-zinc-300">{item.ipAddress}</p>
          <span className="text-[10px] text-zinc-500">{item.country}</span>
        </div>
      )
    },
    {
      key: 'device',
      header: 'Device & Client',
      render: (item) => (
        <div>
          <p className="text-xs dark:text-zinc-300">{item.device}</p>
          <span className="text-[10px] text-zinc-500 font-mono">{item.browser}</span>
        </div>
      )
    }
  ];
  const successfulLogins = logs.filter((log) => log.action.includes('LOGIN_SUCCESS')).length;
  const failedAttempts = logs.filter((log) => log.action.includes('LOGIN_FAILED')).length;
  const passwordResets = logs.filter((log) => log.action.includes('PASSWORD_RESET')).length;
  const activeThreats = logs.filter((log) => log.severity === 'Critical' || log.severity === 'High').length;

  return (
    <div className="space-y-6">
      
      {/* SIEM SOC Security KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Successful Logins</span>
            <UserCheck size={16} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-zinc-900 font-heading">{successfulLogins}</h3>
          <p className="text-[10px] text-zinc-500 font-semibold">Current result set</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Failed Attempts</span>
            <UserX size={16} className="text-red-500" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-zinc-900 font-heading">{failedAttempts}</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Recorded audit events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Password Resets</span>
            <KeyRound size={16} className="text-purple-500" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-zinc-900 font-heading">{passwordResets}</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Current result set</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Security Threats</span>
            <ShieldAlert size={16} className="text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-zinc-900 font-heading">{activeThreats}</h3>
          <p className="text-[10px] text-zinc-500 font-semibold">High or critical events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Active Sessions</span>
            <Laptop size={16} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-extrabold dark:text-white text-zinc-900 font-heading">—</h3>
          <p className="text-[10px] text-zinc-500 font-mono">Session telemetry unavailable</p>
        </div>

      </div>

      {/* Main EnterpriseDataGrid Table */}
      <EnterpriseDataGrid<AuditLogRecord>
        title="SIEM Security Event Audit Logs"
        subtitle="Real-time security event log stream with IP geolocation, device fingerprinting, and threat indexing"
        data={logs}
        columns={columns}
        keyExtractor={(item) => item.id}
        totalItems={totalItems}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        onRetry={fetchLogs}
        isOwner={true}
        emptyStateTitle="No audit logs matched search criteria"
        emptyStateDescription="Try adjusting your IP filter, user query, or severity parameters."
      />

    </div>
  );
};
