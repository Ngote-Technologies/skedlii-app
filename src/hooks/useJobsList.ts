import { useQuery, keepPreviousData } from "@tanstack/react-query";

export type JobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "canceled";

export type ScheduledSummary = {
  id: string;
  status: string;
  scheduledFor?: string;
  mode?: string;
  content?: string;
  canceledAt?: string;
  deletedAt?: string;
  platformSummary?: {
    total: number;
    pending: number;
    failed: number;
    published: number;
  };
};

export type SocialSummary = {
  id: string;
  status?: string;
  platform?: string;
  publishedDate?: string;
  postUrl?: string;
};

export type DraftSummary = {
  id: string;
  title?: string;
  status?: string;
  revision?: number;
  updatedAt?: string;
};

export type QueueSnapshot = {
  state?: string;
  attemptsMade?: number;
  attempts?: number;
  delay?: number;
  timestamp?: number;
  processedOn?: number | null;
  finishedOn?: number | null;
} | null;

export type JobHistoryItem = {
  id: string;
  jobId: string;
  queueName: string;
  jobName?: string;
  status: JobStatus;
  attemptsMade: number;
  attempts?: number;
  lastError?: string | null;
  lastErrorType?: string | null;
  publishMode?: string;
  platform?: string;
  socialAccountId?: string;
  scheduledFor?: string;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  payload?: Record<string, unknown>;
  jobOptions?: Record<string, unknown>;
  scheduledPost: ScheduledSummary | null;
  socialPost: SocialSummary | null;
  draft: DraftSummary | null;
  queue: QueueSnapshot;
  operations: {
    canRetry: boolean;
    canCancel: boolean;
  };
};

export type JobsListResponse = {
  items: JobHistoryItem[];
  nextCursor?: string | null;
};

export type JobsListFilters = {
  status?: JobStatus;
  queueName?: string;
  platform?: string;
  jobName?: string;
  jobId?: string;
  from?: string;
  to?: string;
  limit?: number;
};

function buildJobsQueryUrl(filters: JobsListFilters, cursor?: string) {
  const params = new URLSearchParams();

  if (filters.status) params.set("status", filters.status);
  if (filters.queueName) params.set("queueName", filters.queueName);
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.jobName) params.set("jobName", filters.jobName);
  if (filters.jobId) params.set("jobId", filters.jobId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (typeof filters.limit === "number") {
    params.set("limit", String(filters.limit));
  }
  if (cursor) params.set("cursor", cursor);

  const query = params.toString();
  return query ? `/admin/jobs?${query}` : "/admin/jobs";
}

function normalizeJobsResponse(data: unknown): JobsListResponse {
  const payload = (data ?? {}) as Partial<JobsListResponse>;
  const items = Array.isArray(payload.items)
    ? (payload.items as JobHistoryItem[])
    : [];
  const nextCursor =
    typeof payload.nextCursor === "string" ? payload.nextCursor : undefined;

  return { items, nextCursor };
}

export function useJobsList(filters: JobsListFilters, cursor?: string) {
  const url = buildJobsQueryUrl(filters, cursor);

  return useQuery<JobsListResponse, unknown, JobsListResponse>({
    queryKey: [url],
    select: normalizeJobsResponse,
    placeholderData: keepPreviousData,
  });
}
