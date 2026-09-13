// src/pages/admin/PortfolioCmsPage/PortfolioCmsPage.tsx
// Complete Portfolio CMS with full CRUD for all tabs + general settings & SEO.
// Projects, Services, Experiences, Education, Certificates, Gallery, Blogs, Testimonials, FAQs, Settings

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../../services/api';
import { ConfirmDialog } from '../../../components/admin/ConfirmDialog';
import { AdminModal, FormField, inputCls, selectCls } from '../../../components/admin/AdminModal';
import { MediaPicker } from '../../../components/admin/MediaPicker';
import { Button } from '../../../components/atoms/Button';
import {
  FolderGit, Briefcase, GraduationCap, Award, Image as ImageIcon,
  HelpCircle, Plus, Edit2, Trash2, Wrench, Info, Settings, Save,
  FileText, Users, Heart
} from 'lucide-react';

import { EnterpriseDataGrid } from '../../../components/organisms/EnterpriseDataGrid/EnterpriseDataGrid';
import type { ColumnDef } from '../../../components/organisms/EnterpriseDataGrid/EnterpriseDataGrid';

// ── Utility ──────────────────────────────────────────────────────────────────
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '—');
const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
  return `${API_BASE}${url}`;
};

// Tab badge colors
const statusColor: Record<string, string> = {
  completed: 'bg-green-500/15 text-green-500',
  in_progress: 'bg-blue-500/15 text-blue-500',
  planned: 'bg-yellow-500/15 text-yellow-500',
  published: 'bg-green-500/15 text-green-500',
  draft: 'bg-zinc-500/15 text-zinc-500',
};

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'projects',     label: 'Projects',     icon: <FolderGit size={15} /> },
  { id: 'services',    label: 'Services',     icon: <Wrench size={15} /> },
  { id: 'experiences', label: 'Experience',   icon: <Briefcase size={15} /> },
  { id: 'education',   label: 'Education',    icon: <GraduationCap size={15} /> },
  { id: 'certificates',label: 'Certificates', icon: <Award size={15} /> },
  { id: 'gallery',     label: 'Gallery',      icon: <ImageIcon size={15} /> },
  { id: 'blog',        label: 'Blog Posts',   icon: <FileText size={15} /> },
  { id: 'testimonials',label: 'Testimonials', icon: <Users size={15} /> },
  { id: 'faqs',        label: 'FAQs',         icon: <HelpCircle size={15} /> },
  { id: 'about',       label: 'About & Hero',  icon: <Info size={15} /> },
  { id: 'seo',         label: 'SEO & Socials', icon: <Settings size={15} /> },
  { id: 'support',     label: 'Support Settings', icon: <Heart size={15} /> },
];

// ── PROJECTS TAB ─────────────────────────────────────────────────────────────
function ProjectsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-projects'], queryFn: () => adminApi.getProjects() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});
  
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createProject(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateProject(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteProject(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-projects'] }); setConfirm({ open: false }); } });

  const openCreate = () => { setForm({ status: 'planned', isFeatured: false, techStack: [] }); setModal({ open: true }); };
  const openEdit = (item: any) => { setForm({ ...item, techStack: Array.isArray(item.techStack) ? item.techStack.join(', ') : '' }); setModal({ open: true, item }); };
  const save = () => {
    const payload = { ...form, techStack: typeof form.techStack === 'string' ? form.techStack.split(',').map((s: string) => s.trim()).filter(Boolean) : form.techStack };
    if (modal.item) updateM.mutate({ id: modal.item.id, data: payload });
    else createM.mutate(payload);
  };

  const rawItems = data?.items || [];
  const filteredItems = rawItems.filter((p: any) => 
    !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

  const projectColumns: ColumnDef<any>[] = [
    {
      key: 'title',
      header: 'Project Title',
      sortable: true,
      render: (p) => (
        <div>
          <div className="font-bold dark:text-white text-slate-800">{p.title}</div>
          <div className="text-[10px] text-zinc-500 font-mono line-clamp-1">{p.description || 'No description provided'}</div>
        </div>
      ),
    },
    { key: 'category', header: 'Category', sortable: true },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (p) => (
        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', statusColor[p.status])}>
          {p.status}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (p) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => openEdit(p)} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setConfirm({ open: true, id: p.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <EnterpriseDataGrid
        title="Portfolio Projects Directory"
        subtitle="Full CRUD management for software solutions, POS systems & AI applications"
        columns={projectColumns}
        data={paginatedItems}
        keyExtractor={(item) => item.id || Math.random().toString()}
        totalItems={filteredItems.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        isOwner={true}
        customHeaderActions={
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={openCreate}>
            Add Project
          </Button>
        }
        emptyStateTitle="No projects found"
        emptyStateDescription="Create a project record or clear your search filter."
      />

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Project' : 'New Project'} size="lg"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title" required><input className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Category"><input className={inputCls} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} /></FormField>
        </div>
        <FormField label="Brief Card Description"><textarea className={inputCls} rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
        
        <FormField label="Project Thumbnail Image">
          <MediaPicker
            value={form.thumbnailUrl}
            assetId={form.thumbnailAssetId}
            allowedFolder="Images"
            onChange={(url, id) => setForm({ ...form, thumbnailUrl: url, thumbnailAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-3 gap-4">
          <FormField label="GitHub Repository URL"><input className={inputCls} value={form.githubUrl || ''} onChange={e => setForm({ ...form, githubUrl: e.target.value })} /></FormField>
          <FormField label="GitLab Repository URL"><input className={inputCls} value={form.gitlabUrl || ''} onChange={e => setForm({ ...form, gitlabUrl: e.target.value })} /></FormField>
          <FormField label="Live Demo URL"><input className={inputCls} value={form.liveUrl || ''} onChange={e => setForm({ ...form, liveUrl: e.target.value })} /></FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Technologies (comma separated)"><input className={inputCls} value={form.techStack || ''} onChange={e => setForm({ ...form, techStack: e.target.value })} placeholder="e.g. React, PostgreSQL, Tailwind" /></FormField>
          <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 pt-6 cursor-pointer select-none">
            <input type="checkbox" checked={form.isFeatured || false} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
            <span>Featured Project</span>
          </label>
        </div>

        <FormField label="Markdown Details Content"><textarea className={inputCls} rows={4} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} /></FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <select className={selectCls} value={form.status || 'planned'} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </FormField>
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Project" message="This will permanently delete this project. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── SERVICES TAB ─────────────────────────────────────────────────────────────
function ServicesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-services'], queryFn: () => adminApi.getServices() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createService(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateService(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteService(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} services live</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ isActive: true, displayOrder: 0 }); setModal({ open: true }); }}>Add Service</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Service</th>
              <th className="p-4">Order</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">No services.</td></tr>}
            {items.map((s: any) => (
              <tr key={s.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4 font-semibold dark:text-white">{s.title}</td>
                <td className="p-4 dark:text-zinc-400">{s.displayOrder}</td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', s.isActive ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500')}>{s.isActive ? 'Active' : 'Disabled'}</span>
                </td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(s); setModal({ open: true, item: s }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: s.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Service' : 'New Service'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Service Title" required><input className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Description"><textarea className={inputCls} rows={4} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
        
        <FormField label="Service Cover Image">
          <MediaPicker
            value={form.imageUrl}
            assetId={form.imageAssetId}
            allowedFolder="Images"
            onChange={(url, id) => setForm({ ...form, imageUrl: url, imageAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
          <FormField label="Active Status">
            <select className={selectCls} value={form.isActive ? 'true' : 'false'} onChange={e => setForm({ ...form, isActive: e.target.value === 'true' })}>
              <option value="true">Active</option>
              <option value="false">Disabled</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Service" message="This will permanently delete this service offering. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── EXPERIENCES TAB ──────────────────────────────────────────────────────────
function ExperiencesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-experiences'], queryFn: () => adminApi.getExperiences() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createExperience(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-experiences'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateExperience(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-experiences'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteExperience(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-experiences'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} experience milestones</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ displayOrder: 0 }); setModal({ open: true }); }}>Add Experience</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Role</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">No experience milestones.</td></tr>}
            {items.map((e: any) => (
              <tr key={e.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4 font-semibold dark:text-white">{e.company}</td>
                <td className="p-4 dark:text-zinc-400">{e.role}</td>
                <td className="p-4 dark:text-zinc-400">{fmtDate(e.startDate)} - {e.current ? 'Present' : fmtDate(e.endDate)}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(e); setModal({ open: true, item: e }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: e.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Experience' : 'New Experience'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Company" required><input className={inputCls} value={form.company || ''} onChange={e => setForm({ ...form, company: e.target.value })} /></FormField>
        <FormField label="Role Title" required><input className={inputCls} value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} /></FormField>
        <FormField label="Job Description"><textarea className={inputCls} rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} /></FormField>
        
        <FormField label="Company Logo Asset">
          <MediaPicker
            value={form.companyLogoUrl}
            assetId={form.logoAssetId}
            allowedFolder="Brand"
            onChange={(url, id) => setForm({ ...form, companyLogoUrl: url, logoAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date"><input type="date" className={inputCls} value={form.startDate ? form.startDate.substring(0, 10) : ''} onChange={e => setForm({ ...form, startDate: e.target.value })} /></FormField>
          <FormField label="End Date"><input type="date" className={inputCls} disabled={form.current} value={form.endDate ? form.endDate.substring(0, 10) : ''} onChange={e => setForm({ ...form, endDate: e.target.value })} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
          <FormField label="Currently Working here?">
            <select className={selectCls} value={form.current ? 'true' : 'false'} onChange={e => setForm({ ...form, current: e.target.value === 'true', endDate: e.target.value === 'true' ? null : form.endDate })}>
              <option value="false">No, ended</option>
              <option value="true">Yes, current</option>
            </select>
          </FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Experience" message="This will permanently delete this experience card. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── EDUCATION TAB ────────────────────────────────────────────────────────────
function EducationTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-education'], queryFn: () => adminApi.getEducation() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createEducation(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-education'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateEducation(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-education'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteEducation(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-education'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} education logs</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ displayOrder: 0 }); setModal({ open: true }); }}>Add Education</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Institution</th>
              <th className="p-4">Degree</th>
              <th className="p-4">Duration</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">No education logs.</td></tr>}
            {items.map((ed: any) => (
              <tr key={ed.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4 font-semibold dark:text-white">{ed.institution}</td>
                <td className="p-4 dark:text-zinc-400">{ed.degree} in {ed.fieldOfStudy}</td>
                <td className="p-4 dark:text-zinc-400">{fmtDate(ed.startDate)} - {fmtDate(ed.endDate)}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(ed); setModal({ open: true, item: ed }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: ed.id })} className="p-1.5 text-red-500 hover:bg-red-550/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Education' : 'New Education'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Institution" required><input className={inputCls} value={form.institution || ''} onChange={e => setForm({ ...form, institution: e.target.value })} /></FormField>
        
        <FormField label="Institution Logo Asset">
          <MediaPicker
            value={form.institutionLogoUrl}
            assetId={form.logoAssetId}
            allowedFolder="Brand"
            onChange={(url, id) => setForm({ ...form, institutionLogoUrl: url, logoAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Degree"><input className={inputCls} value={form.degree || ''} onChange={e => setForm({ ...form, degree: e.target.value })} /></FormField>
          <FormField label="Field of Study"><input className={inputCls} value={form.fieldOfStudy || ''} onChange={e => setForm({ ...form, fieldOfStudy: e.target.value })} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Start Date"><input type="date" className={inputCls} value={form.startDate ? form.startDate.substring(0, 10) : ''} onChange={e => setForm({ ...form, startDate: e.target.value })} /></FormField>
          <FormField label="End Date"><input type="date" className={inputCls} value={form.endDate ? form.endDate.substring(0, 10) : ''} onChange={e => setForm({ ...form, endDate: e.target.value })} /></FormField>
        </div>
        <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Education" message="This will permanently delete this education log card. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── CERTIFICATES TAB ──────────────────────────────────────────────────────────
function CertificatesTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-certificates'], queryFn: () => adminApi.getCertificates() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createCertificate(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-certificates'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateCertificate(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-certificates'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteCertificate(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-certificates'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} certificates total</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ displayOrder: 0 }); setModal({ open: true }); }}>Add Certificate</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Certificate Name</th>
              <th className="p-4">Issuer</th>
              <th className="p-4">Date Issued</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">No certificates.</td></tr>}
            {items.map((c: any) => (
              <tr key={c.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4 font-semibold dark:text-white">{c.title}</td>
                <td className="p-4 dark:text-zinc-400">{c.issuer}</td>
                <td className="p-4 dark:text-zinc-400">{fmtDate(c.issueDate)}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(c); setModal({ open: true, item: c }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: c.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Certificate' : 'New Certificate'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Certificate Title" required><input className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
        <FormField label="Issuing Authority" required><input className={inputCls} value={form.issuer || ''} onChange={e => setForm({ ...form, issuer: e.target.value })} /></FormField>
        
        <FormField label="Certificate Photo/Badge">
          <MediaPicker
            value={form.imageUrl}
            assetId={form.imageAssetId}
            allowedFolder="Brand"
            onChange={(url, id) => setForm({ ...form, imageUrl: url, imageAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Date Issued"><input type="date" className={inputCls} value={form.issueDate ? form.issueDate.substring(0, 10) : ''} onChange={e => setForm({ ...form, issueDate: e.target.value })} /></FormField>
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Certificate" message="This will permanently delete this certificate log record. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── GALLERY TAB ──────────────────────────────────────────────────────────────
function GalleryTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-gallery'], queryFn: () => adminApi.getGallery() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createGalleryItem(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateGalleryItem(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteGalleryItem(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-gallery'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} gallery items total</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ displayOrder: 0 }); setModal({ open: true }); }}>Add Image</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Thumbnail</th>
              <th className="p-4">Title</th>
              <th className="p-4">Category</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-xs text-zinc-500">No gallery items found.</td></tr>}
            {items.map((g: any) => (
              <tr key={g.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4">
                  <img src={getFullUrl(g.imageUrl)} alt={g.title} className="w-10 h-10 object-cover rounded border dark:border-zinc-800" />
                </td>
                <td className="p-4 font-semibold dark:text-white">{g.title}</td>
                <td className="p-4 dark:text-zinc-400">{g.category}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(g); setModal({ open: true, item: g }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: g.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Gallery Item' : 'New Gallery Item'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Image Title" required><input className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
        
        <FormField label="Gallery Image Asset">
          <MediaPicker
            value={form.imageUrl}
            assetId={form.imageAssetId}
            allowedFolder="Images"
            onChange={(url, id) => setForm({ ...form, imageUrl: url, imageAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category"><input className={inputCls} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Recycler, Server Setup" /></FormField>
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Gallery Item" message="This will permanently delete this gallery image card. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── BLOGS TAB ────────────────────────────────────────────────────────────────
function BlogTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-blog-posts'], queryFn: () => adminApi.getBlogPosts() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createBlogPost(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateBlogPost(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteBlogPost(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog-posts'] }); setConfirm({ open: false }); } });

  const save = () => {
    // Add default category and author if not set
    const payload = {
      ...form,
      categoryId: form.categoryId || 'cuid_category_technology',
      authorId: form.authorId || 'admin',
    };
    if (modal.item) updateM.mutate({ id: modal.item.id, data: payload });
    else createM.mutate(payload);
  };

  const rawItems = data?.items || [];
  const items = rawItems.filter((b: any) => {
    const matchesSearch = b.title?.toLowerCase().includes(search.toLowerCase()) || b.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/10 dark:bg-zinc-900/30 p-4 rounded-xl border dark:border-zinc-800 border-slate-200">
        <div className="flex flex-grow items-center gap-3">
          <input
            type="text"
            placeholder="Search blogs..."
            className="px-3 py-1.5 rounded-lg border dark:border-zinc-850 dark:bg-black/30 text-xs dark:text-white max-w-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-3 py-1.5 rounded-lg border dark:border-zinc-850 dark:bg-zinc-950 text-xs dark:text-white"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ status: 'draft', isFeatured: false }); setModal({ open: true }); }}>Add Post</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Cover</th>
              <th className="p-4">Title</th>
              <th className="p-4">Excerpt</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={5} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-xs text-zinc-500">No blog posts found.</td></tr>}
            {items.map((b: any) => (
              <tr key={b.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4">
                  {b.coverImageUrl ? (
                    <img src={getFullUrl(b.coverImageUrl)} className="w-10 h-10 object-cover rounded border dark:border-zinc-800" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-500"><ImageIcon size={16} /></div>
                  )}
                </td>
                <td className="p-4 font-semibold dark:text-white">{b.title}</td>
                <td className="p-4 dark:text-zinc-400 truncate max-w-xs">{b.excerpt}</td>
                <td className="p-4">
                  <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', statusColor[b.status])}>{b.status}</span>
                </td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(b); setModal({ open: true, item: b }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: b.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Post' : 'New Post'} size="lg"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Title" required><input className={inputCls} value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} /></FormField>
          <FormField label="Slug" required><input className={inputCls} value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. database-tuning" /></FormField>
        </div>
        <FormField label="Excerpt" required><textarea className={inputCls} rows={2} value={form.excerpt || ''} onChange={e => setForm({ ...form, excerpt: e.target.value })} /></FormField>
        <FormField label="Content" required><textarea className={inputCls} rows={5} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} /></FormField>
        
        <FormField label="Cover Image">
          <MediaPicker
            value={form.coverImageUrl}
            assetId={form.coverImageAssetId}
            allowedFolder="Images"
            onChange={(url, id) => setForm({ ...form, coverImageUrl: url, coverImageAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Status">
            <select className={selectCls} value={form.status || 'draft'} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
          <FormField label="Category ID"><input className={inputCls} value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value })} placeholder="cuid_category_technology" /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Post" message="This will permanently delete this blog post. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── TESTIMONIALS TAB ──────────────────────────────────────────────────────────
function TestimonialsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-testimonials'], queryFn: () => adminApi.getTestimonials() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});
  const [search, setSearch] = useState('');

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createTestimonial(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateTestimonial(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteTestimonial(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-testimonials'] }); setConfirm({ open: false }); } });

  const save = () => {
    const payload = {
      ...form,
      rating: +form.rating || 5,
      displayOrder: +form.displayOrder || 0,
    };
    if (modal.item) updateM.mutate({ id: modal.item.id, data: payload });
    else createM.mutate(payload);
  };

  const rawItems = data?.items || [];
  const items = rawItems.filter((t: any) => {
    return t.clientName?.toLowerCase().includes(search.toLowerCase()) || t.clientCompany?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/10 dark:bg-zinc-900/30 p-4 rounded-xl border dark:border-zinc-800 border-slate-100">
        <input
          type="text"
          placeholder="Search testimonials..."
          className="px-3 py-1.5 rounded-lg border dark:border-zinc-850 dark:bg-black/30 text-xs dark:text-white max-w-xs"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ rating: 5, isVisible: true, displayOrder: 0 }); setModal({ open: true }); }}>Add Testimonial</Button>
      </div>

      <div className="rounded-2xl border dark:border-zinc-800 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="dark:bg-zinc-900 bg-slate-50 border-b dark:border-zinc-800 text-xs uppercase tracking-wider dark:text-zinc-500 text-slate-400">
            <tr>
              <th className="p-4">Photo</th>
              <th className="p-4">Client</th>
              <th className="p-4">Company/Title</th>
              <th className="p-4">Rating</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800/60 divide-slate-100">
            {isLoading && <tr><td colSpan={5} className="p-4 text-center text-xs text-zinc-500">Loading...</td></tr>}
            {!isLoading && items.length === 0 && <tr><td colSpan={5} className="p-4 text-center text-xs text-zinc-500">No testimonials found.</td></tr>}
            {items.map((t: any) => (
              <tr key={t.id} className="dark:hover:bg-zinc-800/10">
                <td className="p-4">
                  {t.clientPhotoUrl ? (
                    <img src={getFullUrl(t.clientPhotoUrl)} className="w-10 h-10 object-cover rounded-full border dark:border-zinc-850" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500"><ImageIcon size={16} /></div>
                  )}
                </td>
                <td className="p-4 font-semibold dark:text-white">{t.clientName}</td>
                <td className="p-4 dark:text-zinc-400">{t.clientTitle} at {t.clientCompany}</td>
                <td className="p-4 dark:text-zinc-300">{"★".repeat(t.rating)}</td>
                <td className="p-4 text-right space-x-1">
                  <button onClick={() => { setForm(t); setModal({ open: true, item: t }); }} className="p-1.5 text-accent-violet hover:bg-accent-violet/10 rounded-lg cursor-pointer"><Edit2 size={14} /></button>
                  <button onClick={() => setConfirm({ open: true, id: t.id })} className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit Testimonial' : 'New Testimonial'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Client Name" required><input className={inputCls} value={form.clientName || ''} onChange={e => setForm({ ...form, clientName: e.target.value })} /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Client Title"><input className={inputCls} value={form.clientTitle || ''} onChange={e => setForm({ ...form, clientTitle: e.target.value })} /></FormField>
          <FormField label="Client Company"><input className={inputCls} value={form.clientCompany || ''} onChange={e => setForm({ ...form, clientCompany: e.target.value })} /></FormField>
        </div>
        <FormField label="Testimonial Content" required><textarea className={inputCls} rows={4} value={form.content || ''} onChange={e => setForm({ ...form, content: e.target.value })} /></FormField>
        
        <FormField label="Client Photo">
          <MediaPicker
            value={form.clientPhotoUrl}
            assetId={form.clientPhotoAssetId}
            allowedFolder="Images"
            onChange={(url, id) => setForm({ ...form, clientPhotoUrl: url, clientPhotoAssetId: id })}
          />
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Rating"><input type="number" min={1} max={5} className={inputCls} value={form.rating ?? 5} onChange={e => setForm({ ...form, rating: +e.target.value })} /></FormField>
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
        </div>
      </AdminModal>

      <ConfirmDialog isOpen={confirm.open} title="Delete Testimonial" message="This will permanently delete this client testimonial. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── FAQS TAB ─────────────────────────────────────────────────────────────────
function FaqsTab() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-faqs'], queryFn: () => adminApi.getFaqs() });
  const [modal, setModal] = useState<{ open: boolean; item?: any }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [form, setForm] = useState<any>({});

  const createM = useMutation({ mutationFn: (d: any) => adminApi.createFaq(d), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setModal({ open: false }); } });
  const updateM = useMutation({ mutationFn: ({ id, data }: any) => adminApi.updateFaq(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setModal({ open: false }); } });
  const deleteM = useMutation({ mutationFn: (id: string) => adminApi.deleteFaq(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setConfirm({ open: false }); } });

  const save = () => {
    if (modal.item) updateM.mutate({ id: modal.item.id, data: form });
    else createM.mutate(form);
  };

  const items = data?.items || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm dark:text-zinc-400 text-slate-500">{items.length} FAQs</p>
        <Button size="sm" leftIcon={<Plus size={14} />} onClick={() => { setForm({ displayOrder: 0 }); setModal({ open: true }); }}>Add FAQ</Button>
      </div>
      <div className="space-y-3">
        {isLoading && <div className="text-center text-xs text-zinc-500 py-6">Loading...</div>}
        {!isLoading && items.length === 0 && <div className="text-center text-xs text-zinc-500 py-6">No FAQs yet.</div>}
        {items.map((faq: any) => (
          <div key={faq.id} className="p-4 rounded-xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold dark:text-white text-slate-800 text-sm">{faq.question}</p>
                <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1 leading-relaxed">{faq.answer}</p>
                <p className="text-[10px] dark:text-zinc-600 text-slate-400 mt-2 font-semibold">Category: {faq.category || 'General'} · Order: {faq.displayOrder}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { setForm(faq); setModal({ open: true, item: faq }); }} className="p-1.5 rounded-lg hover:bg-accent-violet/10 text-accent-violet cursor-pointer"><Edit2 size={13} /></button>
                <button onClick={() => setConfirm({ open: true, id: faq.id })} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 cursor-pointer"><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <AdminModal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.item ? 'Edit FAQ' : 'New FAQ'} size="md"
        footer={<><Button variant="outline" onClick={() => setModal({ open: false })}>Cancel</Button><Button onClick={save} isLoading={createM.isPending || updateM.isPending}>{modal.item ? 'Save' : 'Create'}</Button></>}
      >
        <FormField label="Question" required><textarea className={inputCls} rows={2} value={form.question || ''} onChange={e => setForm({ ...form, question: e.target.value })} placeholder="What question does this answer?" /></FormField>
        <FormField label="Answer" required><textarea className={inputCls} rows={4} value={form.answer || ''} onChange={e => setForm({ ...form, answer: e.target.value })} placeholder="Detailed answer..." /></FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Category"><input className={inputCls} value={form.category || ''} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Services, Pricing" /></FormField>
          <FormField label="Display Order"><input type="number" className={inputCls} value={form.displayOrder ?? 0} onChange={e => setForm({ ...form, displayOrder: +e.target.value })} /></FormField>
        </div>
      </AdminModal>
      <ConfirmDialog isOpen={confirm.open} title="Delete FAQ" message="This will permanently delete this FAQ. Continue?" onConfirm={() => confirm.id && deleteM.mutate(confirm.id)} onCancel={() => setConfirm({ open: false })} isPending={deleteM.isPending} />
    </div>
  );
}

// ── GENERAL METADATA SETTINGS TAB (ABOUT & HERO) ─────────────────────────────
function AboutHeroTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: () => adminApi.getSettings() });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Array<{ key: string; value: string }>) => adminApi.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      alert('Hero & About settings updated successfully!');
    }
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.key] = s.value; });
      setFormValues(vals);
    }
  }, [settings]);

  if (isLoading) return <div className="text-center py-6 text-xs text-zinc-500">Loading settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(formValues).map(([key, value]) => ({ key, value }));
    updateSettingsMutation.mutate(updates);
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-6 text-left">
      <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider text-zinc-400 border-b dark:border-zinc-800 pb-2 flex items-center gap-2"><Info size={16} /> Personal Bio & Hero Section Config</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Hero Title Prefix (English)"><input className={inputCls} value={formValues.hero_title_prefix_en || ''} onChange={e => handleFieldChange('hero_title_prefix_en', e.target.value)} /></FormField>
        <FormField label="Hero Title Prefix (Swahili)"><input className={inputCls} value={formValues.hero_title_prefix_sw || ''} onChange={e => handleFieldChange('hero_title_prefix_sw', e.target.value)} /></FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Founder Name"><input className={inputCls} value={formValues.founder_name || ''} onChange={e => handleFieldChange('founder_name', e.target.value)} /></FormField>
        <FormField label="Founder Professional Title"><input className={inputCls} value={formValues.founder_title || ''} onChange={e => handleFieldChange('founder_title', e.target.value)} /></FormField>
      </div>

      <FormField label="Founder Description / Mini-Bio (English)"><textarea className={inputCls} rows={3} value={formValues.hero_desc_en || ''} onChange={e => handleFieldChange('hero_desc_en', e.target.value)} /></FormField>
      <FormField label="Founder Description / Mini-Bio (Swahili)"><textarea className={inputCls} rows={3} value={formValues.hero_desc_sw || ''} onChange={e => handleFieldChange('hero_desc_sw', e.target.value)} /></FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-zinc-800 pt-6">
        <FormField label="Founder Photo">
          <MediaPicker
            value={formValues.founder_photo_url || ''}
            assetId={formValues.founder_photo_asset_id || ''}
            allowedFolder="Images"
            onChange={(url, id) => {
              handleFieldChange('founder_photo_url', url);
              handleFieldChange('founder_photo_asset_id', id);
            }}
          />
        </FormField>
        <FormField label="Brand Logo Image">
          <MediaPicker
            value={formValues.brand_logo_url || ''}
            assetId={formValues.brand_logo_asset_id || ''}
            allowedFolder="Brand"
            onChange={(url, id) => {
              handleFieldChange('brand_logo_url', url);
              handleFieldChange('brand_logo_asset_id', id);
            }}
          />
        </FormField>
      </div>

      <div className="flex justify-end pt-4 border-t dark:border-zinc-855">
        <Button type="submit" variant="primary" leftIcon={<Save size={14} />} isLoading={updateSettingsMutation.isPending}>Save Bio Config</Button>
      </div>
    </form>
  );
}

// ── SEO & SOCIAL LINK SETTINGS TAB ───────────────────────────────────────────
function SeoSocialsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: () => adminApi.getSettings() });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Array<{ key: string; value: string }>) => adminApi.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      alert('SEO & Social links saved successfully!');
    }
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.key] = s.value; });
      setFormValues(vals);
    }
  }, [settings]);

  if (isLoading) return <div className="text-center py-6 text-xs text-zinc-500">Loading SEO settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates = Object.entries(formValues).map(([key, value]) => ({ key, value }));
    updateSettingsMutation.mutate(updates);
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-6 text-left">
      <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider text-zinc-400 border-b dark:border-zinc-800 pb-2 flex items-center gap-2"><Settings size={16} /> Global SEO Metadata & Social Accounts</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Meta Title Tag"><input className={inputCls} value={formValues.meta_title || ''} onChange={e => handleFieldChange('meta_title', e.target.value)} /></FormField>
        <FormField label="Meta Keywords Tag"><input className={inputCls} value={formValues.meta_keywords || ''} onChange={e => handleFieldChange('meta_keywords', e.target.value)} /></FormField>
      </div>

      <FormField label="Meta Description Tag"><textarea className={inputCls} rows={2} value={formValues.meta_description || ''} onChange={e => handleFieldChange('meta_description', e.target.value)} /></FormField>

      <FormField label="OpenGraph Image (SEO Preview)">
        <MediaPicker
          value={formValues.og_image_url || ''}
          assetId={formValues.og_image_asset_id || ''}
          allowedFolder="Images"
          onChange={(url, id) => {
            handleFieldChange('og_image_url', url);
            handleFieldChange('og_image_asset_id', id);
          }}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-zinc-800 pt-6">
        <FormField label="LinkedIn Profile URL"><input className={inputCls} value={formValues.social_linkedin || ''} onChange={e => handleFieldChange('social_linkedin', e.target.value)} /></FormField>
        <FormField label="GitHub Profile URL"><input className={inputCls} value={formValues.social_github || ''} onChange={e => handleFieldChange('social_github', e.target.value)} /></FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="YouTube Channel URL"><input className={inputCls} value={formValues.social_youtube || ''} onChange={e => handleFieldChange('social_youtube', e.target.value)} /></FormField>
        <FormField label="Office Email Address"><input className={inputCls} value={formValues.contact_email || ''} onChange={e => handleFieldChange('contact_email', e.target.value)} /></FormField>
      </div>

      <div className="flex justify-end pt-4 border-t dark:border-zinc-850">
        <Button type="submit" variant="primary" leftIcon={<Save size={14} />} isLoading={updateSettingsMutation.isPending}>Save Meta Settings</Button>
      </div>
    </form>
  );
}

function SupportSettingsTab() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({ queryKey: ['admin-settings'], queryFn: () => adminApi.getSettings() });

  const updateSettingsMutation = useMutation({
    mutationFn: (updates: Array<{ key: string; value: string }>) => adminApi.updateSettings(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      alert('Support settings saved successfully!');
    }
  });

  const [formValues, setFormValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      const vals: Record<string, string> = {};
      settings.forEach((s: any) => { vals[s.key] = s.value; });
      if (vals.support_enabled === undefined) vals.support_enabled = 'true';
      if (vals.support_title === undefined) vals.support_title = 'Support My Work';
      if (vals.support_description === undefined) vals.support_description = '';
      if (vals.support_amounts === undefined) vals.support_amounts = '5000,10000,25000,50000,100000';
      if (vals.support_custom_enabled === undefined) vals.support_custom_enabled = 'true';
      if (vals.support_currency === undefined) vals.support_currency = 'TZS';
      if (vals.support_thank_you === undefined) vals.support_thank_you = 'Thank you for supporting!';
      setFormValues(vals);
    }
  }, [settings]);

  if (isLoading) return <div className="text-center py-6 text-xs text-zinc-500">Loading Support settings...</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetKeys = [
      'support_enabled', 'support_title', 'support_description', 
      'support_amounts', 'support_custom_enabled', 'support_currency', 
      'support_thank_you'
    ];
    const updates = targetKeys.map(key => ({ key, value: formValues[key] || '' }));
    updateSettingsMutation.mutate(updates);
  };

  const handleFieldChange = (key: string, val: string) => {
    setFormValues(prev => ({ ...prev, [key]: val }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl border dark:border-zinc-800 dark:bg-zinc-900/40 bg-white space-y-6 text-left animate-fade-in">
      <h3 className="font-bold text-sm dark:text-white uppercase tracking-wider text-zinc-400 border-b dark:border-zinc-800 pb-2 flex items-center gap-2">
        <Heart size={16} className="text-red-500 fill-red-500/20" /> Support Me & Donation Page Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label="Support Page Title"><input className={inputCls} value={formValues.support_title || ''} onChange={e => handleFieldChange('support_title', e.target.value)} /></FormField>
        <FormField label="Suggested Preset Amounts (comma-separated)"><input className={inputCls} value={formValues.support_amounts || ''} onChange={e => handleFieldChange('support_amounts', e.target.value)} placeholder="e.g. 5000,10000,25000" /></FormField>
      </div>

      <FormField label="Support Description"><textarea className={inputCls} rows={2} value={formValues.support_description || ''} onChange={e => handleFieldChange('support_description', e.target.value)} /></FormField>
      <FormField label="Thank You Message"><textarea className={inputCls} rows={2} value={formValues.support_thank_you || ''} onChange={e => handleFieldChange('support_thank_you', e.target.value)} /></FormField>

      <div className="grid grid-cols-3 gap-6 pt-4 border-t dark:border-zinc-800">
        <FormField label="Enable Donation Gateway">
          <select className={selectCls} value={formValues.support_enabled || 'true'} onChange={e => handleFieldChange('support_enabled', e.target.value)}>
            <option value="true">Enabled (Visible)</option>
            <option value="false">Disabled (Hidden)</option>
          </select>
        </FormField>
        <FormField label="Enable Custom Donation Inputs">
          <select className={selectCls} value={formValues.support_custom_enabled || 'true'} onChange={e => handleFieldChange('support_custom_enabled', e.target.value)}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </FormField>
        <FormField label="Default Currency Display">
          <select className={selectCls} value={formValues.support_currency || 'TZS'} onChange={e => handleFieldChange('support_currency', e.target.value)}>
            <option value="TZS">TZS (Tanzanian Shilling)</option>
            <option value="USD">USD (US Dollar)</option>
          </select>
        </FormField>
      </div>

      <div className="flex justify-end pt-4 border-t dark:border-zinc-850">
        <Button type="submit" variant="primary" leftIcon={<Save size={14} />} isLoading={updateSettingsMutation.isPending}>Save Support Settings</Button>
      </div>
    </form>
  );
}

// ── MAIN CMS COMPONENT ───────────────────────────────────────────────────────
export const PortfolioCmsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'projects');

  useEffect(() => {
    const t = searchParams.get('tab');
    if (t) {
      setActiveTab(t);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabComponents: Record<string, React.ReactNode> = {
    projects: <ProjectsTab />,
    services: <ServicesTab />,
    experiences: <ExperiencesTab />,
    education: <EducationTab />,
    certificates: <CertificatesTab />,
    gallery: <GalleryTab />,
    blog: <BlogTab />,
    testimonials: <TestimonialsTab />,
    faqs: <FaqsTab />,
    about: <AboutHeroTab />,
    seo: <SeoSocialsTab />,
    support: <SupportSettingsTab />,
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="border-b dark:border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold dark:text-white light:text-slate-800 tracking-tight">Content CMS & Portfolio Manager</h1>
        <p className="text-sm dark:text-zinc-500 text-slate-500 mt-1">
          Full CRUD portfolio sections management, hero configurations, social media tags, and FAQs.
        </p>
      </div>

      {/* Tab Strip */}
      <div className="flex items-center gap-1 p-1 rounded-xl dark:bg-zinc-900/60 bg-slate-100 w-fit flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              activeTab === tab.id
                ? 'bg-accent-violet text-white shadow-sm'
                : 'dark:text-zinc-400 text-slate-500 hover:dark:text-white hover:text-slate-800'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{tabComponents[activeTab]}</div>
    </div>
  );
};
