import { Calendar, Ghost, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useAuth } from "../store/hooks";

export default function NotFound() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const inDashboard = location.pathname.startsWith("/dashboard");

  const primaryHref = isAuthenticated
    ? inDashboard
      ? "/dashboard"
      : "/login"
    : "/login";
  const primaryLabel = isAuthenticated
    ? inDashboard
      ? "Back to Dashboard"
      : "Back to Login"
    : "Back to Login";

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Ambient brand blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

      <div className="container mx-auto px-4 md:px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          {/* Playful badge */}
          <div className="inline-flex items-center justify-center rounded-full bg-white/70 dark:bg-card/60 backdrop-blur px-3 py-1.5 ring-1 ring-border shadow-sm mb-5">
            <Ghost className="h-4 w-4 mr-2 opacity-80" />
            <span className="text-sm font-medium">
              404 — This page ghosted us
            </span>
          </div>

          {/* Mini calendar card */}
          <div className="mx-auto mb-6 w-full max-w-md">
            <div className="relative glass-effect rounded-3xl p-5 shadow-lg dark:dark-premium-card">
              <div className="absolute -top-3 left-8 h-3 w-3 rounded-full bg-primary-500" />
              <div className="absolute -top-3 right-8 h-3 w-3 rounded-full bg-primary-500" />
              <div className="flex items-center justify-center gap-2 text-primary mb-2">
                <Calendar className="h-5 w-5" />
                <span className="text-sm font-semibold tracking-wide">
                  Skedlii Calendar
                </span>
              </div>
              <div className="rounded-2xl border border-border p-6 bg-white/70 dark:bg-card/70">
                <div className="text-5xl font-extrabold font-heading tracking-tight">
                  404
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  This task didn’t make the content calendar. We checked drafts,
                  ideas, even the meme backlog.
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-heading font-extrabold mb-3">
            We couldn’t find that page
          </h1>
          <p className="text-muted-foreground mb-8">
            But we can help you schedule great content on the right ones.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link to={primaryHref}>
              <Button size="lg" className="rounded-full px-6">
                {primaryLabel}
              </Button>
            </Link>
            <Link to={isAuthenticated ? "/dashboard/post-flow" : "/register"}>
              <Button variant="link">
                {isAuthenticated ? "Create a Post" : "Start Free Trial"}
              </Button>
            </Link>
          </div>

          <div className="mt-10 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4" />
            Pro tip: Add the correct link to your calendar — future you will
            thank you.
          </div>
        </div>
      </div>
    </div>
  );
}
