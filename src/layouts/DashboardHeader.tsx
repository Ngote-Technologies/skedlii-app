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
  Bell,
  ChevronRight,
  Sparkles,
  Calendar,
  Settings,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { useMobileMenuStore } from "../store/layout";
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet";
import DashboardSidebar from "./DashboardSidebar";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "../components/ui/badge";
import NotificationBadge from "../components/ui/notification-badge";
import { useDynamicBreadcrumbs } from "../hooks/useDynamicBreadcrumbs";
import {
  CompactOrganizationSwitcher,
  CreateOrganizationDialog,
} from "../components/organization";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { getApiClient, useV2Api } from "../api/axios";

export default function DashboardHeader() {
  const {
    user,
    organization,
    logout,
    canManageBilling,
    fetchUserData,
    refreshPermissions,
    canCreateTeams,
  } = useAuth();
  const { canConnectSocialAccounts } = useAccessControl();
  const canUseV2 = useV2Api("auth");
  const location = useLocation();
  const [isCreateOrgDialogOpen, setIsCreateOrgDialogOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const [orgSetupOpen, setOrgSetupOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [isSavingOrg, setIsSavingOrg] = useState(false);

  // Determine if we should prompt for org setup: collaboration-capable plan and missing name
  const shouldPromptOrgSetup = useMemo(() => {
    const hasOrgId = !!(organization?._id || user?.defaultOrganizationId);
    const missingName = !organization?.name;
    // Only owners can set the org profile via the lightweight endpoint
    const isOwner = (organization as any)?.role === "owner";
    // Gate by collaboration-capable plans (Team/Enterprise/Trial)
    return hasOrgId && missingName && isOwner && !!canCreateTeams;
  }, [organization, user?.defaultOrganizationId, canCreateTeams]);

  useEffect(() => {
    if (shouldPromptOrgSetup) {
      setOrgSetupOpen(true);
    }
  }, [shouldPromptOrgSetup]);

  const saveOrganizationProfile = async () => {
    if (!orgName?.trim()) return;
    const orgId =
      (organization?._id as string) || (user?.defaultOrganizationId as string);
    if (!orgId) return;
    setIsSavingOrg(true);
    try {
      const api = getApiClient(canUseV2 ? "v2" : undefined);
      await api.patch(`/organizations/${orgId}/profile`, {
        name: orgName.trim(),
      });
      await fetchUserData();
      setOrgSetupOpen(false);
      toast.success({
        title: "Organization updated",
        description: "Name saved successfully.",
      });
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Failed to update organization";
      toast.error({ title: "Update failed", description: msg });
    } finally {
      setIsSavingOrg(false);
    }
  };

  const mobileMenuOpen = useMobileMenuStore(
    (state: any) => state.mobileMenuOpen
  );
  const setMobileMenuOpen = useMobileMenuStore(
    (state: any) => state.setMobileMenuOpen
  );

  // Generate breadcrumbs using dynamic system
  const breadcrumbs = useDynamicBreadcrumbs(location.pathname);

  // Handle sync functionality
  const handleSync = async () => {
    if (isSyncing) return; // Prevent multiple simultaneous syncs

    setIsSyncing(true);
    try {
      // Single source of truth: use store action which updates state internally
      const activeOrgId = user?.defaultOrganizationId;
      await refreshPermissions(activeOrgId);

      toast.success({
        title: "Data Synced",
        description: "Your account data has been refreshed successfully.",
      });
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error({
        title: "Sync Failed",
        description: "Failed to refresh your data. Please try again.",
      });
    } finally {
      setIsSyncing(false);
    }
  };

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

        {/* Right Section - Actions & Profile */}
        <div className="flex items-center space-x-3">
          {/* Organization Switcher */}
          <CompactOrganizationSwitcher
            className="flex"
            onCreateOrganization={() => setIsCreateOrgDialogOpen(true)}
          />

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 hidden sm:flex"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <NotificationBadge count={3} variant="count" size="md" />
          </Button>

          {/* Sync Button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleSync}
            disabled={isSyncing}
            aria-label="Sync data"
            title="Refresh account data"
          >
            <RefreshCw
              className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
            />
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
                        ? "Team Plan"
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

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={isCreateOrgDialogOpen}
        onOpenChange={setIsCreateOrgDialogOpen}
      />

      {/* Organization Setup Prompt (inline) */}
      {orgSetupOpen && (
        <div className="border-t bg-amber-50 dark:bg-amber-950/40 px-4 lg:px-6 py-3 flex items-center gap-3">
          <div className="text-amber-800 dark:text-amber-200 text-sm flex-1">
            <span className="font-medium">Set up your organization</span>
            <span className="ml-2 opacity-90">
              Give your workspace a name to get started.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Organization name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-56"
            />
            <Button
              size="sm"
              onClick={saveOrganizationProfile}
              disabled={!orgName?.trim() || isSavingOrg}
            >
              {isSavingOrg ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOrgSetupOpen(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Debug Component */}
    </header>
  );
}
