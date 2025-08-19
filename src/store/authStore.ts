import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { Organization, Team } from "../types";
import { useTeamStore } from "./teamStore";
import { useOrganizationStore } from "./organizationStore";

export type UserRole =
  | "org_owner"
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
  organization: Organization | null;
  teams: Team[];
  isLoading: boolean;
  error: string | null;

  // Enhanced authentication context
  userRole: UserRole | null;
  userType: UserType | null;
  subscriptionInfo: SubscriptionInfo;

  // Computed permissions
  isAdmin: boolean;
  canManageOrganization: boolean;
  canManageBilling: boolean;
  canConnectSocialAccounts: boolean;
  canCreateTeams: boolean;

  // Actions
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchUserData: () => Promise<void>;
  clearError: () => void;
  updateSubscriptionInfo: (info: SubscriptionInfo) => void;
  refreshPermissions: (organizationId?: string) => Promise<void>;
}

// Helper functions for computing permissions based on user context
const computePermissions = (
  user: any,
  userRole: UserRole | null,
  userType: UserType | null,
  subscriptionInfo: SubscriptionInfo
) => {
  if (!user || !userType) {
    return {
      isAdmin: false,
      canManageOrganization: false,
      canManageBilling: false,
      canConnectSocialAccounts: false,
      canCreateTeams: false,
    };
  }

  const isIndividualUser = userType === "individual";
  const isOrganizationOwner =
    userType === "organization" && userRole === "org_owner";
  const isOrganizationAdmin =
    userType === "organization" && userRole === "admin";
  const hasValidSub = subscriptionInfo.hasValidSubscription;

  return {
    // Individual users are admins of their own accounts, org owners are admins
    isAdmin:
      isIndividualUser || isOrganizationOwner,

    // Only organization owners can manage organization settings
    canManageOrganization: isOrganizationOwner,

    // Individual users manage their own billing, org owners manage organization billing
    canManageBilling: isIndividualUser || isOrganizationOwner,

    // Individual users and org owners/admins can connect social accounts
    canConnectSocialAccounts:
      isIndividualUser || isOrganizationOwner || isOrganizationAdmin,

    // Org owners and admins can create teams (with valid subscription)
    canCreateTeams: (isOrganizationOwner || isOrganizationAdmin) && hasValidSub,
  };
};

// Helper function for subscription inheritance logic
const computeSubscriptionInfo = (
  user: any,
  organizationData?: any
): SubscriptionInfo => {
  if (!user) {
    return {
      hasValidSubscription: false,
      subscriptionTier: null,
      subscriptionStatus: null,
    };
  }

  const userType = user.userType as UserType;
  const userRole = user.role as UserRole;

  // Individual users use their own billing
  if (userType === "individual") {
    const billing = user.billing;
    return {
      hasValidSubscription:
        billing?.paymentStatus === "active" ||
        billing?.paymentStatus === "trialing",
      subscriptionTier: billing?.stripePlan || null,
      subscriptionStatus: billing?.paymentStatus || null,
    };
  }

  // Organization owners use their personal billing for all their organizations
  if (userType === "organization" && userRole === "org_owner") {
    const billing = user.billing;
    return {
      hasValidSubscription:
        billing?.paymentStatus === "active" ||
        billing?.paymentStatus === "trialing",
      subscriptionTier: billing?.stripePlan || null,
      subscriptionStatus: billing?.paymentStatus || null,
    };
  }

  // Organization members inherit subscription from organization owner
  if (userType === "organization" && userRole !== "org_owner") {
    // This would need organization owner billing data from the backend
    const orgOwnerBilling = organizationData?.ownerBilling;
    if (orgOwnerBilling) {
      return {
        hasValidSubscription:
          orgOwnerBilling.paymentStatus === "active" ||
          orgOwnerBilling.paymentStatus === "trialing",
        subscriptionTier: orgOwnerBilling.stripePlan || null,
        subscriptionStatus: orgOwnerBilling.paymentStatus || null,
        organizationOwnerBilling: orgOwnerBilling,
      };
    }
  }

  // Fallback
  return {
    hasValidSubscription: false,
    subscriptionTier: null,
    subscriptionStatus: null,
  };
};

export const logoutUser = async () => {
  try {
    await authApi.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("auth_token");
    useAuthStore.setState({
      user: null,
      token: null,
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
      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.loginUser({ email, password });

          localStorage.setItem("auth_token", data.token);

          // Use server-computed permissions if available, fallback to client-side computation
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;
          
          let subscriptionInfo: SubscriptionInfo;
          let permissions: any;

          if (data.computedPermissions && data.subscriptionInfo) {
            // Use server-computed values
            subscriptionInfo = data.subscriptionInfo;
            permissions = data.computedPermissions;
          } else {
            // Fallback to client-side computation
            subscriptionInfo = computeSubscriptionInfo(
              data.user,
              data.organization
            );
            permissions = computePermissions(
              data.user,
              userRole,
              userType,
              subscriptionInfo
            );
          }

          set({
            token: data.token,
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo,

            // Use server-computed permissions
            ...permissions,
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
          const response = await authApi.registerUser(data);
          localStorage.setItem("auth_token", response.token);

          // Use server-computed permissions if available, fallback to client-side computation
          const userRole = response.user?.role as UserRole;
          const userType = response.user?.userType as UserType;
          
          let subscriptionInfo: SubscriptionInfo;
          let permissions: any;

          if (response.computedPermissions && response.subscriptionInfo) {
            // Use server-computed values
            subscriptionInfo = response.subscriptionInfo;
            permissions = response.computedPermissions;
          } else {
            // Fallback to client-side computation
            subscriptionInfo = computeSubscriptionInfo(
              response.user,
              response.organization
            );
            permissions = computePermissions(
              response.user,
              userRole,
              userType,
              subscriptionInfo
            );
          }

          set({
            token: response.token,
            user: response.user,
            organization: response.organization ?? null,
            teams: response.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo,

            // Use server-computed permissions
            ...permissions,
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
          const data = await authApi.getCurrentUser();

          // Use server-computed permissions if available, fallback to client-side computation
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;
          
          let subscriptionInfo: SubscriptionInfo;
          let permissions: any;

          if (data.computedPermissions && data.subscriptionInfo) {
            // Use server-computed values
            subscriptionInfo = data.subscriptionInfo;
            permissions = data.computedPermissions;
          } else {
            // Fallback to client-side computation
            subscriptionInfo = computeSubscriptionInfo(
              data.user,
              data.organization
            );
            permissions = computePermissions(
              data.user,
              userRole,
              userType,
              subscriptionInfo
            );
          }

          set({
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo,

            // Use server-computed permissions
            ...permissions,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),

      updateSubscriptionInfo: (info: SubscriptionInfo) => {
        const state = get();
        const permissions = computePermissions(
          state.user,
          state.userRole,
          state.userType,
          info
        );

        set({
          subscriptionInfo: info,
          ...permissions,
        });
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
      }),
    }
  )
);
