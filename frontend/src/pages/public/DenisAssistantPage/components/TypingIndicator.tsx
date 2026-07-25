// DenisAssistantPage/components/TypingIndicator.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { LogoIcon } from '../../../../components/atoms/Logo/Logo';

export const TypingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.96 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 4, scale: 0.96 }}
    transition={{ duration: 0.2 }}
    className="flex items-end gap-2.5 self-start max-w-[85%]"
  >
    <div className="w-7 h-7 rounded-full overflow-hidden border dark:border-zinc-800 light:border-slate-200 flex items-center justify-center dark:bg-zinc-900 light:bg-white p-1 shrink-0 shadow-sm">
      <LogoIcon sizeClass="w-full h-full" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-none dark:bg-zinc-900/70 light:bg-slate-100 shadow-sm flex items-center gap-1.5 h-9">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full dark:bg-zinc-500 light:bg-slate-400"
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.9, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  </motion.div>
);
