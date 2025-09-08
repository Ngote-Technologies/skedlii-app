export { default as OrganizationSwitcher, CompactOrganizationSwitcher } from './OrganizationSwitcher';
export { default as OrganizationDashboard } from './OrganizationDashboard';
export { default as OrganizationSettings } from './OrganizationSettings';
export { default as OrganizationMembers } from './OrganizationMembers';
export { default as CreateOrganizationDialog } from './CreateOrganizationDialog';

// Organization context now handled through auth store
// useAuth() provides organization context via user.defaultOrganizationId and organization fields

export {
  organizationsApi,
  type Organization,
  type OrganizationWithRole,
  type CreateOrganizationData,
  type UpdateOrganizationData,
  type OrganizationMember,
  type OrganizationWithDetails,
  type OrganizationRole
} from '../../api/organizations';