import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error Boundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-lg bg-[#121214] border border-[#FF5A1F]/30 rounded-2xl p-8 shadow-2xl space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-[#FF5A1F]/20 text-[#FF5A1F] text-2xl font-bold mb-2">
              ⚠️
            </div>
            <h2 className="font-syne text-2xl font-bold text-white">Something went wrong</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              An unexpected error occurred while loading the application interface.
            </p>
            {this.state.error?.message && (
              <div className="text-xs font-mono bg-black/60 p-3 rounded-lg text-[#FF5A1F] text-left overflow-x-auto max-h-32 border border-white/10">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2.5 rounded-full bg-[#FF5A1F] text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all cursor-pointer mt-4"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
