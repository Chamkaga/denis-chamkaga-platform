import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export const Forbidden403Page: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 font-body">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-6">
        <ShieldAlert size={32} />
      </div>
      <h1 className="text-4xl font-bold font-display dark:text-white light:text-slate-900 mb-2">
        403 - Access Forbidden
      </h1>
      <p className="text-sm dark:text-zinc-400 light:text-slate-600 max-w-md mb-8">
        You do not have the required role or permissions to access this administrative resource.
      </p>
      <Link
        to={ROUTES.HOME}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-violet text-white font-semibold text-xs hover:bg-accent-violet/90 transition-all"
      >
        <ArrowLeft size={16} /> Return Home
      </Link>
    </div>
  );
};
export default Forbidden403Page;
