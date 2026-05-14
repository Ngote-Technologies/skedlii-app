import {
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
} from "lucide-react";
import { Badge } from "../../ui/badge";
import { cn, formatDate, getSocialIcon } from "../../../lib/utils";

export type PlatformStatus =
  | "pending"
  | "publishing"
  | "published"
  | "failed"
  | "canceled";

export type AggregatePostStatus =
  | "scheduled"
  | "publishing"
  | "published"
  | "partial"
  | "failed"
  | "canceled"
  | "draft";

const TERMINAL_FAILURE_STATUSES = new Set(["failed", "canceled"]);

export function getPlatformStatus(platform: any): PlatformStatus {
  const status = String(platform?.status || "pending").toLowerCase();
  if (status === "published") return "published";
  if (status === "publishing") return "publishing";
  if (status === "failed") return "failed";
  if (status === "canceled") return "canceled";
  return "pending";
}

export function getAggregatePostStatus(platforms: any[]): AggregatePostStatus {
  const statuses = Array.isArray(platforms)
    ? platforms.map(getPlatformStatus)
    : [];

  if (!statuses.length) return "scheduled";

  const hasPublished = statuses.includes("published");
  const hasPublishing = statuses.includes("publishing");
  const hasPending = statuses.includes("pending");
  const hasFailedOrCanceled = statuses.some((status) =>
    TERMINAL_FAILURE_STATUSES.has(status)
  );

  if (statuses.every((status) => status === "published")) return "published";
  if (hasPublishing) return "publishing";
  if (hasPublished && hasFailedOrCanceled) return "partial";
  if (hasPending) return "scheduled";
  if (hasFailedOrCanceled) return "failed";

  return "scheduled";
}

export function hasPendingTarget(platforms: any[]) {
  return (
    Array.isArray(platforms) &&
    platforms.some((p) => getPlatformStatus(p) === "pending")
  );
}

export function hasActiveTarget(platforms: any[]) {
  return (
    Array.isArray(platforms) &&
    platforms.some((p) => {
      const status = getPlatformStatus(p);
      return status === "pending" || status === "publishing";
    })
  );
}

export function hasPublishingTarget(platforms: any[]) {
  return (
    Array.isArray(platforms) &&
    platforms.some((p) => getPlatformStatus(p) === "publishing")
  );
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 w-fit"
          icon={<FileText size={12} />}
        >
          Draft
        </Badge>
      );
    case "published":
      return (
        <Badge
          variant="success"
          className="flex items-center gap-1 w-fit"
          icon={<CheckCircle size={12} />}
        >
          Published
        </Badge>
      );
    case "partial":
      return (
        <Badge
          variant="warning"
          className="flex items-center gap-1 w-fit"
          icon={<AlertCircle size={12} />}
        >
          Partially Published
        </Badge>
      );
    case "scheduled":
    case "pending":
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 w-fit"
          icon={<Clock size={12} />}
        >
          Scheduled
        </Badge>
      );
    case "publishing":
      return (
        <Badge
          variant="info"
          className="flex items-center gap-1 w-fit"
          icon={<Loader2 size={12} className="animate-spin" />}
        >
          Publishing
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1 w-fit"
          icon={<AlertCircle size={12} />}
        >
          Failed
        </Badge>
      );
    case "canceled":
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1 w-fit"
          icon={<Clock size={12} />}
        >
          Canceled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 w-fit"
          icon={<FileText size={12} />}
        >
          {status}
        </Badge>
      );
  }
};

function getPlatformTime(platform: any, scheduledFor?: string) {
  const status = getPlatformStatus(platform);
  if (status === "published") return platform?.publishedAt || scheduledFor;
  if (status === "failed" || status === "publishing") {
    return platform?.startedAt || scheduledFor;
  }
  return scheduledFor;
}

function getPlatformPillStyle(status: PlatformStatus) {
  switch (status) {
    case "published":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900";
    case "failed":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900";
    case "publishing":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900";
    case "canceled":
      return "bg-muted text-muted-foreground border-border";
    default:
      return "bg-muted text-foreground border-border";
  }
}

export function PlatformStatusPill({
  platform,
  scheduledFor,
}: {
  platform: any;
  scheduledFor?: string;
}) {
  const status = getPlatformStatus(platform);
  const name = String(platform?.platformName || platform?.platform || "")
    .toLowerCase()
    .trim();
  const time = getPlatformTime(platform, scheduledFor);
  const shouldShowTime = Boolean(time);
  const failureTitle =
    status === "failed" && platform?.lastError
      ? String(platform.lastError)
      : undefined;

  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        getPlatformPillStyle(status)
      )}
      title={failureTitle}
    >
      <i className={cn(getSocialIcon(name), "shrink-0")} />
      <span className="truncate">
        {name || platform?.platformId || "platform"}
      </span>
      {shouldShowTime && (
        <>
          <span className="text-current/60">·</span>
          <span className="shrink-0 text-current/80">
            {formatDate(time, "p")}
          </span>
        </>
      )}
    </div>
  );
}
