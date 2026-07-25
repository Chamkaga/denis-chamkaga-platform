// DenisAssistantPage/components/QuickActionGrid.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Code2, Globe, Smartphone, Brain, FileText, MessageCircle,
  Layers, Database, BarChart, Zap, ShieldCheck, ArrowRight
} from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: string;
  prompt: string;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  code: <Code2 size={16} />,
  globe: <Globe size={16} />,
  smartphone: <Smartphone size={16} />,
  brain: <Brain size={16} />,
  ai: <Brain size={16} />,
  file: <FileText size={16} />,
  chat: <MessageCircle size={16} />,
  layers: <Layers size={16} />,
  database: <Database size={16} />,
  chart: <BarChart size={16} />,
  zap: <Zap size={16} />,
  shield: <ShieldCheck size={16} />,
};

const DEFAULT_ACTIONS: QuickAction[] = [
  { label: 'Build Software', icon: 'code', prompt: 'I need custom software built for my business.' },
  { label: 'Business Website', icon: 'globe', prompt: 'I need a professional business website.' },
  { label: 'Mobile App', icon: 'smartphone', prompt: 'I need a mobile application for my business.' },
  { label: 'AI Solution', icon: 'ai', prompt: 'I want to integrate AI into my business operations.' },
  { label: 'Request Quotation', icon: 'file', prompt: 'I would like to request a quotation for a project.' },
  { label: 'Talk to Denis', icon: 'chat', prompt: 'I would like to schedule a consultation with Denis directly.' },
];

interface QuickActionGridProps {
  actions?: QuickAction[];
  onAction: (prompt: string) => void;
  isLoading?: boolean;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  actions,
  onAction,
  isLoading = false,
}) => {
  const items = actions && actions.length > 0 ? actions : DEFAULT_ACTIONS;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg mx-auto">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-12 rounded-xl dark:bg-zinc-800/40 light:bg-slate-100 animate-skeleton"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-lg mx-auto">
      {items.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.2 }}
          onClick={() => onAction(action.prompt)}
          className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/40 light:bg-white dark:hover:bg-zinc-800/60 light:hover:bg-slate-50 hover:border-accent-violet/60 transition-all duration-200 text-left cursor-pointer"
        >
          <span className="text-accent-violet/80 group-hover:text-accent-violet shrink-0 transition-colors">
            {ICON_MAP[action.icon] || <ArrowRight size={16} />}
          </span>
          <span className="text-[11px] font-semibold dark:text-zinc-300 light:text-slate-700 group-hover:text-accent-violet transition-colors leading-tight truncate">
            {action.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
