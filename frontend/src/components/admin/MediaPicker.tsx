// src/components/admin/MediaPicker.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, FileText, Film, Upload, Search, Folder, Check, X, Loader2 } from 'lucide-react';
import { adminApi } from '../../services/api';
import { AdminModal } from './AdminModal';
import { cn } from '../../lib/cn';

// Helper to resolve absolute file URLs
const getFullUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || '';
  return `${API_BASE}${url}`;
};

interface MediaPickerProps {
  value?: string;           // selected asset URL
  assetId?: string;         // selected asset DB ID
  onChange: (url: string, id: string) => void;
  label?: string;
  allowedFolder?: string;   // restrict selection/upload folder: "Images", "Videos", etc.
  disabled?: boolean;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({
  value,
  assetId,
  onChange,
  label,
  allowedFolder = 'Images',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>(allowedFolder);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const folders = [
    'Images',
    'Documents',
    'Videos',
    'Audio',
    'Downloads',
    'Logos',
    'Icons',
    'Brand Assets',
    'AI Assets',
  ];

  // Fetch assets for library browsing
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAssets({
        folder: selectedFolder,
        search: searchQuery || undefined,
        page,
        limit: 9,
      });
      setAssets(res.items || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAssets();
    }
  }, [isOpen, selectedFolder, searchQuery, page]);

  // Handle local file upload
  const handleFileUpload = async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Ensure we upload to the allowedFolder or fall back to selectedFolder
      formData.append('folder', allowedFolder || selectedFolder);
      
      const newAsset = await adminApi.uploadAsset(formData);
      onChange(newAsset.url, newAsset.id);
      setIsOpen(false);
    } catch (err: any) {
      setUploadError(err?.response?.data?.error?.message || 'File upload failed. Check the file size or format.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (mime: string) => {
    if (mime?.startsWith('image/')) return <ImageIcon className="text-blue-500" size={32} />;
    if (mime?.startsWith('video/')) return <Film className="text-purple-500" size={32} />;
    return <FileText className="text-emerald-500" size={32} />;
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-2 text-left">
      {label && (
        <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {label}
        </span>
      )}

      {/* Selected Asset Area & Drag/Drop Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all relative overflow-hidden",
          "dark:border-zinc-800 bg-white/5 dark:bg-black/25 backdrop-blur-md",
          isDragging && "border-dashed border-accent-violet bg-accent-violet/5 scale-[1.01]",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Drag Over Overlay Visual indicator */}
        {isDragging && (
          <div className="absolute inset-0 bg-accent-violet/10 flex items-center justify-center pointer-events-none z-20">
            <span className="text-xs font-bold text-accent-violet flex items-center gap-1.5">
              <Upload size={14} className="animate-bounce" /> Drop file here to upload directly
            </span>
          </div>
        )}

        {/* Preview Thumbnail */}
        <div className="w-16 h-16 rounded-lg overflow-hidden border dark:border-zinc-700 bg-zinc-900 flex items-center justify-center shrink-0">
          {value ? (
            value.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) ? (
              <img src={getFullUrl(value)} alt="Selected Asset" className="w-full h-full object-cover" />
            ) : (
              getFileIcon(value.endsWith('.mp4') ? 'video/mp4' : 'application/pdf')
            )
          ) : (
            <ImageIcon className="text-zinc-600" size={24} />
          )}
        </div>

        <div className="flex-grow min-w-0">
          <p className="text-sm font-semibold truncate dark:text-zinc-200 text-slate-800">
            {value ? value.split('/').pop() : 'No Asset Selected'}
          </p>
          <p className="text-xs dark:text-zinc-500 text-slate-400 truncate mt-0.5">
            {value ? `URL: ${value}` : 'Drag & drop a file here, or use the options to the right.'}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setIsOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold border dark:border-zinc-700 hover:bg-zinc-800/50 dark:hover:bg-zinc-800 transition-colors rounded-lg cursor-pointer text-slate-900 dark:text-white flex items-center gap-1.5"
          >
            Choose Existing
          </button>
          
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-2 text-xs font-semibold bg-accent-violet hover:bg-accent-violet/90 text-white transition-colors rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            {isUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
            Upload File
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files[0]) handleFileUpload(files[0]);
            }}
          />

          {value && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange('', '')}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg cursor-pointer shrink-0"
              title="Remove Asset"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}

      {/* Library Selection Modal */}
      <AdminModal
        isOpen={isOpen}
        title="Choose Asset From Library"
        onClose={() => setIsOpen(false)}
        size="xl"
      >
        <div className="flex flex-col h-[70vh] text-left">
          <div className="flex-grow min-h-0 flex flex-col md:flex-row gap-4 pt-2">
            {/* Sidebar folders */}
            <div className="w-full md:w-48 shrink-0 flex flex-col gap-1 pr-4 border-r dark:border-zinc-800 border-slate-200">
              <span className="text-[10px] font-extrabold text-zinc-500 tracking-widest uppercase mb-1 px-2">Folders</span>
              {folders.map((folder) => {
                const isSelected = selectedFolder === folder;
                return (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => { setSelectedFolder(folder); setPage(1); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-left cursor-pointer transition-colors w-full",
                      isSelected
                        ? "bg-accent-violet/10 text-accent-violet"
                        : "dark:text-zinc-400 text-slate-500 hover:bg-zinc-800/50"
                    )}
                  >
                    <Folder size={14} className={isSelected ? 'text-accent-violet' : 'text-zinc-500'} />
                    {folder}
                  </button>
                );
              })}
            </div>

            {/* Content pane */}
            <div className="flex-grow flex flex-col">
              {/* Toolbar */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search assets by filename or tag..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-4 py-2 border rounded-xl dark:border-zinc-800 dark:bg-black/30 text-xs dark:text-white"
                />
              </div>

              {/* Grid */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-accent-violet" size={32} />
                  </div>
                ) : assets.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-12">
                    <ImageIcon size={32} className="opacity-40 mb-2 animate-pulse" />
                    <p className="text-xs">No assets found in folder "{selectedFolder}".</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {assets.map((asset) => {
                      const isSelected = asset.id === assetId || asset.url === value;
                      return (
                        <div
                          key={asset.id}
                          onClick={() => {
                            onChange(asset.url, asset.id);
                            setIsOpen(false);
                          }}
                          className={cn(
                            "group relative border rounded-xl dark:border-zinc-800 p-2 bg-black/10 hover:border-accent-violet transition-all cursor-pointer select-none",
                            isSelected && "border-2 border-accent-violet bg-accent-violet/5"
                          )}
                        >
                          <div className="w-full h-24 rounded-lg bg-zinc-950 flex items-center justify-center overflow-hidden border dark:border-zinc-900">
                            {asset.mimeType?.startsWith('image/') ? (
                              <img src={getFullUrl(asset.url)} alt={asset.name} className="w-full h-full object-cover" />
                            ) : (
                              getFileIcon(asset.mimeType)
                            )}
                          </div>
                          <p className="text-[11px] font-bold dark:text-zinc-300 truncate mt-2 leading-tight pr-4">{asset.name}</p>
                          <p className="text-[9px] dark:text-zinc-500 truncate mt-0.5">{asset.extension.toUpperCase()} • {+(asset.sizeBytes / 1024).toFixed(1)} KB</p>

                          {isSelected && (
                            <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-accent-violet flex items-center justify-center text-white z-10">
                              <Check size={12} />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination footer */}
              {totalPages > 1 && (
                <div className="flex gap-2 justify-end mt-4 pt-3 border-t dark:border-zinc-800 border-slate-200">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    className="px-3 py-1 text-xs border rounded-lg dark:border-zinc-700 dark:text-white disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <span className="text-xs dark:text-zinc-400 text-slate-500 self-center">Page {page} of {totalPages}</span>
                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 text-xs border rounded-lg dark:border-zinc-700 dark:text-white disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminModal>
    </div>
  );
};
