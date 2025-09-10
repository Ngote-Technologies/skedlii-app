import { useAuthStore } from "./authStore";
import { useTeamStore } from "./teamStore";

// Convenience hook that combines auth and team data
export const useAuth = () => {
  const {
    user,
    token,
    organization,
    teams,
    isLoading: authLoading,
    error: authError,
    login,
    logout,
    register,
    fetchUserData,
    clearError: clearAuthError,
    updateSubscriptionInfo,
    refreshPermissions,
    setActiveOrganization,

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
    canManageTeams,
    canDeleteTeams,
    canInviteMembers,
    canRemoveMembers,
    canViewAnalytics,
    canExportData,
    canAccessAdvancedFeatures,
    canSchedulePosts,
    canBulkSchedule,
    canUseAIFeatures,
    canManageWebhooks,
    canViewAuditLogs,
    canManageApiKeys,
    canAccessBetaFeatures,
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
    organization,
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
    teams,
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
    refreshPermissions,
    setActiveOrganization,

    // Computed permissions
    isAdmin,
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,
    canManageTeams,
    canDeleteTeams,
    canInviteMembers,
    canRemoveMembers,
    canViewAnalytics,
    canExportData,
    canAccessAdvancedFeatures,
    canSchedulePosts,
    canBulkSchedule,
    canUseAIFeatures,
    canManageWebhooks,
    canViewAuditLogs,
    canManageApiKeys,
    canAccessBetaFeatures,

    // Team actions
    // fetchTeams,
    setActiveTeam,
    createTeam,
  };
};
