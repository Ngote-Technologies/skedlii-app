import React from "react";
import { useDynamicBreadcrumbs } from "../../hooks/useDynamicBreadcrumbs";

/**
 * Test component for dynamic breadcrumbs - Remove after testing
 */
export const BreadcrumbTest: React.FC = () => {
  // Test different routes
  const testRoutes = [
    "/dashboard",
    "/dashboard/collections",
    "/dashboard/collections/123",
    "/dashboard/posts",
    "/dashboard/settings",
  ];

  return (
    <div className="p-8 space-y-6 bg-gray-50 dark:bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold">Breadcrumb System Tests</h2>

      {testRoutes.map((route) => {
        // This would normally be called within a component that has access to React Query
        // For demo purposes, we'll show the expected structure
        return (
          <div key={route} className="p-4 border rounded">
            <h3 className="font-medium text-lg mb-2">Route: {route}</h3>
            <div className="text-sm text-gray-600">
              Expected breadcrumb behavior:
              {route === "/dashboard" && (
                <span className="block">Dashboard</span>
              )}
              {route === "/dashboard/collections" && (
                <span className="block">Dashboard &gt; Collections</span>
              )}
              {route === "/dashboard/collections/123" && (
                <span className="block">
                  Dashboard &gt; Collections &gt; [Collection Name]
                </span>
              )}
              {route === "/dashboard/posts" && (
                <span className="block">Dashboard &gt; Published Posts</span>
              )}
              {route === "/dashboard/settings" && (
                <span className="block">Dashboard &gt; Settings</span>
              )}
            </div>
          </div>
        );
      })}

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950 rounded">
        <h3 className="font-medium mb-2">How it works:</h3>
        <ul className="text-sm space-y-1">
          <li>
            • <strong>Static routes</strong>: Use fallback breadcrumb mapping
          </li>
          <li>
            • <strong>Dynamic routes</strong>: Match pattern and read from React
            Query cache
          </li>
          <li>
            • <strong>Collections</strong>: /dashboard/collections/:id reads
            collection name from existing API call
          </li>
          <li>
            • <strong>Loading states</strong>: Show fallback text while data
            loads
          </li>
          <li>
            • <strong>Extensible</strong>: Easy to add new dynamic routes in
            config
          </li>
        </ul>
      </div>
    </div>
  );
};
