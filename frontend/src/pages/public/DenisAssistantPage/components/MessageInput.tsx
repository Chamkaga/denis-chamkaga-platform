// DenisAssistantPage/components/MessageInput.tsx
import React, { useRef } from 'react';
import { Send } from 'lucide-react';
import { AttachmentUploader } from './AttachmentUploader';
import type { UploadedAttachment } from './AttachmentUploader';

interface MessageInputProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string, attachments: UploadedAttachment[]) => void;
  isTyping: boolean;
  attachments: UploadedAttachment[];
  onAttachmentsChange: (attachments: UploadedAttachment[]) => void;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  isTyping,
  attachments,
  onAttachmentsChange,
  placeholder = 'Ask Denis AI anything...',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if ((!text && attachments.length === 0) || isTyping) return;
    onSend(text, attachments);
    onAttachmentsChange([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Auto-resize textarea
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const canSend = (value.trim() || attachments.length > 0) && !isTyping;

  return (
    <div className="shrink-0 px-4 py-3 border-t dark:border-zinc-800/70 light:border-slate-200 dark:bg-zinc-950/60 light:bg-white/80 backdrop-blur-sm">
      {/* Attachments area (chips appear above input) */}
      <div className="mb-2">
        <AttachmentUploader
          attachments={attachments}
          onAttachmentsChange={onAttachmentsChange}
          disabled={isTyping}
        />
      </div>

      {/* Input Row */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex-1 relative flex items-end dark:bg-zinc-900/60 light:bg-slate-50 border dark:border-zinc-800 light:border-slate-200 rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-accent-violet transition-all">
          <textarea
            ref={textareaRef}
            id="denis-ai-input"
            rows={1}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 text-sm resize-none bg-transparent dark:text-white light:text-slate-800 focus:outline-none disabled:opacity-50 max-h-[120px] min-h-[44px] scrollbar placeholder:dark:text-zinc-600 placeholder:light:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={!canSend}
          className="p-3 rounded-2xl bg-accent-violet hover:bg-accent-violet-hover disabled:bg-zinc-800/30 dark:disabled:bg-zinc-800/30 disabled:text-zinc-600 text-white transition-all shadow-lg disabled:cursor-not-allowed cursor-pointer shrink-0 flex items-center justify-center"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </form>

      <p className="text-[9px] dark:text-zinc-700 light:text-slate-400 mt-1.5 text-center">
        Denis AI · Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
};
