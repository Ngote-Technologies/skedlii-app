import { Button } from "../components/ui/button";
import { ThemeToggle } from "../components/ui/theme-toggle";
import { useAuth } from "../store/hooks";
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
import { getInitials, cn } from "../lib/utils";
import {
  Menu,
  Search,
  Bell,
  ChevronRight,
  Home,
  Sparkles,
  Calendar,
  Settings,
  HelpCircle,
  Plus,
} from "lucide-react";
import { useMobileMenuStore } from "../store/layout";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import DashboardSidebar from "./DashboardSidebar";
import { Input } from "../components/ui/input";
import { useState, useMemo } from "react";
import { Badge } from "../components/ui/badge";

export default function DashboardHeader() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const mobileMenuOpen = useMobileMenuStore(
    (state: any) => state.mobileMenuOpen
  );
  const setMobileMenuOpen = useMobileMenuStore(
    (state: any) => state.setMobileMenuOpen
  );

  // Generate breadcrumbs from current path
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const crumbs = [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: <Home className="w-4 h-4" />,
      },
    ];

    if (pathSegments.length > 1) {
      const current = pathSegments[pathSegments.length - 1];
      const breadcrumbMap: Record<
        string,
        { label: string; icon?: JSX.Element }
      > = {
        accounts: {
          label: "Social Accounts",
          icon: <Settings className="w-4 h-4" />,
        },
        scheduled: {
          label: "Scheduled Posts",
          icon: <Calendar className="w-4 h-4" />,
        },
        posts: {
          label: "Published Posts",
          icon: <Calendar className="w-4 h-4" />,
        },
        "post-flow": {
          label: "Create Post",
          icon: <Plus className="w-4 h-4" />,
        },
        collections: { label: "Collections" },
        teams: { label: "Team Management" },
        analytics: { label: "Analytics" },
        settings: { label: "Settings", icon: <Settings className="w-4 h-4" /> },
        billing: { label: "Billing" },
        help: {
          label: "Help & Support",
          icon: <HelpCircle className="w-4 h-4" />,
        },
      };

      const currentInfo = breadcrumbMap[current];
      if (currentInfo) {
        crumbs.push({
          label: currentInfo.label,
          href: location.pathname,
          icon: currentInfo.icon!,
        });
      }
    }

    return crumbs;
  }, [location.pathname]);

  return (
    <header className="h-16 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 sticky top-0 z-50 shadow-sm">
      <div className="h-full flex items-center px-4 lg:px-6">
        {/* Left Section - Logo & Breadcrumbs */}
        <div className="flex items-center flex-1 min-w-0">
          {/* Logo - Always visible */}
          <Link to="/dashboard" className="flex items-center space-x-2 mr-6">
            <div className="text-primary-600 text-xl font-bold flex items-center dark:text-primary-400">
              <Calendar className="mr-2 h-5 w-5" />
              <span className="font-heading hidden sm:block">Skedlii</span>
            </div>
          </Link>

          {/* Breadcrumbs - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <ChevronRight className="w-4 h-4 mx-2" />}
                {index === breadcrumbs.length - 1 ? (
                  <div className="flex items-center space-x-2 font-medium text-gray-900 dark:text-gray-100">
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </div>
                ) : (
                  <Link
                    to={crumb.href}
                    className="flex items-center space-x-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                  >
                    {crumb.icon}
                    <span>{crumb.label}</span>
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Center Section - Search */}
        <div className="hidden lg:flex flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search posts, accounts, or collections..."
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:focus:bg-gray-900"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hidden sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              3
            </Badge>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle variant="ghost" />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage
                    src={user?.avatar ?? ""}
                    alt={user?.firstName ?? ""}
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300">
                    {user?.firstName
                      ? getInitials(`${user.firstName} ${user.lastName || ""}`)
                      : user?.username?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="font-medium">
                    {user?.firstName
                      ? `${user.firstName} ${user.lastName || ""}`.trim()
                      : user?.username}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  {user?.billing?.paymentStatus && (
                    <Badge variant="outline" className="text-xs w-fit">
                      {user.billing.paymentStatus === "active"
                        ? "Pro Plan"
                        : "Free Plan"}
                    </Badge>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/accounts" className="cursor-pointer">
                  <Calendar className="mr-2 h-4 w-4" />
                  Social Accounts
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/dashboard/billing" className="cursor-pointer">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Upgrade Plan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard/help" className="cursor-pointer">
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

          {/* Mobile Menu */}
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
