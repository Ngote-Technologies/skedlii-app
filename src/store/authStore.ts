import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
// import { Organization, Team } from "../types"; // COMMENTED: Not used after commenting out fields
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
  // organization: Organization | null; // COMMENTED: Use organization store instead
  // teams: Team[]; // COMMENTED: Use organization-scoped queries instead  
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
  updateSubscriptionInfo: (info: SubscriptionInfo) => Promise<void>;
  refreshPermissions: (organizationId?: string) => Promise<void>;
}

// DEPRECATED: Client-side permission computation removed
// All permissions now come from backend computedPermissions

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
      // organization: null, // COMMENTED: Use organization store instead
      // teams: [], // COMMENTED: Use organization-scoped queries instead
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
      // organization: null, // COMMENTED: Use organization store instead
      // teams: [], // COMMENTED: Use organization-scoped queries instead
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

          // Backend is now the single source of truth for permissions
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;

          // Always require backend to provide computedPermissions and subscriptionInfo
          if (!data.computedPermissions || !data.subscriptionInfo) {
            throw new Error(
              "Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          set({
            token: data.token,
            user: data.user,
            // organization: data.organization ?? null, // COMMENTED: Use organization store instead
            // teams: data.teams ?? [], // COMMENTED: Use organization-scoped queries instead
            isLoading: false,

            // Enhanced authentication context
            userRole,
            userType,
            subscriptionInfo: data.subscriptionInfo,

            // Use backend-computed permissions directly (single source of truth)
            ...data.computedPermissions,
          });

          // Store teams in auth state; components will sync with team store
          // set({ teams: data.teams || [] }); // COMMENTED: Use organization-scoped queries instead

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

          // Backend is now the single source of truth for permissions
          const userRole = response.user?.role as UserRole;
          const userType = response.user?.userType as UserType;

          // Always require backend to provide computedPermissions and subscriptionInfo
          if (!response.computedPermissions || !response.subscriptionInfo) {
            throw new Error(
              "Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          set({
            token: response.token,
            user: response.user,
            // organization: response.organization ?? null, // COMMENTED: Use organization store instead
            // teams: response.teams ?? [], // COMMENTED: Use organization-scoped queries instead
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
          const data = await authApi.getCurrentUser();

          // Backend is now the single source of truth for permissions
          const userRole = data.user?.role as UserRole;
          const userType = data.user?.userType as UserType;

          // Always require backend to provide computedPermissions and subscriptionInfo
          if (!data.computedPermissions || !data.subscriptionInfo) {
            throw new Error(
              "Backend must provide computedPermissions and subscriptionInfo"
            );
          }

          console.log({ data });

          set({
            user: data.user,
            // organization: data.organization ?? null, // COMMENTED: Use organization store instead
            // teams: data.teams ?? [], // COMMENTED: Use organization-scoped queries instead
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
        user: state.user,
        // organization: state.organization, // COMMENTED: Use organization store instead
        // teams: state.teams, // COMMENTED: Use organization-scoped queries instead
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
