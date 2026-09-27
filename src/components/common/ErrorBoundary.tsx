import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
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
    console.error('LifeGuard Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-500 mb-6">
              LifeGuard encountered an unexpected issue. Don't worry, your emergency data is safe.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full py-3 bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 active:scale-95 transition-all shadow-md"
              >
                <RefreshCw size={18} /> Reload Application
              </button>
              <a
                href="/"
                className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all"
              >
                <Home size={18} /> Go to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
