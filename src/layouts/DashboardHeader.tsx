import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useAuth } from "../store/hooks";
import { useAccessControl } from "../hooks/useAccessControl";
import { Link, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { getInitials } from "../lib/utils";
import {
  Menu,
  ChevronRight,
  Sparkles,
  Calendar,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useMobileMenuStore } from "../store/layout";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import DashboardSidebar from "./DashboardSidebar";
import { Badge } from "../components/ui/badge";
import { useDynamicBreadcrumbs } from "../hooks/useDynamicBreadcrumbs";

export default function DashboardHeader() {
  const { user, logout, canManageBilling, subscriptionInfo } = useAuth();
  const { canConnectSocialAccounts, hasValidSubscription } = useAccessControl();
  const location = useLocation();

  const mobileMenuOpen = useMobileMenuStore(
    (state: any) => state.mobileMenuOpen
  );
  const setMobileMenuOpen = useMobileMenuStore(
    (state: any) => state.setMobileMenuOpen
  );

  const breadcrumbs = useDynamicBreadcrumbs(location.pathname);

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50 shadow-sm">
      <div className="h-full flex items-center px-4 lg:px-6">
        <div className="flex items-center flex-1 min-w-0">
          <Link to="/dashboard" className="flex items-center space-x-2 mr-6">
            <div className="text-primary-600 text-xl font-bold flex items-center dark:text-primary-400">
              <Calendar className="mr-2 h-5 w-5" />
              <span className="font-heading hidden sm:block">Skedlii</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <div
                key={crumb.href || `breadcrumb-${index}`}
                className="flex items-center"
              >
                {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                {index === breadcrumbs.length - 1 ? (
                  <div className="flex items-center space-x-2 font-medium text-gray-900 dark:text-gray-100">
                    {crumb.icon}
                    <span
                      className={
                        crumb.isLoading
                          ? "animate-pulse text-gray-500"
                          : "max-w-[200px] truncate"
                      }
                      title={crumb.fullLabel || crumb.label}
                    >
                      {crumb.label}
                    </span>
                  </div>
                ) : crumb.href ? (
                  <Link
                    to={crumb.href}
                    className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                    title={crumb.fullLabel || crumb.label}
                  >
                    {crumb.icon}
                    <span className="max-w-[150px] truncate">
                      {crumb.label}
                    </span>
                  </Link>
                ) : (
                  <div
                    className="flex items-center space-x-1 text-gray-500"
                    title={crumb.fullLabel || crumb.label}
                  >
                    {crumb.icon}
                    <span className="max-w-[150px] truncate">
                      {crumb.label}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <ThemeToggle variant="ghost" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.avatar ?? ""}
                    alt={user?.name ?? ""}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {user?.name
                      ? getInitials(`${user.name}`)
                      : user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">
                    {user?.name ? `${user.name}` : user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="outline" className="text-xs w-fit capitalize">
                    {subscriptionInfo?.subscriptionTier || "Free "} Plan
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              {canConnectSocialAccounts && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/accounts" className="cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Social Accounts
                  </Link>
                </DropdownMenuItem>
              )}
              {canManageBilling && (
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/billing" className="cursor-pointer">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Upgrade Plan
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/help" className="cursor-pointer">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help & Support
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="text-red-600 dark:text-red-400 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-9 w-9"
                aria-label="Open sidebar"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 w-[280px] z-50">
              <DashboardSidebar
                closeMenu={() => setMobileMenuOpen(false)}
                isMobile={mobileMenuOpen}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
