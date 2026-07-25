// src/components/admin/ConfirmDialog.tsx
// Reusable confirmation modal for destructive actions (delete, etc.)

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isPending = false,
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border dark:border-zinc-800 dark:bg-[#0e0e10] bg-white shadow-2xl p-6 space-y-5 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
            <AlertTriangle size={20} className={variant === 'danger' ? 'text-red-500' : 'text-yellow-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold dark:text-white text-slate-900 text-base leading-tight">{title}</h3>
            <p className="text-sm dark:text-zinc-400 text-slate-500 mt-1 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-zinc-400 text-slate-500"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="px-4 py-2 rounded-xl text-sm font-semibold border dark:border-zinc-700 dark:text-zinc-300 text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors cursor-pointer flex items-center gap-2 ${
              variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'
            } disabled:opacity-60`}
          >
            {isPending && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
