import React from "react";
import { Permission, ACCESS_CONTROL_MESSAGES, FEATURES } from "../../lib/access-control";
import { 
  usePermissionGuard, 
  useFeatureAccess, 
  useSubscriptionGate, 
  useRoleGuard, 
  useUserTypeGuard 
} from "../../hooks/useAccessControl";
import { UserRole, UserType } from "../../store/authStore";

interface PermissionGuardProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  subscriptionTier?: string;
  fallbackComponent?: React.ReactNode;
  fallbackMessage?: string;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGuard({
  permission,
  requireAll = false,
  subscriptionTier,
  fallbackComponent,
  fallbackMessage,
  children,
}: PermissionGuardProps) {
  const { hasAccess, message } = usePermissionGuard(permission, {
    requireAll,
    subscriptionTier,
    fallbackMessage,
  });

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (fallbackMessage !== null) {
      return (
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50 border border-border">
          {message}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface FeatureGuardProps {
  featureKey: keyof typeof FEATURES;
  fallbackComponent?: React.ReactNode;
  fallbackMessage?: string;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on predefined features
 */
export function FeatureGuard({
  featureKey,
  fallbackComponent,
  fallbackMessage,
  children,
}: FeatureGuardProps) {
  const { hasAccess } = useFeatureAccess(featureKey);

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (fallbackMessage !== null) {
      return (
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50 border border-border">
          {fallbackMessage || ACCESS_CONTROL_MESSAGES.SUBSCRIPTION_REQUIRED}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface SubscriptionGuardProps {
  requiredTier?: string;
  showUpgradeMessage?: boolean;
  customUpgradeComponent?: React.ReactNode;
  fallbackComponent?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on subscription tier
 */
export function SubscriptionGuard({
  requiredTier,
  showUpgradeMessage = true,
  customUpgradeComponent,
  fallbackComponent,
  children,
}: SubscriptionGuardProps) {
  const { hasAccess, needsUpgrade, needsSubscription, currentTier } = useSubscriptionGate(requiredTier);

  if (!hasAccess) {
    if (customUpgradeComponent) {
      return <>{customUpgradeComponent}</>;
    }

    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (showUpgradeMessage) {
      const message = needsSubscription
        ? "This feature requires an active subscription"
        : needsUpgrade
        ? `This feature requires the ${requiredTier} plan or higher. You're currently on the ${currentTier} plan.`
        : "Access denied";

      return (
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50 border border-border">
          <p>{message}</p>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  allowedRoles: UserRole[];
  fallbackComponent?: React.ReactNode;
  fallbackMessage?: string;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user roles
 */
export function RoleGuard({
  allowedRoles,
  fallbackComponent,
  fallbackMessage,
  children,
}: RoleGuardProps) {
  const { hasAccess } = useRoleGuard(allowedRoles);

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (fallbackMessage !== null) {
      return (
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50 border border-border">
          {fallbackMessage || ACCESS_CONTROL_MESSAGES.INSUFFICIENT_PERMISSIONS}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

interface UserTypeGuardProps {
  allowedTypes: UserType[];
  fallbackComponent?: React.ReactNode;
  fallbackMessage?: string;
  children: React.ReactNode;
}

/**
 * Component that conditionally renders children based on user type
 */
export function UserTypeGuard({
  allowedTypes,
  fallbackComponent,
  fallbackMessage,
  children,
}: UserTypeGuardProps) {
  const { hasAccess } = useUserTypeGuard(allowedTypes);

  if (!hasAccess) {
    if (fallbackComponent) {
      return <>{fallbackComponent}</>;
    }

    if (fallbackMessage !== null) {
      return (
        <div className="text-sm text-muted-foreground p-3 rounded-md bg-muted/50 border border-border">
          {fallbackMessage || ACCESS_CONTROL_MESSAGES.INVALID_USER_TYPE}
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}