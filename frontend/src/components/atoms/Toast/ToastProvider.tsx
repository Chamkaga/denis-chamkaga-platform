// components/atoms/Toast/ToastProvider.tsx
// Global toast queue manager. Wrap App root with this provider.
// Usage: const { toast } = useToast();  toast.success('Saved!');

import React, { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { Toast } from './Toast';
import type { ToastData, ToastVariant } from './Toast';

// ─── Context ─────────────────────────────────────────────────────────────────

interface ToastContextValue {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error:   (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info:    (message: string, title?: string, duration?: number) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 3;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback(
    (variant: ToastVariant, message: string, title?: string, duration?: number) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setToasts((prev) => {
        // Keep only the last MAX_VISIBLE items
        const next = [...prev, { id, variant, message, title, duration }];
        return next.slice(-MAX_VISIBLE);
      });
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const contextValue: ToastContextValue = {
    toast: {
      success: (msg, title, dur) => addToast('success', msg, title, dur),
      error:   (msg, title, dur) => addToast('error',   msg, title, dur),
      warning: (msg, title, dur) => addToast('warning', msg, title, dur),
      info:    (msg, title, dur) => addToast('info',    msg, title, dur),
      dismiss,
    },
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 pointer-events-none"
        >
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }
  return ctx;
}
