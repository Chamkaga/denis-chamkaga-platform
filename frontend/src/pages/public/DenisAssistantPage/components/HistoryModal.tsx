// src/pages/public/DenisAssistantPage/components/HistoryModal.tsx
import React, { useState } from 'react';
import { X, MessageSquare, Trash2, Edit2, Check } from 'lucide-react';
import type { RecentSession } from './DenisAISidebar';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: RecentSession[];
  activeSessionId?: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRename,
  onDelete,
  onClearHistory,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  // Grouping helpers
  const groupSessions = (list: RecentSession[]) => {
    const today: RecentSession[] = [];
    const yesterday: RecentSession[] = [];
    const older: RecentSession[] = [];

    const now = new Date();
    const todayStr = now.toDateString();

    const yesterdayDate = new Date();
    yesterdayDate.setDate(now.getDate() - 1);
    const yesterdayStr = yesterdayDate.toDateString();

    list.forEach(s => {
      const d = new Date(s.startedAt);
      const dStr = d.toDateString();
      if (dStr === todayStr) {
        today.push(s);
      } else if (dStr === yesterdayStr) {
        yesterday.push(s);
      } else {
        older.push(s);
      }
    });

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = groupSessions(sessions);

  const startEdit = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const saveEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) {
      onDelete(id);
    }
  };

  const renderSessionItem = (s: RecentSession) => {
    const isActive = s.id === activeSessionId;
    const isEditing = s.id === editingId;

    return (
      <div
        key={s.id}
        onClick={() => {
          if (!isEditing) {
            onSelectSession(s.id);
            onClose();
          }
        }}
        className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
          isActive
            ? 'border-accent-violet dark:bg-accent-violet/10 light:bg-violet-50 text-accent-violet'
            : 'dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/40 light:bg-slate-50 hover:border-zinc-700 dark:text-zinc-300 light:text-slate-700'
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <MessageSquare size={14} className="shrink-0 text-accent-violet/70" />
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onClick={e => e.stopPropagation()}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit(e as any, s.id);
                if (e.key === 'Escape') setEditingId(null);
              }}
              className="flex-1 bg-transparent border-b border-accent-violet dark:text-white light:text-slate-800 text-xs focus:outline-none py-0.5"
              autoFocus
            />
          ) : (
            <span className="text-xs font-medium truncate leading-tight">
              {s.title || `Chat Session ${s.id.substring(0, 5)}`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {isEditing ? (
            <button
              onClick={e => saveEdit(e, s.id)}
              className="p-1 rounded dark:hover:bg-zinc-800 light:hover:bg-slate-200 text-green-500 cursor-pointer"
            >
              <Check size={12} />
            </button>
          ) : (
            <>
              <button
                onClick={e => startEdit(e, s.id, s.title)}
                className="p-1 rounded dark:hover:bg-zinc-800 light:hover:bg-slate-200 dark:text-zinc-500 light:text-slate-400 hover:text-accent-violet transition-colors cursor-pointer"
                title="Rename"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={e => handleDelete(e, s.id)}
                className="p-1 rounded dark:hover:bg-zinc-800 light:hover:bg-slate-200 dark:text-zinc-500 light:text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl overflow-hidden flex flex-col max-h-[500px]">
        {/* Header */}
        <div className="px-4 py-3.5 border-b dark:border-zinc-800/60 light:border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={16} className="text-accent-violet" />
            <h3 className="text-sm font-bold dark:text-white light:text-slate-800 font-display">
              Your Conversations
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg dark:hover:bg-zinc-800 light:hover:bg-slate-100 dark:text-zinc-400 light:text-zinc-500 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* List content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar">
          {sessions.length === 0 ? (
            <p className="text-xs text-center dark:text-zinc-500 light:text-slate-400 py-8 font-body">
              No conversations found. Start a new chat session to begin.
            </p>
          ) : (
            <>
              {today.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold dark:text-zinc-550 light:text-slate-400 uppercase tracking-widest text-left">
                    Today
                  </h4>
                  <div className="space-y-1.5">{today.map(renderSessionItem)}</div>
                </div>
              )}

              {yesterday.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold dark:text-zinc-550 light:text-slate-400 uppercase tracking-widest text-left">
                    Yesterday
                  </h4>
                  <div className="space-y-1.5">{yesterday.map(renderSessionItem)}</div>
                </div>
              )}

              {older.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold dark:text-zinc-550 light:text-slate-400 uppercase tracking-widest text-left">
                    Older
                  </h4>
                  <div className="space-y-1.5">{older.map(renderSessionItem)}</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 border-t dark:border-zinc-800/60 light:border-slate-100 dark:bg-zinc-950/20 light:bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              onClearHistory();
              onClose();
            }}
            disabled={sessions.length === 0}
            className="flex items-center gap-1 text-[11px] font-semibold text-red-500 hover:underline cursor-pointer disabled:opacity-40 disabled:no-underline"
          >
            <Trash2 size={12} /> Clear History
          </button>

          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all cursor-pointer"
          >
            + New Conversation
          </button>
        </div>
      </div>
    </div>
  );
};
