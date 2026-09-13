// components/atoms/Toast/Toast.tsx
// Production-grade toast notification component.
// Variants: success | error | warning | info

import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../../lib/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  variant: ToastVariant;
  title?: string;
  message: string;
  duration?: number; // ms — 0 = persistent
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

const VARIANT_CONFIG: Record<
  ToastVariant,
  { icon: React.ReactNode; classes: string; iconColor: string; barColor: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    classes: 'dark:bg-zinc-900 dark:border-emerald-500/30 light:bg-white light:border-emerald-500/40',
    iconColor: 'text-emerald-400',
    barColor: 'bg-emerald-500',
  },
  error: {
    icon: <XCircle size={18} />,
    classes: 'dark:bg-zinc-900 dark:border-red-500/30 light:bg-white light:border-red-500/40',
    iconColor: 'text-red-400',
    barColor: 'bg-red-500',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    classes: 'dark:bg-zinc-900 dark:border-amber-500/30 light:bg-white light:border-amber-500/40',
    iconColor: 'text-amber-400',
    barColor: 'bg-amber-500',
  },
  info: {
    icon: <Info size={18} />,
    classes: 'dark:bg-zinc-900 dark:border-accent-violet/30 light:bg-white light:border-accent-violet/30',
    iconColor: 'text-accent-violet',
    barColor: 'bg-accent-violet',
  },
};

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const config = VARIANT_CONFIG[toast.variant];
  const duration = toast.duration ?? (toast.variant === 'error' ? 6000 : 4000);

  const handleDismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  useEffect(() => {
    // Enter animation
    const enterTimer = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(enterTimer);
  }, []);

  useEffect(() => {
    if (duration === 0) return; // persistent
    const timer = setTimeout(() => handleDismiss(), duration);
    return () => clearTimeout(timer);
  }, [duration, handleDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'relative flex items-start gap-3 w-[360px] max-w-[calc(100vw-2rem)]',
        'rounded-xl border shadow-xl px-4 py-3.5 overflow-hidden',
        'transition-all duration-300',
        config.classes,
        visible && !leaving
          ? 'opacity-100 translate-x-0'
          : leaving
          ? 'opacity-0 translate-x-6'
          : 'opacity-0 translate-x-6'
      )}
    >
      {/* Progress bar */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 h-[2px] w-full">
          <div
            className={cn('h-full', config.barColor)}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      {/* Icon */}
      <span className={cn('mt-0.5 flex-shrink-0', config.iconColor)}>
        {config.icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold dark:text-white light:text-slate-900 mb-0.5">
            {toast.title}
          </p>
        )}
        <p className={cn(
          'text-sm dark:text-zinc-300 light:text-slate-600',
          !toast.title && 'font-medium dark:text-white light:text-slate-800'
        )}>
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="flex-shrink-0 p-1 -mr-1 rounded-md dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-800 light:text-slate-400 light:hover:text-slate-600 light:hover:bg-slate-100 transition-colors duration-150 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
};
