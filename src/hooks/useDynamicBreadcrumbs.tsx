import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Home } from "lucide-react";
import {
  breadcrumbRoutes,
  staticBreadcrumbMap,
} from "../config/breadcrumbRoutes";

export interface Breadcrumb {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  fullLabel?: string; // Store full text for tooltip
}

// Utility function for smart text truncation
const truncateText = (text: string, maxLength: number = 25): { truncated: string; full: string } => {
  if (text.length <= maxLength) {
    return { truncated: text, full: text };
  }
  
  // Try to truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.6) {
    // If we can truncate at a word boundary without losing too much
    return { 
      truncated: text.slice(0, lastSpace) + '...', 
      full: text 
    };
  } else {
    // Otherwise, truncate at character boundary
    return { 
      truncated: text.slice(0, maxLength - 3) + '...', 
      full: text 
    };
  }
};

export const useDynamicBreadcrumbs = (pathname: string): Breadcrumb[] => {
  // First, determine which route matches and extract query keys
  const routeInfo = useMemo(() => {
    for (const route of breadcrumbRoutes) {
      const match = pathname.match(route.pattern);
      if (match) {
        const params = match.slice(1);
        const queryKeys = route.segments
          .filter(segment => segment.queryKey)
          .map(segment => segment.queryKey!(params));
        
        return {
          route,
          params,
          queryKeys,
        };
      }
    }
    return null;
  }, [pathname]);

  // Call useQuery hooks unconditionally for all possible query keys
  // This ensures hooks are called in the same order every time
  const queryResults = [
    useQuery({
      queryKey: routeInfo?.queryKeys[0] || ['__dummy_key_0'],
      enabled: false,
      staleTime: Infinity,
    }),
    useQuery({
      queryKey: routeInfo?.queryKeys[1] || ['__dummy_key_1'],
      enabled: false,
      staleTime: Infinity,
    }),
    useQuery({
      queryKey: routeInfo?.queryKeys[2] || ['__dummy_key_2'],
      enabled: false,
      staleTime: Infinity,
    }),
  ];

  return useMemo(() => {
    // If no dynamic route matches, use static breadcrumbs
    if (!routeInfo) {
      return buildStaticBreadcrumbs(pathname);
    }

    const { route, params } = routeInfo;
    let queryIndex = 0;

    return route.segments.map((segment) => {
      // If this segment needs dynamic data
      if (segment.queryKey && segment.fallback) {
        const queryResult = queryResults[queryIndex++];
        const { data, isLoading } = queryResult;

        let label: string;
        let fullLabel: string;

        if (isLoading || !data) {
          // Use fallback while loading or if no data
          const fallbackText = segment.fallback(params[0]); // Use first param (collection ID)
          label = fallbackText;
          fullLabel = fallbackText;
        } else if (typeof segment.label === "function") {
          const fullText = segment.label(data);
          const { truncated, full } = truncateText(fullText);
          label = truncated;
          fullLabel = full;
        } else {
          const { truncated, full } = truncateText(segment.label);
          label = truncated;
          fullLabel = full;
        }

        return {
          label,
          fullLabel,
          href:
            typeof segment.href === "function"
              ? segment.href(params)
              : segment.href,
          icon: segment.icon,
          isLoading: isLoading || !data,
        };
      }

      // Static segment
      const staticLabel = typeof segment.label === "function"
        ? segment.label({})
        : segment.label;
      
      const { truncated, full } = truncateText(staticLabel);
      
      return {
        label: truncated,
        fullLabel: full,
        href:
          typeof segment.href === "function"
            ? segment.href(params)
            : segment.href,
        icon: segment.icon,
        isLoading: false,
      };
    });
  }, [pathname, routeInfo, queryResults]);
};

// Helper function to build static breadcrumbs (existing logic)
const buildStaticBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const pathSegments = pathname.split("/").filter(Boolean);
  const { truncated: dashboardLabel, full: dashboardFull } = truncateText("Dashboard");
  
  const crumbs: Breadcrumb[] = [
    {
      label: dashboardLabel,
      fullLabel: dashboardFull,
      href: "/dashboard",
      icon: <Home className="w-4 h-4" />,
    },
  ];

  if (pathSegments.length > 1) {
    const current = pathSegments[pathSegments.length - 1];
    const breadcrumbInfo = staticBreadcrumbMap[current];

    if (breadcrumbInfo) {
      const { truncated, full } = truncateText(breadcrumbInfo.label);
      crumbs.push({
        label: truncated,
        fullLabel: full,
        href: pathname,
        icon: breadcrumbInfo.icon,
      });
    }
  }

  return crumbs;
};

// Helper hook for components that need to know if they're on a dynamic route
export const useIsDynamicRoute = (pathname: string): boolean => {
  return useMemo(() => {
    return breadcrumbRoutes.some((route) => route.pattern.test(pathname));
  }, [pathname]);
};

// Hook to get route parameters for dynamic routes
export const useRouteParams = (pathname: string): string[] => {
  return useMemo(() => {
    for (const route of breadcrumbRoutes) {
      const match = pathname.match(route.pattern);
      if (match) {
        return match.slice(1); // Return capture groups
      }
    }
    return [];
  }, [pathname]);
};
