export { default as OrganizationSwitcher, CompactOrganizationSwitcher } from './OrganizationSwitcher';
export { default as OrganizationDashboard } from './OrganizationDashboard';
export { default as OrganizationSettings } from './OrganizationSettings';
export { default as OrganizationMembers } from './OrganizationMembers';
export { default as CreateOrganizationDialog } from './CreateOrganizationDialog';

// Re-export organization-related types and hooks
// export {
//   useOrganizationStore,
//   useActiveOrganization,
//   useOrganizationRole,
//   useOrganizationPermissions,
//   type OrganizationRole
// } from '../../store/organizationStore';

export {
  organizationsApi,
  type Organization,
  type OrganizationWithRole,
  type CreateOrganizationData,
  type UpdateOrganizationData,
  type OrganizationMember,
  type OrganizationWithDetails
} from '../../api/organizations';