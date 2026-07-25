// DenisAssistantPage/components/ChatWindow.tsx
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';
import { LogoIcon } from '../../../../components/atoms/Logo/Logo';
import { ConversationCard } from './ConversationCard';
import type { CardDefinition } from './ConversationCard';
import { TypingIndicator } from './TypingIndicator';

export type MessageType = 'text' | 'card';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  type: MessageType;
  text?: string;
  card?: CardDefinition;
  timestamp: string;
  // Metadata from orchestrator (on last assistant message)
  intent?: string;
  leadScore?: number;
  temperature?: string;
  attachments?: { url: string; name: string; mimeType: string }[];
}

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onCardSubmit: (cardId: string, value: string) => void;
  onCardCancel: () => void;
}

const FileChip: React.FC<{ name: string; mimeType: string; url: string }> = ({ name, mimeType, url }) => {
  const isImage = mimeType.startsWith('image/');
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-zinc-700 light:border-slate-200 dark:bg-zinc-800/60 light:bg-slate-50 text-[10px] dark:text-zinc-300 light:text-slate-600 hover:border-accent-violet/50 transition-colors max-w-[160px]"
    >
      {isImage ? (
        <img src={url} alt={name} className="w-5 h-5 rounded object-cover" />
      ) : (
        <span className="text-accent-violet text-[9px] font-bold uppercase bg-accent-violet/10 rounded px-1 py-0.5 shrink-0">
          {name.split('.').pop()?.toUpperCase() || 'FILE'}
        </span>
      )}
      <span className="truncate">{name}</span>
    </a>
  );
};

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isTyping,
  onCardSubmit,
  onCardCancel,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom only when near bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 180;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    if (isNearBottom || isTyping) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isTyping]);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 flex flex-col scrollbar"
    >
      <AnimatePresence initial={false}>
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`flex gap-2.5 ${
              msg.sender === 'user' ? 'self-end flex-row-reverse ml-auto max-w-[85%]' : 'self-start mr-auto max-w-[90%]'
            }`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full overflow-hidden border shrink-0 flex items-center justify-center shadow-sm mt-0.5 ${
              msg.sender === 'user'
                ? 'dark:border-zinc-700 light:border-slate-200 bg-accent-violet text-white'
                : 'dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white p-0.5'
            }`}>
              {msg.sender === 'user'
                ? <User size={13} />
                : <LogoIcon sizeClass="w-full h-full" />
              }
            </div>

            {/* Content */}
            <div className="space-y-1.5 flex flex-col">
              {/* Attachments (above bubble) */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className={`flex flex-wrap gap-1.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.attachments.map((a, i) => (
                    <FileChip key={i} name={a.name} mimeType={a.mimeType} url={a.url} />
                  ))}
                </div>
              )}

              {/* Card Message */}
              {msg.type === 'card' && msg.card && (
                <ConversationCard
                  card={msg.card}
                  onSubmit={onCardSubmit}
                  onCancel={onCardCancel}
                  disabled={false}
                />
              )}

              {/* Text Message */}
              {msg.type === 'text' && msg.text && (
                <div className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-line break-words ${
                  msg.sender === 'user'
                    ? 'dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white rounded-tr-none shadow-md'
                    : 'dark:bg-zinc-900/70 dark:text-zinc-100 light:bg-slate-100 light:text-slate-800 rounded-tl-none shadow-sm font-body'
                }`}>
                  {msg.text}
                </div>
              )}

              {/* Timestamp */}
              <span className={`block text-[9px] dark:text-zinc-600 light:text-slate-400 px-1 ${
                msg.sender === 'user' ? 'text-right' : 'text-left'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {isTyping && <TypingIndicator />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
};
