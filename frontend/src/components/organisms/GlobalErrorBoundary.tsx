import React, { Component, type ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Global Error Boundary] Caught runtime exception:', error);
    console.error('[Global Error Boundary] Stack:', info.componentStack);
    this.setState({ componentStack: info.componentStack ?? null });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="w-full min-h-screen dark:bg-zinc-950 light:bg-slate-50 flex items-center justify-center p-6 text-left transition-colors duration-300">
          <div className="w-full max-w-xl rounded-3xl border dark:border-zinc-800/80 light:border-slate-200/80 dark:bg-zinc-900/50 light:bg-white/80 backdrop-blur-xl shadow-2xl p-8 space-y-6">
            {/* Alert Icon & Heading */}
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-500 shrink-0">
                <AlertOctagon size={24} />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold dark:text-white light:text-slate-800 font-display">
                  Something went wrong
                </h1>
                <p className="text-xs dark:text-zinc-400 light:text-slate-500 leading-relaxed font-body">
                  An unexpected exception occurred while rendering the application layout. If the issue persists, please contact support.
                </p>
              </div>
            </div>

            {/* Error Message & Stack trace (Shown only in dev) */}
            {isDev && this.state.error && (
              <div className="p-4 rounded-2xl dark:bg-zinc-950/60 light:bg-slate-50 border dark:border-zinc-800/60 light:border-slate-200/60 space-y-3">
                <p className="text-xs font-mono text-red-400 break-words leading-relaxed">
                  {this.state.error.name}: {this.state.error.message}
                </p>
                {this.state.componentStack && (
                  <details className="text-[10px] dark:text-zinc-500 light:text-slate-400 font-mono">
                    <summary className="cursor-pointer hover:text-accent-violet transition-colors">
                      View component stack trace
                    </summary>
                    <pre className="mt-2 p-2 rounded dark:bg-zinc-950 light:bg-slate-100 overflow-x-auto whitespace-pre-wrap text-[9px] max-h-48 scrollbar">
                      {this.state.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all cursor-pointer shadow-md shadow-accent-violet/10"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold dark:text-zinc-400 light:text-slate-600 dark:hover:bg-zinc-800 light:hover:bg-slate-100 transition-all border dark:border-zinc-800 light:border-slate-200 cursor-pointer"
              >
                <Home size={14} />
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
