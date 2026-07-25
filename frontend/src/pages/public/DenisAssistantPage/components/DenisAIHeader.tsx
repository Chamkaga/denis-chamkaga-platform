// DenisAssistantPage/components/DenisAIHeader.tsx
import React from 'react';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DenisAIHeaderProps {
  onMoreClick: () => void;
  isOnline?: boolean;
}

export const DenisAIHeader: React.FC<DenisAIHeaderProps> = ({ onMoreClick, isOnline = true }) => {
  const navigate = useNavigate();

  return (
    <header className="shrink-0 flex items-center justify-between px-4 py-3 border-b dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-950/80 light:bg-white/90 backdrop-blur-md z-10">
      {/* Left: Back + Identity */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 rounded-lg dark:hover:bg-zinc-800/60 light:hover:bg-slate-100 dark:text-zinc-400 light:text-slate-500 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Avatar with pulse ring */}
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 dark:border-zinc-800 light:border-slate-200">
            <img
              src="/images/assistant/bot_portrait.webp"
              alt="Denis AI"
              className="w-full h-full object-cover"
            />
          </div>
          {isOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 dark:border-zinc-950 light:border-white" />
            </span>
          )}
        </div>

        {/* Title + Status */}
        <div>
          <h1 className="text-sm font-bold dark:text-white light:text-slate-800 font-display leading-none">
            Denis AI
          </h1>
          <p className="text-[10px] dark:text-green-400 light:text-green-600 font-medium flex items-center gap-1 mt-0.5">
            {isOnline ? 'Usually replies instantly' : 'Currently offline'}
          </p>
        </div>
      </div>

      {/* Right: More Actions */}
      <button
        id="denis-ai-more-btn"
        onClick={onMoreClick}
        className="p-2 rounded-lg dark:hover:bg-zinc-800/60 light:hover:bg-slate-100 dark:text-zinc-400 light:text-slate-500 transition-colors cursor-pointer"
        aria-label="More options"
      >
        <MoreVertical size={18} />
      </button>
    </header>
  );
};
