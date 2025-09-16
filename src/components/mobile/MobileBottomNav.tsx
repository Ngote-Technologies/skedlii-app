import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  Home,
  Plus,
  CalendarCheck,
  Link2,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAccessControl } from "../../hooks/useAccessControl";
import { useEffect, useState } from "react";

export default function MobileBottomNav() {
  const location = useLocation();
  const { hasValidSubscription } = useAccessControl();
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("mobile_nav_collapsed") === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("mobile_nav_collapsed", collapsed ? "1" : "0");
    } catch {}
  }, [collapsed]);

  // Primary actions for mobile bottom navigation
  const bottomNavItems = [
    {
      icon: Home,
      label: "Home",
      href: "/dashboard",
      primary: true,
    },
    {
      icon: Link2,
      label: "Accounts",
      href: "/dashboard/accounts",
      primary: true,
    },
    {
      icon: Plus,
      label: "Create",
      href: "/dashboard/post-flow",
      primary: true,
      highlight: true,
      disabled: !hasValidSubscription,
    },
    {
      icon: CalendarCheck,
      label: "Scheduled",
      href: "/dashboard/scheduled",
      primary: true,
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/dashboard/analytics",
      primary: true,
      disabled: !hasValidSubscription,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-800 shadow-lg transition-all duration-200"
      aria-label="Main navigation"
      role="navigation"
    >
      {/* Collapse/Expand handle */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <button
          type="button"
          aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
          className="h-6 px-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 shadow hover:shadow-md transition-all flex items-center gap-1"
        >
          {collapsed ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
          <span className="text-[11px] text-gray-600 dark:text-gray-300">
            {collapsed ? "Expand" : "Hide"}
          </span>
        </button>
      </div>

      {/* Expanded content */}
      {!collapsed && (
        <div className="flex items-center justify-around px-2 py-2 max-w-md mx-auto">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            const isHighlight = item.highlight && !item.disabled;

            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className="flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 opacity-50"
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg mb-1",
                      "bg-gray-100 dark:bg-gray-800"
                    )}
                  >
                    <Icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <span className="text-xs text-gray-400 truncate">
                    {item.label}
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex flex-col items-center justify-center px-3 py-2 min-w-0 flex-1 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900 rounded-lg"
                aria-label={`${item.label}${isActive ? " (current page)" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-lg mb-1 transition-all duration-200 transform group-active:scale-95",
                    isHighlight
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg group-hover:shadow-xl group-hover:scale-110"
                      : isActive
                      ? "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400"
                      : "bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-gray-800"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors duration-200",
                      isHighlight
                        ? "text-white"
                        : isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-xs truncate transition-colors duration-200",
                    isActive
                      ? "text-primary-600 font-medium dark:text-primary-400"
                      : "text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Collapsed bar (keeps safe area and subtle presence) */}
      {collapsed && (
        <div className="px-2 py-1 max-w-md mx-auto text-center">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 select-none">
            Navigation hidden
          </div>
        </div>
      )}

      {/* Safe area for devices with home indicator */}
      <div className="h-safe-bottom bg-white/95 backdrop-blur-lg dark:bg-gray-900/95" />
    </nav>
  );
}
