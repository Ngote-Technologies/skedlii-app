import { create } from "zustand";
import { teamsApi } from "../api/teams";
import { persist } from "zustand/middleware";
import { Team } from "../types";

interface TeamState {
  // State
  teams: Team[];
  activeTeam: Team | null;
  currentOrganizationId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTeams: (organizationId?: string) => Promise<void>;
  setActiveTeam: (team: Team) => void;
  setTeams: (teams: Team[]) => void;
  createTeam: (name: string, organizationId?: string) => Promise<void>;
  clearTeams: () => void;
  setCurrentOrganization: (organizationId: string | null) => void;
}

const teamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      // Initial state
      teams: [],
      activeTeam: null,
      currentOrganizationId: null,
      isLoading: false,
      error: null,

      // Actions
      fetchTeams: async (organizationId?: string) => {
        if (!organizationId) return;

        // If switching to a different organization, clear current teams first
        const currentState = get();
        if (
          currentState.currentOrganizationId &&
          currentState.currentOrganizationId !== organizationId
        ) {
          set({
            teams: [],
            activeTeam: null,
            currentOrganizationId: organizationId,
          });
        } else if (!currentState.currentOrganizationId) {
          set({ currentOrganizationId: organizationId });
        }

        set({ isLoading: true });
        try {
          const teams = await teamsApi.getTeams(organizationId);
          set({
            teams,
            isLoading: false,
            currentOrganizationId: organizationId,
          });

          // Set active team if none is selected
          if (!get().activeTeam && teams.length > 0) {
            set({ activeTeam: teams[0] });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setActiveTeam: (team) => {
        // Validate team belongs to current organization
        const currentState = get();
        if (
          currentState.currentOrganizationId &&
          team.organizationId !== currentState.currentOrganizationId
        ) {
          console.warn(
            "Attempting to set active team from different organization"
          );
          return;
        }
        set({ activeTeam: team });
      },

      setTeams: (teams) => {
        set({ teams });

        // Set active team if none is selected
        if (!get().activeTeam && teams.length > 0) {
          set({ activeTeam: teams[0] });
        }
      },

      createTeam: async (name, organizationId?: string) => {
        if (!organizationId) return;

        set({ isLoading: true });
        try {
          const newTeam = await teamsApi.createTeam(name, organizationId);
          set({
            teams: [...get().teams, newTeam],
            activeTeam: newTeam,
            isLoading: false,
            currentOrganizationId: organizationId,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      clearTeams: () => {
        set({
          teams: [],
          activeTeam: null,
          currentOrganizationId: null,
        });
      },

      setCurrentOrganization: (organizationId: string | null) => {
        const currentState = get();

        // If switching to a different organization, clear teams
        if (currentState.currentOrganizationId !== organizationId) {
          set({
            teams: [],
            activeTeam: null,
            currentOrganizationId: organizationId,
          });
        }
      },
    }),
    {
      name: "skedlii-team-storage",
      partialize: (state) => ({
        teams: state.teams,
        activeTeam: state.activeTeam,
        currentOrganizationId: state.currentOrganizationId,
      }),
    }
  )
);

// Listen for organization change events and clear teams accordingly
if (typeof window !== 'undefined') {
  window.addEventListener('organizationChanged', (event: any) => {
    const { organization } = event.detail;
    teamStore.getState().setCurrentOrganization(organization?._id || null);
  });

  window.addEventListener('organizationSwitched', (event: any) => {
    const { organizationId } = event.detail;
    teamStore.getState().setCurrentOrganization(organizationId);
  });
}

export const useTeamStore = teamStore;
