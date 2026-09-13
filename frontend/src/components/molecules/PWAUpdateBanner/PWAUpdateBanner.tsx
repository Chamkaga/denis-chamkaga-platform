import React from 'react';
import { WifiOff } from 'lucide-react';
import { usePWA } from '../../../hooks/usePWA';

export const PWAUpdateBanner: React.FC = () => {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 text-zinc-950 font-body text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4" />
      <span>You are currently offline. Running on cached platform resources.</span>
    </div>
  );
};
