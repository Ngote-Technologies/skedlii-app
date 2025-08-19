import { useMemo } from "react";
import { useAuth } from "../store/hooks";
import { useOrganizationRole } from "../store/organizationStore";
import {
  createAccessControl,
  Permission,
  FEATURES,
  ACCESS_CONTROL_MESSAGES,
  NavigationItem,
} from "../lib/access-control";
import { UserRole, UserType } from "../store/authStore";

/**
 * Hook for accessing permission and subscription-based access control
 */
export function useAccessControl() {
  const { 
    userType, 
    userRole, 
    subscriptionInfo,
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,
  } = useAuth();
  
  const organizationRole = useOrganizationRole();

  // Create user context for access control
  const userContext = useMemo(() => ({
    userType: userType as UserType | null,
    userRole: userRole as UserRole | null,
    hasValidSubscription: subscriptionInfo.hasValidSubscription,
    subscriptionTier: subscriptionInfo.subscriptionTier,
    organizationRole,
  }), [userType, userRole, subscriptionInfo, organizationRole]);

  // Create access control utilities
  const accessControl = useMemo(() => 
    createAccessControl(userContext), 
    [userContext]
  );

  return {
    // Core permission checking
    hasPermission: accessControl.hasPermission,
    hasAnyPermission: accessControl.hasAnyPermission,
    hasAllPermissions: accessControl.hasAllPermissions,
    canManageRole: accessControl.canManageRole,
    
    // Subscription checking
    hasSubscriptionAccess: accessControl.hasSubscriptionAccess,
    hasValidSubscription: subscriptionInfo.hasValidSubscription,
    subscriptionTier: subscriptionInfo.subscriptionTier,
    
    // Feature access
    canAccessFeature: accessControl.canAccessFeature,
    canAccessNavigation: accessControl.canAccessNavigation,
    
    // Pre-computed common permissions (from auth store)
    canManageOrganization,
    canManageBilling,
    canConnectSocialAccounts,
    canCreateTeams,
    
    // User context
    userContext,
    
    // Constants for easy access
    Permission,
    FEATURES,
    ACCESS_CONTROL_MESSAGES,
  };
}

/**
 * Hook for checking specific feature access
 */
export function useFeatureAccess(featureKey: keyof typeof FEATURES) {
  const { canAccessFeature, userContext } = useAccessControl();
  const feature = FEATURES[featureKey];
  
  return useMemo(() => ({
    hasAccess: canAccessFeature(feature),
    feature,
    userContext,
  }), [canAccessFeature, feature, userContext]);
}

/**
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
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasSubscriptionAccess } = useAccessControl();
  
  return useMemo(() => {
    // Check subscription requirement first
    if (options.subscriptionTier && !hasSubscriptionAccess(options.subscriptionTier)) {
      return {
        hasAccess: false,
        reason: "subscription_required",
        message: options.fallbackMessage || ACCESS_CONTROL_MESSAGES.SUBSCRIPTION_UPGRADE_REQUIRED,
      };
    }

    let hasAccess = false;
    
    if (Array.isArray(permission)) {
      hasAccess = options.requireAll 
        ? hasAllPermissions(permission)
        : hasAnyPermission(permission);
    } else {
      hasAccess = hasPermission(permission);
    }

    return {
      hasAccess,
      reason: hasAccess ? null : "insufficient_permissions",
      message: hasAccess ? null : (options.fallbackMessage || ACCESS_CONTROL_MESSAGES.INSUFFICIENT_PERMISSIONS),
    };
  }, [permission, options, hasPermission, hasAnyPermission, hasAllPermissions, hasSubscriptionAccess]);
}

/**
 * Hook for navigation access control
 */
export function useNavigationAccess(navigationItems: NavigationItem[]) {
  const { canAccessNavigation } = useAccessControl();
  
  return useMemo(() => {
    return navigationItems.filter(item => canAccessNavigation(item));
  }, [navigationItems, canAccessNavigation]);
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