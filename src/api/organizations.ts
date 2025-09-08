import { apiRequest } from "../lib/queryClient";
export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  country?: string;
  timezone?: string;
  ownerId: string;
  subscriptionStatus?: string;
  isActive: boolean;
  settings?: {
    allowMemberInvitations?: boolean;
    requireEmailVerification?: boolean;
    defaultUserRole?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface OrganizationWithRole extends Organization {
  userRole: OrganizationRole;
  joinedAt: string;
  memberCount: number;
}

export interface CreateOrganizationData {
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  country?: string;
  timezone?: string;
}

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  logo?: string;
  website?: string;
  industry?: string;
  size?: "1-10" | "11-50" | "51-200" | "201-500" | "500+";
  country?: string;
  timezone?: string;
  settings?: {
    allowMemberInvitations?: boolean;
    requireEmailVerification?: boolean;
    defaultUserRole?: string;
    brandColors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

export interface AddMemberData {
  email: string;
  role: OrganizationRole;
}

export interface OrganizationMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  joinedAt?: string;
}

export interface OrganizationWithDetails extends Organization {
  owner?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  members?: OrganizationMember[];
  teams?: Array<{
    _id: string;
    name: string;
    description?: string;
    memberCount?: number;
  }>;
  socialAccounts?: Array<{
    _id: string;
    platform: string;
    accountName?: string;
    isActive: boolean;
  }>;
}

export const organizationsApi = {
  /**
   * Get all organizations for the current user
   */
  getUserOrganizations: async (): Promise<OrganizationWithRole[]> => {
    return await apiRequest("GET", "/organizations/user/organizations");
  },

  /**
   * Create a new organization
   */
  createOrganization: async (
    data: CreateOrganizationData
  ): Promise<Organization> => {
    return await apiRequest("POST", "/organizations", data);
  },

  /**
   * Get organization by ID with details
   */
  getOrganization: async (
    organizationId: string
  ): Promise<OrganizationWithDetails> => {
    return await apiRequest("GET", `/organizations/${organizationId}`);
  },

  /**
   * Update organization
   */
  updateOrganization: async (
    organizationId: string,
    data: UpdateOrganizationData
  ): Promise<Organization> => {
    return await apiRequest("PATCH", `/organizations/${organizationId}`, data);
  },

  /**
   * Delete organization
   */
  deleteOrganization: async (
    organizationId: string
  ): Promise<{ message: string }> => {
    return await apiRequest("DELETE", `/organizations/${organizationId}`);
  },

  /**
   * Add member to organization
   */
  addMember: async (
    organizationId: string,
    memberData: AddMemberData
  ): Promise<{ message: string }> => {
    return await apiRequest(
      "POST",
      `/organizations/${organizationId}/members`,
      memberData
    );
  },

  /**
   * Remove member from organization
   */
  removeMember: async (
    organizationId: string,
    userId: string
  ): Promise<{ message: string }> => {
    return await apiRequest(
      "DELETE",
      `/organizations/${organizationId}/members/${userId}`
    );
  },

  /**
   * Get organization statistics
   */
  getOrganizationStats: async (
    organizationId: string
  ): Promise<{
    memberCount: number;
    teamCount: number;
    socialAccountCount: number;
    scheduledPostCount: number;
    publishedPostCount: number;
    storageUsed?: number;
    apiCallsThisMonth?: number;
  }> => {
    // This endpoint may need to be implemented in the backend
    return await apiRequest("GET", `/organizations/${organizationId}/stats`);
  },
};

export default organizationsApi;
