// DenisAssistantPage/components/DenisAISidebar.tsx
import React, { useState } from 'react';
import { Home, MessageSquare, Plus, Trash2, Edit2, Search, X, Clock } from 'lucide-react';

export interface RecentSession {
  id: string;
  title: string;
  status: string;
  startedAt: string;
  messageCount: number;
}

interface DenisAISidebarProps {
  activeSection: 'home' | 'chat';
  sessions: RecentSession[];
  activeSessionId?: string;
  onSelectHome: () => void;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
  onClearHistory: () => void;
}

function groupSessionsByDate(sessions: RecentSession[]): Record<string, RecentSession[]> {
  const now = new Date();
  const groups: Record<string, RecentSession[]> = {
    'Today': [],
    'Yesterday': [],
    'Last 7 Days': [],
    'Older': [],
  };

  for (const s of sessions) {
    const d = new Date(s.startedAt);
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 1) {
      groups['Today'].push(s);
    } else if (diffDays < 2) {
      groups['Yesterday'].push(s);
    } else if (diffDays <= 7) {
      groups['Last 7 Days'].push(s);
    } else {
      groups['Older'].push(s);
    }
  }

  return groups;
}

export const DenisAISidebar: React.FC<DenisAISidebarProps> = ({
  activeSection,
  sessions,
  activeSessionId,
  onSelectHome,
  onSelectSession,
  onNewChat,
  onRename,
  onDelete,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filtered = search.trim()
    ? sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : sessions;

  const grouped = groupSessionsByDate(filtered);

  const handleRenameCommit = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <aside className="w-56 shrink-0 flex flex-col border-r dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/60 light:bg-slate-50/80 h-full overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b dark:border-zinc-800/60 light:border-slate-200">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 dark:text-zinc-500 light:text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full pl-7 pr-6 py-1.5 text-[11px] rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-zinc-300 light:text-slate-700 focus:outline-none focus:ring-1 focus:ring-accent-violet dark:placeholder-zinc-600 light:placeholder-slate-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 dark:text-zinc-500 light:text-slate-400 hover:text-red-400 cursor-pointer">
              <X size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="px-2 pt-2 pb-1 space-y-0.5 shrink-0">
        <button
          onClick={onSelectHome}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === 'home'
              ? 'dark:bg-accent-violet/15 light:bg-violet-50 text-accent-violet border dark:border-accent-violet/20 light:border-violet-200'
              : 'dark:text-zinc-400 light:text-slate-600 dark:hover:bg-zinc-800/40 light:hover:bg-slate-100'
          }`}
        >
          <Home size={14} />
          <span>Home</span>
        </button>

        <div className="px-3 pt-3 pb-1 text-[9px] font-extrabold dark:text-zinc-600 light:text-slate-400 uppercase tracking-widest">
          Conversations
        </div>
      </nav>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar space-y-1">
        {filtered.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <Clock size={16} className="mx-auto mb-2 dark:text-zinc-700 light:text-slate-300" />
            <p className="text-[10px] dark:text-zinc-600 light:text-slate-400 italic">
              {search ? 'No matches found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([group, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <div className="px-2 pt-2 pb-1 text-[9px] font-bold dark:text-zinc-600 light:text-slate-400 uppercase tracking-wider">
                  {group}
                </div>
                {items.map(s => {
                  const isActive = activeSessionId === s.id;
                  const isEditing = editingId === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => !isEditing && onSelectSession(s.id)}
                      className={`group w-full flex items-center justify-between p-2 rounded-lg text-[11px] transition-all cursor-pointer mb-0.5 ${
                        isActive
                          ? 'dark:bg-zinc-800/80 light:bg-white dark:text-white light:text-slate-900 font-semibold border-l-2 border-accent-violet dark:border-accent-violet light:border-accent-violet shadow-sm'
                          : 'dark:text-zinc-500 light:text-slate-600 dark:hover:bg-zinc-800/30 light:hover:bg-white dark:hover:text-zinc-300 light:hover:text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <MessageSquare size={11} className="shrink-0 dark:text-zinc-600 light:text-slate-400" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            onBlur={() => handleRenameCommit(s.id)}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleRenameCommit(s.id);
                              if (e.key === 'Escape') { setEditingId(null); setEditTitle(''); }
                            }}
                            autoFocus
                            className="bg-transparent border-b border-accent-violet outline-none w-full py-0.5 text-[11px] dark:text-white light:text-slate-900"
                            onClick={e => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate">{s.title}</span>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity ml-1">
                          <button
                            onClick={e => { e.stopPropagation(); setEditingId(s.id); setEditTitle(s.title); }}
                            className="p-0.5 dark:text-zinc-500 hover:text-accent-violet cursor-pointer transition-colors"
                            title="Rename"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); onDelete(s.id); }}
                            className="p-0.5 dark:text-zinc-500 hover:text-red-500 cursor-pointer transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Actions */}
      <div className="p-2 border-t dark:border-zinc-800/60 light:border-slate-200 space-y-1 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-[11px] font-bold border dark:border-zinc-800 light:border-slate-200 dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-900/60 light:hover:bg-white hover:border-accent-violet hover:text-accent-violet transition-all cursor-pointer"
        >
          <Plus size={13} />
          <span>New Conversation</span>
        </button>

        {sessions.length > 0 && (
          <button
            onClick={onClearHistory}
            className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-[11px] dark:text-zinc-600 light:text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <Trash2 size={11} />
            <span>Clear History</span>
          </button>
        )}
      </div>
    </aside>
  );
};
