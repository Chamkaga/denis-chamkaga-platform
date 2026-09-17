import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { useSearchParams } from 'react-router-dom';
import {
  Users, Building, Phone, Calendar, UserCheck, Kanban, PhoneCall
} from 'lucide-react';
import type { ColumnDef } from '../../../components/admin/EnterpriseDataGrid';
import { EnterpriseDataGrid } from '../../../components/admin/EnterpriseDataGrid';
import { Customer360Drawer } from '../../../components/admin/Customer360Drawer';
import { CallNotebookModal } from '../../../components/admin/CallNotebookModal';
import { Button } from '../../../components/atoms/Button';
import { SalesPipelineTab } from './SalesPipelineTab';

export const CRMPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>('leads');
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  useEffect(() => {
    const sub = searchParams.get('sub');
    if (sub) setActiveTab(sub);
  }, [searchParams]);

  const handleTabChange = (tabKey: string) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: 'crm', sub: tabKey });
  };

  // Queries
  const { data: leadsData = { items: [] }, isLoading: leadsLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminApi.getLeads(),
  });

  const { data: orgs = [], isLoading: orgsLoading } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => adminApi.getOrganizations(),
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['admin-clients'],
    queryFn: () => adminApi.getOrgClients(),
  });

  const { data: consultations = [], isLoading: consultsLoading } = useQuery({
    queryKey: ['admin-consultations'],
    queryFn: () => adminApi.getConsultations(),
  });

  const { data: calls = [], isLoading: callsLoading } = useQuery({
    queryKey: ['admin-calls'],
    queryFn: () => adminApi.getCalls(),
  });

  const leads = leadsData.items || [];

  // Leads Columns
  const leadColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Lead Name',
      cell: (row) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-white">
            {row.firstName ? `${row.firstName} ${row.lastName || ''}` : row.name || 'Anonymous Lead'}
          </div>
          <div className="text-[10px] text-zinc-400">{row.email}</div>
        </div>
      ),
    },
    { key: 'phone', header: 'Phone Number', cell: (row) => <span className="font-mono text-[11px]">{row.phone || '—'}</span> },
    { key: 'organizationName', header: 'Company', cell: (row) => row.organizationName || row.organization?.name || '—' },
    {
      key: 'status',
      header: 'Stage',
      filterable: true,
      cell: (row) => (
        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase bg-accent-violet/10 text-accent-violet border-accent-violet/20">
          {row.status || 'NEW'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Customer 360',
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(row);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-accent-violet hover:text-white transition-colors"
        >
          View 360
        </button>
      ),
    },
  ];

  // Contacts Columns
  const contactColumns: ColumnDef<any>[] = [
    {
      key: 'name',
      header: 'Contact Person',
      cell: (row) => (
        <div className="font-bold text-slate-800 dark:text-white">
          {row.firstName} {row.lastName}
        </div>
      ),
    },
    { key: 'email', header: 'Email' },
    { key: 'phone', header: 'Phone' },
    { key: 'organization', header: 'Organization', cell: (row) => row.organization?.name || '—' },
    {
      key: 'actions',
      header: 'Action',
      cell: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedCustomer(row);
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-accent-violet hover:text-white transition-colors"
        >
          View 360
        </button>
      ),
    },
  ];

  // Organizations Columns
  const orgColumns: ColumnDef<any>[] = [
    { key: 'name', header: 'Organization Name', cell: (row) => <span className="font-bold text-slate-800 dark:text-white">{row.name}</span> },
    { key: 'email', header: 'Official Email' },
    { key: 'phone', header: 'Contact Phone' },
    { key: 'website', header: 'Website', cell: (row) => row.website ? <a href={row.website} target="_blank" rel="noreferrer" className="text-accent-violet hover:underline">{row.website}</a> : '—' },
  ];

  // Consultations Columns
  const consultColumns: ColumnDef<any>[] = [
    { key: 'title', header: 'Meeting Topic', cell: (row) => <span className="font-bold text-slate-800 dark:text-white">{row.title || 'Consultation Meeting'}</span> },
    { key: 'clientName', header: 'Client', cell: (row) => row.clientName || row.client?.firstName || '—' },
    { key: 'status', header: 'Status', cell: (row) => <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{row.status || 'SCHEDULED'}</span> },
    { key: 'scheduledAt', header: 'Scheduled Date', cell: (row) => <span className="font-mono text-zinc-500 text-[11px]">{row.scheduledAt ? new Date(row.scheduledAt).toLocaleString() : '—'}</span> },
  ];

  const tabs = [
    { key: 'leads', label: 'Leads', icon: <Users size={15} /> },
    { key: 'contacts', label: 'Contacts', icon: <UserCheck size={15} /> },
    { key: 'orgs', label: 'Organizations', icon: <Building size={15} /> },
    { key: 'consultations', label: 'Consultations', icon: <Calendar size={15} /> },
    { key: 'calls', label: 'Calls', icon: <Phone size={15} /> },
    { key: 'pipeline', label: 'Sales Pipeline', icon: <Kanban size={15} /> },
  ];

  return (
    <div className="space-y-6 text-left font-body">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2">
            <Users className="text-accent-violet" size={28} />
            CRM & Customer 360 Center
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete relationship management • Leads, Contacts, Meetings & Lifecycle Journey
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsNotebookOpen(true)}
          leftIcon={<PhoneCall size={14} />}
        >
          Notebook
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b dark:border-zinc-800 pb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/20'
                : 'text-zinc-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'leads' && (
        <EnterpriseDataGrid
          title="Captured Leads Directory"
          subtitle="Click any row to open Customer 360 Profile"
          columns={leadColumns}
          data={leads}
          isLoading={leadsLoading}
          onRowClick={(row) => setSelectedCustomer(row)}
          exportFilename="leads_directory"
        />
      )}

      {activeTab === 'contacts' && (
        <EnterpriseDataGrid
          title="Contacts Registry"
          subtitle="Individual key account contacts"
          columns={contactColumns}
          data={clients}
          isLoading={clientsLoading}
          onRowClick={(row) => setSelectedCustomer(row)}
          exportFilename="contacts_registry"
        />
      )}

      {activeTab === 'orgs' && (
        <EnterpriseDataGrid
          title="Organizations & Companies"
          subtitle="Corporate accounts directory"
          columns={orgColumns}
          data={orgs}
          isLoading={orgsLoading}
          exportFilename="organizations"
        />
      )}

      {activeTab === 'consultations' && (
        <EnterpriseDataGrid
          title="Consultation Meetings"
          subtitle="Booked consultation sessions"
          columns={consultColumns}
          data={consultations}
          isLoading={consultsLoading}
          exportFilename="consultations"
        />
      )}

      {activeTab === 'calls' && (
        <EnterpriseDataGrid
          title="WebRTC & Phone Calls Log"
          subtitle="Recorded call sessions and AI summaries"
          columns={[
            { key: 'clientName', header: 'Client' },
            { key: 'duration', header: 'Duration' },
            { key: 'createdAt', header: 'Date' },
          ]}
          data={calls}
          isLoading={callsLoading}
          exportFilename="calls_log"
        />
      )}

      {activeTab === 'pipeline' && <SalesPipelineTab leads={leads} />}

      {/* Customer 360 Slide-out Drawer */}
      <Customer360Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />

      {/* AI Call Notebook Modal */}
      <CallNotebookModal
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />
    </div>
  );
};

export default CRMPage;
