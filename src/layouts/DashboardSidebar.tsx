import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  CalendarCheck,
  Folder,
  Home,
  Link2,
  Users,
  Settings,
  CalendarSync,
  Plus,
  HelpCircle,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../store/hooks";
import { useMemo, useState } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { hasValidSubscription } from "../lib/access";
import { Badge } from "../components/ui/badge";

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
  const { isAdmin, user } = useAuth();
  const { billing } = user;

  const menuItems = useMemo(
    () => [
      {
        icon: <Home size={18} />,
        label: "Dashboard",
        href: "/dashboard",
        badge: null,
      },
      {
        icon: <Link2 size={18} />,
        label: "Social Accounts",
        href: "/dashboard/accounts",
        badge: null,
      },
      {
        icon: <CalendarCheck size={18} />,
        label: "Scheduled Posts",
        href: "/dashboard/scheduled",
        badge: null,
      },
      {
        icon: <CalendarSync size={18} />,
        label: "Published Posts",
        href: "/dashboard/posts",
        badge: null,
      },
      {
        icon: <Plus size={18} />,
        label: "Create Post",
        href: "/dashboard/post-flow",
        disabled: !hasValidSubscription(billing?.paymentStatus),
        badge: !hasValidSubscription(billing?.paymentStatus) ? "Pro" : null,
        premium: true,
      },
      {
        icon: <Folder size={18} />,
        label: "Collections",
        href: "/dashboard/collections",
        disabled: !hasValidSubscription(billing?.paymentStatus),
        badge: !hasValidSubscription(billing?.paymentStatus) ? "Pro" : null,
      },
      {
        icon: <Users size={18} />,
        label: "Team Management",
        href: "/dashboard/teams",
        disabled: user?.userType === "individual",
        badge: user?.userType === "individual" ? "Org" : null,
      },
      {
        icon: <BarChart3 size={18} />,
        label: "Analytics",
        href: "/dashboard/analytics",
        disabled: !hasValidSubscription(billing?.paymentStatus),
        badge: !hasValidSubscription(billing?.paymentStatus) ? "Pro" : null,
      },
    ],
    [isAdmin, billing, user?.userType]
  );

  const bottomNavItems = [
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      label: "Help & Support",
      href: "/dashboard/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  const handleNavigation = () => {
    console.log("handleNavigationClicked");
    if (closeMenu && isMobile) {
      closeMenu();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] border-r bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 z-40 transition-all duration-300 ease-in-out shadow-xl dark:shadow-gray-900/50",
        isMobile ? "relative w-full" : collapsed ? "w-20" : "w-64",
        "flex flex-col"
      )}
    >
      {/* Mobile Close Button */}
      {isMobile && (
        <div className="flex justify-between items-center p-4 border-b">
          <div className="text-primary-600 text-lg font-bold flex items-center dark:text-primary-400">
            <Sparkles className="mr-2 h-5 w-5" />
            <span className="font-heading">Menu</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => closeMenu?.()}
            className="relative hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      {!isMobile && (
        <div className="flex items-center justify-between p-4 border-b">
          {!collapsed && (
            <div className="text-primary-600 text-lg font-bold flex items-center dark:text-primary-400">
              <Sparkles className="mr-2 h-5 w-5" />
              <span className="font-heading">Skedlii</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            <span className="sr-only">Toggle sidebar</span>
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main CTA Button */}
          {(!collapsed || isMobile) && (
            <Button
              variant="gradient"
              onClick={() => {
                navigate("/dashboard/post-flow");
                handleNavigation();
              }}
              className="w-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
              disabled={!hasValidSubscription(billing?.paymentStatus)}
            >
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform duration-200" />
              Create Post
              {!hasValidSubscription(billing?.paymentStatus) && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Pro
                </Badge>
              )}
            </Button>
          )}

          {/* Collapsed CTA */}
          {collapsed && !isMobile && (
            <Button
              variant="gradient"
              size="icon"
              onClick={() => {
                navigate("/dashboard/post-flow");
                handleNavigation();
              }}
              className="w-full h-12 shadow-lg hover:shadow-xl transition-all duration-300 group"
              disabled={!hasValidSubscription(billing?.paymentStatus)}
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="sr-only">Create Post</span>
            </Button>
          )}

          {/* Main Navigation */}
          <nav className="space-y-2">
            <div className={cn("space-y-1", collapsed && !isMobile && "space-y-2")}>
              {menuItems
                .filter((item) => !item.disabled || !collapsed)
                .map((item) => (
                <div key={item.href} className="relative group">
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                      collapsed && !isMobile
                        ? "h-12 px-0 justify-center"
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
                        <div className={cn("flex items-center", collapsed && !isMobile ? "justify-center" : "")}>
                          {item.icon}
                          {(!collapsed || isMobile) && (
                            <>
                              <span className="ml-3 flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <Badge variant="outline" className="text-xs">
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
                        <div className={cn("flex items-center w-full", collapsed && !isMobile ? "justify-center" : "")}>
                          {item.icon}
                          {(!collapsed || isMobile) && (
                            <>
                              <span className="ml-3 flex-1 text-left">{item.label}</span>
                              {item.badge && (
                                <Badge variant="outline" className="text-xs">
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
              ))}
            </div>
          </nav>
        </div>
      </ScrollArea>

      {/* Bottom Navigation */}
      <div className="border-t bg-gray-50/50 dark:bg-gray-800/50">
        <div className="p-4">
          <nav className="space-y-1">
            {bottomNavItems.map((item) => (
              <div key={item.href} className="relative group">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800",
                    collapsed && !isMobile
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
                    <div className={cn("flex items-center", collapsed && !isMobile ? "justify-center" : "")}>
                      {item.icon}
                      {(!collapsed || isMobile) && (
                        <span className="ml-3">{item.label}</span>
                      )}
                    </div>
                  </Link>
                </Button>

                {/* Tooltip for collapsed state */}
                {collapsed && !isMobile && (
                  <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>
    </aside>
  );
}
