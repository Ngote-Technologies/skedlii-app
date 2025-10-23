import * as React from "react";
import { Link } from "react-router-dom";
import { Calendar, Bug, Sparkles, ClipboardCopy, RefreshCcw, Home } from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../store/hooks";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  fallbackRender?: (args: { error: Error; reset: () => void }) => React.ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = { error: Error | null };

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("Skedlii ErrorBoundary caught: ", error, info);
  }

  private reset = () => {
    this.props.onReset?.();
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallbackRender) return this.props.fallbackRender({ error, reset: this.reset });
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <p className="text-xl font-semibold">Something went wrong</p>
            <pre className="text-sm mt-3 text-red-600 whitespace-pre-wrap">{String(error)}</pre>
            <button className="mt-6 underline" onClick={this.reset}>Try again</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Branded, playful fallback for Skedlii app
export function AppErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const { isAuthenticated } = useAuth();
  const isDev = typeof import.meta !== "undefined" && (import.meta as any).env?.DEV;

  const primaryHref = isAuthenticated ? 
    "/dashboard" : "/login";
  const primaryLabel = isAuthenticated ? "Back to Dashboard" : "Back to Login";

  const copyDetails = async () => {
    try {
      await navigator.clipboard?.writeText(
        `${error.name}: ${error.message}\n\n${error.stack ?? ""}`
      );
    } catch {}
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient brand blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          {/* Playful badge */}
          <div className="inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-card/60 backdrop-blur px-3 py-1.5 ring-1 ring-border shadow-sm mb-5">
            <Bug className="h-4 w-4 mr-2 opacity-80" />
            <span className="text-sm font-medium">Oops — Something went off schedule</span>
          </div>

          {/* Mini calendar card */}
          <div className="mx-auto mb-6 w-full max-w-md">
            <div className="relative glass-effect rounded-3xl p-5 shadow-lg dark:dark-premium-card">
              <div className="absolute -top-3 left-8 h-3 w-3 rounded-full bg-primary-500" />
              <div className="absolute -top-3 right-8 h-3 w-3 rounded-full bg-primary-500" />
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wide">Skedlii Calendar</span>
              </div>
              <div className="rounded-2xl border border-border p-6 bg-white/70 dark:bg-card/70">
                <div className="text-3xl font-extrabold font-heading tracking-tight">Error</div>
                <div className="mt-2 text-sm text-muted-foreground">
                  This task missed its slot. Try again, go back, or tell us what happened.
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Button size="lg" className="rounded-full px-5" onClick={reset}>
              <RefreshCcw className="h-4 w-4 mr-2" /> Try again
            </Button>
            <Link to={primaryHref}>
              <Button variant="secondary" size="lg" className="rounded-full px-5">
                <Home className="h-4 w-4 mr-2" /> {primaryLabel}
              </Button>
            </Link>
            {isDev && (
              <Button variant="ghost" size="lg" className="rounded-full px-5" onClick={copyDetails}>
                <ClipboardCopy className="h-4 w-4 mr-2" /> Copy error
              </Button>
            )}
          </div>

          <div className="mt-10 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Pro tip: Even the best calendars have surprise meetings.
          </div>

          {isDev && (
            <details className="mt-6 mx-auto max-w-2xl text-left bg-card/70 border border-border rounded-lg p-4">
              <summary className="cursor-pointer font-medium">Error details (dev)</summary>
              <pre className="text-xs mt-3 whitespace-pre-wrap">
                {`${error.name}: ${error.message}\n\n${error.stack ?? ""}`}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

