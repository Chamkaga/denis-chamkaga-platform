// DenisAssistantPage/components/MoreActionsMenu.tsx
import React, { useRef, useEffect } from 'react';
import { 
  Info, Download, Volume2, VolumeX, RefreshCw, XCircle, PlusCircle, History
} from 'lucide-react';

interface MoreActionsMenuProps {
  onClose: () => void;
  onVisitorInfo: () => void;
  onConversationHistory: () => void;
  onDownloadHistory: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onNewConversation: () => void;
  onRestartChat: () => void;
  onEndChat: () => void;
}

export const MoreActionsMenu: React.FC<MoreActionsMenuProps> = ({
  onClose,
  onVisitorInfo,
  onConversationHistory,
  onDownloadHistory,
  isMuted,
  onToggleMute,
  onNewConversation,
  onRestartChat,
  onEndChat,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const moreBtn = document.getElementById('denis-ai-more-btn');
      if (
        menuRef.current && 
        !menuRef.current.contains(event.target as Node) &&
        moreBtn &&
        !moreBtn.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div 
      ref={menuRef}
      className="absolute right-0 top-7 w-52 rounded-xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl z-50 overflow-hidden flex flex-col py-1 text-left"
    >
      {/* 1. Visitor Info */}
      <button
        onClick={() => { onVisitorInfo(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-800 light:hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
      >
        <Info size={14} className="text-accent-violet shrink-0" />
        <span>Visitor Information</span>
      </button>

      {/* 2. Conversation History */}
      <button
        onClick={() => { onConversationHistory(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-800 light:hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
      >
        <History size={14} className="text-accent-violet shrink-0" />
        <span>Conversation History</span>
      </button>

      {/* 3. Download Log */}
      <button
        onClick={() => { onDownloadHistory(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-800 light:hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
      >
        <Download size={14} className="text-accent-violet shrink-0" />
        <span>Download Conversation</span>
      </button>

      {/* 4. Mute Toggle */}
      <button
        onClick={() => { onToggleMute(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-800 light:hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
      >
        {isMuted ? (
          <>
            <VolumeX size={14} className="text-zinc-400 shrink-0" />
            <span>Unmute Pings</span>
          </>
        ) : (
          <>
            <Volume2 size={14} className="text-accent-violet shrink-0" />
            <span>Mute Notifications</span>
          </>
        )}
      </button>

      <div className="border-t dark:border-zinc-850 light:border-slate-100 my-1" />

      {/* 5. New Conversation */}
      <button
        onClick={() => { onNewConversation(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs dark:text-zinc-300 light:text-slate-700 dark:hover:bg-zinc-850 light:hover:bg-slate-55 flex items-center gap-2.5 cursor-pointer text-accent-violet font-semibold"
      >
        <PlusCircle size={14} className="shrink-0" />
        <span>+ New Conversation</span>
      </button>

      {/* 6. Restart */}
      <button
        onClick={() => { onRestartChat(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs text-red-500 dark:hover:bg-red-500/10 light:hover:bg-red-500/5 flex items-center gap-2.5 cursor-pointer font-medium"
      >
        <RefreshCw size={14} className="shrink-0" />
        <span>Restart Conversation</span>
      </button>

      {/* 7. End Conversation */}
      <button
        onClick={() => { onEndChat(); onClose(); }}
        className="w-full px-3 py-2 text-left text-xs text-red-500 dark:hover:bg-red-500/10 light:hover:bg-red-500/5 flex items-center gap-2.5 cursor-pointer font-medium"
      >
        <XCircle size={14} className="shrink-0" />
        <span>End Conversation</span>
      </button>
    </div>
  );
};
