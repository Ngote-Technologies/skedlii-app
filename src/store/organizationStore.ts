import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  organizationsApi,
  OrganizationWithRole,
  CreateOrganizationData,
  UpdateOrganizationData,
} from "../api/organizations";

export type OrganizationRole = "owner" | "admin" | "member" | "viewer";

interface OrganizationState {
  // State
  organizations: OrganizationWithRole[];
  activeOrganization: OrganizationWithRole | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchUserOrganizations: () => Promise<void>;
  setActiveOrganization: (organization: OrganizationWithRole) => void;
  switchOrganization: (organizationId: string) => Promise<void>;
  createOrganization: (data: CreateOrganizationData) => Promise<void>;
  updateOrganization: (
    organizationId: string,
    data: UpdateOrganizationData
  ) => Promise<void>;
  deleteOrganization: (organizationId: string) => Promise<void>;
  addMember: (
    organizationId: string,
    email: string,
    role: OrganizationRole
  ) => Promise<void>;
  removeMember: (organizationId: string, userId: string) => Promise<void>;
  clearOrganizations: () => void;
  setError: (error: string | null) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      // Initial state
      organizations: [],
      activeOrganization: null,
      isLoading: false,
      error: null,

      // Actions
      fetchUserOrganizations: async () => {
        set({ isLoading: true, error: null });
        try {
          const organizations = await organizationsApi.getUserOrganizations();
          set({ organizations, isLoading: false });

          // Set active organization if none is selected and organizations exist
          const current = get();
          if (!current.activeOrganization && organizations.length > 0) {
            // Try to find owner organization first, otherwise use the first one
            const ownerOrg = organizations.find(
              (org) => org.userRole === "owner"
            );
            current.setActiveOrganization(ownerOrg || organizations[0]);
          }

          // If active organization is not in the list anymore, clear it
          if (
            current.activeOrganization &&
            !organizations.find(
              (org) => org._id === current.activeOrganization?._id
            )
          ) {
            if (organizations.length > 0) {
              current.setActiveOrganization(organizations[0]);
            } else {
              set({ activeOrganization: null });
            }
          }
        } catch (error: any) {
          console.error("Failed to fetch user organizations:", error);
          set({
            error: error.message || "Failed to fetch organizations",
            isLoading: false,
          });
        }
      },

      setActiveOrganization: (organization) => {
        set({ activeOrganization: organization });

        // Emit organization change event for other components to listen
        window.dispatchEvent(
          new CustomEvent("organizationChanged", {
            detail: { organization },
          })
        );
      },

      switchOrganization: async (organizationId: string) => {
        const current = get();
        const organization = current.organizations.find(
          (org) => org._id === organizationId
        );

        if (organization) {
          current.setActiveOrganization(organization);

          // Trigger refetch of organization-specific data
          window.dispatchEvent(
            new CustomEvent("organizationSwitched", {
              detail: { organizationId, organization },
            })
          );
        } else {
          console.warn(
            `Organization with ID ${organizationId} not found in user's organizations`
          );
        }
      },

      createOrganization: async (data: CreateOrganizationData) => {
        set({ isLoading: true, error: null });
        try {
          const newOrganization = await organizationsApi.createOrganization(
            data
          );

          // Add to organizations list with owner role
          const orgWithRole: OrganizationWithRole = {
            ...newOrganization,
            userRole: "owner",
            joinedAt: new Date().toISOString(),
            memberCount: 1,
          };

          set((state) => ({
            organizations: [...state.organizations, orgWithRole],
            activeOrganization: orgWithRole,
            isLoading: false,
          }));

          // Trigger organization change event
          window.dispatchEvent(
            new CustomEvent("organizationCreated", {
              detail: { organization: orgWithRole },
            })
          );
        } catch (error: any) {
          console.error("Failed to create organization:", error);
          set({
            error: error.message || "Failed to create organization",
            isLoading: false,
          });
          throw error;
        }
      },

      updateOrganization: async (
        organizationId: string,
        data: UpdateOrganizationData
      ) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrganization = await organizationsApi.updateOrganization(
            organizationId,
            data
          );

          set((state) => {
            const updatedOrganizations = state.organizations.map((org) =>
              org._id === organizationId
                ? { ...org, ...updatedOrganization }
                : org
            );

            const updatedActiveOrg =
              state.activeOrganization?._id === organizationId
                ? { ...state.activeOrganization, ...updatedOrganization }
                : state.activeOrganization;

            return {
              organizations: updatedOrganizations,
              activeOrganization: updatedActiveOrg,
              isLoading: false,
            };
          });
        } catch (error: any) {
          console.error("Failed to update organization:", error);
          set({
            error: error.message || "Failed to update organization",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteOrganization: async (organizationId: string) => {
        set({ isLoading: true, error: null });
        try {
          await organizationsApi.deleteOrganization(organizationId);

          set((state) => {
            const filteredOrganizations = state.organizations.filter(
              (org) => org._id !== organizationId
            );
            const newActiveOrganization =
              state.activeOrganization?._id === organizationId
                ? filteredOrganizations.length > 0
                  ? filteredOrganizations[0]
                  : null
                : state.activeOrganization;

            return {
              organizations: filteredOrganizations,
              activeOrganization: newActiveOrganization,
              isLoading: false,
            };
          });

          // Trigger organization change event if active organization was deleted
          const current = get();
          if (current.activeOrganization) {
            window.dispatchEvent(
              new CustomEvent("organizationDeleted", {
                detail: {
                  organizationId,
                  newActiveOrganization: current.activeOrganization,
                },
              })
            );
          }
        } catch (error: any) {
          console.error("Failed to delete organization:", error);
          set({
            error: error.message || "Failed to delete organization",
            isLoading: false,
          });
          throw error;
        }
      },

      addMember: async (
        organizationId: string,
        email: string,
        role: OrganizationRole
      ) => {
        set({ isLoading: true, error: null });
        try {
          await organizationsApi.addMember(organizationId, { email, role });

          // Refresh organization data
          await get().fetchUserOrganizations();

          set({ isLoading: false });
        } catch (error: any) {
          console.error("Failed to add member:", error);
          set({
            error: error.message || "Failed to add member",
            isLoading: false,
          });
          throw error;
        }
      },

      removeMember: async (organizationId: string, userId: string) => {
        set({ isLoading: true, error: null });
        try {
          await organizationsApi.removeMember(organizationId, userId);

          // Refresh organization data
          await get().fetchUserOrganizations();

          set({ isLoading: false });
        } catch (error: any) {
          console.error("Failed to remove member:", error);
          set({
            error: error.message || "Failed to remove member",
            isLoading: false,
          });
          throw error;
        }
      },

      clearOrganizations: () => {
        set({
          organizations: [],
          activeOrganization: null,
          isLoading: false,
          error: null,
        });
      },

      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: "skedlii-organization-storage",
      partialize: (state) => ({
        organizations: state.organizations,
        activeOrganization: state.activeOrganization,
      }),
    }
  )
);

// Helper hook for accessing organization context
export const useActiveOrganization = () => {
  const { activeOrganization } = useOrganizationStore();
  return activeOrganization;
};

// Helper hook for checking user role in active organization
export const useOrganizationRole = () => {
  const { activeOrganization } = useOrganizationStore();
  return activeOrganization?.userRole || null;
};

// Helper hook for checking if user has specific permissions
export const useOrganizationPermissions = () => {
  const role = useOrganizationRole();

  return {
    canManageOrganization: role === "owner",
    canManageMembers: role === "owner" || role === "admin",
    canCreateTeams: role === "owner" || role === "admin",
    canManageContent: role === "owner" || role === "admin" || role === "member",
    canViewOrganization: role !== null,
  };
};
