import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold font-serif text-slate-900 mb-3">Something went wrong</h1>
          <p className="text-slate-600 max-w-md mb-8">
            We encountered an unexpected error. This might be due to a temporary issue or incomplete data.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={() => window.location.reload()} 
              variant="default"
              className="px-6"
            >
              <RotateCcw className="w-4 h-4 mr-2" /> Reload Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="outline"
              className="px-6"
            >
              <Home className="w-4 h-4 mr-2" /> Go Home
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-12 p-4 bg-slate-200 rounded-lg text-left overflow-auto max-w-2xl">
              <p className="font-mono text-xs text-slate-800">{this.state.error?.toString()}</p>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
