// src/components/admin/AdminModal.tsx
// Reusable slide-in / centered modal for admin create/edit forms.

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  size = 'md',
  footer,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full ${sizeMap[size]} rounded-2xl border dark:border-zinc-800 dark:bg-[#0e0e10] bg-white shadow-2xl flex flex-col max-h-[90vh] animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b dark:border-zinc-800 border-slate-200 shrink-0">
          <div>
            <h2 className="text-lg font-bold dark:text-white text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs dark:text-zinc-500 text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer dark:text-zinc-400 text-slate-500 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="shrink-0 p-6 border-t dark:border-zinc-800 border-slate-200 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Input row helper for modal forms
export const FormField: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}> = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-semibold dark:text-zinc-400 text-slate-500 uppercase tracking-wider">
      {label}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11px] dark:text-zinc-600 text-slate-400">{hint}</p>}
  </div>
);

// Standard input style
export const inputCls = `w-full rounded-xl border dark:border-zinc-700 border-slate-300 dark:bg-zinc-900 bg-slate-50 dark:text-white text-slate-800 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent-violet/50 transition placeholder:text-zinc-500`;

// Select style
export const selectCls = `${inputCls} cursor-pointer`;
