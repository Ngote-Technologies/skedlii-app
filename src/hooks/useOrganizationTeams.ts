import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { useActiveOrganization } from "../store/organizationStore";

/**
 * Custom hook for fetching teams scoped to the active organization
 * This replaces the need to get teams from auth store
 */
export const useOrganizationTeams = () => {
  const activeOrganization = useActiveOrganization();

  return useQuery({
    queryKey: ["/teams", "organization", activeOrganization?._id],
    queryFn: () =>
      activeOrganization
        ? apiRequest("GET", `/teams/organization/${activeOrganization._id}`)
        : Promise.resolve([]),
    enabled: !!activeOrganization,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook for getting team count for dashboard stats
 */
export const useOrganizationTeamCount = () => {
  const { data: teams = [] } = useOrganizationTeams();
  return teams.length;
};