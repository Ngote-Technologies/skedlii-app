import { useEffect, useRef, ReactNode } from 'react';
import { focusManager } from '../../lib/accessibility';

interface FocusTrapProps {
  children: ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
}

export function FocusTrap({ children, active = true, restoreFocus = true }: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!active || !containerRef.current) return;

    // Store current focus if we should restore it later
    if (restoreFocus) {
      focusManager.storeFocus();
    }

    // Focus first interactive element
    focusManager.focusFirstInteractive(containerRef.current);

    // Set up focus trap
    cleanupRef.current = focusManager.trapFocus(containerRef.current);

    return () => {
      // Clean up focus trap
      if (cleanupRef.current) {
        cleanupRef.current();
      }

      // Restore focus if requested
      if (restoreFocus) {
        focusManager.restoreFocus();
      }
    };
  }, [active, restoreFocus]);

  return (
    <div ref={containerRef}>
      {children}
    </div>
  );
}

// Skip links component for better keyboard navigation
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 z-[100] bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to navigation
      </a>
    </div>
  );
}