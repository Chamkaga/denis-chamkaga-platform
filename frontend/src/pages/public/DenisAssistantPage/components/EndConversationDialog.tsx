// DenisAssistantPage/components/EndConversationDialog.tsx
import React from 'react';
import { XCircle, X } from 'lucide-react';

interface EndConversationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const EndConversationDialog: React.FC<EndConversationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl overflow-hidden flex flex-col p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 shrink-0">
              <XCircle size={16} />
            </div>
            <h3 className="text-sm font-bold dark:text-white light:text-slate-800 font-display">
              End Conversation
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg dark:hover:bg-zinc-800 light:hover:bg-slate-100 dark:text-zinc-400 light:text-zinc-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body text-left">
          Are you sure you want to end this conversation? This will mark the session as concluded in the business dashboard. You will be able to review the session summary and provide feedback.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold dark:text-zinc-400 light:text-slate-600 dark:hover:bg-zinc-800 light:hover:bg-slate-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all cursor-pointer"
          >
            End Chat
          </button>
        </div>
      </div>
    </div>
  );
};
