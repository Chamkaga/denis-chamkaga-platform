// src/pages/public/DenisAssistantPage/components/DenisAIErrorBoundary.tsx
import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
}

export class DenisAIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, componentStack: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, componentStack: null };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[Denis AI Error Boundary] Caught runtime error:', error);
    console.error('[Denis AI Error Boundary] Component stack:', info.componentStack);
    this.setState({ componentStack: info.componentStack ?? null });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, componentStack: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen dark:bg-zinc-950 light:bg-slate-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg rounded-2xl border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white shadow-2xl p-6 space-y-4 text-left">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold dark:text-white light:text-slate-800 font-display">
                  Denis AI encountered a runtime error
                </h2>
                <p className="text-[11px] dark:text-zinc-500 light:text-slate-400 mt-0.5">
                  An unexpected error occurred while rendering the interface.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {this.state.error && (
              <div className="p-3 rounded-xl dark:bg-zinc-950/60 light:bg-slate-50 border dark:border-zinc-800 light:border-slate-200">
                <p className="text-[11px] font-mono text-red-400 break-words leading-relaxed">
                  {this.state.error.name}: {this.state.error.message}
                </p>
              </div>
            )}

            {/* Component Stack */}
            {this.state.componentStack && (
              <details className="text-[10px] dark:text-zinc-600 light:text-slate-400 font-mono leading-relaxed">
                <summary className="cursor-pointer hover:text-accent-violet transition-colors">
                  View component stack trace
                </summary>
                <pre className="mt-2 p-2 rounded dark:bg-zinc-950 light:bg-slate-100 overflow-x-auto whitespace-pre-wrap text-[9px] max-h-40 scrollbar">
                  {this.state.componentStack}
                </pre>
              </details>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-accent-violet hover:bg-accent-violet-hover text-white transition-all cursor-pointer"
              >
                <RefreshCw size={13} /> Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold dark:text-zinc-400 light:text-slate-600 dark:hover:bg-zinc-800 light:hover:bg-slate-100 transition-all cursor-pointer"
              >
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
