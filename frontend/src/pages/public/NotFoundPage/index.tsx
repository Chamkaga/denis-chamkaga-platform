// pages/public/NotFoundPage/index.tsx
// Production 404 page — shown for any unmatched route inside PublicLayout.

import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../config/routes';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <main className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 animate-page-enter">
      {/* Status code */}
      <div className="relative mb-8">
        <span className="text-[8rem] md:text-[11rem] font-extrabold font-display leading-none select-none dark:text-zinc-800 light:text-slate-100">
          404
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-accent-violet/10 border border-accent-violet/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-accent-violet font-display">?</span>
          </div>
        </div>
      </div>

      {/* Copy */}
      <h1 className="text-2xl md:text-3xl font-extrabold dark:text-white light:text-slate-900 font-display tracking-tight mb-3">
        Page Not Found
      </h1>
      <p className="text-sm dark:text-zinc-400 light:text-slate-500 max-w-md mb-2">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <p className="text-xs dark:text-zinc-600 light:text-slate-400 max-w-sm mb-8 font-body">
        Ukurasa unaotafuta haupatikani au umehamishwa.
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 light:border-slate-200 light:text-slate-700 light:hover:bg-slate-50 transition-colors duration-150 cursor-pointer"
        >
          <ArrowLeft size={15} />
          Go Back
        </button>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-accent-violet text-white hover:bg-accent-violet-hover transition-colors duration-150"
        >
          <Home size={15} />
          Return Home
        </Link>
      </div>
    </main>
  );
};

export default NotFoundPage;
