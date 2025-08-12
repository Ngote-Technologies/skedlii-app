import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

interface UseScrollToTopOptions {
  behavior?: ScrollBehavior;
  delay?: number;
  excludeParams?: boolean;
}

/**
 * Custom hook to scroll a container to top on route changes
 * Specifically designed for dashboard layouts with scrollable containers
 */
export function useScrollToTop(
  scrollContainerRef: React.RefObject<HTMLElement>,
  options: UseScrollToTopOptions = {}
) {
  const location = useLocation();
  const {
    behavior = "smooth",
    delay = 0,
    excludeParams = true,
  } = options;

  // Keep track of the previous pathname to avoid unnecessary scrolls
  const prevPathnameRef = useRef<string>("");

  useEffect(() => {
    const currentPath = excludeParams 
      ? location.pathname 
      : location.pathname + location.search;

    // Only scroll if the pathname actually changed
    if (currentPath !== prevPathnameRef.current) {
      const scrollToTop = () => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
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
  }, [location.pathname, location.search, scrollContainerRef, behavior, delay, excludeParams]);
}

/**
 * Alternative hook for window-level scrolling (for non-dashboard routes)
 */
export function useWindowScrollToTop(options: UseScrollToTopOptions = {}) {
  const location = useLocation();
  const { 
    behavior = "smooth", 
    delay = 0, 
    excludeParams = true 
  } = options;

  const prevPathnameRef = useRef<string>("");

  useEffect(() => {
    const currentPath = excludeParams 
      ? location.pathname 
      : location.pathname + location.search;

    if (currentPath !== prevPathnameRef.current) {
      const scrollToTop = () => {
        window.scrollTo({
          top: 0,
          behavior,
        });
      };

      if (delay > 0) {
        const timeoutId = setTimeout(scrollToTop, delay);
        return () => clearTimeout(timeoutId);
      } else {
        scrollToTop();
      }

      prevPathnameRef.current = currentPath;
    }
  }, [location.pathname, location.search, behavior, delay, excludeParams]);
}