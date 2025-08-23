import { useAuthStore } from "./authStore";
import { useTeamStore } from "./teamStore";

// Convenience hook that combines auth and team data
export const useAuth = () => {
  const {
    user,
    token,
    // organization, // COMMENTED: Use organization store instead
    // teams, // COMMENTED: Use organization-scoped queries instead
    isLoading: authLoading,
    error: authError,
    login,
    logout,
    register,
    fetchUserData,
    clearError: clearAuthError,
    updateSubscriptionInfo,

    // Enhanced authentication context
    userRole,
    userType,
    subscriptionInfo,

    // Computed permissions
    isAdmin,
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,
  } = useAuthStore();

  const {
    // teams,
    activeTeam,
    isLoading: teamsLoading,
    error: teamsError,
    // fetchTeams,
    setActiveTeam,
    createTeam,
  } = useTeamStore();

  // Derived state
  const isAuthenticated = !!token;
  const isOrganizationUser = user?.userType === "organization";
  const isIndividualUser = user?.userType === "individual";

  return {
    // Auth state
    user,
    // organization, // COMMENTED: Use organization store instead
    isAuthenticated,
    isOrganizationUser,
    isIndividualUser,
    authLoading,
    authError,

    // Enhanced authentication context
    userRole,
    userType,
    subscriptionInfo,

    // Team state
    // teams, // COMMENTED: Use organization-scoped queries instead
    activeTeam,
    teamsLoading,
    teamsError,

    // Auth actions
    login,
    logout,
    register,
    fetchUserData,
    clearAuthError,
    updateSubscriptionInfo,

    // Computed permissions
    isAdmin,
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,

    // Team actions
    // fetchTeams,
    setActiveTeam,
    createTeam,
  };
};
