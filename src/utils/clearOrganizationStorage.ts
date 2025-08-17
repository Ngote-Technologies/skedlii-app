// Utility function to clear corrupted organization data
export const clearOrganizationStorage = () => {
  try {
    localStorage.removeItem('skedlii-organization-storage');
    console.log('Cleared organization storage');
  } catch (error) {
    console.error('Failed to clear organization storage:', error);
  }
};

// Call this once if you need to reset
if (typeof window !== 'undefined') {
  (window as any).clearOrganizationStorage = clearOrganizationStorage;
}