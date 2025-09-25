import axiosInstance from "./axios";
import { User } from "../types";

export type UpdateUserPayload = {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
};

interface InviteUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  role: User["role"];
  organizationId: string;
}

export const usersApi = {
  getUsers: async (organizationId: string): Promise<any> => {
    const response = await axiosInstance.get(
      `/organizations/${organizationId}`
    );
    return response.data;
  },

  inviteUser: async (data: InviteUserRequest): Promise<void> => {
    await axiosInstance.post("/invitations", data);
  },

  updateUser: async (updates: UpdateUserPayload): Promise<User> => {
    const payload = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    ) as UpdateUserPayload;
    const response = await axiosInstance.patch(`/users/me`, payload);
    return (response.data as { user: User }).user;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}`);
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data;
  },
};
