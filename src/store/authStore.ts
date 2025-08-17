import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { Organization, Team } from "../types";
import { useTeamStore } from "./teamStore";

interface AuthState {
  // State
  user: any;
  token: string | null;
  organization: Organization | null;
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  isAdmin: boolean;

  // Actions
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
  fetchUserData: () => Promise<void>;
  clearError: () => void;
}

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
    });
    
    // Clear team store explicitly
    useTeamStore.getState().clearTeams();
    
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
      isAdmin: false,
      // Actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await authApi.loginUser({ email, password });

          localStorage.setItem("auth_token", data.token);

          set({
            token: data.token,
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,
            isAdmin:
              data.user?.userType === "individual" ||
              data.user?.role === "super_admin" ||
              data.user?.role === "org_owner",
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
          set({
            token: response.token,
            user: response.user,
            organization: response.organization ?? null,
            teams: response.teams ?? [],
            isLoading: false,
            isAdmin:
              response.user?.userType === "individual" ||
              response.user?.role === "super_admin" ||
              response.user?.role === "org_owner",
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
          set({
            user: data.user,
            organization: data.organization ?? null,
            teams: data.teams ?? [],
            isLoading: false,
            isAdmin:
              data.user?.userType === "individual" ||
              data.user?.role === "super_admin" ||
              data.user?.role === "org_owner",
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "skedlii-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        organization: state.organization,
        teams: state.teams,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
