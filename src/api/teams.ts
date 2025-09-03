import { Team } from "../types";
import axiosInstance from "./axios";

export const teamsApi = {
  createTeam: async (name: string, organizationId: string): Promise<Team> => {
    const response = await axiosInstance.post("/teams", {
      name,
      organizationId,
    });
    return response.data;
  },

  getTeams: async (organizationId: string): Promise<Team[]> => {
    try {
      const response = await axiosInstance.get(
        `/teams/organization/${organizationId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error in getTeams:", error);
      throw error;
    }
  },

  getTeam: async (teamId: string): Promise<Team> => {
    const response = await axiosInstance.get(`/teams/${teamId}`);
    return response.data;
  },

  updateTeam: async (teamId: string, updates: Partial<Team>): Promise<Team> => {
    const response = await axiosInstance.put(`/teams/${teamId}`, updates);
    return response.data;
  },

  deleteTeam: async (teamId: string): Promise<void> => {
    await axiosInstance.delete(`/teams/${teamId}`);
  },

  addTeamMember: async (teamId: string, userId: string): Promise<void> => {
    await axiosInstance.post(`/teams/${teamId}/members/${userId}`);
  },

  removeTeamMember: async (teamId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`/teams/${teamId}/members/${userId}`);
  },

  // Social Account Assignment Methods
  getTeamSocialAccounts: async (organizationId: string, teamId: string): Promise<any[]> => {
    const response = await axiosInstance.get(
      `/teams/organization/${organizationId}/${teamId}/social-accounts`
    );
    return response.data;
  },

  assignSocialAccountToTeam: async (
    organizationId: string,
    teamId: string,
    accountId: string
  ): Promise<void> => {
    await axiosInstance.post(
      `/teams/organization/${organizationId}/${teamId}/social-accounts/${accountId}`
    );
  },

  removeSocialAccountFromTeam: async (
    organizationId: string,
    teamId: string,
    accountId: string
  ): Promise<void> => {
    await axiosInstance.delete(
      `/teams/organization/${organizationId}/${teamId}/social-accounts/${accountId}`
    );
  },
};
