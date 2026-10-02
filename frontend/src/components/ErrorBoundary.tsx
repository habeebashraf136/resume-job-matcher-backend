import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-12 text-center bg-surface">
            <h1 className="text-8xl font-display font-bold text-ink mb-4">CRASH</h1>
            <h2 className="text-2xl font-bold text-ink mb-6">System Failure</h2>
            <p className="text-ink font-medium mb-8">
              A critical error occurred in the application.
            </p>
            <div className="text-sm text-left bg-yellow p-4 rounded-neo border-2 border-ink text-ink font-mono font-bold mb-8 overflow-auto max-h-48 neo-shadow-sm">
              {this.state.error?.message}
            </div>
            <Button variant="primary" onClick={() => window.location.href = '/app'} className="w-full">
              Go Home
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
