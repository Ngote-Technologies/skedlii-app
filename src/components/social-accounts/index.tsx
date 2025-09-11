import { useEffect, useState, useMemo } from "react";
import { useToast } from "../../hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  formatDate,
  getClassName,
  getSocialIcon,
  getTextColor,
  platformCounts,
} from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Form, FormField } from "../ui/form";
import { Badge, StatusBadge } from "../ui/badge";
import {
  AlertCircle,
  Clock,
  Filter,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Activity,
  Users,
  BarChart3,
  ExternalLink,
  Settings,
  TrendingUp,
  Eye,
  Calendar,
  // Zap,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../store/hooks";
import { useAccessControl } from "../../hooks/useAccessControl";
// Organization context now handled through useAuth hook
import { teamsApi } from "../../api/teams";
import { Team } from "../../types";
import { Skeleton } from "../ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import DeleteDialog from "../dialog/DeleteDialog";
import {
  useConnectLinkedIn,
  useConnectTwitter,
  useConnectThreads,
  useConnectInstagram,
  useConnectTikTok,
  useConnectYoutube,
  useDeleteAccount,
  useRefreshTwitterAccessToken,
  useRefreshYoutubeAccessToken,
  useRefreshTikTokAccessToken,
  useGetSocialAccounts,
  useGetOrganizationSocialAccounts,
  useConnectMeta,
} from "../../hooks/useSocialAccounts";
import PlatformSelector from "./PlatformSelector";
// import { hasValidSubscription } from "../../lib/access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const socialAccountSchema = z
  .object({
    platform: z.string().min(1, "Select One Platform"),
    instagramAccountType: z.string().optional(),
  })
  .refine(
    (data) =>
      data.platform !== "instagram" ||
      (data.platform === "instagram" && data.instagramAccountType),
    {
      message: "Please select a login method for Instagram",
      path: ["instagramAccountType"],
    }
  );

type SocialAccountFormData = z.infer<typeof socialAccountSchema>;

// Team Assignment Dropdown Component
interface TeamAssignmentDropdownProps {
  currentTeamId?: string;
  availableTeams: Team[];
  onAssign: (teamId: string) => void;
  onUnassign: () => void;
  isLoading?: boolean;
}

function TeamAssignmentDropdown({
  currentTeamId,
  availableTeams,
  onAssign,
  onUnassign,
  isLoading = false,
}: TeamAssignmentDropdownProps) {
  const currentTeam = availableTeams.find((team) => team._id === currentTeamId);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Team:</span>
      </div>
      <Select
        value={currentTeamId || "unassigned"}
        onValueChange={(value) => {
          if (value === "unassigned") {
            onUnassign();
          } else {
            onAssign(value);
          }
        }}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[180px] h-8">
          <SelectValue placeholder="Select team">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs">Updating...</span>
              </div>
            ) : currentTeam ? (
              <span className="text-xs">{currentTeam.name}</span>
            ) : (
              <span className="text-xs text-muted-foreground">Unassigned</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">
            <span className="text-muted-foreground">Unassigned</span>
          </SelectItem>
          {availableTeams.map((team) => (
            <SelectItem key={team._id} value={team._id}>
              {team.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default function SocialAccounts() {
  const { user, organization } = useAuth();
  const { canConnectSocialAccounts, hasValidSubscription, canCreateTeams } =
    useAccessControl();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [deleteConfig, setDeleteConfig] = useState({
    id: "",
    isOpen: false,
    platform: "",
  });

  const { mutate: connectLinkedIn, isPending: isConnectingLinkedInPending } =
    useConnectLinkedIn();
  const { mutate: connectTwitter, isPending: isConnectingTwitterPending } =
    useConnectTwitter();
  const { mutate: connectThreads, isPending: isConnectingThreadsPending } =
    useConnectThreads();
  const { mutate: connectInstagram, isPending: isConnectingInstagramPending } =
    useConnectInstagram();
  const { mutate: connectMeta, isPending: isConnectingMetaPending } =
    useConnectMeta();
  const { mutate: connectTikTok, isPending: isConnectingTikTokPending } =
    useConnectTikTok();
  const { mutate: connectYoutube, isPending: isConnectingYoutubePending } =
    useConnectYoutube();
  const { mutate: deleteAccount, isPending: isDeletingPending } =
    useDeleteAccount();
  const {
    mutate: refreshTwitterAccessToken,
    isPending: isRefreshingTwitterPending,
  } = useRefreshTwitterAccessToken();
  const {
    mutate: refreshYoutubeAccessToken,
    isPending: isRefreshingYoutubePending,
  } = useRefreshYoutubeAccessToken();
  const {
    mutate: refreshTiktokAccessToken,
    isPending: isRefreshingTiktokPending,
  } = useRefreshTikTokAccessToken();
  // Determine whether to use individual or organization accounts
  const shouldUseOrganizationAccounts =
    organization && user?.userType === "organization";

  // Individual user accounts (only when not using organization accounts)
  const {
    data: individualAccountsData,
    isPending: isIndividualAccountsLoading,
    refetch: refetchIndividualAccounts,
  } = useGetSocialAccounts(shouldUseOrganizationAccounts ? "" : user?._id);
  const individualAccounts: any[] = individualAccountsData?.items ?? [];

  // Organization accounts (only when using organization accounts)
  const {
    data: organizationAccountsData,
    isPending: isOrganizationAccountsLoading,
    refetch: refetchOrganizationAccounts,
  } = useGetOrganizationSocialAccounts(
    shouldUseOrganizationAccounts ? organization?._id || "" : ""
  );
  const organizationAccounts: any[] = organizationAccountsData?.items ?? [];

  // Use the appropriate accounts and loading state
  const accounts: any[] = shouldUseOrganizationAccounts
    ? organizationAccounts
    : individualAccounts;
  const isAccountsLoading = shouldUseOrganizationAccounts
    ? isOrganizationAccountsLoading
    : isIndividualAccountsLoading;
  const refetchAccounts = shouldUseOrganizationAccounts
    ? refetchOrganizationAccounts
    : refetchIndividualAccounts;

  // Fetch organization teams for assignment functionality
  // const { data: organizationTeams = [] } = useQuery<Team[]>({
  //   queryKey: ["/teams", organization?._id],
  //   queryFn: () => {
  //     if (!organization) return Promise.resolve([]);
  //     return teamsApi.getTeams(organization._id);
  //   },
  //   enabled: Boolean(shouldUseOrganizationAccounts && organization),
  // });

  console.log({ accounts });

  // Team assignment mutations
  // const { mutate: assignToTeam, isPending: isAssigning } = useMutation({
  //   mutationFn: async ({
  //     teamId,
  //     accountId,
  //   }: {
  //     teamId: string;
  //     accountId: string;
  //   }) => {
  //     if (!organization) throw new Error("No active organization");
  //     return await teamsApi.assignSocialAccountToTeam(
  //       organization._id,
  //       teamId,
  //       accountId
  //     );
  //   },
  //   onSuccess: () => {
  //     // Invalidate both social accounts and teams queries to refresh data
  //     if (shouldUseOrganizationAccounts) {
  //       queryClient.invalidateQueries({
  //         queryKey: ["/social-accounts/organization", organization?._id],
  //       });
  //     } else {
  //       queryClient.invalidateQueries({ queryKey: ["/social-accounts"] });
  //     }
  //     queryClient.invalidateQueries({ queryKey: ["/teams"] });
  //     toast({
  //       title: "Account assigned",
  //       description:
  //         "Social account has been successfully assigned to the team.",
  //     });
  //   },
  //   onError: (error: any) => {
  //     toast({
  //       title: "Assignment failed",
  //       description:
  //         error.response?.data?.message || "Failed to assign account to team.",
  //       variant: "destructive",
  //     });
  //   },
  // });

  // const { mutate: unassignFromTeam, isPending: isUnassigning } = useMutation({
  //   mutationFn: async ({
  //     teamId,
  //     accountId,
  //   }: {
  //     teamId: string;
  //     accountId: string;
  //   }) => {
  //     if (!organization) throw new Error("No active organization");
  //     return await teamsApi.removeSocialAccountFromTeam(
  //       organization._id,
  //       teamId,
  //       accountId
  //     );
  //   },
  //   onSuccess: () => {
  //     // Invalidate both social accounts and teams queries to refresh data
  //     if (shouldUseOrganizationAccounts) {
  //       queryClient.invalidateQueries({
  //         queryKey: ["/social-accounts/organization", organization?._id],
  //       });
  //     } else {
  //       queryClient.invalidateQueries({ queryKey: ["/social-accounts"] });
  //     }
  //     queryClient.invalidateQueries({ queryKey: ["/teams"] });
  //     toast({
  //       title: "Account unassigned",
  //       description: "Social account has been removed from the team.",
  //     });
  //   },
  //   onError: (error: any) => {
  //     toast({
  //       title: "Unassignment failed",
  //       description:
  //         error.response?.data?.message ||
  //         "Failed to remove account from team.",
  //       variant: "destructive",
  //     });
  //   },
  // });

  // Get unique platforms and their counts
  const platformStats = useMemo(() => {
    const counts = platformCounts(accounts);
    const uniquePlatforms = Object.keys(counts).sort();
    return { counts, uniquePlatforms };
  }, [accounts]);

  // Filter accounts based on selected platforms
  const filteredAccounts = useMemo(() => {
    if (selectedPlatforms.length === 0) return accounts;
    return accounts.filter((account: any) =>
      selectedPlatforms.includes(account.platform.toLowerCase())
    );
  }, [accounts, selectedPlatforms]);

  const form = useForm<SocialAccountFormData>({
    resolver: zodResolver(socialAccountSchema),
    defaultValues: {
      platform: "",
      instagramAccountType: "",
    },
  });

  function onSubmit(data: SocialAccountFormData) {
    switch (data.platform) {
      case "twitter":
        connectTwitter();
        break;
      case "threads":
        connectThreads();
        break;
      case "linkedin":
        connectLinkedIn();
        break;
      case "instagram": {
        if (data.instagramAccountType === "facebook")
          connectMeta({
            platform: "instagram",
          });
        else connectInstagram();
        break;
      }
      case "facebook":
        // connectFacebook();
        connectMeta({
          platform: "facebook",
        });
        break;
      case "tiktok":
        connectTikTok();
        break;
      case "youtube":
        connectYoutube();
        break;
      default:
        toast.error({
          title: "Connection Failed",
          description: "Failed to connect social account.",
        });
        break;
    }
  }

  const isLoading =
    isConnectingTwitterPending ||
    isAccountsLoading ||
    isConnectingThreadsPending ||
    isConnectingLinkedInPending ||
    isConnectingInstagramPending ||
    isConnectingTikTokPending ||
    isConnectingYoutubePending ||
    isRefreshingTwitterPending ||
    isRefreshingYoutubePending ||
    isRefreshingTiktokPending ||
    isConnectingMetaPending;

  useEffect(() => {
    const fetchData = async () => {
      const searchParams = new URLSearchParams(window.location.search);

      // Legacy: ?success=true
      if (searchParams.get("success") === "true") {
        toast.success({
          title: "Social Account Connected",
          description: "Your social account has been connected successfully.",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
        return;
      }

      // Legacy: ?error=someType
      if (searchParams.get("error")) {
        const message = searchParams.get("message");
        // OAuth error will be displayed in the toast below
        toast.error({
          title: "Social Account Connection Failed",
          description: message ?? "Failed to connect social account.",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
        return;
      }

      // Instagram Graph-style: ?status=failed&message=...
      if (searchParams.get("status") === "failed") {
        const decodedMessage = decodeURIComponent(
          searchParams.get("message") ?? ""
        );
        toast.error({
          title: "Social Account Connection Failed",
          description: decodedMessage ?? "Something went wrong.",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
      }

      if (searchParams.get("status") === "success") {
        toast.success({
          title: "Social Account Connected",
          description: "Your social account has been connected successfully.",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
      }
    };

    fetchData();
  }, [location]);

  const getImageSrc = (account: any) => {
    if (account.metadata?.profileImageUrl) {
      return account.metadata.profileImageUrl;
    }
    if (account.metadata?.picture) {
      return account.metadata.picture;
    }
    if (account.metadata?.profile?.threads_profile_picture_url) {
      return account.metadata.profile.threads_profile_picture_url;
    }
    return "";
  };

  const handleReauthorize = (account: any) => {
    switch (account.platform) {
      case "twitter":
        refreshTwitterAccessToken(account._id, {
          onSuccess: () => {
            refetchAccounts();
          },
        });
        break;
      case "threads":
        connectThreads();
        break;
      case "linkedin":
        connectLinkedIn();
        break;
      case "instagram":
        connectInstagram();
        break;
      case "tiktok":
        refreshTiktokAccessToken(account.accountId, {
          onSuccess: () => {
            refetchAccounts();
          },
        });
        break;
      case "youtube":
        refreshYoutubeAccessToken(account.accountId, {
          onSuccess: () => {
            refetchAccounts();
          },
        });
        break;
      case "facebook":
        connectMeta({ platform: "facebook" });
        break;
      default:
        toast.error({
          title: "Reauthorization Failed",
          description: "Failed to reauthorize social account.",
        });
        break;
    }
  };

  // console.log({ platformStats });

  const togglePlatformFilter = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const clearAllFilters = () => {
    setSelectedPlatforms([]);
  };

  const handleAccountsView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SocialAccountSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (accounts.length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                {selectedPlatforms.length > 0
                  ? `${filteredAccounts.length} of ${accounts.length} account${
                      accounts.length !== 1 ? "s" : ""
                    } (filtered)`
                  : `${accounts.length} connected account${
                      accounts.length !== 1 ? "s" : ""
                    }`}
              </p>
              {selectedPlatforms.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear filters
                </Button>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAccounts()}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>

          {/* Enhanced Platform Filter Pills */}
          {platformStats?.uniquePlatforms?.length > 1 && (
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-4 border border-border/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
              <div className="relative flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Filter className="h-4 w-4 text-primary" />
                  </div>
                  <span>Filter by platform:</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {platformStats?.uniquePlatforms?.map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <Button
                        key={platform}
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => togglePlatformFilter(platform)}
                        className={`group relative overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0 shadow-md"
                            : "hover:border-primary/30 hover:bg-primary/5"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
                        )}
                        <div className="relative flex items-center gap-2">
                          <i
                            className={`${getSocialIcon(
                              platform
                            )} text-sm transition-colors ${
                              isSelected ? "text-white" : getTextColor(platform)
                            }`}
                          />
                          <span className="capitalize font-medium">
                            {platform}
                          </span>
                          <Badge
                            variant="secondary"
                            className={`ml-1 text-xs transition-colors ${
                              isSelected
                                ? "bg-white/20 text-white border-white/30"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {platformStats.counts[platform]}
                          </Badge>
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {selectedPlatforms.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account: any) => {
              const imageSrc = getImageSrc(account);
              return (
                <Card
                  key={account._id}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 border-border/50 bg-gradient-to-br from-background to-muted/30"
                >
                  {/* Animated Background Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <CardHeader className="relative pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {imageSrc ? (
                            <div className="relative">
                              <img
                                src={imageSrc}
                                alt={`${account.accountName} profile`}
                                className="h-12 w-12 rounded-full object-cover ring-2 ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-primary/50"
                              />
                            </div>
                          ) : (
                            <div
                              className={`relative h-12 w-12 rounded-full ${getClassName(
                                account.platform
                              )} ring-2 ring-offset-2 ring-offset-background transition-all duration-200 group-hover:ring-primary/50 group-hover:scale-105 flex items-center justify-center`}
                            >
                              <i
                                className={`${getSocialIcon(
                                  account.platform
                                )} text-xl ${getTextColor(account.platform)}`}
                              />
                            </div>
                          )}

                          {/* Health indicator dot */}
                          <div
                            className={`absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                              account.status === "active"
                                ? "bg-green-500"
                                : account.status === "expired"
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base font-semibold truncate group-hover:text-primary transition-colors">
                              {account.accountName ?? "Unknown Account"}
                            </CardTitle>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <CardDescription className="capitalize font-medium">
                              {account.platform}
                            </CardDescription>
                            {account.metadata?.followers_count && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Users className="h-3 w-3" />
                                <span>
                                  {account.metadata.followers_count.toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <StatusBadge
                          status={
                            account.status === "active"
                              ? "active"
                              : account.status === "expired"
                              ? "expired"
                              : "inactive"
                          }
                          size="sm"
                        />

                        {/* Quick action menu */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <Settings className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-3">
                    {/* Account Statistics */}
                    {(account.metadata?.followers_count ||
                      account.metadata?.following_count ||
                      account.metadata?.posts_count) && (
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/30 border border-border/50">
                        {account.metadata?.posts_count !== undefined && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                              <BarChart3 className="h-3 w-3" />
                              <span>Posts</span>
                            </div>
                            <div className="font-semibold text-sm">
                              {account.metadata.posts_count.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {account.metadata?.followers_count !== undefined && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                              <Users className="h-3 w-3" />
                              <span>Followers</span>
                            </div>
                            <div className="font-semibold text-sm">
                              {account.metadata.followers_count.toLocaleString()}
                            </div>
                          </div>
                        )}
                        {account.metadata?.following_count !== undefined && (
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-1">
                              <Eye className="h-3 w-3" />
                              <span>Following</span>
                            </div>
                            <div className="font-semibold text-sm">
                              {account.metadata.following_count.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Account Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Account ID
                        </span>
                        <span className="font-mono text-xs bg-muted/50 px-2 py-1 rounded border">
                          {account.accountId?.substring(0, 12)}...
                        </span>
                      </div>

                      {account.tokenExpiry && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Expires</span>
                          </div>
                          <span
                            className={`text-xs font-medium ${
                              new Date(account.tokenExpiry) <
                              new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {formatDate(account.tokenExpiry, "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}

                      {(account.connectedAt || account.createdAt) && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Connected</span>
                          </div>
                          <span className="text-xs font-medium text-green-600">
                            {formatDate(
                              account.connectedAt ?? account.createdAt ?? "",
                              "MMM dd, yyyy"
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Performance Indicators */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        <span>Health: </span>
                        <span
                          className={`font-medium ${
                            account.status === "active"
                              ? "text-green-600"
                              : account.status === "expired"
                              ? "text-orange-600"
                              : "text-red-600"
                          }`}
                        >
                          {account.status === "active"
                            ? "Excellent"
                            : account.status === "expired"
                            ? "Needs Attention"
                            : "Disconnected"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="relative flex flex-col gap-3 pt-3 border-t border-border/50">
                    {/* Team Assignment (Organization Mode Only) */}
                    {/* {shouldUseOrganizationAccounts && canCreateTeams && (
                      <TeamAssignmentDropdown
                        currentTeamId={account.teamId}
                        availableTeams={organizationTeams || []}
                        onAssign={(teamId) =>
                          assignToTeam({ teamId, accountId: account._id })
                        }
                        onUnassign={() =>
                          unassignFromTeam({
                            teamId: account.teamId,
                            accountId: account._id,
                          })
                        }
                        isLoading={isAssigning || isUnassigning}
                      />
                    )} */}

                    <div className="flex justify-between items-center">
                      {/* Quick Actions */}
                      <div className="flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <BarChart3 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>View Analytics</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-primary/10"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open Platform</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {account.status === "expired" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isLoading}
                                  onClick={() => handleReauthorize(account)}
                                  className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20 hover:border-orange-500/30 text-orange-600 hover:text-orange-700"
                                >
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Reauthorize
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>This account needs reauthorization</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setDeleteConfig({
                                    id: account._id,
                                    isOpen: true,
                                    platform: account.platform,
                                  })
                                }
                                disabled={isDeletingPending}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                              >
                                {isDeletingPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Disconnect account</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-6">
      {accounts?.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-[60vh]">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-lg animate-pulse" />
            <div className="relative rounded-full bg-gradient-to-r from-primary to-purple-500 p-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {canConnectSocialAccounts
              ? "No accounts connected"
              : "No team accounts available"}
          </h3>
          <p className="text-muted-foreground text-center max-w-md">
            {canConnectSocialAccounts
              ? "You haven't created any accounts yet. Connect your first account to get started."
              : "Your organization owners and admins haven't connected any social accounts yet, or you haven't been assigned to teams with social account access."}
          </p>
          {canConnectSocialAccounts ? (
            <Button
              onClick={() => setIsAddingAccount(true)}
              disabled={!hasValidSubscription}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus size={16} className="mr-2" />
              Connect Account
            </Button>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button disabled className="opacity-50">
                    <Plus size={16} className="mr-2" />
                    Connect Account
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Only organization owners and admins can connect social
                    accounts
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Enhanced Header with Statistics */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-6 backdrop-blur-sm border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
            <div className="relative flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                    Social Accounts
                  </h2>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                    <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-green-600">
                      {accounts?.length} Active
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  {canConnectSocialAccounts
                    ? "Manage your connected social media accounts and their permissions"
                    : "View social media accounts available through your team assignments"}
                </p>

                {!canConnectSocialAccounts &&
                  user?.userType === "organization" && (
                    <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm">
                      <div className="flex items-start gap-2">
                        <Users className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">
                            Team-based access:{" "}
                          </span>
                          Social accounts are connected by organization owners
                          and admins, then assigned to teams. You can access
                          accounts through teams you're a member of.
                        </div>
                      </div>
                    </div>
                  )}

                {/* Quick Stats */}
                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="font-medium">{accounts?.length}</span>
                    <span className="text-muted-foreground">Connected</span>
                  </div>
                  {/* <div className="flex items-center gap-2 text-sm">
                    <BarChart3 className="h-4 w-4 text-green-500" />
                    <span className="font-medium">
                      {
                        accounts.filter((acc: any) => acc.status === "active")
                          .length
                      }
                    </span>
                    <span className="text-muted-foreground">Active</span>
                  </div> */}
                  {/* <div className="flex items-center gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="font-medium">
                      {
                        accounts.filter((acc: any) => acc.status === "expired")
                          .length
                      }
                    </span>
                    <span className="text-muted-foreground">
                      Need Attention
                    </span>
                  </div> */}
                </div>
              </div>
              {canConnectSocialAccounts ? (
                <Button
                  onClick={() => setIsAddingAccount(true)}
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={!hasValidSubscription}
                >
                  <Plus size={16} className="mr-2" />
                  Connect Account
                </Button>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button disabled className="w-full sm:w-auto opacity-50">
                        <Plus size={16} className="mr-2" />
                        Connect Account
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Only organization owners and admins can connect social
                        accounts
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      )}

      {handleAccountsView()}

      <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
        <DialogContent
          onClose={() => form.reset()}
          isLoading={isLoading}
          className="max-h-[90vh]"
        >
          <DialogHeader>
            <DialogTitle>Connect Social Account</DialogTitle>
            <DialogDescription>
              Enter the details to connect your social media account
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="max-h-[60vh] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <PlatformSelector
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.platform?.message}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>

              <DialogFooter justify="between">
                <Button
                  variant="outline"
                  type="button"
                  disabled={isLoading}
                  onClick={() => {
                    setIsAddingAccount(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <div className="flex items-center gap-6">
                  {form.watch("platform") === "instagram" && (
                    <Select
                      disabled={isLoading}
                      value={form.watch("instagramAccountType")}
                      onValueChange={(value) => {
                        form.setValue("instagramAccountType", value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Login Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram" showIndicator>
                          Instagram Login
                        </SelectItem>
                        <SelectItem value="facebook" showIndicator>
                          Facebook Login
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Button
                    type="submit"
                    className="min-w-[140px]"
                    disabled={
                      isLoading ||
                      !form.watch("platform") ||
                      (form.watch("platform") === "instagram" &&
                        !form.watch("instagramAccountType"))
                    }
                  >
                    {isLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Connect Account
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        config={deleteConfig}
        setConfig={setDeleteConfig}
        handleDelete={() =>
          deleteAccount(deleteConfig, {
            onSuccess: () => {
              refetchAccounts();
              setDeleteConfig({
                id: "",
                isOpen: false,
                platform: "",
              });
            },
          })
        }
        message="Are you sure you want to delete this account?"
        title="Delete Account"
        loading={isDeletingPending}
      />
    </div>
  );
}

const SocialAccountSkeleton = () => (
  <Card>
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
        <Skeleton className="h-5 w-16" />
      </div>
    </CardHeader>
    <CardContent className="space-y-2">
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </CardContent>
    <CardFooter className="flex justify-end gap-2 pt-2">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-8 w-20" />
    </CardFooter>
  </Card>
);
