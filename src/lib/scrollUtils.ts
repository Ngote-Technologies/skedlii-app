/**
 * Scroll utilities for different navigation scenarios
 */

export interface ScrollOptions {
  behavior?: ScrollBehavior;
  delay?: number;
  offset?: number;
}

/**
 * Scroll a specific container to top
 */
export function scrollContainerToTop(
  container: HTMLElement,
  options: ScrollOptions = {}
) {
  const { behavior = "smooth", delay = 0, offset = 0 } = options;

  const scroll = () => {
    container.scrollTo({
      top: offset,
      behavior,
    });
  };

  if (delay > 0) {
    setTimeout(scroll, delay);
  } else {
    scroll();
  }
}

/**
 * Scroll window to top
 */
export function scrollWindowToTop(options: ScrollOptions = {}) {
  const { behavior = "smooth", delay = 0, offset = 0 } = options;

  const scroll = () => {
    window.scrollTo({
      top: offset,
      behavior,
    });
  };

  if (delay > 0) {
    setTimeout(scroll, delay);
  } else {
    scroll();
  }
}

/**
 * Find and scroll the main dashboard content container
 */
export function scrollDashboardToTop(options: ScrollOptions = {}) {
  // Try to find the dashboard content container using multiple strategies
  const selectors = [
    "[data-dashboard-content]",
    "main .overflow-y-auto",
    '[role="main"] .overflow-y-auto',
    "#main-content",
  ];

  let container: HTMLElement | null = null;

  for (const selector of selectors) {
    container = document.querySelector(selector);
    if (container) break;
  }

  if (container) {
    scrollContainerToTop(container, options);
    return true;
  }

  // Fallback to window scroll
  scrollWindowToTop(options);
  return false;
}

/**
 * Smart scroll that detects the context and uses appropriate strategy
 */
export function smartScrollToTop(options: ScrollOptions = {}) {
  // Check if we're in a dashboard context
  const isDashboard = window.location.pathname.startsWith("/dashboard");

  if (isDashboard) {
    return scrollDashboardToTop(options);
  } else {
    scrollWindowToTop(options);
    return true;
  }
}

/**
 * Scroll to a specific element within a container
 */
export function scrollToElement(
  element: HTMLElement,
  container?: HTMLElement,
  options: ScrollOptions = {}
) {
  const { behavior = "smooth", delay = 0, offset = 0 } = options;

  const scroll = () => {
    if (container) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      const scrollTop =
        container.scrollTop + elementRect.top - containerRect.top - offset;

      container.scrollTo({
        top: scrollTop,
        behavior,
      });
    } else {
      element.scrollIntoView({
        behavior,
        block: "start",
      });
    }
  };

  if (delay > 0) {
    setTimeout(scroll, delay);
  } else {
    scroll();
  }
}
