import { useQuery } from "@tanstack/react-query";

export interface AccountSummary {
  _id?: string;
  accountId?: string;
  accountName?: string;
  platform?: string;
  status?: string;
  userId?: string;
  teamId?: string;
  lastConnectedAt?: string;
}

export interface ScheduledPostSummary {
  _id?: string;
  scheduledFor?: string;
  createdAt?: string;
  status?: string;
}

export interface DraftSummary {
  _id?: string;
  title?: string;
  status?: string;
  currentRevision?: unknown;
  updatedAt?: string;
  createdAt?: string;
}

export interface SocialPostDetailPayload {
  socialPost: Record<string, unknown> | null;
  account?: AccountSummary;
  scheduledPost?: ScheduledPostSummary;
  draft?: DraftSummary;
  operations?: {
    canDelete?: boolean;
  };
}

export function useSocialPostDetail(id?: string) {
  return useQuery<
    SocialPostDetailPayload | undefined,
    unknown,
    SocialPostDetailPayload
  >({
    queryKey: id ? [`/social-posts/${id}`] : [],
    enabled: Boolean(id),
    select: (raw: unknown) => {
      const payload = (raw ?? {}) as Partial<SocialPostDetailPayload>;
      const socialPost = (payload.socialPost ?? null) as Record<
        string,
        unknown
      > | null;
      return {
        socialPost,
        account: payload.account,
        scheduledPost: payload.scheduledPost,
        draft: payload.draft,
        operations: payload.operations ?? {},
      } as SocialPostDetailPayload;
    },
  });
}

export type SocialPostDetailQuery = ReturnType<typeof useSocialPostDetail>;
