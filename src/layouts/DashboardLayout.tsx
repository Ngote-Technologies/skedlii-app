import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect, Suspense, useRef } from "react";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import MobileBottomNav from "../components/mobile/MobileBottomNav";
import {
  AnimatedPage,
  PageLoadingSkeleton,
} from "../components/ui/page-transition";
import { SkipLinks } from "../components/ui/focus-trap";
import { useMobileMenuStore } from "../store/layout";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { cn } from "../lib/utils";

export default function DashboardLayout() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mobileMenuOpen = useMobileMenuStore(
    (state: any) => state.mobileMenuOpen
  );

  // Ref for the main scrollable content container
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to top when navigating between dashboard routes
  // This ensures users start at the top of each new page instead of maintaining scroll position
  useScrollToTop(mainContentRef, {
    behavior: "smooth",
    delay: 100, // Small delay to ensure content is rendered and animations can settle
  });

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <SkipLinks />
      <div className="h-screen flex flex-col bg-gray-50/50 dark:bg-gray-900/50">
        {/* Enhanced Header */}
        <DashboardHeader />

        <div className="flex-1 flex overflow-hidden relative">
          {/* Enhanced Sidebar Container */}
          <div className="hidden lg:block relative">
            <DashboardSidebar
              collapsed={sidebarCollapsed}
              onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
          </div>

          {/* Enhanced Main Content Area */}
          <main
            className={cn(
              "flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out",
              sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
            )}
          >
            {/* Page Content Container */}
            <div 
              ref={mainContentRef}
              data-dashboard-content
              className="flex-1 overflow-y-auto"
            >
              <div
                key={location.pathname}
                className="min-h-full p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8"
              >
                {/* Content Wrapper with enhanced page transitions */}
                <div id="main-content" className="max-w-7xl mx-auto">
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <AnimatedPage animation="fade" className="space-y-6">
                      <Outlet />
                    </AnimatedPage>
                  </Suspense>
                </div>
              </div>
            </div>
          </main>

          {/* Mobile Overlay */}
          {mobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-200"
              onClick={() =>
                (useMobileMenuStore as any).getState().setMobileMenuOpen(false)
              }
            />
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </>
  );
}
