import { apiRequest } from "../lib/queryClient";
import { Team, User } from "../types";

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

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  userType: "individual" | "organization";
  organizationName?: string;
}

export const authApi = {
  loginUser: async (credentials: any) => {
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

  refreshPermissions: async (organizationId?: string): Promise<{
    organizationId: string | null;
    computedPermissions: any;
    subscriptionInfo: any;
    userRole: string;
    userType: string;
  }> => {
    const response = await apiRequest("POST", "/auth/refresh-permissions", { organizationId });
    return response;
  },

  logout: async (): Promise<void> => {
    // Just clear the token on the client side
    // No need for API call since we're using JWT
    localStorage.removeItem("auth_token");
    localStorage.removeItem("skedlii-storage");
    localStorage.removeItem("skedlii-team-storage");
    localStorage.removeItem("skedlii-theme");
  },
};
