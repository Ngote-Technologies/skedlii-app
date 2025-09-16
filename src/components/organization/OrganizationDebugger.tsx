import { useAuth } from "../../store/hooks";

export default function OrganizationDebugger() {
  const { user, organization, authLoading: isLoading, authError: error } = useAuth();

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
          <strong>User:</strong>
          <pre className="mt-1 text-xs overflow-auto max-h-24">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <strong>Organization Context:</strong>
          <pre className="mt-1 text-xs overflow-auto max-h-24">
            {JSON.stringify(organization, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
