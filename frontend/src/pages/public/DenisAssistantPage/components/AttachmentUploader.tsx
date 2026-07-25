// DenisAssistantPage/components/AttachmentUploader.tsx
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paperclip, X, FileText, Image, Loader } from 'lucide-react';
import { aiApi } from '../../../../services/api';

export interface UploadedAttachment {
  id: string;
  url: string;
  name: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  extension: string;
}

interface AttachmentUploaderProps {
  attachments: UploadedAttachment[];
  onAttachmentsChange: (attachments: UploadedAttachment[]) => void;
  disabled?: boolean;
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.pdf,.docx,.xlsx';
const MAX_SIZE_MB = 10;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFileIcon(mimeType: string): React.ReactNode {
  if (mimeType.startsWith('image/')) return <Image size={12} />;
  return <FileText size={12} />;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  attachments,
  onAttachmentsChange,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);

    const file = files[0]; // Process one at a time
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_SIZE_MB}MB allowed.`);
      return;
    }

    setUploading(true);
    try {
      const asset = await aiApi.uploadAttachment(file);
      onAttachmentsChange([...attachments, asset]);
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || 'Upload failed. Please try again.';
      setError(msg);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-2">
      {/* Attachment Chips */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 px-1"
          >
            {attachments.map(a => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border dark:border-zinc-700/80 light:border-slate-200 dark:bg-zinc-800/60 light:bg-slate-50 text-[10px] dark:text-zinc-300 light:text-slate-600 max-w-[160px]"
              >
                <span className="text-accent-violet/80 shrink-0">{getFileIcon(a.mimeType)}</span>
                <span className="truncate">{a.originalName}</span>
                <span className="text-[9px] dark:text-zinc-600 light:text-slate-400 shrink-0">
                  {formatBytes(a.sizeBytes)}
                </span>
                <button
                  onClick={() => removeAttachment(a.id)}
                  className="ml-0.5 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer shrink-0"
                >
                  <X size={10} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[10px] text-red-400 px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
        disabled={disabled || uploading}
      />

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        disabled={disabled || uploading}
        className={`p-2 rounded-lg transition-all cursor-pointer ${
          isDragging
            ? 'dark:bg-accent-violet/20 light:bg-violet-50 border border-accent-violet/50 text-accent-violet'
            : 'dark:text-zinc-500 light:text-slate-400 dark:hover:text-zinc-300 light:hover:text-slate-600 dark:hover:bg-zinc-800/40 light:hover:bg-slate-100'
        } disabled:opacity-40 disabled:cursor-not-allowed`}
        title="Attach file (images, PDF, documents)"
        aria-label="Attach file"
      >
        {uploading ? (
          <Loader size={16} className="animate-spin text-accent-violet" />
        ) : (
          <Paperclip size={16} />
        )}
      </button>
    </div>
  );
};
