import axiosInstance from "./axios";

export type PlatformName =
  | "twitter"
  | "linkedin"
  | "instagram"
  | "threads"
  | "tiktok"
  | "youtube"
  | "facebook";

export type PostDraftMediaPayload = {
  type: "image" | "video";
  url?: string;
  ref?: string;
  width?: number;
  height?: number;
  durationSec?: number;
};

export type DraftTargetPayload = {
  platform: PlatformName;
  socialAccountId: string;
  teamId?: string;
};

export type CreatePostDraftPayload = {
  title?: string;
  content: string;
  media?: PostDraftMediaPayload[];
  tags?: string[];
  sourceContentId?: string;
  platformCaptions?: Record<string, string>;
  targets?: DraftTargetPayload[];
};

export type PromotePostDraftPayload = {
  mode: "immediate" | "scheduled";
  targets: Array<{
    socialAccountId: string;
    platform?: string;
    teamId?: string;
  }>;
  scheduleAt?: string;
  tiktokOptions?: Record<string, any>;
  idempotencyKey?: string;
  platformCaptions?: Record<string, string>;
};

export type PostDraftResponse = {
  draft: any;
};

export type PromotePostDraftResponse = {
  scheduledPostId?: string;
  jobs?: string[];
  mode: "immediate" | "scheduled";
  draft: any;
};

const postDraftsApi = {
  async list(params?: { status?: string; q?: string }) {
    const response = await axiosInstance.get("/post-drafts", { params });
    return response.data;
  },

  async get(id: string) {
    const response = await axiosInstance.get(`/post-drafts/${id}`);
    return response.data as PostDraftResponse;
  },

  async create(payload: CreatePostDraftPayload) {
    const response = await axiosInstance.post(`/post-drafts`, payload);
    return response.data as PostDraftResponse;
  },

  async update(id: string, payload: Partial<CreatePostDraftPayload>) {
    const response = await axiosInstance.patch(`/post-drafts/${id}`, payload);
    return response.data as PostDraftResponse;
  },

  async archive(id: string) {
    await axiosInstance.delete(`/post-drafts/${id}`);
  },

  async promote(id: string, payload: PromotePostDraftPayload) {
    const response = await axiosInstance.post(
      `/post-drafts/${id}/promote`,
      payload
    );
    return response.data as PromotePostDraftResponse;
  },
};

export default postDraftsApi;
