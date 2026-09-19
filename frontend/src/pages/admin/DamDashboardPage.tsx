// src/pages/admin/DamDashboardPage.tsx
import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Folder, Search, Grid, List, Trash2, Edit2, Link2, Upload, Check, FileText, Film, Image as ImageIcon, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { Button } from '../../components/atoms/Button/Button';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { AdminModal, FormField } from '../../components/admin/AdminModal';
import { cn } from '../../lib/cn';

const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
  return `${API_BASE}${url}`;
};

export const DamDashboardPage: React.FC = () => {
  const qc = useQueryClient();
  const [selectedFolder, setSelectedFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Selection states
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal actions
  const [activeAsset, setActiveAsset] = useState<any | null>(null);
  const [usages, setUsages] = useState<string[]>([]);
  const [usagesLoading, setUsagesLoading] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [renameForm, setRenameForm] = useState({ name: '', tags: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id?: string; permanent?: boolean }>({ open: false });

  // Uploader ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const folders = ['All', 'Images', 'Videos', 'Documents', 'Brand', 'Downloads', 'AI_Assets', 'System_Assets', 'Archive'];

  // Queries
  const { data: analytics, isLoading: statsLoading } = useQuery({
    queryKey: ['dam-analytics'],
    queryFn: () => adminApi.getDamAnalytics(),
  });

  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: ['dam-assets', selectedFolder, searchQuery],
    queryFn: () => adminApi.getAssets({
      folder: selectedFolder === 'All' ? undefined : selectedFolder,
      search: searchQuery || undefined,
      includeArchived: selectedFolder === 'Archive',
    }),
  });

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => adminApi.uploadAsset(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) => adminApi.replaceAsset(id, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
      setIsDetailOpen(false);
      setActiveAsset(null);
    },
  });

  const renameMutation = useMutation({
    mutationFn: ({ id, name, tags }: { id: string; name: string; tags: string[] }) => 
      Promise.all([
        adminApi.renameAsset(id, name),
        adminApi.updateAssetTags(id, tags)
      ]),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      setIsRenameOpen(false);
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: string) => adminApi.archiveAsset(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
      setIsDetailOpen(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id, folder }: { id: string; folder: string }) => adminApi.restoreAsset(id, folder),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
      setIsDetailOpen(false);
    },
  });

  const deletePermanentMutation = useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) => adminApi.deleteAssetPermanently(id, force),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
      setDeleteConfirm({ open: false });
      setIsDetailOpen(false);
      setActiveAsset(null);
    },
  });

  // Bulk actions mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await adminApi.deleteAssetPermanently(id, true);
      }
    },
    onSuccess: () => {
      setSelectedAssetIds([]);
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
    },
  });

  const bulkArchiveMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await adminApi.archiveAsset(id);
      }
    },
    onSuccess: () => {
      setSelectedAssetIds([]);
      qc.invalidateQueries({ queryKey: ['dam-assets'] });
      qc.invalidateQueries({ queryKey: ['dam-analytics'] });
    },
  });

  // Load usages before asset details open
  const handleOpenDetail = async (asset: any) => {
    setActiveAsset(asset);
    setIsDetailOpen(true);
    setUsagesLoading(true);
    try {
      const res = await adminApi.getAssetUsage(asset.id);
      setUsages(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setUsagesLoading(false);
    }
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('folder', selectedFolder === 'All' || selectedFolder === 'Archive' ? 'Images' : selectedFolder);
      uploadMutation.mutate(formData);
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0] && activeAsset) {
      const formData = new FormData();
      formData.append('file', files[0]);
      replaceMutation.mutate({ id: activeAsset.id, formData });
    }
  };

  const handleRenameSave = () => {
    if (activeAsset) {
      renameMutation.mutate({
        id: activeAsset.id,
        name: renameForm.name,
        tags: renameForm.tags.split(',').map((t) => t.trim()).filter(Boolean),
      });
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime?.startsWith('image/')) return <ImageIcon className="text-blue-500" size={32} />;
    if (mime?.startsWith('video/')) return <Film className="text-purple-500" size={32} />;
    return <FileText className="text-emerald-500" size={32} />;
  };

  const copyUrlToClipboard = (url: string, id: string) => {
    const full = getFullUrl(url);
    navigator.clipboard.writeText(full);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSelectAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssetIds((prev) => 
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to permanently delete these ${selectedAssetIds.length} assets?`)) {
      bulkDeleteMutation.mutate(selectedAssetIds);
    }
  };

  const handleBulkArchive = () => {
    bulkArchiveMutation.mutate(selectedAssetIds);
  };

  const assets = assetsData?.items || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight dark:text-white text-zinc-900">Digital Asset Management</h1>
          <p className="text-xs dark:text-zinc-400 text-slate-500 mt-1">
            Core repository system for images, documents, videos, and branding logos across the platform.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleUploadFile}
          />
          <Button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 cursor-pointer">
            {uploadMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Upload Asset
          </Button>
        </div>
      </div>

      {/* Storage stats cards */}
      {!statsLoading && analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Used Storage', value: `${analytics.summary.totalUsedGB} GB`, detail: `${analytics.summary.totalAssets} active assets` },
            { label: 'Images Cataloged', value: analytics.folders.Images?.count || 0, detail: `${+((analytics.folders.Images?.bytes || 0) / (1024 * 1024)).toFixed(1)} MB total` },
            { label: 'Documents & Zips', value: analytics.folders.Documents?.count || 0, detail: `${+((analytics.folders.Documents?.bytes || 0) / (1024 * 1024)).toFixed(1)} MB total` },
            { label: 'Unused Assets', value: analytics.summary.unusedAssets, detail: 'Ready for soft-archiving' },
          ].map((card, i) => (
            <div key={i} className="p-4 border dark:border-zinc-800 rounded-xl dark:bg-black/10 bg-white shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">{card.label}</span>
              <p className="text-lg font-black dark:text-white mt-1">{card.value}</p>
              <span className="text-xs dark:text-zinc-500 text-slate-400 mt-2">{card.detail}</span>
            </div>
          ))}
        </div>
      )}

      {/* Explorer Workspace */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left folders panel */}
        <div className="w-full lg:w-56 shrink-0 flex flex-col gap-1.5 border dark:border-zinc-800 p-3 rounded-xl dark:bg-black/5">
          <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase px-3 mb-1">Folders</span>
          {folders.map((f) => {
            const isActive = selectedFolder === f;
            const count = analytics?.folders?.[f]?.count || 0;
            return (
              <button
                key={f}
                onClick={() => { setSelectedFolder(f); setSelectedAssetIds([]); }}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2 text-xs font-semibold rounded-lg text-left cursor-pointer transition-colors w-full",
                  isActive 
                    ? "bg-accent-violet/10 text-accent-violet font-bold" 
                    : "dark:text-zinc-400 text-slate-500 hover:bg-zinc-800/40"
                )}
              >
                <div className="flex items-center gap-2">
                  <Folder size={14} className={isActive ? 'text-accent-violet' : 'text-zinc-500'} />
                  <span>{f.replace('_', ' ')}</span>
                </div>
                {analytics && <span className="text-[10px] bg-zinc-800/50 dark:text-zinc-500 px-2 py-0.5 rounded-full">{f === 'All' ? analytics.summary.totalAssets : count}</span>}
              </button>
            );
          })}
        </div>

        {/* Central Grid Explorer */}
        <div className="flex-grow flex flex-col gap-4">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
              <input
                type="text"
                placeholder="Search assets name or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border rounded-xl dark:border-zinc-800 dark:bg-black/30 text-xs dark:text-white"
              />
            </div>

            {/* View selectors & Bulk actions */}
            <div className="flex gap-2 w-full md:w-auto justify-end">
              {selectedAssetIds.length > 0 && (
                <div className="flex gap-1 border dark:border-zinc-800 rounded-lg p-0.5 mr-2">
                  <button
                    onClick={handleBulkArchive}
                    className="px-2.5 py-1 text-[10px] font-bold dark:text-zinc-300 hover:bg-zinc-800 rounded cursor-pointer"
                  >
                    Archive ({selectedAssetIds.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-500/10 rounded cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                </div>
              )}

              <div className="border dark:border-zinc-800 rounded-lg p-0.5 flex">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn("p-1.5 rounded cursor-pointer", viewMode === 'grid' && "bg-zinc-800 text-white")}
                >
                  <Grid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn("p-1.5 rounded cursor-pointer", viewMode === 'list' && "bg-zinc-800 text-white")}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {assetsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-accent-violet" size={36} />
            </div>
          ) : assets.length === 0 ? (
            <div className="border dark:border-zinc-800 rounded-xl p-16 flex flex-col items-center justify-center text-zinc-500">
              <ImageIcon size={40} className="opacity-30 mb-2" />
              <p className="text-sm">No assets found in this folder.</p>
              <p className="text-xs mt-1 opacity-60">Upload new assets to populate this folder directory.</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {assets.map((asset: any) => {
                const isSel = selectedAssetIds.includes(asset.id);
                return (
                  <div
                    key={asset.id}
                    onClick={() => handleOpenDetail(asset)}
                    className={cn(
                      "group border dark:border-zinc-800 rounded-xl p-2 bg-black/10 dark:hover:border-zinc-700 transition-all cursor-pointer relative",
                      isSel && "border-2 border-accent-violet"
                    )}
                  >
                    {/* Multi select checkbox */}
                    <div
                      onClick={(e) => toggleSelectAsset(asset.id, e)}
                      className={cn(
                        "absolute top-3 left-3 w-4 h-4 rounded border dark:border-zinc-700 flex items-center justify-center z-10 transition-colors bg-black/40",
                        isSel ? "bg-accent-violet border-accent-violet text-white" : "opacity-0 group-hover:opacity-100"
                      )}
                    >
                      {isSel && <Check size={10} />}
                    </div>

                    <div className="w-full h-28 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border dark:border-zinc-900">
                      {asset.mimeType?.startsWith('image/') ? (
                        <img src={getFullUrl(asset.url)} alt={asset.name} className="w-full h-full object-cover" />
                      ) : (
                        getFileIcon(asset.mimeType)
                      )}
                    </div>
                    <div className="mt-2.5 px-1 pb-1">
                      <p className="text-xs font-bold dark:text-zinc-200 truncate leading-tight pr-4">{asset.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] dark:text-zinc-500">{asset.extension.toUpperCase()} • {+(asset.sizeBytes / 1024).toFixed(1)} KB</span>
                        {asset.usageCount > 0 && (
                          <span className="text-[8px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full font-bold">Used</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List View
            <div className="border dark:border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="bg-zinc-800/40 dark:text-zinc-400 text-slate-500 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="p-3 w-8"></th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Folder</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">checksum</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {assets.map((asset: any) => {
                    const isSel = selectedAssetIds.includes(asset.id);
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => handleOpenDetail(asset)}
                        className={cn("hover:bg-zinc-800/10 transition-colors cursor-pointer", isSel && "bg-accent-violet/5")}
                      >
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSel}
                            onChange={(e) => setSelectedAssetIds((prev) => e.target.checked ? [...prev, asset.id] : prev.filter((x) => x !== asset.id))}
                          />
                        </td>
                        <td className="p-3 font-semibold dark:text-zinc-200">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-zinc-950 flex items-center justify-center shrink-0 overflow-hidden">
                              {asset.mimeType?.startsWith('image/') ? (
                                <img src={getFullUrl(asset.url)} className="w-full h-full object-cover" />
                              ) : (
                                getFileIcon(asset.mimeType)
                              )}
                            </div>
                            <span className="truncate max-w-xs">{asset.name}.{asset.extension}</span>
                          </div>
                        </td>
                        <td className="p-3 dark:text-zinc-400">{asset.folder}</td>
                        <td className="p-3 dark:text-zinc-400">{+(asset.sizeBytes / 1024).toFixed(1)} KB</td>
                        <td className="p-3 font-mono text-[10px] dark:text-zinc-500">{asset.checksum?.slice(0, 8) || 'N/A'}</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => copyUrlToClipboard(asset.url, asset.id)}
                            className="p-1.5 text-zinc-400 hover:text-white"
                          >
                            {copiedId === asset.id ? <Check size={14} className="text-emerald-500" /> : <Link2 size={14} />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={isDetailOpen}
        title="Asset Inspection & Metadata"
        onClose={() => setIsDetailOpen(false)}
        size="md"
      >
        {activeAsset && (
          <div className="space-y-5">
            {/* Visual preview */}
            <div className="w-full h-44 rounded-xl border dark:border-zinc-800 bg-zinc-950 flex items-center justify-center overflow-hidden relative group">
              {activeAsset.mimeType?.startsWith('image/') ? (
                <img src={getFullUrl(activeAsset.url)} className="max-h-full object-contain" />
              ) : (
                getFileIcon(activeAsset.mimeType)
              )}
            </div>

            {/* Replace Button */}
            <div className="flex gap-2">
              <input
                ref={replaceInputRef}
                type="file"
                className="hidden"
                onChange={handleReplaceFile}
              />
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1.5"
                onClick={() => replaceInputRef.current?.click()}
              >
                {replaceMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Replace File (Same URL)
              </Button>
              <Button
                variant="outline"
                className="shrink-0 p-2.5"
                onClick={() => copyUrlToClipboard(activeAsset.url, activeAsset.id)}
              >
                {copiedId === activeAsset.id ? <Check className="text-emerald-500" size={16} /> : <Link2 size={16} />}
              </Button>
            </div>

            {/* Metadata Fields */}
            <div className="border dark:border-zinc-800 rounded-xl p-3 bg-black/20 divide-y dark:divide-zinc-800 text-[11px] font-semibold">
              {[
                { label: 'File Name', value: `${activeAsset.name}.${activeAsset.extension}` },
                { label: 'Original Name', value: activeAsset.originalName },
                { label: 'Size', value: `${+(activeAsset.sizeBytes / 1024).toFixed(1)} KB` },
                { label: 'Extension', value: activeAsset.extension.toUpperCase() },
                { label: 'Mime Type', value: activeAsset.mimeType },
                { label: 'Dimensions', value: activeAsset.width ? `${activeAsset.width} x ${activeAsset.height} px` : 'N/A' },
                { label: 'Version', value: `v${activeAsset.version}` },
                { label: 'MD5 checksum', value: activeAsset.checksum || 'N/A' },
                { label: 'Upload Date', value: new Date(activeAsset.createdAt).toLocaleDateString() },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-1.5">
                  <span className="dark:text-zinc-500">{row.label}</span>
                  <span className="dark:text-zinc-300 truncate max-w-xs">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Usages checker warnings */}
            <div className="space-y-2 border dark:border-zinc-800 rounded-xl p-3 bg-zinc-950">
              <span className="text-[10px] font-extrabold tracking-widest text-zinc-500 uppercase">Referencing Usages</span>
              {usagesLoading ? (
                <div className="flex gap-2 items-center py-2 text-zinc-500">
                  <Loader2 size={12} className="animate-spin text-accent-violet" />
                  <span className="text-xs">Scanning relational tables...</span>
                </div>
              ) : usages.length === 0 ? (
                <p className="text-xs text-emerald-500 flex items-center gap-1.5 py-1">
                  <Check size={12} /> Asset is completely safe to delete. No references found.
                </p>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] text-yellow-500 leading-tight">
                    Warning: Asset is used in {usages.length} places. Deleting it will create broken links:
                  </p>
                  <ul className="text-[10px] text-zinc-400 space-y-1 list-disc pl-4">
                    {usages.map((u, k) => <li key={k}>{u}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-1 cursor-pointer"
                onClick={() => {
                  setRenameForm({ name: activeAsset.name, tags: activeAsset.tags?.join(', ') || '' });
                  setIsRenameOpen(true);
                }}
              >
                <Edit2 size={12} /> Rename
              </Button>

              {activeAsset.folder === 'Archive' ? (
                <Button
                  className="w-full cursor-pointer bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => restoreMutation.mutate({ id: activeAsset.id, folder: 'Images' })}
                >
                  Restore Asset
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="w-full cursor-pointer text-amber-500 hover:bg-amber-500/10 border-amber-500/20"
                  onClick={() => archiveMutation.mutate(activeAsset.id)}
                >
                  Archive (Soft Delete)
                </Button>
              )}

              <Button
                className="shrink-0 p-2.5 text-red-500 hover:bg-red-500/10 border-red-500/20 bg-transparent border hover:border-red-500/30"
                onClick={() => setDeleteConfirm({ open: true, id: activeAsset.id, permanent: true })}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Rename Dialog */}
      <AdminModal
        isOpen={isRenameOpen}
        title="Rename Digital Asset"
        onClose={() => setIsRenameOpen(false)}
        footer={
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsRenameOpen(false)}>Cancel</Button>
            <Button onClick={handleRenameSave}>Save Changes</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <FormField label="Asset Display Name">
            <input
              type="text"
              value={renameForm.name}
              onChange={(e) => setRenameForm({ ...renameForm, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl dark:border-zinc-800 dark:bg-black/30 text-xs dark:text-white"
            />
          </FormField>
          <FormField label="Tags (comma separated)">
            <input
              type="text"
              placeholder="logo, brand, homepage"
              value={renameForm.tags}
              onChange={(e) => setRenameForm({ ...renameForm, tags: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl dark:border-zinc-800 dark:bg-black/30 text-xs dark:text-white"
            />
          </FormField>
        </div>
      </AdminModal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Permanently Delete Asset?"
        message={usages.length > 0 
          ? `WARNING: This file is referenced in ${usages.length} pages. Deleting it will create broken layout configurations! Proceed anyway?`
          : "Are you sure you want to permanently erase this digital asset from the hard disk? This cannot be undone."
        }
        onCancel={() => setDeleteConfirm({ open: false })}
        onConfirm={() => deletePermanentMutation.mutate({ id: deleteConfirm.id || '', force: true })}
      />
    </div>
  );
};
