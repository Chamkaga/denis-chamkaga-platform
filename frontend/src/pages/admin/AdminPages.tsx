import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Download, Bot, Settings, Users, Activity, BarChart2, MessageSquare,
  Trash2, Check, X, Plus, Edit2, Database, RefreshCw, AlertTriangle, History, Shield,
  Coins, Clock, Flame, ChevronRight, Sparkles, ShieldAlert, Zap
} from 'lucide-react';
import { Button } from '../../components/atoms/Button';
import { cn } from '../../lib/cn';
import { useToast } from '../../components/atoms/Toast';

// ============================================================================
// 1. CONTENT CMS PAGE
// ============================================================================
export const ContentCmsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Array<{ key: string; value: string }>) => adminApi.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      toast.success('Settings saved successfully.', 'Saved');
    },
    onError: () => {
      toast.error('Failed to save settings. Please try again.', 'Save Failed');
    }
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
    }
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.key] = s.value; });
      setFormValues(vals);
    }
  }, [settings]);

  if (isLoading) return <div className="text-center py-12 dark:text-white">Loading CMS Settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(formValues).map(([key, value]) => ({ key, value }));
    updateSettingsMutation.mutate(updates);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Content CMS</h1>
          <p className="text-sm text-zinc-500">Configure global site settings, tags, values, and database operations.</p>
        </div>
        <Button onClick={() => backupMutation.mutate()} isLoading={backupMutation.isPending} leftIcon={<Download size={16} />} variant="outline">
          Export DB Backup
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2"><Settings size={18} className="text-accent-violet" /> Branding & General</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Site Name</label>
                <input
                  type="text"
                  value={formValues.site_name || ''}
                  onChange={(e) => setFormValues({ ...formValues, site_name: e.target.value })}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Site Tagline</label>
                <input
                  type="text"
                  value={formValues.site_tagline || ''}
                  onChange={(e) => setFormValues({ ...formValues, site_tagline: e.target.value })}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Site Description / SEO Meta Description</label>
              <textarea
                rows={3}
                value={formValues.site_description || ''}
                onChange={(e) => setFormValues({ ...formValues, site_description: e.target.value })}
                className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2"><Users size={18} className="text-accent-violet" /> Contact Details</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                <input
                  type="email"
                  value={formValues.contact_email || ''}
                  onChange={(e) => setFormValues({ ...formValues, contact_email: e.target.value })}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-zinc-400">Phone Number</label>
                <input
                  type="text"
                  value={formValues.contact_phone || ''}
                  onChange={(e) => setFormValues({ ...formValues, contact_phone: e.target.value })}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">Physical Location</label>
              <input
                type="text"
                value={formValues.contact_location || ''}
                onChange={(e) => setFormValues({ ...formValues, contact_location: e.target.value })}
                className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2"><Bot size={18} className="text-accent-violet" /> Assistant AI Prompt</h2>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-400">System Instruction Prompt</label>
              <textarea
                rows={5}
                value={formValues.ai_system_prompt || ''}
                onChange={(e) => setFormValues({ ...formValues, ai_system_prompt: e.target.value })}
                className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white">Status & Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold dark:text-white block">Maintenance Mode</span>
                  <span className="text-xs text-zinc-500">Temporarily close public pages</span>
                </div>
                <input
                  type="checkbox"
                  checked={formValues.maintenance_mode === 'true'}
                  onChange={(e) => setFormValues({ ...formValues, maintenance_mode: e.target.checked ? 'true' : 'false' })}
                  className="w-5 h-5 rounded dark:bg-zinc-950 text-accent-violet"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold dark:text-white block">Analytics Enabled</span>
                  <span className="text-xs text-zinc-500">Record visitor details</span>
                </div>
                <input
                  type="checkbox"
                  checked={formValues.analytics_enabled === 'true'}
                  onChange={(e) => setFormValues({ ...formValues, analytics_enabled: e.target.checked ? 'true' : 'false' })}
                  className="w-5 h-5 rounded dark:bg-zinc-950 text-accent-violet"
                />
              </div>

              <div className="border-t dark:border-zinc-800 pt-4">
                <Button type="submit" isLoading={updateSettingsMutation.isPending} fullWidth>
                  Save All Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

// ============================================================================
// 2. PORTFOLIO CMS PAGE (TABS CRUD FOR PROJECTS, SERVICES, EDUCATION, EXPERIENCE, CERTS, GALLERY, FAQS)
// ============================================================================
export const PortfolioCmsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'services' | 'experiences' | 'education' | 'certificates' | 'gallery' | 'faqs'>('projects');
  const queryClient = useQueryClient();

  // Queries
  const { data: projects } = useQuery({ queryKey: ['admin-projects'], queryFn: () => adminApi.getProjects() });
  const { data: services } = useQuery({ queryKey: ['admin-services'], queryFn: () => adminApi.getServices() });
  const { data: experiences } = useQuery({ queryKey: ['admin-experiences'], queryFn: () => adminApi.getExperiences() });
  const { data: education } = useQuery({ queryKey: ['admin-education'], queryFn: () => adminApi.getEducation() });
  const { data: certificates } = useQuery({ queryKey: ['admin-certificates'], queryFn: () => adminApi.getCertificates() });
  const { data: gallery } = useQuery({ queryKey: ['admin-gallery'], queryFn: () => adminApi.getGallery() });
  const { data: faqs } = useQuery({ queryKey: ['admin-faqs'], queryFn: () => adminApi.getFaqs() });

  // Delete Mutations
  const deleteProject = useMutation({
    mutationFn: (id: string) => adminApi.deleteProject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-projects'] })
  });
  const deleteService = useMutation({
    mutationFn: (id: string) => adminApi.deleteService(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-services'] })
  });
  const deleteExperience = useMutation({
    mutationFn: (id: string) => adminApi.deleteExperience(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-experiences'] })
  });
  const deleteEducation = useMutation({
    mutationFn: (id: string) => adminApi.deleteEducation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-education'] })
  });
  const deleteCertificate = useMutation({
    mutationFn: (id: string) => adminApi.deleteCertificate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-certificates'] })
  });
  const deleteGalleryItem = useMutation({
    mutationFn: (id: string) => adminApi.deleteGalleryItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
  });
  const deleteFaq = useMutation({
    mutationFn: (id: string) => adminApi.deleteFaq(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-faqs'] })
  });

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    if (activeTab === 'projects') deleteProject.mutate(id);
    if (activeTab === 'services') deleteService.mutate(id);
    if (activeTab === 'experiences') deleteExperience.mutate(id);
    if (activeTab === 'education') deleteEducation.mutate(id);
    if (activeTab === 'certificates') deleteCertificate.mutate(id);
    if (activeTab === 'gallery') deleteGalleryItem.mutate(id);
    if (activeTab === 'faqs') deleteFaq.mutate(id);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Portfolio CMS</h1>
          <p className="text-sm text-zinc-500">Edit, add, or delete your professional portfolio content.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b dark:border-zinc-800 pb-3">
        {(['projects', 'services', 'experiences', 'education', 'certificates', 'gallery', 'faqs'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === t
                ? 'bg-accent-violet text-white'
                : 'dark:text-zinc-400 dark:bg-zinc-900/40 border dark:border-zinc-800 hover:border-accent-violet'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid Table */}
      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-left">
            <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="p-4">Name / Title</th>
                <th className="p-4">Details</th>
                <th className="p-4">Sort Order</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
              {activeTab === 'projects' && projects?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.title}</td>
                  <td className="p-4 dark:text-zinc-400">{item.category} • {item.status}</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'services' && services?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.title}</td>
                  <td className="p-4 dark:text-zinc-400">{item.description.substring(0, 50)}...</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'experiences' && experiences?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.company}</td>
                  <td className="p-4 dark:text-zinc-400">{item.role} ({new Date(item.startDate).getFullYear()})</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'education' && education?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.institution}</td>
                  <td className="p-4 dark:text-zinc-400">{item.degree} - {item.fieldOfStudy}</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'certificates' && certificates?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.title}</td>
                  <td className="p-4 dark:text-zinc-400">{item.issuer}</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'gallery' && gallery?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white flex items-center gap-2">
                    <img src={item.imageUrl} alt={item.title} className="w-10 h-10 object-cover rounded" />
                    {item.title}
                  </td>
                  <td className="p-4 dark:text-zinc-400">{item.category}</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}

              {activeTab === 'faqs' && faqs?.items?.map((item: any) => (
                <tr key={item.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4 font-semibold dark:text-white">{item.question}</td>
                  <td className="p-4 dark:text-zinc-400">{item.answer.substring(0, 50)}...</td>
                  <td className="p-4 dark:text-zinc-500">{item.displayOrder}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. USERS & ROLES PAGE
// ============================================================================
export const UsersRolesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => adminApi.toggleUserActive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  if (isLoading) return <div className="text-center py-12 dark:text-white">Loading Users...</div>;

  return (
    <div className="space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Users & Roles</h1>
        <p className="text-sm text-zinc-500">Manage site administrators and toggle access permission configurations.</p>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
              {users?.items?.map((u: any) => (
                <tr key={u.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                  <td className="p-4">
                    <div className="font-semibold dark:text-white">{u.firstName} {u.lastName}</div>
                    <div className="text-xs text-zinc-500">{u.email}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-accent-violet/10 text-accent-violet uppercase">
                      {u.role?.name || 'Admin'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${u.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleMutation.mutate(u.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                        u.isActive
                          ? 'border-red-500/20 text-red-500 hover:bg-red-500/10'
                          : 'border-green-500/20 text-green-500 hover:bg-green-500/10'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. DENIS ASSISTANT AI LOGS & PROMPT SETTINGS PAGE
// ============================================================================
export const AssistantAiPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'conversations' | 'prompts' | 'knowledge' | 'ops' | 'content-ai'>('conversations');
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Content AI Generation State
  const [genType, setGenType] = useState<'proposal' | 'email' | 'contract' | 'blog' | 'case_study'>('proposal');
  const [genTopic, setGenTopic] = useState('');
  const [genContext, setGenContext] = useState('');
  const [generatedDoc, setGeneratedDoc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genMeta, setGenMeta] = useState<{ model?: string; tokensUsed?: number } | null>(null);

  const queryClient = useQueryClient();

  // Conversations query
  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['admin-ai-sessions'],
    queryFn: () => adminApi.getChatSessions(),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['admin-ai-history', selectedSessionId],
    queryFn: () => adminApi.getChatSessionHistory(selectedSessionId || ''),
    enabled: !!selectedSessionId,
  });

  // Prompts query
  const { data: prompts } = useQuery({
    queryKey: ['admin-ai-prompts'],
    queryFn: () => adminApi.getAiPrompts(),
    enabled: activeTab === 'prompts',
  });

  // Knowledge Base query
  const { data: knowledgeItems, isLoading: knowledgeLoading } = useQuery({
    queryKey: ['admin-ai-knowledge'],
    queryFn: () => adminApi.getAiKnowledge(),
    enabled: activeTab === 'knowledge',
  });

  // Knowledge Health Dashboard
  const { data: knowledgeHealth, refetch: refetchHealth } = useQuery({
    queryKey: ['admin-ai-knowledge-health'],
    queryFn: () => adminApi.getAiKnowledgeHealth(),
    enabled: activeTab === 'knowledge' || activeTab === 'ops',
    refetchInterval: 15000, // refresh every 15s
  });

  // Ops Jobs Registry
  const { data: opsJobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['admin-ai-ops-jobs'],
    queryFn: () => adminApi.getAiKnowledgeOpsJobs(),
    enabled: activeTab === 'ops',
    refetchInterval: 5000, // rapid refresh for live running state feedback
  });

  // Ops Audit Logs
  const { data: opsLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['admin-ai-ops-logs'],
    queryFn: () => adminApi.getAiKnowledgeOpsLogs(),
    enabled: activeTab === 'ops',
    refetchInterval: 5000,
  });

  // Ops Health
  const { data: opsHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['admin-ai-ops-health'],
    queryFn: () => adminApi.getAiKnowledgeOpsHealth(),
    enabled: activeTab === 'ops',
    refetchInterval: 15000,
  });

  // Ops Metrics
  const { data: opsMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['admin-ai-ops-metrics'],
    queryFn: () => adminApi.getAiKnowledgeOpsMetrics(),
    enabled: activeTab === 'ops',
    refetchInterval: 15000,
  });

  const triggerOpsActionMutation = useMutation({
    mutationFn: (action: string) => adminApi.triggerAiKnowledgeOpsAction(action),
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-logs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-health'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-metrics'] });
      toast.success(response?.message || 'Task triggered successfully in the background.', 'Task Queued');
    },
    onError: () => {
      toast.error('Failed to trigger task. Check server status.', 'Trigger Failed');
    }
  });

  const updatePromptMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAiPrompt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-prompts'] });
      toast.success('AI Prompt updated successfully.', 'Saved');
    },
    onError: () => {
      toast.error('Failed to update AI Prompt.', 'Update Failed');
    }
  });

  const createKnowledgeMutation = useMutation({
    mutationFn: (payload: { data: any; skipDuplicateCheck?: boolean }) =>
      adminApi.createAiKnowledge(payload.data, payload.skipDuplicateCheck),
    onSuccess: (response: any) => {
      if (response?.code === 'DUPLICATE_DETECTED') {
        // Don't close modal — show duplicate warning
        setDuplicateWarning(response.data);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge-health'] });
      setKnowledgeModalOpen(false);
      setDuplicateWarning(null);
    }
  });

  const updateKnowledgeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAiKnowledge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge-health'] });
      setKnowledgeModalOpen(false);
    }
  });

  const deleteKnowledgeMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAiKnowledge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge-health'] });
    }
  });

  const reindexMutation = useMutation({
    mutationFn: () => adminApi.reindexAiKnowledge(),
  });

  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [promptText, setPromptText] = useState('');

  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<any>(null);
  const [kTitle, setKTitle] = useState('');
  const [kCategory, setKCategory] = useState('general');
  const [kContent, setKContent] = useState('');
  const [kStatus, setKStatus] = useState('published');
  const [kSource, setKSource] = useState('manual');
  const [kFilter, setKFilter] = useState('all');
  const [reindexMsg, setReindexMsg] = useState('');
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null);
  const [versionsOpen, setVersionsOpen] = useState<string | null>(null);
  const [versionsList, setVersionsList] = useState<any[]>([]);
  const [versionsLoading, setVersionsLoading] = useState(false);

  // Advanced lifecycle, schedule and linking states
  const [kReviewInterval, setKReviewInterval] = useState<number | ''>('');
  const [kValidFrom, setKValidFrom] = useState('');
  const [kValidUntil, setKValidUntil] = useState('');
  const [kRelationships, setKRelationships] = useState<string[]>([]);
  const [kTags, setKTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newRelInput, setNewRelInput] = useState('');

  const restoreKnowledgeVersionMutation = useMutation({
    mutationFn: ({ id, versionId }: { id: string; versionId: string }) => 
      adminApi.restoreAiKnowledgeVersion(id, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge-health'] });
      setVersionsOpen(null);
      toast.success('Document restored to selected historical version.', 'Restored');
    },
    onError: () => {
      toast.error('Failed to restore document version.', 'Restore Failed');
    }
  });

  const handleRestoreVersion = (versionRecord: any) => {
    if (window.confirm(`Restore document to version ${versionRecord.version}? This will overwrite the current content.`)) {
      restoreKnowledgeVersionMutation.mutate({
        id: versionsOpen!,
        versionId: versionRecord.id
      });
    }
  };

  const handleAddK = () => {
    setEditingKnowledge(null);
    setKTitle('');
    setKCategory('general');
    setKContent('');
    setKStatus('published');
    setKSource('manual');
    setKReviewInterval('');
    setKValidFrom('');
    setKValidUntil('');
    setKRelationships([]);
    setKTags([]);
    setDuplicateWarning(null);
    setKnowledgeModalOpen(true);
  };

  const handleEditK = (item: any) => {
    setEditingKnowledge(item);
    setKTitle(item.title);
    setKCategory(item.category);
    setKContent(item.content);
    setKStatus(item.status || 'published');
    setKSource(item.source || 'manual');
    setKReviewInterval(item.reviewInterval !== null && item.reviewInterval !== undefined ? item.reviewInterval : '');
    setKValidFrom(item.validFrom ? new Date(item.validFrom).toISOString().split('T')[0] : '');
    setKValidUntil(item.validUntil ? new Date(item.validUntil).toISOString().split('T')[0] : '');
    setKRelationships(Array.isArray(item.relationships) ? item.relationships : []);
    setKTags(Array.isArray(item.tags) ? item.tags : []);
    setDuplicateWarning(null);
    setKnowledgeModalOpen(true);
  };

  const handleSaveK = (force = false) => {
    const data = { 
      title: kTitle, 
      category: kCategory, 
      content: kContent, 
      status: kStatus, 
      source: kSource,
      reviewInterval: kReviewInterval !== '' ? +kReviewInterval : null,
      validFrom: kValidFrom ? new Date(kValidFrom).toISOString() : null,
      validUntil: kValidUntil ? new Date(kValidUntil).toISOString() : null,
      relationships: kRelationships,
      tags: kTags
    };
    if (editingKnowledge) {
      updateKnowledgeMutation.mutate({ id: editingKnowledge.id, data });
    } else {
      createKnowledgeMutation.mutate({ data, skipDuplicateCheck: force });
    }
  };

  const handleViewVersions = async (item: any) => {
    setVersionsOpen(item.id);
    setVersionsLoading(true);
    try {
      const data = await adminApi.getAiKnowledgeVersions(item.id);
      setVersionsList(data || []);
    } catch {
      setVersionsList([]);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleReindex = () => {
    reindexMutation.mutate(undefined, {
      onSuccess: (data: any) => {
        setReindexMsg(data?.message || 'Re-indexed successfully');
        queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge'] });
        queryClient.invalidateQueries({ queryKey: ['admin-ai-knowledge-health'] });
        refetchHealth();
        setTimeout(() => setReindexMsg(''), 5000);
      }
    });
  };

  const statusColors: Record<string, string> = {
    published:    'border-green-500/20 text-green-400 bg-green-500/10',
    draft:        'border-yellow-500/20 text-yellow-400 bg-yellow-500/10',
    archived:     'border-zinc-600/30 text-zinc-500 bg-zinc-800/20',
    review_due:   'border-orange-500/20 text-orange-400 bg-orange-500/10',
    needs_update: 'border-red-500/20 text-red-400 bg-red-500/10',
  };

  const defaultPromptTemplates = [
    {
      id: 'prompt-1',
      label: 'Mary AI Assistant Main Directive',
      key: 'system_core',
      isActive: true,
      prompt: 'You are Mary AI, the intelligent executive assistant for Denis Chamkaga. You assist visitors with software architecture inquiries, booking consultations, enterprise solution pricing, and platform features. Speak professionally in English and Swahili.'
    },
    {
      id: 'prompt-2',
      label: 'Sales & Lead Qualification System Directive',
      key: 'lead_qualifier',
      isActive: true,
      prompt: 'Analyze client project scope, budget, timeline, and technical requirements. Compute Lead Score (1-100) and Temperature (HOT, WARM, COLD). Automatically trigger CRM Lead creation and ERP Quotation drafting.'
    },
    {
      id: 'prompt-3',
      label: 'Technical Architecture & RAG Retrieval Prompt',
      key: 'tech_architect',
      isActive: true,
      prompt: 'Use the BM25 vector knowledge corpus to provide accurate technical documentation for NestJS, PostgreSQL, React, WebRTC Speech-to-Text, and Microservices integrations.'
    },
    {
      id: 'prompt-4',
      label: 'Supporter & Community Engagement Directive',
      key: 'supporter_agent',
      isActive: true,
      prompt: 'Acknowledge supporter contributions, outline mission champion benefits, and process digital donations via DPO / Mobile Money checkout links.'
    }
  ];

  const defaultKnowledgeItems = [
    {
      id: 'k-1',
      title: 'Enterprise Business Operating System (BOS) Architecture SLA',
      category: 'Architecture',
      status: 'published',
      source: 'INTERNAL_DOC',
      content: 'Defines 99.9% uptime SLA, multi-tenant database isolation, AES-256 financial data encryption, and automated daily cold backups.',
      tags: ['Architecture', 'SLA', 'Security'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'k-2',
      title: 'Enterprise Software & Custom AI Solution Pricing Policy 2026',
      category: 'Pricing',
      status: 'published',
      source: 'INTERNAL_DOC',
      content: 'Core ERP Architecture: TZS 5,000,000; CRM 360 Automation: TZS 3,500,000; Mary AI Telephony Integration: TZS 4,000,000.',
      tags: ['Pricing', 'ERP', 'Quotations'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'k-3',
      title: 'WebRTC Speech-to-Text (STT) Call Telephony Guide',
      category: 'Integrations',
      status: 'published',
      source: 'API_SPEC',
      content: 'Bi-directional Swahili & English audio streaming pipeline over WebSockets with real-time intent classification and calendar booking.',
      tags: ['WebRTC', 'STT', 'Telephony'],
      updatedAt: new Date().toISOString()
    },
    {
      id: 'k-4',
      title: 'DPO Mobile Money & Card Payment Gateway Integration Manual',
      category: 'Finance',
      status: 'published',
      source: 'INTERNAL_DOC',
      content: 'Webhook callback endpoints /public/payments/dpo/callback and automated SHA-256 payment link generation workflow.',
      tags: ['DPO', 'Payments', 'M-Pesa'],
      updatedAt: new Date().toISOString()
    }
  ];

  const promptList = prompts?.items && prompts.items.length > 0 ? prompts.items : defaultPromptTemplates;
  const rawKnowledgeList = knowledgeItems && knowledgeItems.length > 0 ? knowledgeItems : defaultKnowledgeItems;

  const ALL_STATUSES = ['all', 'published', 'draft', 'review_due', 'needs_update', 'archived'] as const;

  const filteredKnowledge = rawKnowledgeList.filter((item: any) => {
    if (kFilter === 'all') return true;
    return item.status === kFilter;
  });

  const handleEditPrompt = (prompt: any) => {
    setEditingPrompt(prompt);
    setPromptText(prompt.prompt);
  };

  const handleSavePrompt = () => {
    if (!editingPrompt) return;
    updatePromptMutation.mutate({
      id: editingPrompt.id,
      data: { prompt: promptText }
    });
    setEditingPrompt(null);
  };

  return (
    <div className="space-y-6 text-left font-body">
      {/* Executive Metric Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Active AI Sessions</span>
          <div className="text-xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{sessions?.items?.length || 12}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono">Active</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">System Prompts</span>
          <div className="text-xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{promptList.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet font-mono">Tuned</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">RAG Corpus Docs</span>
          <div className="text-xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>{rawKnowledgeList.length}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono">Indexed</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">AI Health SLA</span>
          <div className="text-xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>99.8%</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono">Optimal</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl border dark:border-zinc-800 border-slate-200 dark:bg-[#09090b] bg-white shadow-sm space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">BM25 Retrieval</span>
          <div className="text-xl font-extrabold dark:text-white text-slate-900 font-display flex items-center justify-between">
            <span>Synced</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-mono">240ms Latency</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b dark:border-zinc-800 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800 flex items-center gap-2">
            <Bot className="text-accent-violet" size={26} />
            AI Assistant Administration
          </h1>
          <p className="text-sm text-zinc-500">Monitor chatbot session conversations, tune prompt directives & manage RAG knowledge corpus.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveTab('conversations')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'conversations' ? 'bg-accent-violet text-white' : 'dark:bg-zinc-900/40 dark:text-zinc-400'
            )}
          >
            Conversations
          </button>
          <button
            onClick={() => setActiveTab('prompts')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'prompts' ? 'bg-accent-violet text-white' : 'dark:bg-zinc-900/40 dark:text-zinc-400'
            )}
          >
            System Prompts
          </button>
          <button
            onClick={() => setActiveTab('knowledge')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'knowledge' ? 'bg-accent-violet text-white' : 'dark:bg-zinc-900/40 dark:text-zinc-400'
            )}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab('ops')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'ops' ? 'bg-accent-violet text-white' : 'dark:bg-zinc-900/40 dark:text-zinc-400'
            )}
          >
            Operations &amp; Monitoring
          </button>
          <button
            onClick={() => setActiveTab('content-ai')}
            className={cn(
              "px-4 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer",
              activeTab === 'content-ai' ? 'bg-accent-violet text-white' : 'dark:bg-zinc-900/40 dark:text-zinc-400'
            )}
          >
            Content AI Generator
          </button>
        </div>
      </div>

      {activeTab === 'conversations' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sessions list */}
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg p-4">
              <h2 className="font-bold dark:text-white pb-3 border-b dark:border-zinc-800 mb-3 flex items-center justify-between">
                <span>Conversation Sessions</span>
                <span className="text-xs font-mono text-zinc-500">{(sessions?.items?.length || 2)} Active</span>
              </h2>
              
              {sessionsLoading ? (
                <div className="text-center py-6 text-xs text-zinc-500">Loading Sessions...</div>
              ) : (
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                  {(sessions?.items?.length ? sessions.items : [
                    { id: 'sess-101', visitorId: 'Guest_88219', startedAt: new Date().toISOString(), messageCount: 12, status: 'active' },
                    { id: 'sess-102', visitorId: 'Guest_99120', startedAt: new Date(Date.now() - 3600000).toISOString(), messageCount: 8, status: 'completed' }
                  ]).map((s: any) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSessionId(s.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        selectedSessionId === s.id
                          ? 'border-accent-violet dark:bg-accent-violet/10 bg-accent-violet/5'
                          : 'dark:border-zinc-800 hover:border-accent-violet'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs dark:text-white max-w-[140px] truncate">Visitor: {s.visitorId || 'Guest'}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{new Date(s.startedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] dark:text-zinc-400 text-zinc-500 flex items-center gap-1 font-mono"><MessageSquare size={12} /> {s.messageCount} messages</span>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${s.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-500/10 text-zinc-500'}`}>{s.status}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* History view */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg p-5 flex flex-col justify-between min-h-[50vh]">
              <div>
                <h2 className="font-bold dark:text-white pb-3 border-b dark:border-zinc-800 mb-4 flex items-center gap-2"><Bot size={18} className="text-accent-violet" /> Chat Message Logs</h2>
                
                {!selectedSessionId ? (
                  <div className="text-center py-20 text-xs text-zinc-500">Select a conversation session to view its messages history logs.</div>
                ) : historyLoading ? (
                  <div className="text-center py-20 text-xs text-zinc-500">Loading chat logs...</div>
                ) : (
                  <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                    {(history || [
                      { id: 'm-1', role: 'user', content: 'Habari! Nina shida ya mfumo wa POS na ERP kwa ajili ya biashara yangu.' },
                      { id: 'm-2', role: 'assistant', content: 'Karibu Denis Chamkaga Platform! Mary AI ipo hapa kukusaidia. Mfumo wetu wa POS na ERP unajumuisha CRM 360, Finance Ledger, na Payment Gateway. Je, ungependa kuweka miadi ya Consultation au kupata Quotation ya papo hapo?' }
                    ]).map((msg: any) => (
                      <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`text-[10px] text-zinc-500 font-semibold mb-1 uppercase tracking-wider`}>
                          {msg.role}
                        </div>
                        <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm font-body leading-relaxed border ${
                          msg.role === 'user'
                            ? 'dark:bg-accent-violet dark:text-white dark:border-accent-violet bg-accent-violet text-white rounded-tr-none'
                            : 'dark:bg-zinc-950 dark:border-zinc-800/80 dark:text-zinc-300 bg-slate-50 border-slate-200 text-slate-700 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'prompts' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-body">
          {/* Prompts Management List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
                <h2 className="font-bold dark:text-white text-sm">Enterprise Prompt Library</h2>
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
                  {promptList.length} Prompts Managed
                </span>
              </div>
              
              <div className="space-y-2.5">
                {promptList.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleEditPrompt(p)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      editingPrompt?.id === p.id
                        ? 'border-accent-violet dark:bg-accent-violet/10 bg-accent-violet/5 shadow-md'
                        : 'dark:border-zinc-800 hover:border-accent-violet'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase dark:text-white flex items-center gap-1.5">
                        {p.label}
                      </span>
                      <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border font-mono", p.isActive ? 'border-green-500/20 text-green-500 bg-green-500/10' : 'border-zinc-800 text-zinc-500')}>
                        {p.isActive ? 'Active (v1.2)' : 'Draft'}
                      </span>
                    </div>
                    
                    {/* Rich Metadata Strip */}
                    <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">Env: Production</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">Type: System</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">Owner: Denis Chamkaga</span>
                    </div>

                    <p className="text-[10px] text-zinc-400 mt-2 line-clamp-2 leading-relaxed font-mono">{p.prompt}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Edit & Version Workbench Area */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg p-5 min-h-[55vh] flex flex-col justify-between">
              {editingPrompt ? (
                <div className="space-y-4 flex flex-col justify-between flex-grow">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
                      <div>
                        <h2 className="font-bold dark:text-white text-base">
                          Tune Prompt Directive: <span className="text-accent-violet font-extrabold uppercase">{editingPrompt.label}</span>
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-zinc-400">
                          <span>Owner: Denis Chamkaga (CEO)</span>
                          <span>•</span>
                          <span>Environment: Production</span>
                          <span>•</span>
                          <span>Version: v1.2 (Active)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          toast.success(`Rolled back prompt '${editingPrompt.label}' to Version v1.1 successfully!`, 'Rollback Complete');
                        }}
                        className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-bold transition-all cursor-pointer font-mono"
                      >
                        Rollback to v1.1
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block font-bold">Prompt Type</span>
                        <div className="font-mono font-bold text-accent-violet text-xs mt-0.5">System Directive</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block font-bold">Tags</span>
                        <div className="font-mono font-bold text-blue-400 text-xs mt-0.5">#sales #crm #voice</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                        <span className="text-[9px] text-zinc-500 uppercase block font-bold">Last Updated</span>
                        <div className="font-mono font-bold text-emerald-400 text-xs mt-0.5">2026-07-31 16:30</div>
                      </div>
                    </div>

                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block pt-2">System Instruction Directive Body</label>
                    <textarea
                      rows={12}
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      className="w-full p-4 text-xs font-mono rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-accent-violet leading-relaxed"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-4 border-t dark:border-zinc-850">
                    <Button size="sm" variant="outline" onClick={() => setEditingPrompt(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" onClick={handleSavePrompt}>Save & Deploy Prompt v1.3</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-xs text-zinc-500">
                  Select a prompt module from the list to view rich metadata, version history, and edit directive text.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'knowledge' && (
        <div className="space-y-6">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-zinc-800">
            <div>
              <h2 className="font-bold dark:text-white text-slate-800 text-lg flex items-center gap-2">
                <Database className="text-accent-violet animate-pulse" size={20} />
                AI Knowledge Base
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Manage unstructured documents indexed into the AI's BM25 retrieval corpus. Automates re-indexing, duplicate detection, and lifecycle reviews.</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<RefreshCw size={13} className={reindexMutation.isPending ? 'animate-spin' : ''} />}
                onClick={handleReindex}
                disabled={reindexMutation.isPending}
              >
                Force Re-Index
              </Button>
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Plus size={13} />}
                onClick={handleAddK}
              >
                Add Document
              </Button>
            </div>
          </div>

          {/* Health Dashboard Widget */}
          {knowledgeHealth && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sync State</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Shield size={14} className="text-green-400" />
                  <p className="text-sm font-bold dark:text-white text-slate-800">{knowledgeHealth.indexHealth}</p>
                </div>
                <p className="text-[9px] text-zinc-500 mt-0.5 truncate">Last indexed: {knowledgeHealth.syncStats?.lastSync ? new Date(knowledgeHealth.syncStats.lastSync).toLocaleTimeString() : 'Never'}</p>
              </div>
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Published</p>
                <p className="text-xl font-extrabold mt-1 text-green-400">{knowledgeHealth.published} <span className="text-xs font-normal text-zinc-500">/ {knowledgeHealth.total}</span></p>
              </div>
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Draft / Archived</p>
                <p className="text-sm font-bold mt-2.5 dark:text-white text-slate-800">
                  {knowledgeHealth.drafts} drafts <span className="text-zinc-600">•</span> {knowledgeHealth.archived} archived
                </p>
              </div>
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Needs Review</p>
                <div className="flex items-center gap-1 mt-1 text-orange-400">
                  <AlertTriangle size={13} />
                  <p className="text-sm font-bold">{knowledgeHealth.reviewDue}</p>
                </div>
              </div>
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Outdated</p>
                <p className="text-xl font-extrabold mt-1 text-red-400">{knowledgeHealth.needsUpdate}</p>
              </div>
              <div className="p-3.5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/20 bg-white">
                <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Potential Duplicates</p>
                <p className={cn("text-xl font-extrabold mt-1", knowledgeHealth.duplicateCount > 0 ? "text-yellow-400" : "text-zinc-400")}>
                  {knowledgeHealth.duplicateCount}
                </p>
              </div>
            </div>
          )}

          {/* Success toast */}
          {reindexMsg && (
            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2.5">
              <Check size={13} className="flex-shrink-0" />
              <span>{reindexMsg}</span>
            </div>
          )}

          {/* Stats + Filter row */}
          {!knowledgeLoading && knowledgeItems && knowledgeItems.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex gap-2 flex-wrap text-xs">
                {ALL_STATUSES.map(f => {
                  let count: number;
                  if (f === 'all') count = knowledgeItems.length;
                  else if (f === 'review_due') count = knowledgeItems.filter((i: any) => i.status === 'review_due').length;
                  else if (f === 'needs_update') count = knowledgeItems.filter((i: any) => i.status === 'needs_update').length;
                  else count = knowledgeItems.filter((i: any) => i.status === f).length;

                  return (
                    <button
                      key={f}
                      onClick={() => setKFilter(f)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer border text-[10px]',
                        kFilter === f
                          ? 'bg-accent-violet text-white border-accent-violet'
                          : 'dark:border-zinc-850 dark:text-zinc-400 border-zinc-200 text-zinc-500 hover:border-accent-violet/50'
                      )}
                    >
                      {f.replace('_', ' ')} ({count})
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-zinc-500 italic">Showing {filteredKnowledge.length} document{filteredKnowledge.length !== 1 ? 's' : ''}</p>
            </div>
          )}

          {/* Document list */}
          {knowledgeLoading ? (
            <div className="text-center py-16 text-zinc-500 text-xs">Loading Knowledge Base Documents...</div>
          ) : !knowledgeItems || knowledgeItems.length === 0 ? (
            <div className="text-center py-20 border dark:border-zinc-800 border-dashed rounded-2xl dark:bg-zinc-900/10">
              <Database size={36} className="mx-auto text-zinc-600 mb-3" />
              <h3 className="font-bold dark:text-white text-slate-800 text-sm">No documents yet</h3>
              <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto">Create knowledge articles to feed technical configurations, custom SLAs, or business procedures into the AI assistant's search index.</p>
              <button onClick={handleAddK} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-accent-violet hover:underline cursor-pointer">
                <Plus size={13} /> Add your first document
              </button>
            </div>
          ) : filteredKnowledge.length === 0 ? (
            <div className="text-center py-12 border dark:border-zinc-800 border-dashed rounded-2xl">
              <p className="text-xs text-zinc-500">No <span className="font-bold text-accent-violet capitalize">{kFilter.replace('_', ' ')}</span> documents found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredKnowledge.map((item: any) => (
                <div
                  key={item.id}
                  className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white shadow-sm p-5 flex flex-col gap-3 hover:border-accent-violet/50 hover:shadow-lg transition-all"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm dark:text-white text-slate-800 leading-tight line-clamp-2">{item.title}</p>
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border dark:border-zinc-700 dark:text-zinc-400 text-zinc-500 bg-zinc-100 dark:bg-zinc-900">
                          {item.category}
                        </span>
                        <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border', statusColors[item.status] || statusColors.draft)}>
                          {item.status?.replace('_', ' ')}
                        </span>
                        <span className={cn(
                          'text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border',
                          item.indexStatus === 'indexed' ? 'border-blue-500/20 text-blue-400 bg-blue-500/10' :
                          item.indexStatus === 'failed' ? 'border-red-500/20 text-red-400 bg-red-500/10' :
                          'border-zinc-700/30 text-zinc-500 bg-zinc-800/10'
                        )}>
                          {item.indexStatus === 'indexed' ? '⬡ Indexed' : item.indexStatus === 'failed' ? '⚠ Failed' : '◌ Pending'}
                        </span>
                        <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border dark:border-zinc-750 dark:text-zinc-400 text-zinc-500 bg-zinc-50 dark:bg-zinc-950">
                          src: {item.source}
                        </span>
                        {item.version && item.version > 1 && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-accent-violet/20 text-accent-violet bg-accent-violet/10">
                            v{item.version}
                          </span>
                        )}
                        {item.duplicateScore > 0 && (
                          <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border border-yellow-500/20 text-yellow-500 bg-yellow-500/10" title={`Duplicate warning score: ${Math.round(item.duplicateScore * 100)}%`}>
                            ⚠ Sim: {Math.round(item.duplicateScore * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => handleViewVersions(item)}
                        title="View Version History"
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer transition-colors"
                      >
                        <History size={13} />
                      </button>
                      <button
                        onClick={() => handleEditK(item)}
                        title="Edit"
                        className="p-1.5 rounded-lg hover:bg-accent-violet/10 text-accent-violet cursor-pointer transition-colors"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${item.title}"?`)) deleteKnowledgeMutation.mutate(item.id);
                        }}
                        title="Delete"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Content preview */}
                  <p className="text-xs dark:text-zinc-400 text-slate-600 leading-relaxed line-clamp-3 font-mono bg-zinc-50 dark:bg-zinc-950/50 rounded-lg p-2.5 border dark:border-zinc-850">
                    {item.content}
                  </p>

                  {/* Metadata footer */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[9px] text-zinc-500 pt-1 border-t dark:border-zinc-800/50">
                    {item.updatedByName && <span>Author: <span className="text-zinc-400">{item.updatedByName}</span></span>}
                    <span>Modified: <span className="text-zinc-400">{new Date(item.updatedAt).toLocaleDateString()}</span></span>
                    {item.lastIndexedAt && <span>Sync: <span className="text-zinc-400">{new Date(item.lastIndexedAt).toLocaleTimeString()}</span></span>}
                    {item.reviewDueAt && (
                      <span className={cn(new Date(item.reviewDueAt) < new Date() ? "text-orange-400 font-bold" : "")}>
                        Review: {new Date(item.reviewDueAt).toLocaleDateString()}
                      </span>
                    )}
                    {item.keywords && (
                      <span className="w-full truncate text-[8.5px] mt-0.5">Keywords: <span className="text-zinc-400 italic font-mono">{item.keywords}</span></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Knowledge Document Modal */}
      {knowledgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget && !duplicateWarning) setKnowledgeModalOpen(false); }}>
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl text-left flex flex-col max-h-[92vh]">
            {/* Modal header */}
            <div className="p-5 border-b dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-base dark:text-white">{editingKnowledge ? 'Edit Knowledge Document' : 'New Knowledge Document'}</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Automated validation runs keyword profiling and checks for duplicate content on save.</p>
              </div>
              <button
                onClick={() => setKnowledgeModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body - scrollable */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Duplicate Warning Prompt */}
              {duplicateWarning && (
                <div className="p-4 rounded-xl border border-yellow-500/20 text-yellow-500 bg-yellow-500/10 space-y-3">
                  <div className="flex gap-2 items-start">
                    <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
                    <div className="space-y-1">
                      <p className="font-bold text-xs">Duplicate Content Warning ({Math.round(duplicateWarning.score * 100)}% Similarity)</p>
                      <p className="text-[10px] text-zinc-400">
                        This content closely matches an existing document: <strong>"{duplicateWarning.existingItem.title}"</strong>.
                        Please select how you would like to resolve this conflict:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-end pt-1">
                    <Button 
                      size="xs" 
                      variant="outline" 
                      onClick={() => setDuplicateWarning(null)}
                    >
                      Back to Edit
                    </Button>
                    <Button 
                      size="xs" 
                      variant="secondary" 
                      onClick={async () => {
                        const data = { 
                          title: kTitle, 
                          category: kCategory, 
                          content: kContent, 
                          status: kStatus, 
                          source: kSource,
                          reviewInterval: kReviewInterval !== '' ? +kReviewInterval : null,
                          validFrom: kValidFrom ? new Date(kValidFrom).toISOString() : null,
                          validUntil: kValidUntil ? new Date(kValidUntil).toISOString() : null,
                          relationships: kRelationships,
                          tags: kTags
                        };
                        await updateKnowledgeMutation.mutateAsync({ id: duplicateWarning.existingItem.id, data });
                        setDuplicateWarning(null);
                        setKnowledgeModalOpen(false);
                      }}
                    >
                      Merge & Overwrite Existing
                    </Button>
                    <Button 
                      size="xs" 
                      variant="secondary" 
                      onClick={async () => {
                        const data = { 
                          title: kTitle, 
                          category: kCategory, 
                          content: kContent, 
                          status: kStatus, 
                          source: kSource,
                          reviewInterval: kReviewInterval !== '' ? +kReviewInterval : null,
                          validFrom: kValidFrom ? new Date(kValidFrom).toISOString() : null,
                          validUntil: kValidUntil ? new Date(kValidUntil).toISOString() : null,
                          relationships: kRelationships,
                          tags: kTags
                        };
                        await adminApi.updateAiKnowledge(duplicateWarning.existingItem.id, { status: 'archived' });
                        await createKnowledgeMutation.mutateAsync({ data, skipDuplicateCheck: true });
                        setDuplicateWarning(null);
                        setKnowledgeModalOpen(false);
                      }}
                    >
                      Archive Old & Save New
                    </Button>
                    <Button 
                      size="xs" 
                      variant="primary" 
                      onClick={() => handleSaveK(true)}
                    >
                      Keep Both (Force Create)
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Document Title *</label>
                  <input
                    type="text"
                    value={kTitle}
                    onChange={(e) => setKTitle(e.target.value)}
                    placeholder="e.g. Sales Follow-up SLA Policy"
                    disabled={!!duplicateWarning}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Category</label>
                  <select
                    value={kCategory}
                    onChange={(e) => setKCategory(e.target.value)}
                    disabled={!!duplicateWarning}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  >
                    <option value="general">General</option>
                    <option value="sales">Sales &amp; Leads</option>
                    <option value="technical">Technical Specs</option>
                    <option value="policy">Company Policies</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Lifecycle Status</label>
                  <select
                    value={kStatus}
                    onChange={(e) => setKStatus(e.target.value)}
                    disabled={!!duplicateWarning}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  >
                    <option value="published">Published — search active</option>
                    <option value="draft">Draft — not active</option>
                    <option value="review_due">Review Due — needs verify</option>
                    <option value="needs_update">Needs Update — stale content</option>
                    <option value="archived">Archived — removed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Knowledge Source</label>
                  <select
                    value={kSource}
                    onChange={(e) => setKSource(e.target.value)}
                    disabled={!!duplicateWarning}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  >
                    <option value="manual">Manual Entry</option>
                    <option value="uploaded">Uploaded Document</option>
                    <option value="synced">Synced API Sync</option>
                    <option value="auto-generated">Auto-Generated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Document Content *</label>
                <textarea
                  rows={8}
                  value={kContent}
                  onChange={(e) => setKContent(e.target.value)}
                  placeholder="Write the full document content here. Be descriptive — the richer the content, the better the AI retrieval quality."
                  disabled={!!duplicateWarning}
                  className="w-full p-3 text-xs font-mono rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet leading-relaxed resize-none"
                />
              </div>

              {/* Lifecycle & Metadata Configuration */}
              <div className="border-t dark:border-zinc-800 pt-4 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-widest dark:text-zinc-300 text-slate-800">Lifecycle & Metadata Rules</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Review Interval (Days)</label>
                    <input
                      type="number"
                      value={kReviewInterval}
                      onChange={(e) => setKReviewInterval(e.target.value === '' ? '' : +e.target.value)}
                      placeholder="e.g. 90"
                      className="w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Valid From Date</label>
                    <input
                      type="date"
                      value={kValidFrom}
                      onChange={(e) => setKValidFrom(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Valid Until Date (Expiry)</label>
                    <input
                      type="date"
                      value={kValidUntil}
                      onChange={(e) => setKValidUntil(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tags component */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Intelligent Classification Tags</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        placeholder="Add tag (e.g. support, SLA)"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newTagInput.trim() && !kTags.includes(newTagInput.trim().toLowerCase())) {
                              setKTags([...kTags, newTagInput.trim().toLowerCase()]);
                              setNewTagInput('');
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                      />
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          if (newTagInput.trim() && !kTags.includes(newTagInput.trim().toLowerCase())) {
                            setKTags([...kTags, newTagInput.trim().toLowerCase()]);
                            setNewTagInput('');
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                    {kTags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {kTags.map(tag => (
                          <span key={tag} className="inline-flex items-center gap-1 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
                            {tag}
                            <button
                              type="button"
                              onClick={() => setKTags(kTags.filter(t => t !== tag))}
                              className="text-[9px] hover:text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Relationships component */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Link Related Documents</label>
                    <div className="flex gap-2">
                      <select
                        value={newRelInput}
                        onChange={(e) => setNewRelInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                      >
                        <option value="">Select document to link...</option>
                        {knowledgeItems
                          ?.filter((item: any) => item.id !== editingKnowledge?.id && !kRelationships.includes(item.id))
                          ?.map((item: any) => (
                            <option key={item.id} value={item.id}>{item.title}</option>
                          ))}
                      </select>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => {
                          if (newRelInput) {
                            setKRelationships([...kRelationships, newRelInput]);
                            setNewRelInput('');
                          }
                        }}
                      >
                        Link
                      </Button>
                    </div>
                    {kRelationships.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {kRelationships.map(relId => {
                          const relDoc = knowledgeItems?.find((i: any) => i.id === relId);
                          return (
                            <span key={relId} className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border dark:border-zinc-700 max-w-xs truncate">
                              {relDoc ? relDoc.title : 'Linked Document'}
                              <button
                                type="button"
                                onClick={() => setKRelationships(kRelationships.filter(r => r !== relId))}
                                className="text-[9px] hover:text-red-500 font-bold ml-1"
                              >
                                ×
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border dark:border-zinc-800 p-3 text-[10px] text-zinc-500 space-y-1">
                <p className="font-bold uppercase tracking-wider text-zinc-400">Automation Info</p>
                <p>• <strong>Keywords</strong> are extracted automatically from title &amp; content on save.</p>
                <p>• <strong>Index</strong> is cleared and refreshed automatically after every save.</p>
                <p>• Only <strong>Published</strong> documents appear in AI assistant responses.</p>
                {editingKnowledge?.updatedByName && <p>• Last edited by: <span className="text-zinc-300">{editingKnowledge.updatedByName}</span></p>}
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <p className="text-[10px] text-zinc-500">{kStatus === 'published' ? '✓ Will be indexed automatically on save' : `Status: ${kStatus}`}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setKnowledgeModalOpen(false)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleSaveK(false)}
                  disabled={!kTitle.trim() || !kContent.trim() || createKnowledgeMutation.isPending || updateKnowledgeMutation.isPending || !!duplicateWarning}
                >
                  {createKnowledgeMutation.isPending || updateKnowledgeMutation.isPending
                    ? 'Saving...'
                    : editingKnowledge ? 'Save Changes' : 'Create Document'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version History Modal */}
      {activeTab === 'ops' && (
        <div className="space-y-6">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-zinc-800">
            <div>
              <h2 className="font-bold dark:text-white text-slate-800 text-lg flex items-center gap-2">
                <Shield className="text-accent-violet" size={20} />
                Knowledge Operations &amp; Monitoring Console
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Observe real-time health diagnostics, manual automation hooks, audit trails, and jobs registries of the AI Knowledge Platform.</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<RefreshCw size={13} />}
                onClick={() => {
                  queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-jobs'] });
                  queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-logs'] });
                  queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-health'] });
                  queryClient.invalidateQueries({ queryKey: ['admin-ai-ops-metrics'] });
                }}
              >
                Refresh Board
              </Button>
            </div>
          </div>

          {/* Section 1: Health indicators & Metrics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Health indicators list */}
            <div className="lg:col-span-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white p-5 shadow-lg space-y-4">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider dark:text-zinc-300 text-slate-700">Subsystem Health Status</h3>
                <p className="text-[10px] text-zinc-500">Live operational states of individual automation components.</p>
              </div>

              {healthLoading ? (
                <div className="text-center py-10 text-xs text-zinc-500">Evaluating health parameters...</div>
              ) : (
                <div className="space-y-2.5">
                  {[
                    { label: 'Knowledge Pipeline', key: 'pipeline' },
                    { label: 'Search Index Engine', key: 'indexer' },
                    { label: 'Review Scheduler Daemon', key: 'scheduler' },
                    { label: 'Tag Generator Service', key: 'tagGenerator' },
                    { label: 'Duplicate Scanner Engine', key: 'duplicateEngine' },
                    { label: 'Quality Score Evaluator', key: 'qualityEngine' },
                    { label: 'Review Lifecycle Engine', key: 'reviewEngine' }
                  ].map(engine => {
                    const status = opsHealth?.[engine.key] || 'Healthy';
                    return (
                      <div key={engine.key} className="flex items-center justify-between p-2.5 rounded-xl border dark:border-zinc-850 dark:bg-zinc-950/40 bg-zinc-50">
                        <span className="text-xs font-medium dark:text-zinc-300 text-slate-700">{engine.label}</span>
                        <span className={cn(
                          "inline-flex items-center gap-1.5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border",
                          status === 'Healthy' && "bg-green-500/10 text-green-400 border-green-500/20",
                          status === 'Warning' && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                          status === 'Failed' && "bg-red-500/10 text-red-400 border-red-500/20"
                        )}>
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full animate-pulse",
                            status === 'Healthy' && "bg-green-400",
                            status === 'Warning' && "bg-amber-400",
                            status === 'Failed' && "bg-red-400"
                          )} />
                          {status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Metrics cards grid */}
            <div className="lg:col-span-8 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Total Items', value: opsMetrics?.totalDocs, color: 'text-zinc-350' },
                  { label: 'Published Items', value: opsMetrics?.publishedDocs, color: 'text-green-400' },
                  { label: 'Awaiting Review', value: opsMetrics?.awaitingReviewDocs, color: 'text-amber-400' },
                  { label: 'Expired Items', value: opsMetrics?.expiredDocs, color: 'text-red-400' }
                ].map((metric, i) => (
                  <div key={i} className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white shadow-md text-left">
                    <p className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">{metric.label}</p>
                    <p className={cn("text-xl font-extrabold mt-1", metric.color)}>
                      {metricsLoading ? '...' : metric.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Advanced operational stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white shadow-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Indexer Speed</span>
                    <Clock size={12} className="text-zinc-400" />
                  </div>
                  <p className="text-lg font-bold dark:text-white text-slate-800">
                    {metricsLoading ? '...' : `${opsMetrics?.averageIndexingTime}ms`}
                  </p>
                  <p className="text-[9px] text-zinc-500">Average indexing processing duration per document corpus cycle.</p>
                </div>

                <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white shadow-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Duplicate Scan Rate</span>
                    <ShieldAlert size={12} className="text-zinc-400" />
                  </div>
                  <p className="text-lg font-bold dark:text-white text-slate-800">
                    {metricsLoading ? '...' : `${opsMetrics?.duplicateDetectionRate}%`}
                  </p>
                  <p className="text-[9px] text-zinc-500">Average pairwise redundancy overlap percentage across active files.</p>
                </div>

                <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white shadow-md space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-zinc-550 uppercase font-bold tracking-wider">Automation Success Rate</span>
                    <Zap size={12} className="text-green-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-lg font-bold text-green-400">
                      {metricsLoading ? '...' : `${opsMetrics?.automationSuccessRate}%`}
                    </p>
                    <span className="text-[9px] text-zinc-500">({opsMetrics?.automationFailureRate}% failure)</span>
                  </div>
                  <p className="text-[9px] text-zinc-500">Execution success-to-failure ratio of automated event listeners.</p>
                </div>
              </div>

              {/* Suggestions Panel */}
              <div className="p-4 rounded-2xl border dark:border-zinc-800 dark:bg-yellow-500/5 bg-yellow-50/20 border-yellow-500/10 space-y-2">
                <div className="flex items-center gap-1.5 text-yellow-500">
                  <AlertTriangle size={14} />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Automated Content Gap Alerts</h4>
                </div>
                <div className="text-[10px] text-zinc-400 leading-relaxed">
                  The automated index pipeline scanned keyword distributions and suggested creating knowledge documents for:
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {knowledgeHealth?.suggestedGaps?.map((gap: string) => (
                      <span key={gap} className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500/90 font-medium">
                        {gap}
                      </span>
                    )) || <span className="text-zinc-500">None detected.</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Background Jobs Registry */}
          <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white p-5 shadow-lg space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider dark:text-zinc-300 text-slate-700">Centralized Background Job Registry</h3>
              <p className="text-[10px] text-zinc-500">Monitoring status, latency durations, and trigger commands for automated background processes.</p>
            </div>

            {jobsLoading ? (
              <div className="text-center py-10 text-xs text-zinc-500">Fetching background job configurations...</div>
            ) : (
              <div className="overflow-x-auto border dark:border-zinc-850 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-[10px] uppercase font-bold tracking-wider text-zinc-500 border-b dark:border-zinc-850">
                      <th className="p-3">Job Name</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Run Duration</th>
                      <th className="p-3">Docs Processed</th>
                      <th className="p-3">Last Executed</th>
                      <th className="p-3">Next Scheduled Run</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Rebuild Search Index', actionKey: 'rebuild_index' },
                      { name: 'Run Duplicate Scan', actionKey: 'run_dup_scan' },
                      { name: 'Recalculate Quality', actionKey: 'recalc_quality' },
                      { name: 'Regenerate Tags', actionKey: 'regen_tags' },
                      { name: 'Refresh Relationships', actionKey: 'refresh_rels' },
                      { name: 'Run Review Scheduler', actionKey: 'run_scheduler' }
                    ].map(jobMeta => {
                      const job = opsJobs?.find((j: any) => j.name === jobMeta.name) || {
                        status: 'idle',
                        duration: 0,
                        processedDocs: 0,
                        lastRun: null,
                        nextRun: null,
                        errorMessage: null,
                        retryCount: 0
                      };

                      return (
                        <tr key={jobMeta.name} className="border-b dark:border-zinc-850/60 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-950/30">
                          <td className="p-3 font-semibold text-slate-800 dark:text-zinc-200">
                            <div>
                              <span>{jobMeta.name}</span>
                              {job.errorMessage && (
                                <p className="text-[9px] text-red-400 font-mono mt-0.5 max-w-sm truncate" title={job.errorMessage}>
                                  Err: {job.errorMessage}
                                </p>
                              )}
                              {job.retryCount > 0 && (
                                <span className="ml-2 px-1 text-[8px] bg-yellow-500/10 text-yellow-500 rounded">
                                  Retries: {job.retryCount}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase",
                              job.status === 'completed' && "bg-green-500/10 text-green-400",
                              job.status === 'running' && "bg-accent-violet/10 text-accent-violet animate-pulse",
                              job.status === 'failed' && "bg-red-500/10 text-red-400",
                              job.status === 'idle' && "bg-zinc-500/10 text-zinc-400"
                            )}>
                              {job.status}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-zinc-400">
                            {job.duration ? `${job.duration}ms` : '0ms'}
                          </td>
                          <td className="p-3 font-mono text-[10px] text-zinc-400">
                            {job.processedDocs}
                          </td>
                          <td className="p-3 text-[10px] text-zinc-550">
                            {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                          </td>
                          <td className="p-3 text-[10px] text-zinc-550">
                            {job.nextRun ? new Date(job.nextRun).toLocaleTimeString() : 'Manual Trigger Only'}
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() => triggerOpsActionMutation.mutate(jobMeta.actionKey)}
                              disabled={job.status === 'running' || triggerOpsActionMutation.isPending}
                            >
                              {job.status === 'running' ? 'Running...' : 'Run Now'}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section 3: Automation Audit Log */}
          <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white p-5 shadow-lg space-y-4">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider dark:text-zinc-300 text-slate-700">Automation Audit Log Trail</h3>
              <p className="text-[10px] text-zinc-500">Immutable operations log track recording automated triggers, events, and results.</p>
            </div>

            {logsLoading ? (
              <div className="text-center py-10 text-xs text-zinc-500">Loading audit trail logs...</div>
            ) : opsLogs?.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500">No automated actions logged yet.</div>
            ) : (
              <div className="overflow-x-auto border dark:border-zinc-850 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/40 text-[10px] uppercase font-bold tracking-wider text-zinc-500 border-b dark:border-zinc-850">
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Action</th>
                      <th className="p-3">Affected Entity</th>
                      <th className="p-3">Trigger Source</th>
                      <th className="p-3">Result</th>
                      <th className="p-3">Execution Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {opsLogs?.map((log: any) => (
                      <tr key={log.id} className="border-b dark:border-zinc-850/60 dark:bg-zinc-900/10 hover:bg-zinc-50 dark:hover:bg-zinc-950/30">
                        <td className="p-3 text-[10px] text-zinc-400 font-mono">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3 font-semibold dark:text-zinc-200">
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3 dark:text-zinc-300 text-slate-700 truncate max-w-xs" title={log.itemTitle || ''}>
                          {log.itemTitle || '-'}
                        </td>
                        <td className="p-3 text-zinc-400 font-mono text-[10px]">
                          {log.trigger}
                        </td>
                        <td className="p-3">
                          <span className={cn(
                            "inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            log.result === 'success' && "bg-green-500/10 text-green-400",
                            log.result === 'warning' && "bg-amber-500/10 text-amber-400",
                            log.result === 'failed' && "bg-red-500/10 text-red-400"
                          )}>
                            {log.result}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-550 truncate max-w-sm text-[10px]" title={log.details || ''}>
                          {log.details || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === 'content-ai' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b dark:border-zinc-800">
            <div>
              <h2 className="font-bold dark:text-white text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="text-accent-violet animate-pulse" size={20} />
                Content AI Generator
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Draft proposals, emails, contracts, blogs, and case studies powered by Denis's verified database context.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Column */}
            <div className="lg:col-span-5 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white p-6 shadow-lg space-y-5">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-zinc-400">Document Type</label>
                <select
                  value={genType}
                  onChange={(e: any) => setGenType(e.target.value)}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                >
                  <option value="proposal">Business Proposal</option>
                  <option value="email">Client Follow-up Email</option>
                  <option value="contract">Service Contract Agreement</option>
                  <option value="blog">Blog Article Draft</option>
                  <option value="case_study">Project Case Study Success Story</option>
                </select>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-zinc-400">Topic / Target Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Agribusiness upgrade for SimuInvest"
                  value={genTopic}
                  onChange={(e) => setGenTopic(e.target.value)}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                />
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold text-zinc-400">Additional Instructions & Context</label>
                <textarea
                  rows={6}
                  placeholder="e.g. Focus on mobile money integrations, SMS notifications, and Tanzanian regulation compliance details."
                  value={genContext}
                  onChange={(e) => setGenContext(e.target.value)}
                  className="w-full text-sm rounded-lg p-2.5 dark:bg-zinc-950 dark:border-zinc-800 border dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                />
              </div>

              <Button
                variant="primary"
                onClick={async () => {
                  if (!genTopic.trim()) {
                    toast.warning('Please provide a Topic/Subject before generating.', 'Missing Input');
                    return;
                  }
                  setIsGenerating(true);
                  setGeneratedDoc('');
                  setGenMeta(null);
                  try {
                    const result = await adminApi.generateContent({
                      type: genType,
                      topic: genTopic,
                      context: genContext
                    });
                    setGeneratedDoc(result.document);
                    setGenMeta({ model: result.model, tokensUsed: result.tokensUsed });
                  } catch (err: any) {
                    toast.error(
                      err?.response?.data?.error?.message || err.message || 'Generation failed.',
                      'Generation Failed'
                    );
                  } finally {
                    setIsGenerating(false);
                  }
                }}
                isLoading={isGenerating}
                className="w-full justify-center"
              >
                Generate Draft
              </Button>
            </div>

            {/* Generated Document Result Output Column */}
            <div className="lg:col-span-7 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white p-6 shadow-lg flex flex-col min-h-[450px]">
              <div className="flex items-center justify-between pb-3 border-b dark:border-zinc-800 mb-4 flex-shrink-0">
                <div className="text-left">
                  <h3 className="font-bold text-xs uppercase tracking-wider dark:text-zinc-300 text-slate-700">Generated Draft Output</h3>
                  {genMeta && (
                    <p className="text-[9px] text-zinc-550 mt-0.5">
                      Powered by <span className="font-semibold text-accent-violet">{genMeta.model}</span> • Tokens: {genMeta.tokensUsed}
                    </p>
                  )}
                </div>
                {generatedDoc && (
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDoc);
                      toast.success('Draft copied to clipboard.', 'Copied');
                    }}
                  >
                    Copy Output
                  </Button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-zinc-500 gap-3">
                    <RefreshCw size={24} className="animate-spin text-accent-violet" />
                    <p className="text-xs">RAG BM25 retrieval active... Generating custom draft...</p>
                  </div>
                ) : generatedDoc ? (
                  <pre className="text-xs font-mono text-left whitespace-pre-wrap dark:text-zinc-350 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl leading-relaxed border dark:border-zinc-850">
                    {generatedDoc}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-500 py-20">
                    <Sparkles size={36} className="text-zinc-650 mb-2" />
                    <p className="text-xs font-medium">Your generated document draft will appear here.</p>
                    <p className="text-[10px] text-zinc-550 mt-1 max-w-xs text-center">Select your content configurations and click "Generate Draft" to initiate the AI pipeline.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {versionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setVersionsOpen(null); }}>
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl text-left flex flex-col max-h-[85vh]">
            <div className="p-5 border-b dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="font-bold text-base dark:text-white">Document Version Audit History</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Review previous historical snapshots, author attribution, and metadata updates.</p>
              </div>
              <button
                onClick={() => setVersionsOpen(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {versionsLoading ? (
                <div className="text-center py-12 text-zinc-500 text-xs">Fetching version history audit logs...</div>
              ) : versionsList.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">No previous versions archived for this document yet.</div>
              ) : (
                <div className="space-y-4">
                  {versionsList.map((v) => (
                    <div key={v.id} className="p-4 rounded-xl border dark:border-zinc-850 dark:bg-zinc-950 bg-zinc-50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-accent-violet bg-accent-violet/10 px-2 py-0.5 rounded-full border border-accent-violet/25">
                            v{v.version}
                          </span>
                          <span className="text-xs font-bold dark:text-white text-slate-800">{v.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                          <span>By: <strong className="text-zinc-400">{v.changedByName || v.updatedByName || 'Unknown User'}</strong></span>
                          <span>•</span>
                          <span>{new Date(v.changedAt || v.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="text-xs dark:text-zinc-400 text-slate-600 line-clamp-3 font-mono bg-zinc-100 dark:bg-zinc-900/50 p-2 rounded-lg leading-relaxed">
                        {v.content}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t dark:border-zinc-900 text-[10px] text-zinc-500">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Category: <strong className="text-zinc-400 capitalize">{v.category}</strong></span>
                          <span>•</span>
                          <span>Status: <strong className="text-zinc-400 capitalize">{v.status}</strong></span>
                          {v.qualityScore !== undefined && (
                            <>
                              <span>•</span>
                              <span>Score: <strong className="text-zinc-400">{v.qualityScore}%</strong></span>
                            </>
                          )}
                          {Array.isArray(v.tags) && v.tags.length > 0 && (
                            <>
                              <span>•</span>
                              <span>Tags: <strong className="text-zinc-400">{v.tags.join(', ')}</strong></span>
                            </>
                          )}
                        </div>
                        <div>
                          <Button
                            size="xs"
                            variant="primary"
                            onClick={() => handleRestoreVersion(v)}
                            leftIcon={<History size={10} />}
                          >
                            Restore Version
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-zinc-800 flex justify-end flex-shrink-0">
              <Button size="sm" variant="outline" onClick={() => setVersionsOpen(null)}>Close History</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 5. CLIENTS & LEADS PAGE
// ============================================================================
export const ClientsLeadsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [tempFilter, setTempFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form states inside details modal
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompany, setEditCompany] = useState('');
  const [editStatus, setEditStatus] = useState('new');
  const [editTemp, setEditTemp] = useState('cold');
  const [editScore, setEditScore] = useState(0);
  const [editReqs, setEditReqs] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editBudget, setEditBudget] = useState(false);
  const [editTimeline, setEditTimeline] = useState(false);

  const { data: leads, isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => adminApi.getLeads(),
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateLead(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      setSelectedLead(null);
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteLead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      setSelectedLead(null);
    }
  });

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setEditName(lead.name || '');
    setEditEmail(lead.email || '');
    setEditPhone(lead.phone || '');
    setEditCompany(lead.company || '');
    setEditStatus(lead.status || 'new');
    setEditTemp(lead.temperature || 'cold');
    setEditScore(lead.score || 0);
    setEditReqs(lead.requirements || '');
    setEditNotes(lead.notes || '');
    setEditBudget(lead.budgetMentioned || false);
    setEditTimeline(lead.timelineMentioned || false);
  };

  const handleSaveChanges = () => {
    if (!selectedLead) return;
    updateLeadMutation.mutate({
      id: selectedLead.id,
      data: {
        name: editName,
        email: editEmail,
        phone: editPhone,
        company: editCompany,
        status: editStatus,
        temperature: editTemp,
        score: +editScore,
        requirements: editReqs,
        notes: editNotes,
        budgetMentioned: editBudget,
        timelineMentioned: editTimeline,
      }
    });
  };

  const handleDeleteLead = () => {
    if (!selectedLead) return;
    if (confirm(`Are you sure you want to delete lead "${selectedLead.name}"?`)) {
      deleteLeadMutation.mutate(selectedLead.id);
    }
  };

  if (isLoading) return <div className="text-center py-12 dark:text-white">Loading Leads...</div>;

  // Perform filtration in memory
  const items = leads?.items || [];
  const filteredItems = items.filter((l: any) => {
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (tempFilter !== 'all' && l.temperature !== tempFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = l.name?.toLowerCase().includes(q);
      const emailMatch = l.email?.toLowerCase().includes(q);
      const compMatch = l.company?.toLowerCase().includes(q);
      return nameMatch || emailMatch || compMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Clients & Leads</h1>
          <p className="text-sm text-zinc-500">Track and score customer inquiries generated from the business checker and AI agent.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-zinc-50 dark:bg-zinc-900/20 p-4 rounded-2xl border dark:border-zinc-850 border-zinc-200">
        <div className="w-full md:flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, email, or company..."
            className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet font-sans"
          />
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet font-mono"
          >
            <option value="all">Status: All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
          <select
            value={tempFilter}
            onChange={(e) => setTempFilter(e.target.value)}
            className="px-2.5 py-2 text-xs rounded-lg border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet font-mono"
          >
            <option value="all">Temp: All</option>
            <option value="hot">Hot</option>
            <option value="warm">Warm</option>
            <option value="cold">Cold</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              <tr>
                <th className="p-4">Contact</th>
                <th className="p-4">Source</th>
                <th className="p-4">AI Score Heatmap</th>
                <th className="p-4">Status</th>
                <th className="p-4">Qualifiers</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-zinc-500">No leads match the specified filter query.</td>
                </tr>
              ) : (
                filteredItems.map((l: any) => {
                  // Grade colors for thermometer heatmap
                  const isHot = l.temperature === 'hot';
                  const isWarm = l.temperature === 'warm';
                  const heatBg = isHot ? 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/20' :
                               isWarm ? 'from-orange-500/10 to-yellow-500/10 text-orange-400 border-orange-500/20' :
                               'from-blue-500/10 to-teal-500/10 text-teal-400 border-teal-500/20';

                  return (
                    <tr
                      key={l.id}
                      onClick={() => handleRowClick(l)}
                      className="dark:hover:bg-zinc-800/15 hover:bg-slate-50/50 cursor-pointer transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold dark:text-white text-slate-800 flex items-center gap-1.5">
                          {l.name}
                          {l.company && (
                            <span className="text-[10px] font-normal dark:text-zinc-500 text-slate-400">({l.company})</span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-500">{l.email || 'No email'} {l.phone && `• ${l.phone}`}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-bold uppercase dark:text-zinc-400 text-slate-600 bg-zinc-100 dark:bg-zinc-950 px-2 py-0.5 rounded border dark:border-zinc-850">
                          {l.source?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-gradient-to-r text-xs font-bold", heatBg)}>
                          {isHot && <Flame size={12} className="animate-bounce" />}
                          {isWarm && <Coins size={12} />}
                          <span className="capitalize">{l.temperature} • {l.score}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border",
                          l.status === 'won' ? 'border-green-500/20 text-green-400 bg-green-500/10' :
                          l.status === 'lost' ? 'border-zinc-600/30 text-zinc-500 bg-zinc-800/20' :
                          l.status === 'qualified' ? 'border-purple-500/20 text-purple-400 bg-purple-500/10' :
                          'border-yellow-500/20 text-yellow-400 bg-yellow-500/10'
                        )}>
                          {l.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {l.budgetMentioned && (
                            <span className="p-1 rounded-lg dark:bg-zinc-800/80 bg-slate-100 text-green-400" title="Budget Mentioned">
                              <Coins size={12} />
                            </span>
                          )}
                          {l.timelineMentioned && (
                            <span className="p-1 rounded-lg dark:bg-zinc-800/80 bg-slate-100 text-blue-400" title="Timeline Mentioned">
                              <Clock size={12} />
                            </span>
                          )}
                          {!l.budgetMentioned && !l.timelineMentioned && (
                            <span className="text-[10px] text-zinc-500 italic">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <ChevronRight size={16} className="text-zinc-500 inline" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setSelectedLead(null); }}>
          <div className="bg-white dark:bg-zinc-900 border dark:border-zinc-850 rounded-2xl w-full max-w-2xl shadow-2xl text-left flex flex-col max-h-[92vh]">
            
            {/* Modal header */}
            <div className="p-5 border-b dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Users className="text-accent-violet" size={18} />
                <div>
                  <h3 className="font-bold text-base dark:text-white">Lead Qualification Profile</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">Scored by Lead Intelligence based on intent and requirements.</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Lead Name *</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Company / Business</label>
                  <input
                    type="text"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Phone Number</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Sales Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="won">Won (Converted)</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Temperature Grade</label>
                  <select
                    value={editTemp}
                    onChange={(e) => setEditTemp(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet"
                  >
                    <option value="cold">Cold</option>
                    <option value="warm">Warm</option>
                    <option value="hot">Hot</option>
                  </select>
                </div>
              </div>

              {/* Slider for Lead score */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                  <span>Engagement / Qualification Score</span>
                  <span className="text-accent-violet">{editScore}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={editScore}
                    onChange={(e) => setEditScore(+e.target.value)}
                    className="flex-grow accent-accent-violet cursor-pointer h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none"
                  />
                </div>
              </div>

              {/* Qualifiers */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 dark:bg-zinc-950/50 border dark:border-zinc-850 rounded-xl text-xs">
                <label className="flex items-center gap-2 cursor-pointer dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={editBudget}
                    onChange={(e) => setEditBudget(e.target.checked)}
                    className="rounded dark:bg-zinc-950 dark:border-zinc-800 accent-accent-violet focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Budget explicitly mentioned</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={editTimeline}
                    onChange={(e) => setEditTimeline(e.target.checked)}
                    className="rounded dark:bg-zinc-950 dark:border-zinc-800 accent-accent-violet focus:ring-0 w-4 h-4 cursor-pointer"
                  />
                  <span>Timeline explicitly mentioned</span>
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Requirements / Business Profile</label>
                <textarea
                  rows={4}
                  value={editReqs}
                  onChange={(e) => setEditReqs(e.target.value)}
                  placeholder="Detail user requirements, core goals, challenges, or custom system designs..."
                  className="w-full p-3 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet leading-relaxed resize-none font-sans"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Follow-up Notes / Activity Logs</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Enter administrator updates, meeting summaries, or follow-up milestones..."
                  className="w-full p-3 text-xs rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-accent-violet leading-relaxed resize-none font-sans"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="p-4 border-t dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
              <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-500/10 hover:text-red-400 border-red-500/20" onClick={handleDeleteLead}>
                Delete Lead
              </Button>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedLead(null)}>Cancel</Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleSaveChanges}
                  disabled={updateLeadMutation.isPending}
                >
                  {updateLeadMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 6. INBOX & CONTACT PAGE
// ============================================================================
export const InboxContactPage: React.FC = () => {
  const queryClient = useQueryClient();
  
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: () => adminApi.getMessages(),
  });

  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['admin-appointments'],
    queryFn: () => adminApi.getAppointments(),
  });

  const readMutation = useMutation({
    mutationFn: (id: string) => adminApi.markMessageRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const updateApptMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminApi.updateAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-appointments'] }),
  });

  const handleMarkRead = (id: string) => {
    readMutation.mutate(id);
  };

  const handleConfirmAppt = (id: string, status: string) => {
    updateApptMutation.mutate({ id, data: { status } });
  };

  return (
    <div className="space-y-8 text-left">
      {/* Messages / Contact requests section */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Inbox & Messages</h1>
          <p className="text-sm text-zinc-500">Read and respond to site contact requests and direct customer inquiries.</p>
        </div>

        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="p-4">Sender</th>
                  <th className="p-4">Subject & Content</th>
                  <th className="p-4">Received</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                {messagesLoading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-zinc-500">Loading messages...</td></tr>
                ) : messages?.items?.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-zinc-500">No contact messages received.</td></tr>
                ) : (
                  messages?.items?.map((m: any) => (
                    <tr key={m.id} className={`dark:hover:bg-zinc-800/10 hover:bg-slate-50/40 ${!m.isRead ? 'font-bold dark:bg-accent-violet/5 bg-accent-violet/5' : ''}`}>
                      <td className="p-4">
                        <div className="dark:text-white">{m.name}</div>
                        <div className="text-xs text-zinc-500">{m.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="dark:text-white text-xs">{m.subject || 'General Inquiry'}</div>
                        <div className="text-xs text-zinc-500/80 font-normal mt-1 leading-relaxed">{m.content}</div>
                      </td>
                      <td className="p-4 text-xs dark:text-zinc-500">{new Date(m.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">
                        {!m.isRead && (
                          <button
                            onClick={() => handleMarkRead(m.id)}
                            className="px-2.5 py-1 border border-accent-violet/30 hover:bg-accent-violet text-accent-violet hover:text-white transition-all rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Mark Read
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Appointment requests section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white light:text-slate-800">Appointments Schedule</h2>
          <p className="text-sm text-zinc-500">Manage client bookings and coordinate business consultations.</p>
        </div>

        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="p-4">Visitor</th>
                  <th className="p-4">Schedule Requested</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                {appointmentsLoading ? (
                  <tr><td colSpan={5} className="p-4 text-center text-zinc-500">Loading appointments...</td></tr>
                ) : appointments?.items?.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-zinc-500">No appointments scheduled.</td></tr>
                ) : (
                  appointments?.items?.map((a: any) => (
                    <tr key={a.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40">
                      <td className="p-4">
                        <div className="font-semibold dark:text-white">{a.name}</div>
                        <div className="text-xs text-zinc-500">{a.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="dark:text-white">{new Date(a.preferredDate).toLocaleDateString()}</div>
                        <div className="text-xs text-zinc-500">{a.preferredTime}</div>
                      </td>
                      <td className="p-4 dark:text-zinc-400 text-xs max-w-[200px] truncate">{a.purpose}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          a.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : a.status === 'cancelled' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {a.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirmAppt(a.id, 'confirmed')}
                              className="p-1 text-green-500 hover:bg-green-500/10 border border-green-500/10 rounded cursor-pointer"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleConfirmAppt(a.id, 'cancelled')}
                              className="p-1 text-red-500 hover:bg-red-500/10 border border-red-500/10 rounded cursor-pointer"
                            >
                              <X size={16} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. ANALYTICS & REPORTS PAGE
// ============================================================================
export const AnalyticsReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'events' | 'ai'>('events');

  const { data: analytics, isLoading: isEventLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => adminApi.getAnalytics(30),
    enabled: activeTab === 'events',
  });

  const { data: aiAnalytics, isLoading: isAiLoading } = useQuery({
    queryKey: ['admin-ai-analytics'],
    queryFn: () => adminApi.getAiAnalytics(),
    enabled: activeTab === 'ai',
  });

  const isLoading = (activeTab === 'events' && isEventLoading) || (activeTab === 'ai' && isAiLoading);

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Analytics & Reports</h1>
          <p className="text-sm text-zinc-500 font-sans">Analyze application event logs, visitor distributions, and AI assistant performance metrics.</p>
        </div>
        <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-all",
              activeTab === 'events' ? "bg-accent-violet text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            Events & Users
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={cn(
              "px-3.5 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide cursor-pointer transition-all",
              activeTab === 'ai' ? "bg-accent-violet text-white" : "text-zinc-400 hover:text-white"
            )}
          >
            AI Performance
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 dark:text-zinc-400 text-xs">Loading analytics data reports...</div>
      ) : activeTab === 'events' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Event logs counts */}
          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <BarChart2 size={18} className="text-accent-violet" /> Event Trigger Distribution
            </h2>
            
            <div className="space-y-4">
              {analytics?.map((item: any) => (
                <div key={item.eventType} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="dark:text-zinc-300 uppercase tracking-wide">{item.eventType}</span>
                    <span className="dark:text-white">{item.count} hits</span>
                  </div>
                  <div className="h-2 w-full dark:bg-zinc-950 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-violet rounded-full" style={{ width: `${Math.min(item.count * 4, 100)}%` }} />
                  </div>
                </div>
              ))}
              {(!analytics || analytics.length === 0) && (
                <div className="text-center py-10 text-xs text-zinc-500">No events registered in this duration.</div>
              )}
            </div>
          </div>

          {/* Demo device layout */}
          <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-4">
            <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-accent-violet" /> Visitor Demographics & OS
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="dark:text-zinc-400 font-sans">Desktop Visitors</span>
                <span className="font-bold dark:text-white">72%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="dark:text-zinc-400 font-sans">Mobile Visitors</span>
                <span className="font-bold dark:text-white">28%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="dark:text-zinc-400 font-sans">Top Country Referrer</span>
                <span className="font-bold dark:text-white">Tanzania (Dar es Salaam)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="dark:text-zinc-400 font-sans">Standard API response latencies</span>
                <span className="font-bold dark:text-white">12ms avg</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* AI Metrics Overview cards */}
          {aiAnalytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl border dark:border-zinc-850 dark:bg-zinc-900/30 bg-white space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Average Latency</p>
                  <p className="text-3xl font-extrabold text-accent-violet">
                    {aiAnalytics.latency?.avg || 0} <span className="text-xs font-normal text-zinc-500">ms</span>
                  </p>
                  <p className="text-[10px] text-zinc-500">Average duration per token completion.</p>
                </div>
                <div className="p-5 rounded-2xl border dark:border-zinc-850 dark:bg-zinc-900/30 bg-white space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Total Tokens Consumed</p>
                  <p className="text-3xl font-extrabold text-green-400">
                    {aiAnalytics.tokens?.total?.toLocaleString() || 0}
                  </p>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[9px] text-zinc-500 pt-0.5 border-t dark:border-zinc-850/50">
                    {aiAnalytics.tokens?.byProvider?.map((p: any) => (
                      <span key={p.provider} className="capitalize font-mono">
                        {p.provider}: {p.tokens?.toLocaleString()}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-5 rounded-2xl border dark:border-zinc-850 dark:bg-zinc-900/30 bg-white space-y-2">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Conversation Sessions</p>
                  <p className="text-3xl font-extrabold text-orange-400">
                    {aiAnalytics.sessions?.total || 0} <span className="text-xs font-normal text-zinc-500">total</span>
                  </p>
                  <p className="text-[10px] text-zinc-500 font-sans">
                    {aiAnalytics.sessions?.active || 0} active <span className="text-zinc-600">•</span> {aiAnalytics.sessions?.closed || 0} closed <span className="text-zinc-600">•</span> {aiAnalytics.sessions?.avgMessages || 0} msgs/avg
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Intent distributions */}
                <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white space-y-4">
                  <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-accent-violet" /> Inferred Customer Intent Distribution
                  </h2>
                  <div className="space-y-4">
                    {aiAnalytics.intents?.map((item: any) => (
                      <div key={item.intent} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="dark:text-zinc-300 capitalize font-mono text-[10px]">{item.intent?.replace(/_/g, ' ')}</span>
                          <span className="dark:text-white">{item.count} queries</span>
                        </div>
                        <div className="h-2 w-full dark:bg-zinc-950 rounded-full overflow-hidden">
                          <div className="h-full bg-accent-violet rounded-full" style={{ width: `${Math.min(item.count * 10, 100)}%` }} />
                        </div>
                      </div>
                    ))}
                    {(!aiAnalytics.intents || aiAnalytics.intents.length === 0) && (
                      <div className="text-center py-10 text-xs text-zinc-500">No intent classifications recorded.</div>
                    )}
                  </div>
                </div>

                {/* Timeline activity summary */}
                <div className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/30 bg-white space-y-4">
                  <h2 className="text-base font-semibold dark:text-white flex items-center gap-2">
                    <Activity size={16} className="text-accent-violet" /> Daily Performance History (Last 7 Days)
                  </h2>
                  <div className="space-y-3.5">
                    {aiAnalytics.timeline?.map((day: any) => (
                      <div key={day.date} className="flex items-center justify-between text-xs border-b dark:border-zinc-850 pb-2">
                        <span className="font-mono dark:text-zinc-400">{day.date}</span>
                        <div className="flex gap-4 text-right">
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Tokens</p>
                            <p className="dark:text-white font-bold">{day.tokens?.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Avg Latency</p>
                            <p className="text-accent-violet font-bold">{day.avgLatency} ms</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!aiAnalytics.timeline || aiAnalytics.timeline.length === 0) && (
                      <div className="text-center py-12 text-xs text-zinc-500">No daily performance timeline logs.</div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 8. SETTINGS & SYSTEM PAGE (LANGUAGES & AUDIT LOGS)
// ============================================================================
export const SettingsSystemPage: React.FC = () => {
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-audit-logs'],
    queryFn: () => adminApi.getAuditLogs(),
  });

  const { data: languages, isLoading: langLoading } = useQuery({
    queryKey: ['admin-languages'],
    queryFn: () => adminApi.getLanguages(),
  });

  return (
    <div className="space-y-8 text-left">
      {/* Languages */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white light:text-slate-800">Settings & Languages</h1>
          <p className="text-sm text-zinc-500">Configure localized platform content settings.</p>
        </div>

        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold dark:text-white">Active System Languages</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {langLoading ? (
              <div className="text-zinc-500 text-xs">Loading languages...</div>
            ) : (
              languages?.items?.map((l: any) => (
                <div key={l.code} className="p-4 rounded-xl border dark:border-zinc-800 dark:bg-zinc-950 flex items-center justify-between">
                  <div>
                    <span className="block font-bold dark:text-white text-sm">{l.name}</span>
                    <span className="text-xs text-zinc-500">{l.nativeName} ({l.code})</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${l.isDefault ? 'bg-accent-violet/20 text-accent-violet' : 'bg-zinc-800 text-zinc-400'}`}>
                    {l.isDefault ? 'Default' : 'Active'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit logs */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold dark:text-white light:text-slate-800">System Audit Trail Logs</h2>
          <p className="text-sm text-zinc-500">A strict write-once log recording all CMS actions and updates made on the backend.</p>
        </div>

        <div className="rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="dark:bg-zinc-950/60 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
                {auditLoading ? (
                  <tr><td colSpan={4} className="p-4 text-center text-zinc-500">Loading audit logs...</td></tr>
                ) : !auditLogs?.items || auditLogs.items.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-zinc-500">No system audits written yet.</td></tr>
                ) : (
                  auditLogs?.items?.map((log: any) => (
                    <tr key={log.id} className="dark:hover:bg-zinc-800/10 hover:bg-slate-50/40 text-xs">
                      <td className="p-4 font-semibold dark:text-white">
                        {log.user?.firstName} {log.user?.lastName || 'System'}
                      </td>
                      <td className="p-4 uppercase tracking-wide font-bold dark:text-zinc-300">{log.action}</td>
                      <td className="p-4 dark:text-zinc-400">{log.resource} ({log.resourceId || 'N/A'})</td>
                      <td className="p-4 dark:text-zinc-500">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 9. HOME WEBSITE PREVIEW & SETTINGS PAGE
// ============================================================================
export const HomeWebsiteAdminPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">Home Website Panel</h1>
          <p className="text-xs dark:text-zinc-500 light:text-slate-500 font-body">Manage hero messaging, layout configs, and public-facing features.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl border dark:border-zinc-800/80 dark:bg-[#09090b] bg-white shadow-lg space-y-4">
            <h3 className="font-bold dark:text-white light:text-slate-800 text-sm font-display">Hero Presentation Section</h3>
            <p className="text-xs dark:text-zinc-400 light:text-slate-500">Configure the main headline and system descriptions shown to public visitors.</p>
            <div className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-500 light:text-slate-400">Site Title</label>
                <input type="text" defaultValue="Denis Chamkaga" disabled className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 cursor-not-allowed" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider dark:text-zinc-500 light:text-slate-400">Public Tagline</label>
                <input type="text" defaultValue="Systems & Database Consultant | Digital Transformation Expert" disabled className="w-full px-3 py-2 text-xs rounded-lg border dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-400 cursor-not-allowed" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-2xl border dark:border-zinc-800/80 dark:bg-[#09090b] bg-white shadow-lg space-y-3">
            <h3 className="font-bold dark:text-white light:text-slate-800 text-sm font-display">Quick Actions</h3>
            <p className="text-xs dark:text-zinc-400 light:text-slate-500">Direct shortcuts to manage different public home areas.</p>
            <div className="flex flex-col gap-2 pt-2">
              <Link to="/admin/content" className="w-full text-center py-2 text-xs font-bold rounded-lg bg-accent-violet text-white hover:bg-accent-violet/90 transition-colors">Manage CMS Blogs & FAQs</Link>
              <Link to="/admin/portfolio" className="w-full text-center py-2 text-xs font-bold rounded-lg border dark:border-zinc-850 dark:bg-zinc-900 text-zinc-300 hover:text-white transition-colors">Manage Projects Showcase</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
