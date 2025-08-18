import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface DashboardScrollToTopProps {
  /**
   * The scrollable container element selector
   * Defaults to the main dashboard content container
   */
  containerSelector?: string;
  /**
   * Scroll behavior - 'smooth' or 'instant'
   */
  behavior?: ScrollBehavior;
  /**
   * Delay in milliseconds before scrolling
   */
  delay?: number;
  /**
   * Whether to exclude URL parameters when determining route changes
   */
  excludeParams?: boolean;
}

/**
 * Component that scrolls the dashboard content container to top on route changes
 * Use this for dashboard routes that need automatic scroll-to-top behavior
 */
export default function DashboardScrollToTop({
  containerSelector = '[data-dashboard-content]',
  behavior = "smooth",
  delay = 100,
  excludeParams = true,
}: DashboardScrollToTopProps) {
  const location = useLocation();
  const prevPathnameRef = useRef<string>("");

  useEffect(() => {
    const currentPath = excludeParams 
      ? location.pathname 
      : location.pathname + location.search;

    // Only scroll if the pathname actually changed
    if (currentPath !== prevPathnameRef.current) {
      const scrollToTop = () => {
        // Try multiple selectors to find the scrollable container
        const selectors = [
          containerSelector,
          '[data-dashboard-content]',
          '.overflow-y-auto',
          'main [class*="overflow-y-auto"]',
        ];

        let container: HTMLElement | null = null;
        
        for (const selector of selectors) {
          container = document.querySelector(selector);
          if (container) break;
        }

        if (container) {
          container.scrollTo({
            top: 0,
            behavior,
          });
        } else {
          // Fallback to window scroll if no container found
          console.warn('DashboardScrollToTop: No scrollable container found, falling back to window scroll');
          window.scrollTo({
            top: 0,
            behavior,
          });
        }
      };

      if (delay > 0) {
        const timeoutId = setTimeout(scrollToTop, delay);
        return () => clearTimeout(timeoutId);
      } else {
        scrollToTop();
      }

      prevPathnameRef.current = currentPath;
    }
  }, [location.pathname, location.search, containerSelector, behavior, delay, excludeParams]);

  return null;
}