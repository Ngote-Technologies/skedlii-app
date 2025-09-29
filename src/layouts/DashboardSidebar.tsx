import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  CalendarCheck,
  Folder,
  Home,
  Link2,
  Settings,
  CalendarSync,
  Plus,
  HelpCircle,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  Building,
  FileText,
} from "lucide-react";
import { useAuth } from "../store/hooks";
import { useMemo } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { Badge } from "../components/ui/badge";
import { useAccessControl } from "../hooks/useAccessControl";

export default function DashboardSidebar({
  closeMenu,
  isMobile = false,
  collapsed = false,
  onToggleCollapse,
}: {
  readonly closeMenu?: () => void;
  readonly isMobile?: boolean;
  readonly collapsed?: boolean;
  readonly onToggleCollapse?: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, user, canManageBilling } = useAuth();
  const { billing } = user;
  const {
    canCreateTeams,
    canConnectSocialAccounts,
    hasValidSubscription: hasValidSub,
    userContext,
  } = useAccessControl();
  const userType = userContext.userType;

  const bottomNavItems = useMemo(
    () =>
      [
        {
          label: "Settings",
          href: "/dashboard/settings",
          icon: <Settings size={18} />,
          show: true, // Everyone can access settings
        },
        {
          label: "Billing",
          href: "/dashboard/billing",
          icon: <CreditCard size={18} />,
          show: canManageBilling, // Only users who can manage billing
        },
        {
          label: "Help & Support",
          href: "/dashboard/help",
          icon: <HelpCircle size={18} />,
          show: true, // Everyone can access help
        },
      ].filter((item) => item.show),
    [canManageBilling]
  );

  const menuItems = useMemo(() => {
    const mainItems = [
      {
        icon: <Home size={18} />,
        label: "Dashboard",
        href: "/dashboard",
        badge: null,
        show: true, // Everyone can access dashboard
      },
      {
        icon: <Link2 size={18} />,
        label: "Social Accounts",
        href: "/dashboard/accounts",
        badge: null,
        show: canConnectSocialAccounts || isAdmin,
      },
      {
        icon: <CalendarCheck size={18} />,
        label: "Scheduled Posts",
        href: "/dashboard/scheduled",
        badge: null,
        show: hasValidSub,
      },
      {
        icon: <CalendarSync size={18} />,
        label: "Published Posts",
        href: "/dashboard/posts",
        badge: null,
        show: hasValidSub,
      },
      {
        icon: <Plus size={18} />,
        label: "Create Post",
        href: "/dashboard/post-flow",
        disabled: !hasValidSub,
        badge: !hasValidSub ? "Team" : null,
        premium: true,
        show: true, // Show but may be disabled
      },
      {
        icon: <FileText size={18} />,
        label: "Drafts",
        href: "/dashboard/drafts",
        badge: null,
        show: true,
      },
      {
        icon: <Folder size={18} />,
        label: "Collections",
        href: "/dashboard/collections",
        disabled: !hasValidSub,
        badge: !hasValidSub ? "Team" : null,
        show: true, // Show but may be disabled
      },
      {
        icon: <Building size={18} />,
        label: "Organization",
        href: "/dashboard/organizations",
        disabled: userType === "individual",
        badge: userType === "individual" ? "Org" : null,
        show: userType === "organization", // Only show for organization users
      },
      {
        icon: <BarChart3 size={18} />,
        label: "Analytics",
        href: "/dashboard/analytics",
        disabled: !hasValidSub,
        badge: !hasValidSub ? "Team" : null,
        show: true, // Show but may be disabled
      },
    ];

    // Add development items in development mode
    if (import.meta.env.DEV) {
      mainItems.push({
        icon: <div className="text-purple-500">🧪</div>,
        label: "Toast Demo",
        href: "/dashboard/dev/toast-demo",
        badge: "DEV",
        show: true,
        disabled: false,
        premium: false,
      });
    }

    // Filter items based on show property
    const filteredMainItems = mainItems.filter((item) => item.show);

    // For mobile, add bottom nav items to main navigation
    if (isMobile) {
      return [
        ...filteredMainItems,
        ...bottomNavItems.map(
          (item) =>
            ({
              ...item,
              badge: null,
              disabled: false,
              premium: false,
              isBottomNavItem: true,
              show: true,
            } as any)
        ),
      ];
    }

    return filteredMainItems;
  }, [
    isAdmin,
    billing,
    user?.userType,
    isMobile,
    bottomNavItems,
    hasValidSub,
    userType,
    canCreateTeams,
    canConnectSocialAccounts,
  ]);

  const handleNavigation = () => {
    if (closeMenu && isMobile) {
      closeMenu();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 z-40 transition-all duration-300 ease-in-out shadow-xl dark:shadow-gray-900/50",
        isMobile ? "relative w-full h-full top-0" : collapsed ? "w-20" : "w-64",
        "flex flex-col"
      )}
    >
      {/* Mobile Header with Swipe Indicator */}
      {isMobile && (
        <div className="flex flex-col">
          {/* Swipe Indicator */}
          <div className="flex justify-center py-2 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="w-8 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex justify-center items-center py-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => closeMenu?.()}
              className="relative hover:bg-gray-100 dark:hover:bg-gray-800 h-10 w-10 touch-manipulation"
            >
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <div className="flex items-center justify-end px-4 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Main CTA Button */}
          {(!collapsed || isMobile) && (
            <Button
              variant="default"
              onClick={() => {
                navigate("/dashboard/post-flow");
                handleNavigation();
              }}
              className={cn(
                "w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group",
                isMobile ? "h-12 text-base touch-manipulation" : ""
              )}
              disabled={!hasValidSub}
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              Create Post
              {!hasValidSub && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Team
                </Badge>
              )}
            </Button>
          )}

          {/* Collapsed CTA */}
          {collapsed && !isMobile && (
            <Button
              variant="default"
              size="icon"
              onClick={() => {
                navigate("/dashboard/post-flow");
                handleNavigation();
              }}
              className="w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 group"
              disabled={!hasValidSub}
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="sr-only">Create Post</span>
            </Button>
          )}

          {/* Main Navigation */}
          <nav className={cn("space-y-1", isMobile && "space-y-2")}>
            {isMobile && (
              <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                  Main
                </div>
              </div>
            )}
            <div
              className={cn("space-y-1", collapsed && !isMobile && "space-y-2")}
            >
              {menuItems
                .filter((item) => !item.disabled || !collapsed)
                .map((item, index) => {
                  // Add section divider for bottom nav items on mobile
                  const isFirstBottomNavItem =
                    isMobile &&
                    (item as any).isBottomNavItem &&
                    index > 0 &&
                    !(menuItems[index - 1] as any).isBottomNavItem;

                  return (
                    <div key={item.href}>
                      {isFirstBottomNavItem && (
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-3 mt-6">
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-2">
                            Account
                          </div>
                        </div>
                      )}
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95",
                            collapsed && !isMobile
                              ? "h-12 px-0 justify-center"
                              : isMobile
                              ? "justify-start px-4 h-12 text-base touch-manipulation"
                              : "justify-start px-4",
                            location.pathname === item.href &&
                              "bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800",
                            item.disabled && "opacity-60 cursor-not-allowed",
                            item.premium && "relative overflow-hidden"
                          )}
                          asChild={!item.disabled}
                          onClick={() => !item.disabled && handleNavigation()}
                        >
                          {item.disabled ? (
                            <div className="flex items-center">
                              <div
                                className={cn(
                                  "flex items-center",
                                  collapsed && !isMobile ? "justify-center" : ""
                                )}
                              >
                                {item.icon}
                                {(!collapsed || isMobile) && (
                                  <>
                                    <span className="ml-3 flex-1 text-left">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Link
                              to={item.href}
                              onClick={() => handleNavigation()}
                              className="flex items-center w-full"
                            >
                              <div
                                className={cn(
                                  "flex items-center w-full",
                                  collapsed && !isMobile ? "justify-center" : ""
                                )}
                              >
                                {item.icon}
                                {(!collapsed || isMobile) && (
                                  <>
                                    <span className="ml-3 flex-1 text-left">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </>
                                )}
                              </div>
                            </Link>
                          )}
                        </Button>

                        {/* Tooltip for collapsed state */}
                        {collapsed && !isMobile && (
                          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            {item.label}
                            {item.badge && (
                              <span className="ml-1 px-1 py-0.5 bg-gray-700 rounded text-xs">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </nav>
        </div>
      </ScrollArea>

      {/* Bottom Navigation - Desktop Only */}
      {!isMobile && (
        <div className="border-t bg-gray-50/50 dark:bg-gray-800/50">
          <div className="p-4">
            <nav className="space-y-1">
              {bottomNavItems.map((item) => (
                <div key={item.href} className="relative group">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95",
                      collapsed
                        ? "h-10 px-0 justify-center"
                        : "justify-start px-3 h-10",
                      location.pathname === item.href &&
                        "bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-900/20 dark:text-primary-300 dark:border-primary-800"
                    )}
                    asChild
                    onClick={() => handleNavigation()}
                  >
                    <Link
                      to={item.href}
                      onClick={() => handleNavigation()}
                      className="flex items-center w-full"
                    >
                      <div
                        className={cn(
                          "flex items-center",
                          collapsed ? "justify-center" : ""
                        )}
                      >
                        {item.icon}
                        {!collapsed && (
                          <span className="ml-3">{item.label}</span>
                        )}
                      </div>
                    </Link>
                  </Button>

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </aside>
  );
}
