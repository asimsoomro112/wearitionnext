import React from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Wearition App Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
          <p className="font-serif text-6xl text-foreground/10 mb-8">◇</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Something went wrong</h1>
          <p className="text-foreground/50 text-sm font-sans max-w-md mb-10 leading-relaxed">
            Our atelier is experiencing a momentary interruption. Please refresh the page or return home.
          </p>
          <div className="flex gap-6">
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-4 border border-foreground/20 text-foreground text-xs uppercase tracking-widest hover:border-foreground/60 transition-colors"
            >
              Refresh Page
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="px-8 py-4 bg-foreground text-background text-xs uppercase tracking-widest hover:bg-accent transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
