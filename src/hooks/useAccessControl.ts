import { useMemo } from "react";
import { useAuth } from "../store/hooks";
// import { useOrganizationRole } from "../store/organizationStore";
import { UserRole, UserType } from "../store/authStore";

/**
 * Hook for accessing backend-computed permissions (single source of truth)
 */
export function useAccessControl() {
  const {
    userType,
    userRole,
    subscriptionInfo,
    // Backend-computed permissions (single source of truth)
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
    canViewJobs,
    canManageJobs,
    isAdmin,
  } = useAuth();

  // const organizationRole = useOrganizationRole();

  // Simple user context (no computation - just data)
  const userContext = useMemo(
    () => ({
      userType: userType as UserType | null,
      userRole: userRole as UserRole | null,
      hasValidSubscription: subscriptionInfo.hasValidSubscription,
      subscriptionTier: subscriptionInfo.subscriptionTier,
      // organizationRole,
    }),
    [userType, userRole, subscriptionInfo]
  );

  return {
    // Backend-computed permissions (SINGLE SOURCE OF TRUTH)
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
    canViewJobs,
    canManageJobs,
    isAdmin,

    // Subscription info from backend
    hasValidSubscription: subscriptionInfo.hasValidSubscription,
    subscriptionTier: subscriptionInfo.subscriptionTier,
    subscriptionInfo, // Full subscription object for advanced use cases

    // User context (for display purposes)
    userContext,
  };
}

/**
 * Hook for role hierarchy checking
 */
export function useRoleManagement() {
  const { userContext } = useAccessControl();

  return useMemo(
    () => ({
      isOrganizationOwner: userContext.userRole === "org_owner",
      isOrganizationAdmin: userContext.userRole === "admin",
      isOrganizationMember: userContext.userRole === "member",
      isIndividualUser: userContext.userType === "individual",
      userRole: userContext.userRole,
      userType: userContext.userType,
    }),
    [userContext]
  );
}

/**
 * Hook for subscription-based feature gating
 */
export function useSubscriptionGate(requiredTier?: string) {
  const { hasValidSubscription, subscriptionTier } = useAccessControl();

  return useMemo(() => {
    // Basic tier checking (enhanced logic should be in backend)
    let hasAccess = hasValidSubscription;

    if (requiredTier && hasValidSubscription) {
      const tierHierarchy = { free: 1, creator: 2, team: 3, enterprise: 4 };
      const userTier = subscriptionTier?.toLowerCase() || "free";
      const requiredTierLevel =
        tierHierarchy[
          requiredTier.toLowerCase() as keyof typeof tierHierarchy
        ] || 1;
      const userTierLevel =
        tierHierarchy[userTier as keyof typeof tierHierarchy] || 1;
      hasAccess = userTierLevel >= requiredTierLevel;
    }

    return {
      hasAccess,
      currentTier: subscriptionTier,
      requiredTier,
      needsUpgrade: !hasAccess && hasValidSubscription,
      needsSubscription: !hasValidSubscription,
    };
  }, [hasValidSubscription, subscriptionTier, requiredTier]);
}

/**
 * Utility hook for conditional rendering based on user type
 */
export function useUserTypeGuard(allowedTypes: UserType[]) {
  const { userContext } = useAccessControl();

  return useMemo(
    () => ({
      hasAccess: userContext.userType
        ? allowedTypes.includes(userContext.userType)
        : false,
      userType: userContext.userType,
    }),
    [allowedTypes, userContext.userType]
  );
}

/**
 * Utility hook for conditional rendering based on user role
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { userContext } = useAccessControl();

  return useMemo(
    () => ({
      hasAccess: userContext.userRole
        ? allowedRoles.includes(userContext.userRole)
        : false,
      userRole: userContext.userRole,
    }),
    [allowedRoles, userContext.userRole]
  );
}
