import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useSearchParams } from 'react-router-dom';
import {
  Heart, Users, UserPlus
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { AdminModal, FormField, inputCls } from '../../components/admin/AdminModal';
import { useToast } from '../../components/atoms/Toast';
import { EnterpriseDataGrid } from '../../components/organisms/EnterpriseDataGrid/EnterpriseDataGrid';
import type { ColumnDef } from '../../components/organisms/EnterpriseDataGrid/EnterpriseDataGrid';
import { Supporter360Drawer } from '../../components/admin/Supporter360Drawer';
import { cn } from '../../lib/cn';

export const SupportersAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'supporters' | 'collaborators'>('supporters');
  const [tierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Supporter 360 Profile Drawer state
  const [selectedSupporter, setSelectedSupporter] = useState<any | null>(null);
  const [is360Open, setIs360Open] = useState(false);

  // Deep-link: ?tab=collaborators opens Collaborators automatically
  useEffect(() => {
    if (searchParams.get('tab') === 'collaborators') {
      setActiveTab('collaborators');
    }
  }, [searchParams]);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isCollaboratorModalOpen, setIsCollaboratorModalOpen] = useState(false);

  // Forms
  const [recordForm, setRecordForm] = useState({
    supporterName: '',
    supporterEmail: '',
    supporterPhone: '',
    country: 'Tanzania',
    amount: 50000,
    currency: 'TZS',
    tier: 'VISION_BUILDER',
    supportType: 'one_time',
    paymentProvider: 'DPO',
    paymentMethod: 'Mobile Money',
    notes: '',
  });

  const [collabForm, setCollabForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    roleTitle: 'Developer',
    skills: 'TypeScript, React, Node.js',
    notes: '',
  });

  // Queries
  const { data: overview } = useQuery({
    queryKey: ['admin-supporters-overview'],
    queryFn: () => adminApi.getSupportersOverview(),
  });

  const { data: supporters, isLoading: supportersLoading } = useQuery({
    queryKey: ['admin-supporters-list', tierFilter, searchQuery],
    queryFn: () => adminApi.getSupporters({ tier: tierFilter === 'ALL' ? undefined : tierFilter, search: searchQuery }),
  });

  const { data: collabOverview } = useQuery({
    queryKey: ['admin-collaborators-overview'],
    queryFn: () => adminApi.getCollaboratorsOverview(),
  });

  const { data: collaborators, isLoading: collabLoading } = useQuery({
    queryKey: ['admin-collaborators-list', searchQuery],
    queryFn: () => adminApi.getCollaborators(searchQuery),
  });

  // Mutations
  const recordContributionMutation = useMutation({
    mutationFn: (data: any) => adminApi.recordSupporterContribution(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-supporters-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-supporters-list'] });
      setIsRecordModalOpen(false);
      toast.success('Support contribution recorded and synced across CRM, Finance, and Analytics.', 'Contribution Recorded');
    },
    onError: () => toast.error('Failed to record contribution.', 'Error'),
  });

  const upsertCollaboratorMutation = useMutation({
    mutationFn: (data: any) => adminApi.upsertCollaborator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators-list'] });
      setIsCollaboratorModalOpen(false);
      toast.success('Collaborator profile saved successfully.', 'Saved');
    },
    onError: () => toast.error('Failed to save collaborator profile.', 'Error'),
  });

  const summary = overview?.summary || {};

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordContributionMutation.mutate(recordForm);
  };

  const handleCollabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertCollaboratorMutation.mutate(collabForm);
  };

  const supporterColumns: ColumnDef<any>[] = [
    {
      key: 'supporterName',
      header: 'Supporter & Email',
      render: (item) => (
        <div>
          <p className="font-bold dark:text-white text-zinc-900">{item.supporterName}</p>
          <p className="text-[10px] text-zinc-500 font-mono">{item.supporterEmail || '—'}</p>
        </div>
      )
    },
    {
      key: 'tier',
      header: 'Support Tier',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-violet/10 text-accent-violet border border-accent-violet/20 font-mono">
          {item.tier}
        </span>
      )
    },
    {
      key: 'country',
      header: 'Country',
      render: (item) => <span className="font-mono text-xs text-zinc-400">{item.country || 'Tanzania'}</span>
    },
    {
      key: 'amount',
      header: 'Contribution Amount',
      render: (item) => (
        <span className="font-mono font-bold text-emerald-400">
          {(item.amount || 0).toLocaleString()} {item.currency || 'TZS'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (item) => (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
          item.status === 'completed' ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
        )}>
          {item.status || 'completed'}
        </span>
      )
    }
  ];

  const collaboratorColumns: ColumnDef<any>[] = [
    {
      key: 'fullName',
      header: 'Collaborator Name & Email',
      render: (item) => (
        <div>
          <p className="font-bold dark:text-white text-zinc-900">{item.fullName}</p>
          <p className="text-[10px] text-zinc-500 font-mono">{item.email}</p>
        </div>
      )
    },
    {
      key: 'roleTitle',
      header: 'Role & Skills',
      render: (item) => (
        <div>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300">
            {item.roleTitle || 'Senior Engineer'}
          </span>
          <p className="text-[10px] text-zinc-400 mt-1">{item.skills || 'React, Node.js, PostgreSQL'}</p>
        </div>
      )
    },
    {
      key: 'availability',
      header: 'Availability & Workload',
      render: (item) => (
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {item.availability || 'Available (30 hrs/wk)'}
          </span>
          <p className="text-[10px] text-zinc-400 mt-1">Workload: {item.workload || '2 Active Projects'}</p>
        </div>
      )
    },
    {
      key: 'contractRate',
      header: 'Hourly / Contract Rate',
      render: (item) => (
        <span className="font-mono text-xs font-bold text-amber-400">
          {item.contractRate || 'TZS 75,000 / hr'}
        </span>
      )
    },
    {
      key: 'performanceScore',
      header: 'Performance Rating',
      render: (item) => (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
          ⭐ {item.performanceScore || '98/100 (Top Contributor)'}
        </span>
      )
    }
  ];

  const supporterData = supporters || [];
  const collaboratorData = collaborators || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 font-body text-left max-w-7xl mx-auto dark:text-zinc-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold dark:text-white text-zinc-900 tracking-tight font-heading flex items-center gap-2">
            <Heart className="text-red-500" size={24} /> Supporters & Collaborators Platform
          </h1>
          <p className="text-xs text-zinc-500 font-mono">
            Scalable directory tracking vision builders, financial backers, and engineering collaborators
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'collaborators' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCollaboratorModalOpen(true)}
              leftIcon={<UserPlus size={14} />}
            >
              Add Collaborator
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
        <button
          onClick={() => setActiveTab('supporters')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'supporters' ? "bg-accent-violet text-white" : "text-zinc-400 hover:text-white bg-zinc-100 dark:bg-zinc-900"
          )}
        >
          <Heart size={14} /> Supporters Directory ({summary.totalSupporters || 0})
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer",
            activeTab === 'collaborators' ? "bg-accent-violet text-white" : "text-zinc-400 hover:text-white bg-zinc-100 dark:bg-zinc-900"
          )}
        >
          <Users size={14} /> Collaborators Hub ({collabOverview?.totalCollaborators || 0})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'supporters' ? (
        <EnterpriseDataGrid<any>
          title="Supporters & Financial Backers"
          subtitle="Directory of backers supporting Denis Chamkaga ecosystem projects"
          data={supporterData}
          columns={supporterColumns}
          keyExtractor={(item: any) => item.id || item.email || item.name}
          totalItems={supporterData.length}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={supportersLoading}
          isOwner={true}
          onRowClick={(item) => {
            setSelectedSupporter(item);
            setIs360Open(true);
          }}
          emptyStateTitle="No supporters found"
          emptyStateDescription="Record a support contribution to see backer details here."
        />
      ) : (
        <EnterpriseDataGrid<any>
          title="Engineering & Creative Collaborators"
          subtitle="Registered co-developers, designers, and strategic partners"
          data={collaboratorData}
          columns={collaboratorColumns}
          keyExtractor={(item: any) => item.id || item.email || item.fullName}
          totalItems={collaboratorData.length}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={collabLoading}
          isOwner={true}
          emptyStateTitle="No collaborators registered"
          emptyStateDescription="Add a new collaborator profile to list team members."
        />
      )}

      {/* Record Contribution Modal */}
      {isRecordModalOpen && (
        <AdminModal
          isOpen={isRecordModalOpen}
          title="Record Support Contribution"
          subtitle="Manually add a financial support entry"
          onClose={() => setIsRecordModalOpen(false)}
        >
          <form onSubmit={handleRecordSubmit} className="space-y-4">
            <FormField label="Supporter Name">
              <input
                type="text"
                required
                value={recordForm.supporterName}
                onChange={(e) => setRecordForm({ ...recordForm, supporterName: e.target.value })}
                className={inputCls}
              />
            </FormField>
            <FormField label="Supporter Email">
              <input
                type="email"
                required
                value={recordForm.supporterEmail}
                onChange={(e) => setRecordForm({ ...recordForm, supporterEmail: e.target.value })}
                className={inputCls}
              />
            </FormField>
            <FormField label="Amount (TZS)">
              <input
                type="number"
                required
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: +e.target.value })}
                className={inputCls}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsRecordModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Record Entry</Button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Collaborator Modal */}
      {isCollaboratorModalOpen && (
        <AdminModal
          isOpen={isCollaboratorModalOpen}
          title="Add Collaborator"
          subtitle="Register an active contributor"
          onClose={() => setIsCollaboratorModalOpen(false)}
        >
          <form onSubmit={handleCollabSubmit} className="space-y-4">
            <FormField label="Full Name">
              <input
                type="text"
                required
                value={collabForm.fullName}
                onChange={(e) => setCollabForm({ ...collabForm, fullName: e.target.value })}
                className={inputCls}
              />
            </FormField>
            <FormField label="Email">
              <input
                type="email"
                required
                value={collabForm.email}
                onChange={(e) => setCollabForm({ ...collabForm, email: e.target.value })}
                className={inputCls}
              />
            </FormField>
            <FormField label="Role Title">
              <input
                type="text"
                required
                value={collabForm.roleTitle}
                onChange={(e) => setCollabForm({ ...collabForm, roleTitle: e.target.value })}
                className={inputCls}
              />
            </FormField>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCollaboratorModalOpen(false)}>Cancel</Button>
              <Button type="submit" variant="primary">Save Collaborator</Button>
            </div>
          </form>
        </AdminModal>
      )}

      {/* Supporter 360 Profile Drawer */}
      <Supporter360Drawer
        supporter={selectedSupporter}
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
      />
    </div>
  );
};

export default SupportersAdminPage;
