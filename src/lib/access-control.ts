import { UserRole, UserType } from "../store/authStore";

// Core permission definitions matching backend system
export enum Permission {
  // Organization management
  ORG_VIEW = "org:view",
  ORG_MANAGE = "org:manage",
  ORG_DELETE = "org:delete",

  // Organization settings
  ORG_SETTINGS_VIEW = "org:settings:view",
  ORG_SETTINGS_MANAGE = "org:settings:manage",

  // Member management
  ORG_MEMBERS_VIEW = "org:members:view",
  ORG_MEMBERS_INVITE = "org:members:invite",
  ORG_MEMBERS_MANAGE = "org:members:manage",
  ORG_MEMBERS_REMOVE = "org:members:remove",

  // Team management
  TEAMS_VIEW = "teams:view",
  TEAMS_CREATE = "teams:create",
  TEAMS_MANAGE = "teams:manage",
  TEAMS_DELETE = "teams:delete",

  // Team member management
  TEAM_MEMBERS_VIEW = "team:members:view",
  TEAM_MEMBERS_INVITE = "team:members:invite",
  TEAM_MEMBERS_MANAGE = "team:members:manage",
  TEAM_MEMBERS_REMOVE = "team:members:remove",

  // Social accounts
  SOCIAL_ACCOUNTS_VIEW = "social:accounts:view",
  SOCIAL_ACCOUNTS_CONNECT = "social:accounts:connect",
  SOCIAL_ACCOUNTS_MANAGE = "social:accounts:manage",
  SOCIAL_ACCOUNTS_DELETE = "social:accounts:delete",

  // Content and posts
  CONTENT_VIEW = "content:view",
  CONTENT_CREATE = "content:create",
  CONTENT_EDIT = "content:edit",
  CONTENT_DELETE = "content:delete",
  CONTENT_PUBLISH = "content:publish",

  // Collections
  COLLECTIONS_VIEW = "collections:view",
  COLLECTIONS_CREATE = "collections:create",
  COLLECTIONS_MANAGE = "collections:manage",
  COLLECTIONS_DELETE = "collections:delete",

  // Analytics
  ANALYTICS_VIEW = "analytics:view",
  ANALYTICS_EXPORT = "analytics:export",

  // Billing (organization level)
  BILLING_VIEW = "billing:view",
  BILLING_MANAGE = "billing:manage",
}

// Role-based permission matrix matching backend system
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  org_owner: [
    // Owners have all permissions
    ...Object.values(Permission),
  ],

  admin: [
    // Organization (read-only for settings, full for members/teams)
    Permission.ORG_VIEW,
    Permission.ORG_SETTINGS_VIEW,
    Permission.ORG_MEMBERS_VIEW,
    Permission.ORG_MEMBERS_INVITE,
    Permission.ORG_MEMBERS_MANAGE,
    Permission.ORG_MEMBERS_REMOVE,

    // Teams (full access)
    Permission.TEAMS_VIEW,
    Permission.TEAMS_CREATE,
    Permission.TEAMS_MANAGE,
    Permission.TEAMS_DELETE,
    Permission.TEAM_MEMBERS_VIEW,
    Permission.TEAM_MEMBERS_INVITE,
    Permission.TEAM_MEMBERS_MANAGE,
    Permission.TEAM_MEMBERS_REMOVE,

    // Social accounts (full access)
    Permission.SOCIAL_ACCOUNTS_VIEW,
    Permission.SOCIAL_ACCOUNTS_CONNECT,
    Permission.SOCIAL_ACCOUNTS_MANAGE,
    Permission.SOCIAL_ACCOUNTS_DELETE,

    // Content (full access)
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,

    // Collections (full access)
    Permission.COLLECTIONS_VIEW,
    Permission.COLLECTIONS_CREATE,
    Permission.COLLECTIONS_MANAGE,
    Permission.COLLECTIONS_DELETE,

    // Analytics (view and export)
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,

    // Billing (view only)
    Permission.BILLING_VIEW,
  ],

  member: [
    // Organization (view only)
    Permission.ORG_VIEW,
    Permission.ORG_MEMBERS_VIEW,

    // Teams (view and limited management)
    Permission.TEAMS_VIEW,
    Permission.TEAM_MEMBERS_VIEW,

    // Social accounts (view only - no connect permission)
    Permission.SOCIAL_ACCOUNTS_VIEW,

    // Content (create, edit own, view all)
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,

    // Collections (view and create)
    Permission.COLLECTIONS_VIEW,
    Permission.COLLECTIONS_CREATE,

    // Analytics (view only)
    Permission.ANALYTICS_VIEW,
  ],

  user: [
    // Same as member for organization context
    Permission.ORG_VIEW,
    Permission.ORG_MEMBERS_VIEW,
    Permission.TEAMS_VIEW,
    Permission.TEAM_MEMBERS_VIEW,
    Permission.SOCIAL_ACCOUNTS_VIEW,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
    Permission.COLLECTIONS_VIEW,
    Permission.COLLECTIONS_CREATE,
    Permission.ANALYTICS_VIEW,
  ],

  viewer: [
    // Organization (view only)
    Permission.ORG_VIEW,
    Permission.ORG_MEMBERS_VIEW,

    // Teams (view only)
    Permission.TEAMS_VIEW,
    Permission.TEAM_MEMBERS_VIEW,

    // Social accounts (view only)
    Permission.SOCIAL_ACCOUNTS_VIEW,

    // Content (view only)
    Permission.CONTENT_VIEW,

    // Collections (view only)
    Permission.COLLECTIONS_VIEW,

    // Analytics (view only)
    Permission.ANALYTICS_VIEW,
  ],

  super_admin: [
    // Super admins have all permissions
    ...Object.values(Permission),
  ],
};

// User context interface
interface UserContext {
  userType: UserType | null;
  userRole: UserRole | null;
  hasValidSubscription: boolean;
  subscriptionTier?: string | null;
  organizationRole?: string | null; // For organization-specific role checking
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userContext: UserContext,
  permission: Permission
): boolean {
  if (!userContext.userRole) {
    return false;
  }

  // Individual users have all permissions for their own account
  if (userContext.userType === "individual") {
    return true;
  }

  // Organization users check against role permissions
  if (userContext.userType === "organization") {
    const rolePermissions = ROLE_PERMISSIONS[userContext.userRole];
    return rolePermissions?.includes(permission) || false;
  }

  return false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userContext: UserContext,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) =>
    hasPermission(userContext, permission)
  );
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userContext: UserContext,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) =>
    hasPermission(userContext, permission)
  );
}

/**
 * Check if user can manage another user's role
 */
export function canManageRole(
  managerContext: UserContext,
  targetRole: UserRole
): boolean {
  if (!managerContext.userRole) {
    return false;
  }

  const roleHierarchy = {
    org_owner: 4,
    admin: 3,
    member: 2,
    user: 2,
    viewer: 1,
    super_admin: 5,
  };

  return roleHierarchy[managerContext.userRole] > roleHierarchy[targetRole];
}

/**
 * Subscription-aware permission checking
 */
export function hasSubscriptionAccess(
  userContext: UserContext,
  requiredTier?: string
): boolean {
  if (!userContext.hasValidSubscription) {
    return false;
  }

  if (!requiredTier) {
    return true;
  }

  // Basic tier checking (can be enhanced with more complex logic)
  const tierHierarchy = {
    free: 1,
    creator: 2,
    pro: 3,
    enterprise: 4,
  };

  const userTier = userContext.subscriptionTier?.toLowerCase() || "free";
  const requiredTierLevel =
    tierHierarchy[requiredTier.toLowerCase() as keyof typeof tierHierarchy] ||
    1;
  const userTierLevel =
    tierHierarchy[userTier as keyof typeof tierHierarchy] || 1;

  return userTierLevel >= requiredTierLevel;
}

/**
 * Feature access checking combining permissions and subscription
 */
export function canAccessFeature(
  userContext: UserContext,
  feature: {
    permission?: Permission;
    permissions?: Permission[];
    requireAll?: boolean;
    subscriptionTier?: string;
  }
): boolean {
  // Check subscription requirements first
  if (
    feature.subscriptionTier &&
    !hasSubscriptionAccess(userContext, feature.subscriptionTier)
  ) {
    return false;
  }

  // Check permission requirements
  if (feature.permission) {
    return hasPermission(userContext, feature.permission);
  }

  if (feature.permissions) {
    return feature.requireAll
      ? hasAllPermissions(userContext, feature.permissions)
      : hasAnyPermission(userContext, feature.permissions);
  }

  // No specific requirements, allow access if user has valid subscription
  return userContext.hasValidSubscription;
}

/**
 * Navigation item access control
 */
export interface NavigationItem {
  path: string;
  label: string;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  subscriptionTier?: string;
  userTypes?: UserType[];
  roles?: UserRole[];
}

export function canAccessNavigation(
  userContext: UserContext,
  navItem: NavigationItem
): boolean {
  // Check user type restrictions
  if (navItem.userTypes && !navItem.userTypes.includes(userContext.userType!)) {
    return false;
  }

  // Check role restrictions
  if (navItem.roles && !navItem.roles.includes(userContext.userRole!)) {
    return false;
  }

  // Use general feature access checking
  return canAccessFeature(userContext, navItem);
}

/**
 * Component-level access control HOC helper
 */
export function createAccessControl(userContext: UserContext) {
  return {
    hasPermission: (permission: Permission) =>
      hasPermission(userContext, permission),
    hasAnyPermission: (permissions: Permission[]) =>
      hasAnyPermission(userContext, permissions),
    hasAllPermissions: (permissions: Permission[]) =>
      hasAllPermissions(userContext, permissions),
    canManageRole: (targetRole: UserRole) =>
      canManageRole(userContext, targetRole),
    hasSubscriptionAccess: (tier?: string) =>
      hasSubscriptionAccess(userContext, tier),
    canAccessFeature: (feature: any) => canAccessFeature(userContext, feature),
    canAccessNavigation: (navItem: NavigationItem) =>
      canAccessNavigation(userContext, navItem),
  };
}

/**
 * Common feature definitions for easy reuse
 */
export const FEATURES = {
  SOCIAL_ACCOUNT_CONNECTION: {
    permission: Permission.SOCIAL_ACCOUNTS_CONNECT,
    subscriptionTier: "creator",
  },
  TEAM_MANAGEMENT: {
    permissions: [Permission.TEAMS_CREATE, Permission.TEAMS_MANAGE],
    subscriptionTier: "pro",
  },
  ORGANIZATION_BILLING: {
    permission: Permission.BILLING_MANAGE,
    userTypes: ["individual", "organization"] as UserType[],
    roles: ["org_owner"] as UserRole[],
  },
  ANALYTICS_EXPORT: {
    permission: Permission.ANALYTICS_EXPORT,
    subscriptionTier: "pro",
  },
  ADVANCED_CONTENT_FEATURES: {
    permissions: [Permission.CONTENT_CREATE, Permission.CONTENT_PUBLISH],
    subscriptionTier: "creator",
  },
} as const;

/**
 * Error messages for access control
 */
export const ACCESS_CONTROL_MESSAGES = {
  INSUFFICIENT_PERMISSIONS:
    "You don't have sufficient permissions to perform this action",
  SUBSCRIPTION_REQUIRED: "This feature requires a valid subscription",
  SUBSCRIPTION_UPGRADE_REQUIRED:
    "Please upgrade your subscription to access this feature",
  ORGANIZATION_OWNER_ONLY:
    "This action is only available to organization owners",
  ADMIN_ONLY: "This action requires administrator permissions",
  INVALID_USER_TYPE: "This feature is not available for your account type",
} as const;
