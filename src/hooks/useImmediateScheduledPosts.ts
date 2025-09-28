import { useQuery } from "@tanstack/react-query";

export type ImmediateScheduledTarget = {
  id: string;
  scheduledPostId: string;
  accountId: string;
  platformName: string;
  status: string;
  caption: string;
  content: string;
  mediaUrls: string[];
  mediaType: "image" | "video" | "text";
  organizationId?: string;
  createdAt?: string;
  scheduledFor?: string;
  startedAt?: string;
  postUrl?: string;
  lastError?: string;
  lastErrorType?: string;
};

const IMMEDIATE_QUERY_KEY = "/scheduled-posts?mode=immediate" as const;

const ACTIVE_STATUSES = new Set(["pending", "publishing", "failed"]);

type RawPlatform = {
  accountId?: string;
  platformName?: string;
  status?: string;
  caption?: string;
  startedAt?: string;
  postUrl?: string;
  lastError?: string;
  lastErrorType?: string;
};

type RawScheduledPost = {
  _id?: string;
  content?: string;
  mediaUrls?: string[];
  mediaType?: string;
  organizationId?: string;
  createdAt?: string;
  scheduledFor?: string;
  platforms?: RawPlatform[];
};

type ScheduledPostsResponse = {
  items?: RawScheduledPost[];
  data?: RawScheduledPost[];
};

const normalizeStatus = (status?: string) =>
  String(status ?? "pending").toLowerCase();

const toTargetArray = (
  response: ScheduledPostsResponse | null | undefined
): ImmediateScheduledTarget[] => {
  const rawItems = Array.isArray(response?.items)
    ? response?.items
    : Array.isArray(response?.data)
    ? response?.data
    : [];

  return rawItems.flatMap((item) => {
    const platforms = Array.isArray(item?.platforms) ? item.platforms : [];
    const baseContent = (item?.content ?? "").toString();
    const mediaUrls = Array.isArray(item?.mediaUrls) ? item.mediaUrls : [];
    const mediaType =
      item?.mediaType === "image" || item?.mediaType === "video"
        ? (item.mediaType as "image" | "video")
        : "text";

    return platforms
      .filter((platform): platform is RawPlatform => {
        if (!platform?.accountId) return false;
        const status = normalizeStatus(platform.status);
        return ACTIVE_STATUSES.has(status);
      })
      .flatMap((platform) => {
        const scheduledPostId = item?._id ? String(item._id) : null;
        const accountId = platform.accountId
          ? String(platform.accountId)
          : null;
        if (!scheduledPostId || !accountId) {
          return [] as ImmediateScheduledTarget[];
        }

        const platformName = platform.platformName
          ? String(platform.platformName)
          : "";
        const status = normalizeStatus(platform.status);

        return [
          {
            id: `scheduled-${scheduledPostId}-${accountId}`,
            scheduledPostId,
            accountId,
            platformName,
            status,
            caption: (platform.caption ?? baseContent).toString(),
            content: baseContent,
            mediaUrls,
            mediaType,
            organizationId: item?.organizationId
              ? String(item.organizationId)
              : undefined,
            createdAt: item?.createdAt,
            scheduledFor: item?.scheduledFor,
            startedAt: platform.startedAt,
            postUrl: platform.postUrl,
            lastError: platform.lastError,
            lastErrorType: platform.lastErrorType,
          },
        ];
      });
  });
};

export function useImmediateScheduledPosts(enabled: boolean = true) {
  return useQuery<
    ScheduledPostsResponse | null,
    unknown,
    ImmediateScheduledTarget[]
  >({
    queryKey: [IMMEDIATE_QUERY_KEY],
    enabled,
    select: toTargetArray,
    refetchInterval: (query) => {
      const rawData = query.state.data as
        | ImmediateScheduledTarget[]
        | ScheduledPostsResponse
        | null
        | undefined;

      const targets: ImmediateScheduledTarget[] = Array.isArray(rawData)
        ? rawData
        : toTargetArray(rawData || undefined);

      if (targets.length === 0) return false;

      const hasActive = targets.some(
        (target) =>
          target.status === "pending" || target.status === "publishing"
      );

      return hasActive ? 4000 : false;
    },
    staleTime: 0,
  });
}

export const immediateScheduledPostsQueryKey = IMMEDIATE_QUERY_KEY;
