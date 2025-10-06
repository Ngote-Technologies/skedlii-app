import { apiRequest } from "../lib/queryClient";
import { getApiClient, useV2Api } from "./axios";
import { Team, User } from "../types";

// V1 Response Interfaces (legacy)
export interface LoginResponse {
  token: string;
  user: any;
  organization?: any;
  organizations?: any[];
  teams?: any[];
  activeOrganizationId?: string;
  computedPermissions?: any;
  subscriptionInfo?: any;
}

// V2 Response Interfaces (complete structure matching backend)
export interface ComputedPermissions {
  isAdmin: boolean;
  canManageOrganization: boolean;
  canManageBilling: boolean;
  canConnectSocialAccounts: boolean;
  canCreateTeams: boolean;
  canManageTeams: boolean;
  canDeleteTeams: boolean;
  canInviteMembers: boolean;
  canRemoveMembers: boolean;
  canViewAnalytics: boolean;
  canExportData: boolean;
  canAccessAdvancedFeatures: boolean;
  canSchedulePosts: boolean;
  canBulkSchedule: boolean;
  canUseAIFeatures: boolean;
  canManageWebhooks: boolean;
  canViewAuditLogs: boolean;
  canManageApiKeys: boolean;
  canAccessBetaFeatures: boolean;
  canViewJobs: boolean;
  canManageJobs: boolean;
}

export interface SubscriptionInfo {
  hasValidSubscription: boolean;
  subscriptionTier: "free" | "team" | "enterprise" | "creator" | "trial" | null;
  selectedTier: "creator" | "team" | "enterprise" | null;
  subscriptionStatus:
    | "active"
    | "canceled"
    | "past_due"
    | "trialing"
    | "incomplete"
    | "unpaid"
    | "inactive"
    | null;
  billingCycle: "monthly" | "yearly" | null;
  subscriptionId: string | null;
  customerId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEnd: string | null;
  isTrial: boolean;
  hasUsedTrial: boolean;
  planLimits: {
    maxSocialAccounts: number | "unlimited";
    maxTeamMembers: number | "unlimited";
    maxScheduledPosts: number | "unlimited";
    maxPostsPerMonth: number | "unlimited";
    analyticsRetentionDays: number;
    aiCreditsPerMonth: number;
  };
}

export interface PermissionContext {
  organizationId: string | null;
  computedPermissions: ComputedPermissions;
  subscriptionInfo: SubscriptionInfo;
  userRole: "owner" | "admin" | "member" | "viewer";
  userType: "individual" | "organization";
  organizationContext?: {
    status: string;
    planId: string;
    planName: string;
    isActive: boolean;
  } | null;
}

export interface LoginResponseV2 {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    email: string;
    name: string;
    defaultOrganizationId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    role: "owner" | "admin" | "member" | "viewer";
    userType: "individual" | "organization";
  };
  organizationId: string;
  computedPermissions: ComputedPermissions;
  subscriptionInfo: SubscriptionInfo;
  userRole: "owner" | "admin" | "member" | "viewer";
  userType: "individual" | "organization";
}

export interface GetMeResponseV2 {
  user: {
    _id: string;
    email: string;
    name: string;
    defaultOrganizationId: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  organizations: Array<{
    orgId: string;
    role: string;
  }>;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// V2 Forgot Password Request
export interface ForgotPasswordRequestV2 {
  email: string;
}

// V2 Reset Password Request
export interface ResetPasswordRequestV2 {
  token: string;
  email: string;
  newPassword: string;
}

// V2 Auth Events Response
export interface AuthEvent {
  _id: string;
  type: string;
  userId: string;
  ip?: string;
  ua?: string;
  details?: any;
  createdAt: string;
}

export interface AuthEventsResponseV2 {
  items: AuthEvent[];
}

// V2-specific API methods
const authApiV2 = {
  loginUser: async (credentials: {
    email: string;
    password: string;
  }): Promise<LoginResponseV2> => {
    const apiClient = getApiClient("v2");

    try {
      const response = await apiClient.post<LoginResponseV2>(
        "/auth/login",
        credentials
      );

      // Store both tokens for V2
      localStorage.setItem("auth_token", response.data.accessToken);
      localStorage.setItem("refresh_token", response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  registerUser: async (userData: RegisterData): Promise<LoginResponseV2> => {
    const apiClient = getApiClient("v2");
    const response = await apiClient.post<LoginResponseV2>(
      "/auth/register",
      userData
    );

    // Store both tokens for V2
    localStorage.setItem("auth_token", response.data.accessToken);
    localStorage.setItem("refresh_token", response.data.refreshToken);

    return response.data;
  },

  getCurrentUser: async (): Promise<GetMeResponseV2> => {
    const apiClient = getApiClient("v2");
    const response = await apiClient.get<GetMeResponseV2>("/auth/me");
    return response.data;
  },

  refreshPermissions: async (
    organizationId?: string
  ): Promise<PermissionContext> => {
    const apiClient = getApiClient("v2");
    const response = await apiClient.post<PermissionContext>(
      "/auth/refresh-permissions",
      {
        organizationId,
      }
    );
    return response.data;
  },

  refreshTokens: async (): Promise<{
    accessToken: string;
    refreshToken: string;
  } | null> => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      console.warn("[DEBUG] No refresh token available");
      return null;
    }

    try {
      const apiClient = getApiClient("v2");
      const response = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
      }>("/auth/refresh", {
        refreshToken,
      });

      // Update stored tokens
      localStorage.setItem("auth_token", response.data.accessToken);
      localStorage.setItem("refresh_token", response.data.refreshToken);

      return response.data;
    } catch (error: any) {
      console.error("[DEBUG] Token refresh failed:", error);

      // If refresh fails, clear all tokens and force re-login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");

      return null;
    }
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        const apiClient = getApiClient("v2");
        await apiClient.post("/auth/logout", { refreshToken });
      } catch (error) {
        console.warn(
          "[DEBUG] V2 logout API call failed, proceeding with local cleanup"
        );
      }
    }

    // Clear all tokens
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("skedlii-storage");
    localStorage.removeItem("skedlii-team-storage");
    localStorage.removeItem("skedlii-theme");
  },

  forgotPassword: async (data: ForgotPasswordRequestV2): Promise<void> => {
    const apiClient = getApiClient("v2");

    try {
      // V2 API returns 204 No Content for security (no info leakage)
      await apiClient.post("/auth/forgot-password", data);
    } catch (error: any) {
      console.error("[DEBUG] V2 Auth: Forgot password request failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  resetPassword: async (data: ResetPasswordRequestV2): Promise<void> => {
    const apiClient = getApiClient("v2");

    try {
      // V2 API returns 204 No Content on success
      await apiClient.post("/auth/reset-password", data);
    } catch (error: any) {
      console.error("[DEBUG] V2 Auth: Reset password request failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  deleteAccount: async (): Promise<void> => {
    const apiClient = getApiClient("v2");

    try {
      // V2 API DELETE /auth/me
      await apiClient.delete("/auth/me");

      // Clear all local data after successful deletion
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("skedlii-storage");
      localStorage.removeItem("skedlii-team-storage");
      localStorage.removeItem("skedlii-theme");
    } catch (error: any) {
      console.error("[DEBUG] V2 Auth: Account deletion failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  getAuthEvents: async (limit = 50): Promise<AuthEventsResponseV2> => {
    const apiClient = getApiClient("v2");

    try {
      const response = await apiClient.get<AuthEventsResponseV2>(
        `/auth/events?limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error("[DEBUG] V2 Auth: Auth events request failed:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },
};

// V1 API methods (legacy, using apiRequest)
const authApiV1 = {
  loginUser: async (credentials: any): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/auth/login", credentials);
    return response;
  },

  registerUser: async (userData: RegisterData): Promise<LoginResponse> => {
    const response = await apiRequest("POST", "/auth/register", userData);
    return response;
  },

  getCurrentUser: async (): Promise<{
    teams: Team[];
    user: User;
    organization?: any;
    organizations?: any[];
    activeOrganizationId?: string;
    computedPermissions?: any;
    subscriptionInfo?: any;
  }> => {
    const response = await apiRequest("GET", "/auth/me");
    return response;
  },

  refreshPermissions: async (
    organizationId?: string
  ): Promise<{
    organizationId: string | null;
    computedPermissions: any;
    subscriptionInfo: any;
    userRole: string;
    userType: string;
  }> => {
    const response = await apiRequest("POST", "/auth/refresh-permissions", {
      organizationId,
    });
    return response;
  },

  logout: async (): Promise<void> => {
    // Just clear the token on the client side
    localStorage.removeItem("auth_token");
    localStorage.removeItem("skedlii-storage");
    localStorage.removeItem("skedlii-team-storage");
    localStorage.removeItem("skedlii-theme");
  },

  // V1 versions of additional methods (for compatibility)
  forgotPassword: async (data: ForgotPasswordRequestV2): Promise<void> => {
    await apiRequest("POST", "/auth/forgot-password", data);
  },

  resetPassword: async (data: ResetPasswordRequestV2): Promise<void> => {
    await apiRequest("POST", "/auth/reset-password", data);
  },

  deleteAccount: async (): Promise<void> => {
    await apiRequest("DELETE", "/auth/me");
    // Clear all local data after successful deletion
    localStorage.removeItem("auth_token");
    localStorage.removeItem("skedlii-storage");
    localStorage.removeItem("skedlii-team-storage");
    localStorage.removeItem("skedlii-theme");
  },

  // V1 doesn't have auth events, return empty array
  getAuthEvents: async (_limit = 50): Promise<AuthEventsResponseV2> => {
    console.warn(
      "[DEBUG] V1 API: Auth events not supported, returning empty array"
    );
    return { items: [] };
  },
};

// Adaptive auth API that switches between V1 and V2
export const authApi = {
  loginUser: async (credentials: any) => {
    return authApiV2.loginUser(credentials);
  },

  registerUser: async (userData: RegisterData) => {
    return authApiV2.registerUser(userData);
  },

  getCurrentUser: async () => {
    const useV2 = useV2Api("auth");
    return useV2 ? authApiV2.getCurrentUser() : authApiV1.getCurrentUser();
  },

  refreshPermissions: async (organizationId?: string) => {
    const useV2 = useV2Api("auth");
    return useV2
      ? authApiV2.refreshPermissions(organizationId)
      : authApiV1.refreshPermissions(organizationId);
  },

  logout: async (): Promise<void> => {
    const useV2 = useV2Api("auth");
    return useV2 ? authApiV2.logout() : authApiV1.logout();
  },

  // Forgot password functionality
  forgotPassword: async (data: { email: string }) => {
    const useV2 = useV2Api("auth");
    return useV2
      ? authApiV2.forgotPassword(data)
      : authApiV1.forgotPassword(data);
  },

  // Reset password functionality
  resetPassword: async (data: {
    token: string;
    email: string;
    newPassword: string;
  }) => {
    const useV2 = useV2Api("auth");
    return useV2
      ? authApiV2.resetPassword(data)
      : authApiV1.resetPassword(data);
  },

  // Delete account functionality
  deleteAccount: async () => {
    const useV2 = useV2Api("auth");
    return useV2 ? authApiV2.deleteAccount() : authApiV1.deleteAccount();
  },

  // Get auth events (V2 feature, V1 returns empty)
  getAuthEvents: async (limit = 50) => {
    const useV2 = useV2Api("auth");
    return useV2
      ? authApiV2.getAuthEvents(limit)
      : authApiV1.getAuthEvents(limit);
  },

  // V2-specific refresh token functionality
  refreshTokens: async () => {
    const useV2 = useV2Api("auth");
    if (useV2) {
      return authApiV2.refreshTokens();
    }
    // V1 doesn't have refresh tokens, return null
    return null;
  },
};

// Export individual API versions for testing
export { authApiV1, authApiV2 };
