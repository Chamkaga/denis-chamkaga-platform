// DenisAssistantPage/components/WelcomeInterface.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { QuickActionGrid } from './QuickActionGrid';
import type { QuickAction } from './QuickActionGrid';

interface WelcomeInterfaceProps {
  quickActions?: QuickAction[];
  actionsLoading?: boolean;
  onAction: (prompt: string) => void;
  isSwahili?: boolean;
}

export const WelcomeInterface: React.FC<WelcomeInterfaceProps> = ({
  quickActions,
  actionsLoading = false,
  onAction,
  isSwahili = false,
}) => {
  const capabilities = isSwahili
    ? ['Ukuzaji wa Programu', 'Tovuti za Biashara', 'Ufumbuzi wa AI', 'ERP & CRM', 'Mabadiliko ya Kidijitali']
    : ['Software Development', 'Business Websites', 'AI Solutions', 'ERP & CRM', 'Digital Transformation'];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-lg space-y-7"
      >
        {/* Identity */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 dark:border-zinc-800 light:border-slate-200 shadow-xl">
              <img
                src="/images/assistant/bot_portrait.webp"
                alt="Denis AI"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-2xl bg-accent-violet/20 blur-md -z-10 scale-110" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-extrabold dark:text-white light:text-slate-800 font-display">
              {isSwahili ? 'Karibu kwenye Denis AI' : 'Welcome to Denis AI'}
            </h2>
            <p className="text-sm dark:text-zinc-400 light:text-slate-500 font-body">
              {isSwahili ? 'Mshauri wako wa Biashara wa AI' : 'Your AI Business Consultant'}
            </p>
          </div>
        </div>

        {/* Capabilities */}
        <div className="dark:bg-zinc-900/40 light:bg-slate-50 border dark:border-zinc-800/60 light:border-slate-200 rounded-2xl p-4 space-y-2">
          <p className="text-[11px] font-semibold dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider">
            {isSwahili ? 'Ninaweza kukusaidia na:' : 'I can help you with:'}
          </p>
          <ul className="space-y-1.5">
            {capabilities.map(cap => (
              <li key={cap} className="flex items-center gap-2 text-xs dark:text-zinc-300 light:text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-violet shrink-0" />
                {cap}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold dark:text-zinc-500 light:text-slate-400 uppercase tracking-wider text-center">
            {isSwahili ? 'Ungependa kufanya nini leo?' : 'What would you like to do today?'}
          </p>
          <QuickActionGrid
            actions={quickActions}
            onAction={onAction}
            isLoading={actionsLoading}
          />
        </div>

        {/* Subtle footer hint */}
        <p className="text-[10px] text-center dark:text-zinc-700 light:text-slate-400">
          {isSwahili
            ? 'Au andika swali lolote hapa chini ili kuanza mazungumzo'
            : 'Or type any question below to start a conversation'}
        </p>
      </motion.div>
    </div>
  );
};
