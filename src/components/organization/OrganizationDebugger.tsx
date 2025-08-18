import { useOrganizationStore } from "../../store/organizationStore";

export default function OrganizationDebugger() {
  const { organizations, activeOrganization, isLoading, error } =
    useOrganizationStore();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 top-4 h-screen max-w-md p-4 bg-black text-white text-xs font-mono rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold mb-2">Organization Debug</h3>

      <div className="space-y-2">
        <div>
          <strong>Loading:</strong> {isLoading ? "true" : "false"}
        </div>

        <div>
          <strong>Error:</strong> {error || "none"}
        </div>

        <div>
          <strong>Organizations Count:</strong> {organizations.length}
        </div>

        <div>
          <strong>Active Organization:</strong>
          <pre className="mt-1 text-xs overflow-auto max-h-24">
            {JSON.stringify(activeOrganization, null, 2)}
          </pre>
        </div>

        <div>
          <strong>All Organizations:</strong>
          <pre className="mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(organizations, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
