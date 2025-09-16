import { apiRequest } from "../../lib/queryClient";
import axiosInstance from "../axios";

export const socialApi = {
  getAccounts: async ({ id }: { id: string }) => {
    try {
      const response = await axiosInstance.get(`/social-accounts/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch social accounts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch social accounts"
      );
    }
  },

  // Get organization social accounts
  getOrganizationSocialAccounts: async (organizationId: string) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/organization/${organizationId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch organization social accounts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch organization social accounts"
      );
    }
  },

  listAccountsIndividual: async ({ userId }: { userId: string }) => {
    try {
      const response = await axiosInstance.get(`/social-accounts/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch social accounts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch social accounts"
      );
    }
  },

  listSocialAccountsByTeam: async ({ teamId }: { teamId: string }) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/team/${teamId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch social accounts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch social accounts"
      );
    }
  },

  connectTwitter: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/twitter/direct-auth`
    );
    return response;
  },

  connectThreads: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/threads/connect`
    );
    return response;
  },

  connectLinkedIn: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/linkedin/connect`
    );
    return response;
  },

  connectFacebook: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/facebook/connect`
    );
    return response;
  },

  connectViaMeta: async ({
    platform,
  }: {
    platform: "facebook" | "instagram";
  }) => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/meta/connect?platform=${platform}`
    );
    return response;
  },

  connectInstagram: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/instagram/connect`
    );
    return response;
  },

  connectTikTok: async () => {
    const response = await apiRequest("GET", `/social-accounts/tiktok/connect`);
    return response;
  },

  connectYoutube: async () => {
    const response = await apiRequest(
      "GET",
      `/social-accounts/youtube/connect`
    );
    return response;
  },

  disconnectSocialAccount: async ({ accountId }: { accountId: string }) => {
    try {
      const response = await axiosInstance.delete(
        `/social-accounts/disconnect/${accountId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to disconnect account:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to disconnect account"
      );
    }
  },

  disconnectTikTok: async ({ accountId }: { accountId: string }) => {
    try {
      const response = await axiosInstance.delete(
        `/social-accounts/tiktok/revoke/${accountId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to disconnect account:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to disconnect account"
      );
    }
  },

  refreshTwitterAccessToken: async ({ accountId }: { accountId: string }) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/twitter/refresh/${accountId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to refresh access token:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to refresh access token"
      );
    }
  },

  refreshYoutubeAccessToken: async ({ id }: { id: string }) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/youtube/reauth/start/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to refresh access token:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to refresh access token"
      );
    }
  },

  refreshTikTokAccessToken: async ({ accountId }: { accountId: string }) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/tiktok/refresh/${accountId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to refresh access token:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to refresh access token"
      );
    }
  },

  // TODO: Verify methods below if still in use

  postToThreads: async (accountId: string, data: any) => {
    try {
      const response = await axiosInstance.post(
        `/social-accounts/threads/${accountId}/post`,
        {
          data,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error posting to Threads:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to post to Threads"
      );
    }
  },

  postToLinkedIn: async (accountId: string, content: string) => {
    try {
      const response = await axiosInstance.post(
        `/social-accounts/linkedin/${accountId}/post`,
        {
          content,
        },
        {
          withCredentials: true, // Include cookies for session authentication
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error posting to LinkedIn:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to post to LinkedIn"
      );
    }
  },

  postToTwitter: async (accountId: string, data: any) => {
    try {
      const response = await axiosInstance.post(
        `/social-accounts/twitter/${accountId}/post`,
        {
          data,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error posting to Twitter:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to post to Twitter"
      );
    }
  },

  postToInstagram: async (accountId: string, data: any) => {
    try {
      const response = await axiosInstance.post(
        `/social-accounts/instagram/${accountId}/post`,
        {
          data,
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Error posting to Instagram:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to post to Instagram"
      );
    }
  },

  getPosts: async (filters: any) => {
    try {
      const response = await axiosInstance.get(`/social-posts`, {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch social posts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch social posts"
      );
    }
  },

  deletePost: async (postId: string) => {
    try {
      const response = await axiosInstance.delete(`/social-posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to delete social post:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to delete social post"
      );
    }
  },

  // Get Scheduled Posts By Id
  getScheduledPostById: async (postId: string) => {
    try {
      const response = await axiosInstance.get(`/scheduled-posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch scheduled post:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch scheduled post"
      );
    }
  },

  getScheduledPosts: async () => {
    try {
      const response = await axiosInstance.get(`/scheduled-posts`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch scheduled posts:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch scheduled posts"
      );
    }
  },

  updateScheduledPost: async (postId: string, data: any) => {
    try {
      const response = await axiosInstance.put(
        `/scheduled-posts/${postId}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to update scheduled post:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to update scheduled post"
      );
    }
  },

  deleteScheduledPost: async (postId: string) => {
    try {
      const response = await axiosInstance.delete(`/scheduled-posts/${postId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to delete scheduled post:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to delete scheduled post"
      );
    }
  },

  getPostsByOrgId: async (organizationId: string) => {
    try {
      const response = await axiosInstance.get(
        `/social-posts/organization/${organizationId}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch posts by organization:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch posts by organization"
      );
    }
  },

  getPostsByUserId: async (userId: string) => {
    try {
      const response = await axiosInstance.get(`/social-posts/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch posts by user:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch posts by user"
      );
    }
  },

  getPostsByTeamId: async (teamId: string) => {
    try {
      const response = await axiosInstance.get(`/social-posts/team/${teamId}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch posts by team:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to fetch posts by team"
      );
    }
  },

  // Post to multi platforms
  postToMultiPlatform: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post(
        "/social-posts/post-to-platforms",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to post to multi platforms:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to post to multi platforms"
      );
    }
  },

  // SSOT JSON: Immediate post (preferred)
  postNowSSOT: async (
    data: {
      content: string;
      targets: Array<{ platform: string; socialAccountId: string }>;
      media?: Array<{
        type: 'image' | 'video';
        url: string;
        width?: number;
        height?: number;
        durationSec?: number;
        ref?: string;
      }>;
      scheduleAt?: null;
      tiktokOptions?: Record<string, any>;
    },
    config?: any
  ) => {
    try {
      const response = await axiosInstance.post(
        "/social-posts/post-to-platforms",
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to post (SSOT now):", error);
      throw new Error(
        error.response?.data?.message ?? error.message ?? "Failed to post"
      );
    }
  },

  // SSOT JSON: Schedule post
  scheduleSSOT: async (
    data: {
      content: string;
      targets: Array<{ platform: string; socialAccountId: string }>;
      media?: Array<{
        type: 'image' | 'video';
        url: string;
        width?: number;
        height?: number;
        durationSec?: number;
        ref?: string;
      }>;
      scheduleAt: string;
      tiktokOptions?: Record<string, any>;
    },
    config?: any
  ) => {
    try {
      const response = await axiosInstance.post(
        "/scheduled-posts",
        data,
        config
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to schedule (SSOT):", error);
      throw new Error(
        error.response?.data?.message ?? error.message ?? "Failed to schedule"
      );
    }
  },

  schedulePost: async (formData: FormData) => {
    try {
      const response = await axiosInstance.post("/scheduled-posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Failed to schedule post:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to schedule post"
      );
    }
  },

  getTikTokAccountInfo: async (id: string) => {
    try {
      const response = await axiosInstance.get(
        `/social-accounts/tiktok/account-info/${id}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to get TikTok account info:", error);
      throw new Error(
        error.response?.data?.message ??
          error.message ??
          "Failed to get TikTok account info"
      );
    }
  },
};

export default socialApi;
