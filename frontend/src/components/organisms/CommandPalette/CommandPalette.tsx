import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  UserCheck,
  FileText,
  BookOpen,
  Bot,
  Activity,
  Settings,
  HelpCircle,
  X,
  ArrowRight,
  Shield
} from 'lucide-react';
import { ROUTES } from '../../../config/routes';

interface SearchResultItem {
  id: string;
  category: 'Navigation' | 'Leads' | 'Projects' | 'Knowledge' | 'Tools' | 'System';
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const allItems: SearchResultItem[] = [
    { id: 'nav-1', category: 'Navigation', title: 'Owner Dashboard', subtitle: 'Executive overview & KPI metrics', icon: LayoutDashboard, path: ROUTES.ADMIN_DASHBOARD },
    { id: 'nav-2', category: 'Navigation', title: 'Platform Operations', subtitle: 'Technical OS, NOC, SOC, Backups', icon: Activity, path: '/admin/operations' },
    { id: 'nav-3', category: 'Navigation', title: 'CRM & Leads', subtitle: 'Customer 360, Pipeline & Contacts', icon: UserCheck, path: '/admin/business' },
    { id: 'nav-4', category: 'Navigation', title: 'Knowledge Base CMS', subtitle: 'Vectors, Embeddings & RAG articles', icon: BookOpen, path: '/admin/knowledge' },
    { id: 'nav-5', category: 'Navigation', title: 'AI Copilot & Command Center', subtitle: 'Model health, Costs & Prompts', icon: Bot, path: '/admin/assistant' },
    { id: 'nav-6', category: 'Navigation', title: 'Analytics & Reports', subtitle: 'KPI Trends, Latency & Revenue', icon: FileText, path: '/admin/analytics' },
    { id: 'nav-7', category: 'Navigation', title: 'System Settings', subtitle: 'Security, SMTP & System config', icon: Settings, path: '/admin/settings' },
    
    { id: 'lead-1', category: 'Leads', title: 'High Intent Corporate Lead', subtitle: 'Acme Corp — $45,000 Potential Contract', icon: UserCheck, path: '/admin/business' },
    { id: 'proj-1', category: 'Projects', title: 'SimuInvest Finance OS', subtitle: 'Active Platform Development Milestone', icon: FolderKanban, path: '/admin/content' },
    { id: 'know-1', category: 'Knowledge', title: 'AI Orchestrator Standard Directives', subtitle: 'RAG Retrieval & Prompt Directive v2.4', icon: BookOpen, path: '/admin/knowledge' },
    { id: 'tool-1', category: 'Tools', title: 'SIEM SOC Audit Logs', subtitle: 'Security event logs & IP monitoring', icon: Shield, path: '/admin/operations' },
    { id: 'sys-1', category: 'System', title: 'Documentation Center', subtitle: 'SOPs, API Docs & User Manuals', icon: HelpCircle, path: '/admin/settings' },
  ];

  const filteredItems = query.trim()
    ? allItems.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = filteredItems[selectedIndex];
      if (selected) {
        navigate(selected.path);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
      />
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
        
        {/* Search Bar Input */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-850 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
          <Search size={18} className="text-accent-violet animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type to search pages, leads, projects, knowledge, or commands (Ctrl+K)..."
            className="flex-1 bg-transparent text-sm dark:text-white text-zinc-900 focus:outline-none placeholder-zinc-400 font-medium"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-zinc-300 dark:border-zinc-800 rounded-md">
            ESC
          </kbd>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            <X size={16} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 space-y-1 divide-y divide-zinc-100 dark:divide-zinc-900/40">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500">
              No matching records or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const IconComp = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer text-xs transition-all ${
                    isSelected
                      ? 'bg-accent-violet text-white font-semibold'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-zinc-100 dark:bg-zinc-850 text-accent-violet'}`}>
                      <IconComp size={16} />
                    </div>
                    <div>
                      <p className="font-semibold">{item.title}</p>
                      <p className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-zinc-500'}`}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                    }`}>
                      {item.category}
                    </span>
                    <ArrowRight size={14} className={isSelected ? 'text-white' : 'opacity-0'} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="text-accent-violet font-bold">Enterprise BOS Omni Search</span>
        </div>

      </div>
    </div>
  );
};
