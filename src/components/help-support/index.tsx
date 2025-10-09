import { HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";

const HelpSupport = () => {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                Help & Support
              </h2>
            </div>
            <p className="text-muted-foreground">
              Need help with scheduling posts, reconnecting accounts, or
              managing teams? Start here.
            </p>
          </div>
        </div>
      </div>

      {/* Common Questions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Frequently Asked Questions</h3>
        <ul className="space-y-2">
          <li className="p-4 border rounded-md">
            <h4 className="font-medium">
              Why is my post stuck in “Scheduled”?
            </h4>
            <p className="text-sm text-muted-foreground">
              This often happens when the social account token has expired.
              Visit <strong>Settings → Social Accounts</strong> and reconnect
              the affected account to resume posting.
            </p>
          </li>
          <li className="p-4 border rounded-md">
            <h4 className="font-medium">
              How do I reconnect an expired token?
            </h4>
            <p className="text-sm text-muted-foreground">
              If a connected account is marked as “Expired,” click “Reconnect.”
              Skedlii will update your token and restore scheduling
              functionality. No posts will be lost.
            </p>
          </li>
          <li className="p-4 border rounded-md">
            <h4 className="font-medium">
              Can I post to multiple platforms at once?
            </h4>
            <p className="text-sm text-muted-foreground">
              Yes. When scheduling a post, select all connected accounts across
              platforms. Skedlii will automatically route the content to the
              right APIs with the appropriate media constraints (e.g. Instagram
              crop size, Twitter character limit).
            </p>
          </li>
          <li className="p-4 border rounded-md">
            <h4 className="font-medium">
              Why did my Instagram or Threads connection fail?
            </h4>
            <p className="text-sm text-muted-foreground">
              Meta-based accounts can fail to connect if the business/creator
              link isn't established. Make sure your Instagram account is linked
              to a Facebook page and that the Meta permissions are accepted
              during OAuth.
            </p>
          </li>
          <li className="p-4 border rounded-md">
            <h4 className="font-medium">
              How does scheduling work under the hood?
            </h4>
            <p className="text-sm text-muted-foreground">
              Skedlii queues your scheduled post with the selected accounts,
              validates content format, and dispatches at the scheduled time via
              background workers. If a post fails (due to auth or format),
              you’ll see it flagged under <strong>Activity Logs</strong>.
            </p>
          </li>
        </ul>
      </section>

      {/* Platform-Specific Guides */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold">Platform Help</h3>
        <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
          <li>
            <Link
              to="/dashboard/help/instagram"
              className="hover:underline text-primary"
            >
              Instagram
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/help/twitter"
              className="hover:underline text-primary"
            >
              Twitter
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/help/linkedin"
              className="hover:underline text-primary"
            >
              LinkedIn
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/help/threads"
              className="hover:underline text-primary"
            >
              Threads
            </Link>
          </li>
        </ul>
      </section>

      {/* Contact */}
      <section className="space-y-2">
        <h3 className="text-lg font-semibold">Need direct assistance?</h3>
        <p className="text-sm text-muted-foreground">
          We’re here to help. Reach out and we’ll respond within 24 hours.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="mailto:hello@skedlii.xyz"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm"
          >
            Email Support
          </a>
          <button
            className="inline-flex items-center px-4 py-2 border border-muted-foreground rounded-md text-sm"
            onClick={() => alert("Live chat coming soon!")}
          >
            Live Chat (Coming Soon)
          </button>
        </div>
      </section>
    </div>
  );
};

export default HelpSupport;
