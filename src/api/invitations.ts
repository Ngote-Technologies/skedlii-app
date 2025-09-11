import axiosInstance from "./axios";

// Backend-aligned DTOs (skedlii-api-v2 Invitations module)
export type OrgRole = "owner" | "admin" | "editor" | "viewer";

export interface SendInvitationRequest {
  email: string;
  orgId: string;
  role: OrgRole;
  expiresInMinutes?: number; // optional; backend default exists
}

export interface SendInvitationResponse {
  invitationId: string;
  token?: string; // non-prod convenience
}

export interface VerifyInvitationResponse {
  email: string;
  orgId: string;
  role: OrgRole;
  expiresAt?: string;
}

export interface ResendInvitationResponse {
  invitationId: string;
  token?: string;
}

export interface InvitationListItem {
  _id: string;
  orgId: string;
  email: string;
  role: OrgRole;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  invitedBy?: string;
  createdAt?: string;
  expiresAt?: string;
}

export const invitationsApi = {
  // POST /invitations { email, orgId, role, expiresInMinutes? }
  sendInvitation: async (
    data: SendInvitationRequest
  ): Promise<SendInvitationResponse> => {
    const response = await axiosInstance.post<SendInvitationResponse>(
      "/invitations",
      data
    );
    return response.data;
  },

  // GET /invitations/:token/verify → { email, orgId, role, expiresAt }
  verifyInvitation: async (
    token: string
  ): Promise<VerifyInvitationResponse> => {
    const response = await axiosInstance.get<VerifyInvitationResponse>(
      `/invitations/${token}/verify`
    );
    return response.data;
  },

  // POST /invitations/:token/accept (JWT required) → 204
  acceptInvitation: async (token: string): Promise<void> => {
    await axiosInstance.post<void>(`/invitations/${token}/accept`, {});
  },

  // POST /invitations/resend { invitationId }
  resendInvitation: async (
    invitationId: string
  ): Promise<ResendInvitationResponse> => {
    const response = await axiosInstance.post<ResendInvitationResponse>(
      "/invitations/resend",
      { invitationId }
    );
    return response.data;
  },

  // GET /invitations?orgId=...&status=pending
  listInvitations: async (
    orgId: string,
    status: 'pending' | 'accepted' | 'expired' | 'revoked' = 'pending'
  ): Promise<InvitationListItem[]> => {
    const response = await axiosInstance.get<{ items: InvitationListItem[] }>(
      `/invitations`,
      { params: { orgId, status } }
    );
    return response.data.items;
  },

  // DELETE /invitations/:id
  revokeInvitation: async (invitationId: string): Promise<void> => {
    await axiosInstance.delete(`/invitations/${invitationId}`);
  },
};
