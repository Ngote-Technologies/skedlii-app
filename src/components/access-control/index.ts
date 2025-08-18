export {
  PermissionGuard,
  FeatureGuard,
  SubscriptionGuard,
  RoleGuard,
  UserTypeGuard,
} from "./PermissionGuard";

// Re-export access control utilities for convenience
export {
  Permission,
  FEATURES,
  ACCESS_CONTROL_MESSAGES,
} from "../../lib/access-control";

export {
  useAccessControl,
  useFeatureAccess,
  usePermissionGuard,
  useNavigationAccess,
  useRoleManagement,
  useSubscriptionGate,
  useUserTypeGuard,
  useRoleGuard,
} from "../../hooks/useAccessControl";