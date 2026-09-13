import React from 'react';
import { Download, X } from 'lucide-react';
import { usePWA } from '../../../hooks/usePWA';
import { Button } from '../../atoms/Button';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 max-w-sm p-4 rounded-2xl bg-zinc-900/90 border border-violet-500/30 backdrop-blur-md shadow-2xl space-y-3 font-body animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
            <Download className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Install Platform App</h4>
            <p className="text-xs text-zinc-400">Add to your home screen for quick offline access</p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button variant="primary" size="xs" onClick={promptInstall} className="w-full">
          Install App
        </Button>
        <Button variant="ghost" size="xs" onClick={() => setDismissed(true)}>
          Not now
        </Button>
      </div>
    </div>
  );
};
