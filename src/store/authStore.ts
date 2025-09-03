import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  authApi,
  LoginResponse,
  LoginResponseV2,
  GetMeResponseV2,
} from "../api/auth";
import { useV2Api } from "../api/axios";
import { Organization, Team } from "../types";
import { useTeamStore } from "./teamStore";
import { useOrganizationStore } from "./organizationStore";

export type UserRole =
  | "owner" // Database stores this format
  | "org_owner" // Code expects this format - both are treated as equivalent
  | "admin"
  | "member"
  | "viewer";
export type UserType = "individual" | "organization";
export type SubscriptionStatus =
  | "active"
  | "inactive"
  | "canceled"
  | "past_due"
  | "trialing";

interface SubscriptionInfo {
  hasValidSubscription: boolean;
  subscriptionTier: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  organizationOwnerBilling?: any; // For organization members inheriting subscription
}

interface AuthState {
  // State
  user: any;
  token: string | null;
  refreshToken: string | null; // V2 specific
  organization: Organization | null;
  teams: Team[];
  isLoading: boolean;
  error: string | null;

  // Enhanced authentication context
  userRole: UserRole | null;
  userType: UserType | null;
  subscriptionInfo: SubscriptionInfo;

  // Computed permissions (matching V2 API ComputedPermissions interface)
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

  // Actions
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchUserData: () => Promise<void>;
  clearError: () => void;
  updateSubscriptionInfo: (info: SubscriptionInfo) => Promise<void>;
  refreshPermissions: (organizationId?: string) => Promise<void>;
}

// Response format adapters for V1/V2 compatibility
const adaptLoginResponse = (
  response: LoginResponse | LoginResponseV2,
  isV2: boolean
) => {
  if (isV2) {
    const v2Response = response as LoginResponseV2;
    return {
      token: v2Response.accessToken,
      refreshToken: v2Response.refreshToken,
      user: v2Response.user,
      // V2 now provides these in login response - use them if available, else defaults
      organization: v2Response.organizationId
        ? {
            _id: v2Response.organizationId,
            role: v2Response.userRole,
          }
        : null,
      teams: [], // Teams still require separate call
      computedPermissions: v2Response.computedPermissions || {
        isAdmin: false,
        canManageOrganization: false,
        canManageBilling: false,
        canConnectSocialAccounts: false,
        canCreateTeams: false,
        canManageTeams: false,
        canDeleteTeams: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canViewAnalytics: false,
        canExportData: false,
        canAccessAdvancedFeatures: false,
        canSchedulePosts: false,
        canBulkSchedule: false,
        canUseAIFeatures: false,
        canManageWebhooks: false,
        canViewAuditLogs: false,
        canManageApiKeys: false,
        canAccessBetaFeatures: false,
      },
      subscriptionInfo: v2Response.subscriptionInfo || {
        hasValidSubscription: false,
        subscriptionTier: null,
        subscriptionStatus: null,
      },
    };
  } else {
    const v1Response = response as LoginResponse;
    return {
      token: v1Response.token,
      refreshToken: null,
      user: v1Response.user,
      organization: v1Response.organization,
      teams: v1Response.teams || [],
      computedPermissions: v1Response.computedPermissions || {
        isAdmin: false,
        canManageOrganization: false,
        canManageBilling: false,
        canConnectSocialAccounts: false,
        canCreateTeams: false,
      },
      subscriptionInfo: v1Response.subscriptionInfo || {
        hasValidSubscription: false,
        subscriptionTier: null,
        subscriptionStatus: null,
      },
    };
  }
};

const adaptGetMeResponse = (response: any, isV2: boolean) => {
  if (isV2) {
    const v2Response = response as GetMeResponseV2;

    // For V2, we need to compute basic permissions from user role and organizations
    const userRole =
      v2Response.organizations.length > 0
        ? v2Response.organizations[0].role
        : "member";
    const isOwnerOrAdmin = userRole === "owner" || userRole === "admin";

    return {
      user: {
        ...v2Response.user,
        // Map V2 user format to V1 expected format for compatibility
        role: userRole,
        userType: "individual", // Default, can be enhanced later
      },
      organization:
        v2Response.organizations.length > 0
          ? {
              _id: v2Response.organizations[0].orgId,
              role: v2Response.organizations[0].role,
            }
          : null,
      organizations: v2Response.organizations,
      // V2 doesn't provide these in /me response, will need separate calls
      teams: [],
      computedPermissions: {
        // Basic permissions based on role
        isAdmin: isOwnerOrAdmin,
        canManageOrganization: isOwnerOrAdmin,
        canManageBilling: userRole === "owner",
        canConnectSocialAccounts: true, // Most users can connect accounts
        canCreateTeams: isOwnerOrAdmin,
      },
      subscriptionInfo: {
        hasValidSubscription: false, // Will be fetched separately
        subscriptionTier: null,
        subscriptionStatus: null,
      },
    };
  } else {
    // V1 response format
    return response;
  }
};

// DEPRECATED: Client-side permission computation removed
// All permissions now come from backend computedPermissions

export const logoutUser = async () => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    useAuthStore.setState({
      user: null,
      token: null,
      refreshToken: null,
      organization: null,
      teams: [],
      userRole: null,
      userType: null,
      subscriptionInfo: {
        hasValidSubscription: false,
        subscriptionTier: null,
        subscriptionStatus: null,
      },
      isAdmin: false,
      canManageOrganization: false,
      canManageBilling: false,
      canConnectSocialAccounts: false,
      canCreateTeams: false,
      canManageTeams: false,
      canDeleteTeams: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdvancedFeatures: false,
      canSchedulePosts: false,
      canBulkSchedule: false,
      canUseAIFeatures: false,
      canManageWebhooks: false,
      canViewAuditLogs: false,
      canManageApiKeys: false,
      canAccessBetaFeatures: false,
    });

    // Clear team store explicitly
    useTeamStore.getState().clearTeams();

    // Clear organization store explicitly
    useOrganizationStore.getState().clearOrganizations();

    // Clear all app storage
    localStorage.removeItem("skedlii-storage");
    localStorage.removeItem("skedlii-team-storage");
    localStorage.removeItem("skedlii-organization-storage");
    localStorage.removeItem("skedlii-theme");
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: localStorage.getItem("auth_token"),
      refreshToken: localStorage.getItem("refresh_token"),
      organization: null,
      teams: [],
      isLoading: false,
      error: null,

      // Enhanced authentication context
      userRole: null,
      userType: null,
      subscriptionInfo: {
        hasValidSubscription: false,
        subscriptionTier: null,
        subscriptionStatus: null,
      },

      // Computed permissions (initially false)
      isAdmin: false,
      canManageOrganization: false,
      canManageBilling: false,
      canConnectSocialAccounts: false,
      canCreateTeams: false,
      canManageTeams: false,
      canDeleteTeams: false,
      canInviteMembers: false,
      canRemoveMembers: false,
      canViewAnalytics: false,
      canExportData: false,
      canAccessAdvancedFeatures: false,
      canSchedulePosts: false,
      canBulkSchedule: false,
      canUseAIFeatures: false,
      canManageWebhooks: false,
      canViewAuditLogs: false,
      canManageApiKeys: false,
      canAccessBetaFeatures: false,
      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const rawResponse = await authApi.loginUser({ email, password });
          const isV2 = useV2Api("auth");
          const data = adaptLoginResponse(rawResponse, isV2);

          // Store tokens based on API version
          localStorage.setItem("auth_token", data.token);
          if (data.refreshToken) {
            localStorage.setItem("refresh_token", data.refreshToken);
          }

          // Backend is now the single source of truth for permissions
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;

          // For V1, always require backend to provide computedPermissions and subscriptionInfo
          // For V2, use defaults and fetch separately if needed
          if (!isV2 && (!data.computedPermissions || !data.subscriptionInfo)) {
            throw new Error(
              "V1 Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          set({
            token: data.token,
            refreshToken: data.refreshToken,
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo: data.subscriptionInfo,

            // Use backend-computed permissions directly (single source of truth)
            ...data.computedPermissions,
          });

          // Store teams in auth state; components will sync with team store
          set({ teams: data.teams || [] });

          return { success: true, data };
        } catch (error: any) {
          const fallbackMessage = "Something went wrong. Please try again.";
          const response = error?.response;
          const status = response?.status;
          const message =
            response?.data?.message ?? response?.data?.error ?? fallbackMessage;

          set({ error: message, isLoading: false });

          return { success: false, status, message };
        }
      },

      logout: logoutUser,

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const rawResponse = await authApi.registerUser(data);
          const isV2 = useV2Api("auth");
          const response = adaptLoginResponse(rawResponse, isV2);

          // Store tokens based on API version
          localStorage.setItem("auth_token", response.token);
          if (response.refreshToken) {
            localStorage.setItem("refresh_token", response.refreshToken);
          }

          // Backend is now the single source of truth for permissions
          const userRole = response.user?.role as UserRole;
          const userType = response.user?.userType as UserType;

          // For V1, always require backend to provide computedPermissions and subscriptionInfo
          // For V2, use defaults and fetch separately if needed
          if (
            !isV2 &&
            (!response.computedPermissions || !response.subscriptionInfo)
          ) {
            throw new Error(
              "V1 Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          set({
            token: response.token,
            refreshToken: response.refreshToken,
            user: response.user,
            organization: response.organization ?? null,
            teams: response.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo: response.subscriptionInfo,

            // Use backend-computed permissions directly (single source of truth)
            ...response.computedPermissions,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      fetchUserData: async () => {
        const token = get().token;
        if (!token) return;

        set({ isLoading: true });
        try {
          const rawData = await authApi.getCurrentUser();
          const isV2 = useV2Api("auth");
          const data = adaptGetMeResponse(rawData, isV2);

          // Backend is now the single source of truth for permissions
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;

          // For V1, always require backend to provide computedPermissions and subscriptionInfo
          // For V2, use defaults and fetch separately if needed
          if (!isV2 && (!data.computedPermissions || !data.subscriptionInfo)) {
            throw new Error(
              "V1 Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          console.log({ data });

          set({
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo: data.subscriptionInfo,

            // Use backend-computed permissions directly (single source of truth)
            ...data.computedPermissions,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      updateSubscriptionInfo: async (info: SubscriptionInfo) => {
        // Update subscription info and refresh permissions from backend
        set({ subscriptionInfo: info });

        // Trigger backend permission refresh since subscription affects permissions
        try {
          await get().refreshPermissions();
        } catch (error) {
          console.error(
            "Failed to refresh permissions after subscription update:",
            error
          );
        }
      },

      refreshPermissions: async (organizationId?: string) => {
        try {
          const response = await authApi.refreshPermissions(organizationId);

          set({
            userRole: response.userRole,
            userType: response.userType,
            subscriptionInfo: response.subscriptionInfo,
            ...response.computedPermissions,
          });
        } catch (error: any) {
          console.error("Failed to refresh permissions:", error);
          set({ error: error.message });
        }
      },
    }),
    {
      name: "skedlii-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        organization: state.organization,
        teams: state.teams,
        userRole: state.userRole,
        userType: state.userType,
        subscriptionInfo: state.subscriptionInfo,
        isAdmin: state.isAdmin,
        canManageOrganization: state.canManageOrganization,
        canManageBilling: state.canManageBilling,
        canConnectSocialAccounts: state.canConnectSocialAccounts,
        canCreateTeams: state.canCreateTeams,
        canManageTeams: state.canManageTeams,
        canDeleteTeams: state.canDeleteTeams,
        canInviteMembers: state.canInviteMembers,
        canRemoveMembers: state.canRemoveMembers,
        canViewAnalytics: state.canViewAnalytics,
        canExportData: state.canExportData,
        canAccessAdvancedFeatures: state.canAccessAdvancedFeatures,
        canSchedulePosts: state.canSchedulePosts,
        canBulkSchedule: state.canBulkSchedule,
        canUseAIFeatures: state.canUseAIFeatures,
        canManageWebhooks: state.canManageWebhooks,
        canViewAuditLogs: state.canViewAuditLogs,
        canManageApiKeys: state.canManageApiKeys,
        canAccessBetaFeatures: state.canAccessBetaFeatures,
      }),
    }
  )
);
