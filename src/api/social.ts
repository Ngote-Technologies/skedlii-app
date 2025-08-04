import axiosInstance from "./axios";
import { ContentItem } from "../types";

// Types for social account operations
export interface SocialAccount {
  _id: string;
  id: string;
  userId: string;
  platform: string;
  username: string;
  accountName?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: string;
  profileData: any;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  accountId: string;
  organizationId?: string;
  teamId?: string;
  ownershipLevel?: "user" | "team" | "organization"; // Indicates who owns/controls this account
  status?: "active" | "expired" | "revoked" | "error";
}

export interface PostRequest {
  accountId: string;
  message: string;
}

export interface PostResponse {
  tweet: {
    id: string;
    [key: string]: any;
  };
}

// Get all social accounts for the current user
export const getSocialAccounts = async (): Promise<SocialAccount[]> => {
  const response = await axiosInstance.get("/social-accounts");
  return response.data;
};

// Post content to Twitter
export const postToTwitter = async (
  accountId: string,
  message: string
): Promise<PostResponse> => {
  try {
    const response = await axiosInstance.post(
      "/social-accounts/twitter/tweet",
      {
        accountId,
        message,
      }
    );
    return response.data;
  } catch (error: any) {
    console.error("Error posting to Twitter:", error);

    // Get the error response or provide a fallback
    const errorResponse = error.response?.data ?? {};
    const errorType = errorResponse.errorType ?? "";
    const errorMessage =
      errorResponse.message ??
      error.message ??
      "Unknown error posting to Twitter";

    // Handle authentication errors
    if (error.response?.status === 401 || errorType === "auth_expired") {
      throw new Error(
        "Twitter authentication expired. Please reconnect your account."
      );
    }

    // Handle permission errors
    if (error.response?.status === 403 || errorType === "permission_denied") {
      throw new Error(
        errorMessage ??
          "Your Twitter app doesn't have permission to post tweets. " +
            "Please check your Twitter Developer Portal for proper permissions."
      );
    }

    // Handle rate limiting
    if (error.response?.status === 429 || errorType === "rate_limit") {
      throw new Error("Twitter rate limit exceeded. Please try again later.");
    }

    // Handle content rejection
    if (errorType === "content_rejected") {
      throw new Error(
        "Tweet was rejected by Twitter. This could be due to duplicate content or Twitter content policies."
      );
    }

    // API error with status
    if (errorType === "api_error") {
      throw new Error(errorMessage);
    }

    // Generic error with the best error message we can find
    throw new Error(errorMessage);
  }
};

// Post content item to Twitter
export const postContentToTwitter = async (
  accountId: string,
  content: ContentItem
): Promise<PostResponse> => {
  try {
    return await postToTwitter(accountId, content.content);
  } catch (error) {
    // Re-throw the error to be handled by the component
    throw error;
  }
};

// Schedule a tweet for later
export const scheduleTweet = async (
  accountId: string,
  message: string,
  scheduledTime: Date
): Promise<any> => {
  const response = await axiosInstance.post(
    "/social-accounts/twitter/schedule",
    {
      accountId,
      message,
      scheduledTime: scheduledTime.toISOString(),
    }
  );
  return response.data;
};

// Start Twitter account connection flow
export const connectTwitterAccount = async (): Promise<string> => {
  const response = await axiosInstance.get(
    "/social-accounts/twitter/direct-auth"
  );
  return response.data;
};

// Disconnect a social account
export const disconnectSocialAccount = async (
  platform: string
): Promise<{ success: boolean }> => {
  const response = await axiosInstance.post(
    `/social-accounts/${platform}/disconnect`
  );
  return response.data;
};

// Update content status after posting
export const updateContentPostStatus = async (
  contentId: string,
  platform: string,
  postId: string,
  status: "posted" | "scheduled" | "failed"
): Promise<ContentItem> => {
  // This would typically update the content item with posting metadata
  const response = await axiosInstance.patch(
    `/content/${contentId}/post-status`,
    {
      platform,
      postId,
      status,
      postedAt: new Date().toISOString(),
    }
  );
  return response.data;
};

// Track manual posting attempt
export const trackManualPostAttempt = async (
  contentId: string,
  platform: string
): Promise<ContentItem> => {
  // This updates the content item with manual posting metadata
  const response = await axiosInstance.patch(
    `/content/${contentId}/post-status`,
    {
      platform,
      postId: null, // No post ID since it's manual
      status: "manual_attempt",
      postedAt: new Date().toISOString(),
    }
  );
  return response.data;
};
