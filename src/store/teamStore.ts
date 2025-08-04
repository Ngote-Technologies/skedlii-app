import { create } from "zustand";
import { teamsApi } from "../api/teams";
import { persist } from "zustand/middleware";
import { Team } from "../types";

interface TeamState {
  // State
  teams: Team[];
  activeTeam: Team | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTeams: (organizationId?: string) => Promise<void>;
  setActiveTeam: (team: Team) => void;
  setTeams: (teams: Team[]) => void;
  createTeam: (name: string, organizationId?: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      // Initial state
      teams: [],
      activeTeam: null,
      isLoading: false,
      error: null,

      // Actions
      fetchTeams: async (organizationId?: string) => {
        if (!organizationId) return;

        set({ isLoading: true });
        try {
          const teams = await teamsApi.getTeams(organizationId);
          set({ teams, isLoading: false });

          // Set active team if none is selected
          if (!get().activeTeam && teams.length > 0) {
            set({ activeTeam: teams[0] });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      setActiveTeam: (team) => {
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
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
    }),
    {
      name: "skedlii-team-storage",
      partialize: (state) => ({
        teams: state.teams,
        activeTeam: state.activeTeam,
      }),
    }
  )
);
