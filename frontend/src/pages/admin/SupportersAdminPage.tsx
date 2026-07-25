import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import {
  Heart, Users, Award, Plus, Filter, Search, UserPlus
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { AdminModal, FormField, inputCls, selectCls } from '../../components/admin/AdminModal';

const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export const SupportersAdminPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'supporters' | 'collaborators'>('supporters');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
      alert('Support contribution recorded & synced across CRM, Finance, and Analytics!');
    },
  });

  const upsertCollaboratorMutation = useMutation({
    mutationFn: (data: any) => adminApi.upsertCollaborator(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators-overview'] });
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators-list'] });
      setIsCollaboratorModalOpen(false);
      alert('Collaborator profile saved successfully!');
    },
  });

  const summary = overview?.summary || {};
  const tierBreakdown = overview?.tierBreakdown || {};

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordContributionMutation.mutate(recordForm);
  };

  const handleCollabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = collabForm.skills.split(',').map((s) => s.trim()).filter(Boolean);
    upsertCollaboratorMutation.mutate({ ...collabForm, skills: skillsArray });
  };

  return (
    <div className="space-y-8 text-left font-body">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b dark:border-zinc-800">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white text-slate-800 tracking-tight font-display flex items-center gap-2.5">
            <Heart className="text-red-500 fill-red-500/20" size={28} />
            Vision Supporters & Collaborators Platform
          </h1>
          <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1 font-medium">
            Manage Vision Supporters across official platform tiers, record contributions, and manage platform collaborators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'supporters' ? (
            <Button size="sm" variant="primary" leftIcon={<Plus size={14} />} onClick={() => setIsRecordModalOpen(true)}>
              Record Contribution
            </Button>
          ) : (
            <Button size="sm" variant="primary" leftIcon={<UserPlus size={14} />} onClick={() => setIsCollaboratorModalOpen(true)}>
              Add Collaborator
            </Button>
          )}
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-2xl dark:bg-zinc-900 border dark:border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('supporters')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'supporters' ? "bg-accent-violet text-white shadow-md" : "dark:text-zinc-400 hover:text-white"
          )}
        >
          <Heart size={14} /> Supporters Management ({summary.totalSupporters || 0})
        </button>
        <button
          onClick={() => setActiveTab('collaborators')}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'collaborators' ? "bg-accent-violet text-white shadow-md" : "dark:text-zinc-400 hover:text-white"
          )}
        >
          <Users size={14} /> Collaborators Hub ({collabOverview?.totalCollaborators || 0})
        </button>
      </div>

      {/* ── TAB 1: SUPPORTERS MANAGEMENT ────────────────────────────────────────── */}
      {activeTab === 'supporters' && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Total Supporters</span>
              <div className="text-2xl font-extrabold dark:text-white text-slate-800 font-display">
                {summary.totalSupporters || 0}
              </div>
              <p className="text-[11px] text-zinc-500">Active Members: <span className="font-bold text-green-500">{summary.activeSupporters || 0}</span></p>
            </div>

            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Monthly Support Revenue</span>
              <div className="text-2xl font-extrabold text-green-500 font-display">
                {(summary.monthlyRevenue || 0).toLocaleString()} TZS
              </div>
              <p className="text-[11px] text-zinc-500">Recurring Members: <span className="font-bold text-accent-violet">{summary.recurringSupporters || 0}</span></p>
            </div>

            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Total Lifetime Revenue</span>
              <div className="text-2xl font-extrabold text-accent-violet font-display">
                {(summary.lifetimeRevenue || 0).toLocaleString()} TZS
              </div>
              <p className="text-[11px] text-zinc-500">Avg Contribution: <span className="font-bold dark:text-white">{(summary.avgContribution || 0).toLocaleString()} TZS</span></p>
            </div>

            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-[#09090b]/80 bg-white shadow-md space-y-2">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Pending / Failed Status</span>
              <div className="text-2xl font-extrabold text-amber-500 font-display">
                {summary.pendingPayments || 0} Pending
              </div>
              <p className="text-[11px] text-zinc-500">Failed Payments: <span className="font-bold text-red-500">{summary.failedPayments || 0}</span></p>
            </div>
          </div>

          {/* Official Platform Tier Breakdown Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-display flex items-center gap-2">
              <Award size={16} className="text-accent-violet" />
              Official Platform Support Tiers Metrics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4">
              {/* 🌱 Seed Supporter */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold dark:text-white">🌱 Seed Supporter</span>
                  <span className="text-[10px] text-zinc-500">5k TZS+</span>
                </div>
                <div className="text-lg font-extrabold text-green-500">
                  {tierBreakdown.SEED?.totalMembers || 0} Members
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Monthly: <span className="font-bold dark:text-white">{(tierBreakdown.SEED?.monthlyRevenue || 0).toLocaleString()} TZS</span></p>
                  <p>Lifetime: <span className="font-bold dark:text-white">{(tierBreakdown.SEED?.lifetimeRevenue || 0).toLocaleString()} TZS</span></p>
                </div>
              </div>

              {/* 🚀 Growth Supporter */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold dark:text-white">🚀 Growth Supporter</span>
                  <span className="text-[10px] text-zinc-500">20k TZS+</span>
                </div>
                <div className="text-lg font-extrabold text-blue-500">
                  {tierBreakdown.GROWTH?.totalMembers || 0} Members
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Monthly: <span className="font-bold dark:text-white">{(tierBreakdown.GROWTH?.monthlyRevenue || 0).toLocaleString()} TZS</span></p>
                  <p>Lifetime: <span className="font-bold dark:text-white">{(tierBreakdown.GROWTH?.lifetimeRevenue || 0).toLocaleString()} TZS</span></p>
                </div>
              </div>

              {/* ⭐ Vision Builder */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold dark:text-white">⭐ Vision Builder</span>
                  <span className="text-[10px] text-zinc-500">50k TZS+</span>
                </div>
                <div className="text-lg font-extrabold text-amber-500">
                  {tierBreakdown.VISION_BUILDER?.totalMembers || 0} Members
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Monthly: <span className="font-bold dark:text-white">{(tierBreakdown.VISION_BUILDER?.monthlyRevenue || 0).toLocaleString()} TZS</span></p>
                  <p>Lifetime: <span className="font-bold dark:text-white">{(tierBreakdown.VISION_BUILDER?.lifetimeRevenue || 0).toLocaleString()} TZS</span></p>
                </div>
              </div>

              {/* ❤️ Mission Champion */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold dark:text-white">❤️ Mission Champion</span>
                  <span className="text-[10px] text-zinc-500">100k TZS+</span>
                </div>
                <div className="text-lg font-extrabold text-red-500">
                  {tierBreakdown.MISSION_CHAMPION?.totalMembers || 0} Members
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Monthly: <span className="font-bold dark:text-white">{(tierBreakdown.MISSION_CHAMPION?.monthlyRevenue || 0).toLocaleString()} TZS</span></p>
                  <p>Lifetime: <span className="font-bold dark:text-white">{(tierBreakdown.MISSION_CHAMPION?.lifetimeRevenue || 0).toLocaleString()} TZS</span></p>
                </div>
              </div>

              {/* ❤️ Custom Support */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-2 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold dark:text-white">❤️ Custom Support</span>
                  <span className="text-[10px] text-zinc-500">Custom</span>
                </div>
                <div className="text-lg font-extrabold text-accent-violet">
                  {tierBreakdown.CUSTOM?.totalMembers || 0} Members
                </div>
                <div className="text-[11px] text-zinc-400 space-y-1">
                  <p>Monthly: <span className="font-bold dark:text-white">{(tierBreakdown.CUSTOM?.monthlyRevenue || 0).toLocaleString()} TZS</span></p>
                  <p>Lifetime: <span className="font-bold dark:text-white">{(tierBreakdown.CUSTOM?.lifetimeRevenue || 0).toLocaleString()} TZS</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Directory Filter & Search */}
          <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search size={16} className="text-zinc-500" />
              <input
                type="text"
                placeholder="Search supporters by name, email, or country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs dark:bg-zinc-950 border dark:border-zinc-800 rounded-lg p-2 text-white w-full sm:w-80"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-zinc-400" />
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="text-xs dark:bg-zinc-950 border dark:border-zinc-800 rounded-lg p-2 text-white cursor-pointer"
              >
                <option value="ALL">All Support Tiers</option>
                <option value="SEED">🌱 Seed Supporter</option>
                <option value="GROWTH">🚀 Growth Supporter</option>
                <option value="VISION_BUILDER">⭐ Vision Builder</option>
                <option value="MISSION_CHAMPION">❤️ Mission Champion</option>
                <option value="CUSTOM">❤️ Custom Support</option>
              </select>
            </div>
          </div>

          {/* Supporters Directory Table */}
          <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#09090b]">
            {supportersLoading ? (
              <div className="text-center py-12 text-zinc-500">Loading supporters directory...</div>
            ) : supporters?.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No supporters found matching search filter.</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="dark:bg-zinc-900/80 dark:text-zinc-400 border-b dark:border-zinc-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Supporter Name</th>
                    <th className="p-3.5">Support Tier</th>
                    <th className="p-3.5">Country</th>
                    <th className="p-3.5">Lifetime Amount</th>
                    <th className="p-3.5">Support Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800/60">
                  {supporters?.map((s: any) => (
                    <tr key={s.id} className="dark:hover:bg-zinc-800/20 transition-all">
                      <td className="p-3.5">
                        <div className="font-bold dark:text-white">{s.fullName}</div>
                        <div className="text-[10px] text-zinc-500">{s.email}</div>
                      </td>
                      <td className="p-3.5 font-semibold">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-accent-violet/30 bg-accent-violet/10 text-accent-violet">
                          {s.tier === 'SEED' ? '🌱 Seed Supporter' :
                           s.tier === 'GROWTH' ? '🚀 Growth Supporter' :
                           s.tier === 'VISION_BUILDER' ? '⭐ Vision Builder' :
                           s.tier === 'MISSION_CHAMPION' ? '❤️ Mission Champion' :
                           '❤️ Custom Support'}
                        </span>
                      </td>
                      <td className="p-3.5 dark:text-zinc-300">{s.country || 'Tanzania'}</td>
                      <td className="p-3.5 font-bold text-green-400">
                        {s.totalLifetimeAmount.toLocaleString()} {s.currency || 'TZS'}
                      </td>
                      <td className="p-3.5 uppercase text-[10px] font-bold dark:text-zinc-400">
                        {s.isRecurring ? 'Recurring' : 'One-Time'}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500 text-[10px]">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: COLLABORATORS & CONTRIBUTORS HUB ────────────────────────────── */}
      {activeTab === 'collaborators' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Total Collaborators</span>
              <div className="text-2xl font-extrabold dark:text-white font-display">{collabOverview?.totalCollaborators || 0}</div>
            </div>
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Active Contributors</span>
              <div className="text-2xl font-extrabold text-green-500 font-display">{collabOverview?.activeContributors || 0}</div>
            </div>
            <div className="p-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-1">
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider block">Pending Invitations</span>
              <div className="text-2xl font-extrabold text-amber-500 font-display">{collabOverview?.pendingInvitations || 0}</div>
            </div>
          </div>

          <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden bg-white dark:bg-[#09090b]">
            {collabLoading ? (
              <div className="text-center py-12 text-zinc-500">Loading collaborators directory...</div>
            ) : collaborators?.length === 0 ? (
              <div className="text-center py-12 text-zinc-500">No collaborators registered yet.</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="dark:bg-zinc-900/80 dark:text-zinc-400 border-b dark:border-zinc-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Collaborator Name</th>
                    <th className="p-3.5">Role Title</th>
                    <th className="p-3.5">Skills</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800/60">
                  {collaborators?.map((c: any) => (
                    <tr key={c.id} className="dark:hover:bg-zinc-800/20">
                      <td className="p-3.5">
                        <div className="font-bold dark:text-white">{c.fullName}</div>
                        <div className="text-[10px] text-zinc-500">{c.email}</div>
                      </td>
                      <td className="p-3.5 font-bold text-accent-violet">{c.roleTitle}</td>
                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(c.skills) && c.skills.map((sk: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] dark:bg-zinc-800 dark:text-zinc-300 border dark:border-zinc-700">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-green-500/10 text-green-400 border border-green-500/20">
                          {c.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-zinc-500 text-[10px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Modal: Record Contribution */}
      <AdminModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Support Contribution & Multi-Module Sync"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={recordForm.supporterName}
              onChange={(e) => setRecordForm({ ...recordForm, supporterName: e.target.value })}
              className={inputCls}
              placeholder="e.g. Denis Chamkaga"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email" required>
              <input
                type="email"
                required
                value={recordForm.supporterEmail}
                onChange={(e) => setRecordForm({ ...recordForm, supporterEmail: e.target.value })}
                className={inputCls}
                placeholder="supporter@example.com"
              />
            </FormField>
            <FormField label="Phone">
              <input
                type="text"
                value={recordForm.supporterPhone}
                onChange={(e) => setRecordForm({ ...recordForm, supporterPhone: e.target.value })}
                className={inputCls}
                placeholder="+255 700 000 000"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Support Tier" required>
              <select
                value={recordForm.tier}
                onChange={(e) => setRecordForm({ ...recordForm, tier: e.target.value })}
                className={selectCls}
              >
                <option value="SEED">🌱 Seed Supporter (5,000 TZS+)</option>
                <option value="GROWTH">🚀 Growth Supporter (20,000 TZS+)</option>
                <option value="VISION_BUILDER">⭐ Vision Builder (50,000 TZS+)</option>
                <option value="MISSION_CHAMPION">❤️ Mission Champion (100,000 TZS+)</option>
                <option value="CUSTOM">❤️ Custom Support</option>
              </select>
            </FormField>
            <FormField label="Contribution Amount (TZS)" required>
              <input
                type="number"
                required
                value={recordForm.amount}
                onChange={(e) => setRecordForm({ ...recordForm, amount: +e.target.value })}
                className={inputCls}
              />
            </FormField>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setIsRecordModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={recordContributionMutation.isPending}>
              Record & Sync Workflow
            </Button>
          </div>
        </form>
      </AdminModal>

      {/* Modal: Add Collaborator */}
      <AdminModal
        isOpen={isCollaboratorModalOpen}
        onClose={() => setIsCollaboratorModalOpen(false)}
        title="Add Collaborator Profile"
      >
        <form onSubmit={handleCollabSubmit} className="space-y-4">
          <FormField label="Full Name" required>
            <input
              type="text"
              required
              value={collabForm.fullName}
              onChange={(e) => setCollabForm({ ...collabForm, fullName: e.target.value })}
              className={inputCls}
            />
          </FormField>
          <FormField label="Email" required>
            <input
              type="email"
              required
              value={collabForm.email}
              onChange={(e) => setCollabForm({ ...collabForm, email: e.target.value })}
              className={inputCls}
            />
          </FormField>
          <FormField label="Role Title" required>
            <select
              value={collabForm.roleTitle}
              onChange={(e) => setCollabForm({ ...collabForm, roleTitle: e.target.value })}
              className={selectCls}
            >
              <option value="Developer">Developer</option>
              <option value="Designer">Designer</option>
              <option value="Writer">Writer</option>
              <option value="Researcher">Researcher</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Advisor">Advisor</option>
              <option value="Business Partner">Business Partner</option>
            </select>
          </FormField>
          <FormField label="Skills (comma-separated)">
            <input
              type="text"
              value={collabForm.skills}
              onChange={(e) => setCollabForm({ ...collabForm, skills: e.target.value })}
              className={inputCls}
              placeholder="React, TypeScript, Node.js"
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-4 border-t dark:border-zinc-800">
            <Button variant="outline" type="button" onClick={() => setIsCollaboratorModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={upsertCollaboratorMutation.isPending}>
              Save Profile
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
};
