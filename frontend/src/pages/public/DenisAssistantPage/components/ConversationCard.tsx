// DenisAssistantPage/components/ConversationCard.tsx
// Renders AI-driven structured card events inline within the conversation.
// The frontend never assumes card content — it only renders what the AI orchestrator emits.

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, X, ArrowLeft } from 'lucide-react';

export type CardKind = 'radio' | 'text' | 'select' | 'confirm';

export interface CardDefinition {
  id: string;
  title: string;
  subtitle?: string;
  kind: CardKind;
  options?: string[];
  placeholder?: string;
  actions: {
    primary: string;
    secondary?: string;
    back?: string;
  };
}

interface ConversationCardProps {
  card: CardDefinition;
  onSubmit: (cardId: string, value: string) => void;
  onCancel: () => void;
  onBack?: () => void;
  disabled?: boolean;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  card,
  onSubmit,
  onCancel,
  onBack,
  disabled = false,
}) => {
  const [selected, setSelected] = useState<string>('');
  const [textValue, setTextValue] = useState('');

  const canSubmit = () => {
    if (disabled) return false;
    if (card.kind === 'radio' || card.kind === 'select') return !!selected;
    if (card.kind === 'text') return !!textValue.trim();
    if (card.kind === 'confirm') return true;
    return false;
  };

  const handleSubmit = () => {
    if (!canSubmit()) return;
    const value =
      card.kind === 'radio' || card.kind === 'select'
        ? selected
        : card.kind === 'text'
        ? textValue.trim()
        : 'confirmed';
    onSubmit(card.id, value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22 }}
      className="self-start max-w-[90%] w-full"
    >
      <div className="rounded-2xl rounded-tl-none border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/70 light:bg-white shadow-lg overflow-hidden">
        {/* Card Header */}
        <div className="px-4 pt-4 pb-3 border-b dark:border-zinc-800/60 light:border-slate-100">
          <p className="text-sm font-semibold dark:text-white light:text-slate-800 leading-snug">
            {card.title}
          </p>
          {card.subtitle && (
            <p className="text-[11px] dark:text-zinc-500 light:text-slate-400 mt-0.5 leading-relaxed">
              {card.subtitle}
            </p>
          )}
        </div>

        {/* Card Body */}
        <div className="px-4 py-3 space-y-2">
          {/* Radio Options */}
          {(card.kind === 'radio' || card.kind === 'select') && card.options?.map(opt => (
            <button
              key={opt}
              onClick={() => setSelected(opt)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                selected === opt
                  ? 'border-accent-violet dark:bg-accent-violet/10 light:bg-violet-50 text-accent-violet'
                  : 'dark:border-zinc-800/60 light:border-slate-200 dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-800/40 light:hover:bg-slate-50'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                selected === opt ? 'border-accent-violet' : 'dark:border-zinc-600 light:border-slate-300'
              }`}>
                {selected === opt && (
                  <span className="w-2 h-2 rounded-full bg-accent-violet" />
                )}
              </span>
              <span className="text-xs font-medium">{opt}</span>
            </button>
          ))}

          {/* Text Input */}
          {card.kind === 'text' && (
            <input
              type="text"
              value={textValue}
              onChange={e => setTextValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={card.placeholder || 'Type your answer...'}
              disabled={disabled}
              autoFocus
              className="w-full px-3 py-2.5 text-sm rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-800/60 light:bg-slate-50 dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet placeholder:dark:text-zinc-600 placeholder:light:text-slate-400 disabled:opacity-50"
            />
          )}

          {/* Confirm */}
          {card.kind === 'confirm' && (
            <p className="text-xs dark:text-zinc-400 light:text-slate-500">
              Please confirm to continue.
            </p>
          )}
        </div>

        {/* Card Footer Actions */}
        <div className="px-4 py-3 border-t dark:border-zinc-800/60 light:border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {card.actions.back && onBack && (
              <button
                onClick={onBack}
                disabled={disabled}
                className="flex items-center gap-1 text-[11px] dark:text-zinc-500 light:text-slate-400 hover:text-accent-violet transition-colors cursor-pointer disabled:opacity-40"
              >
                <ArrowLeft size={12} /> {card.actions.back}
              </button>
            )}
            {card.actions.secondary && (
              <button
                onClick={onCancel}
                disabled={disabled}
                className="text-[11px] dark:text-zinc-500 light:text-slate-400 hover:text-red-400 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
              >
                <X size={12} /> {card.actions.secondary}
              </button>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-bold bg-accent-violet text-white hover:bg-accent-violet-hover disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {card.actions.primary}
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
