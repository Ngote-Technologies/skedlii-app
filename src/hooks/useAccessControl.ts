import { useMemo } from "react";
import { useAuth } from "../store/hooks";
import { useOrganizationRole } from "../store/organizationStore";
import {
  Permission,
  FEATURES,
  ACCESS_CONTROL_MESSAGES,
} from "../lib/access-control";
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
    isAdmin,
  } = useAuth();
  
  const organizationRole = useOrganizationRole();

  // Simple user context (no computation - just data)
  const userContext = useMemo(() => ({
    userType: userType as UserType | null,
    userRole: userRole as UserRole | null,
    hasValidSubscription: subscriptionInfo.hasValidSubscription,
    subscriptionTier: subscriptionInfo.subscriptionTier,
    organizationRole,
  }), [userType, userRole, subscriptionInfo, organizationRole]);

  // DEPRECATED: These functions now exist for legacy compatibility only
  // All real permission checking comes from backend computedPermissions
  const deprecatedPermissionCheckers = useMemo(() => ({
    hasPermission: (_permission?: any) => {
      console.warn("hasPermission() is deprecated - use specific permission props from auth store instead");
      return false;
    },
    hasAnyPermission: (_permissions?: any[]) => {
      console.warn("hasAnyPermission() is deprecated - use specific permission props from auth store instead");
      return false;
    },
    hasAllPermissions: (_permissions?: any[]) => {
      console.warn("hasAllPermissions() is deprecated - use specific permission props from auth store instead");
      return false;
    },
    canManageRole: (_targetRole?: any) => {
      console.warn("canManageRole() is deprecated - implement role hierarchy checks in backend");
      return false;
    },
    hasSubscriptionAccess: (tier?: string) => {
      if (!tier) return subscriptionInfo.hasValidSubscription;
      // Basic tier checking (enhanced logic should be in backend)
      const tierHierarchy = { free: 1, creator: 2, pro: 3, enterprise: 4 };
      const userTier = subscriptionInfo.subscriptionTier?.toLowerCase() || "free";
      const requiredTierLevel = tierHierarchy[tier.toLowerCase() as keyof typeof tierHierarchy] || 1;
      const userTierLevel = tierHierarchy[userTier as keyof typeof tierHierarchy] || 1;
      return userTierLevel >= requiredTierLevel;
    },
    canAccessFeature: () => {
      console.warn("canAccessFeature() is deprecated - feature access should be controlled by backend permissions");
      return subscriptionInfo.hasValidSubscription;
    },
    canAccessNavigation: () => {
      console.warn("canAccessNavigation() is deprecated - navigation access should be controlled by backend permissions");
      return true;
    },
  }), [subscriptionInfo]);

  return {
    // Backend-computed permissions (SINGLE SOURCE OF TRUTH)
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,
    isAdmin,
    
    // Subscription info from backend
    hasValidSubscription: subscriptionInfo.hasValidSubscription,
    subscriptionTier: subscriptionInfo.subscriptionTier,
    
    // User context (for display purposes)
    userContext,
    
    // DEPRECATED: Legacy permission functions (emit warnings)
    ...deprecatedPermissionCheckers,
    
    // Constants for easy access
    Permission,
    FEATURES,
    ACCESS_CONTROL_MESSAGES,
  };
}

/**
 * @deprecated Use specific backend permissions from useAccessControl() instead
 * Hook for checking specific feature access
 */
export function useFeatureAccess(featureKey: keyof typeof FEATURES) {
  console.warn("useFeatureAccess() is deprecated - use specific permission props from useAccessControl() instead");
  const { hasValidSubscription, userContext } = useAccessControl();
  const feature = FEATURES[featureKey];
  
  return useMemo(() => ({
    hasAccess: hasValidSubscription, // Simplified fallback
    feature,
    userContext,
  }), [hasValidSubscription, feature, userContext]);
}

/**
 * @deprecated Use specific backend permissions from useAccessControl() instead
 * Hook for permission-based component rendering
 */
export function usePermissionGuard(
  permission: Permission | Permission[],
  options: {
    requireAll?: boolean;
    subscriptionTier?: string;
    fallbackMessage?: string;
  } = {}
) {
  console.warn("usePermissionGuard() is deprecated - use specific permission props from useAccessControl() instead");
  const { hasValidSubscription, hasSubscriptionAccess } = useAccessControl();
  
  return useMemo(() => {
    // Check subscription requirement first
    if (options.subscriptionTier && !hasSubscriptionAccess(options.subscriptionTier)) {
      return {
        hasAccess: false,
        reason: "subscription_required",
        message: options.fallbackMessage || ACCESS_CONTROL_MESSAGES.SUBSCRIPTION_UPGRADE_REQUIRED,
      };
    }

    // Simplified fallback - backend should handle specific permissions
    const hasAccess = hasValidSubscription;

    return {
      hasAccess,
      reason: hasAccess ? null : "insufficient_permissions",
      message: hasAccess ? null : (options.fallbackMessage || ACCESS_CONTROL_MESSAGES.INSUFFICIENT_PERMISSIONS),
    };
  }, [permission, options, hasValidSubscription, hasSubscriptionAccess]);
}

/**
 * @deprecated Use specific backend permissions for navigation control instead
 * Hook for navigation access control
 */
export function useNavigationAccess(navigationItems: any[]) {
  console.warn("useNavigationAccess() is deprecated - use specific permission props for navigation control instead");
  
  return useMemo(() => {
    // Return all items - let backend permissions control visibility in components
    return navigationItems;
  }, [navigationItems]);
}

/**
 * Hook for role hierarchy checking
 */
export function useRoleManagement() {
  const { canManageRole, userContext } = useAccessControl();
  
  return useMemo(() => ({
    canManageRole,
    isOrganizationOwner: userContext.userRole === "org_owner",
    isOrganizationAdmin: userContext.userRole === "admin",
    isOrganizationMember: userContext.userRole === "member",
    isIndividualUser: userContext.userType === "individual",
    userRole: userContext.userRole,
    userType: userContext.userType,
  }), [canManageRole, userContext]);
}

/**
 * Hook for subscription-based feature gating
 */
export function useSubscriptionGate(requiredTier?: string) {
  const { hasSubscriptionAccess, hasValidSubscription, subscriptionTier } = useAccessControl();
  
  return useMemo(() => {
    const hasAccess = requiredTier ? hasSubscriptionAccess(requiredTier) : hasValidSubscription;
    
    return {
      hasAccess,
      currentTier: subscriptionTier,
      requiredTier,
      needsUpgrade: !hasAccess && hasValidSubscription,
      needsSubscription: !hasValidSubscription,
    };
  }, [hasSubscriptionAccess, hasValidSubscription, subscriptionTier, requiredTier]);
}

/**
 * Utility hook for conditional rendering based on user type
 */
export function useUserTypeGuard(allowedTypes: UserType[]) {
  const { userContext } = useAccessControl();
  
  return useMemo(() => ({
    hasAccess: userContext.userType ? allowedTypes.includes(userContext.userType) : false,
    userType: userContext.userType,
  }), [allowedTypes, userContext.userType]);
}

/**
 * Utility hook for conditional rendering based on user role
 */
export function useRoleGuard(allowedRoles: UserRole[]) {
  const { userContext } = useAccessControl();
  
  return useMemo(() => ({
    hasAccess: userContext.userRole ? allowedRoles.includes(userContext.userRole) : false,
    userRole: userContext.userRole,
  }), [allowedRoles, userContext.userRole]);
}