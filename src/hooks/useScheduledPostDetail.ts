import { useQuery } from "@tanstack/react-query";

export type QueueJobSnapshot = {
  id?: string;
  state?: string;
  attemptsMade?: number;
  attempts?: number;
  timestamp?: number;
  processedOn?: number;
  finishedOn?: number;
  failedReason?: string;
  delay?: number;
};

export interface SocialPostSummary {
  _id?: string;
  publishedDate?: string;
  content?: string;
  postUrl?: string;
  mediaUrls?: string[];
  metadata?: Record<string, unknown> & {
    platform?: string;
    caption?: string;
    postUrl?: string;
    url?: string;
  };
}

export interface ScheduledPostRecord {
  _id?: string;
  content?: string;
  scheduledFor?: string;
  createdAt?: string;
  updatedAt?: string;
  mediaType?: string;
  mode?: string;
  editPolicy?: string;
  sourceDraftId?: string;
  status?: string;
}

export type ScheduledPlatformDetail = {
  accountId?: string;
  platform?: string;
  accountName?: string;
  status?: string;
  caption?: string;
  captionUsed?: string;
  startedAt?: string;
  publishedAt?: string;
  updatedAt?: string;
  lastError?: string;
  lastErrorType?: string;
  queueJob?: QueueJobSnapshot | null;
  socialPost?: SocialPostSummary;
};

export type ScheduledPostDetailPayload = {
  scheduledPost: ScheduledPostRecord | null;
  platforms: ScheduledPlatformDetail[];
  socialPosts: SocialPostSummary[];
  operations: {
    canCancel?: boolean;
    canRetry?: boolean;
    canDelete?: boolean;
  };
};

const STALE_STATUSES = new Set(["canceled", "deleted", "published", "failed"]);

function computeRefetchInterval(data: ScheduledPostDetailPayload | undefined) {
  if (!data) return false;
  const { platforms = [] } = data;
  const hasActive = platforms.some((plat) => {
    const status = plat.status?.toLowerCase?.() ?? "";
    return !STALE_STATUSES.has(status);
  });
  return hasActive ? 4000 : false;
}

export function useScheduledPostDetail(id?: string) {
  return useQuery<
    ScheduledPostDetailPayload | undefined,
    unknown,
    ScheduledPostDetailPayload
  >({
    queryKey: id ? [`/scheduled-posts/${id}`] : [],
    enabled: Boolean(id),
    select: (raw: unknown) => {
      const payload = (raw ?? {}) as Partial<ScheduledPostDetailPayload>;
      const scheduledPost = (payload.scheduledPost ??
        null) as ScheduledPostRecord | null;
      const platforms = Array.isArray(payload.platforms)
        ? (payload.platforms as ScheduledPlatformDetail[])
        : [];
      const socialPosts = Array.isArray(payload.socialPosts)
        ? (payload.socialPosts as SocialPostSummary[])
        : [];
      const operations = payload.operations ?? {};
      return {
        scheduledPost,
        platforms,
        socialPosts,
        operations,
      } as ScheduledPostDetailPayload;
    },
    refetchInterval: (query) => {
      const payload = query.state.data as
        | ScheduledPostDetailPayload
        | undefined;
      return computeRefetchInterval(payload);
    },
  });
}

export type ScheduledPostDetailQuery = ReturnType<
  typeof useScheduledPostDetail
>;
