import { useEffect, useState } from "react";
import { useToast } from "../../hooks/use-toast";
import {
  formatDate,
  getClassName,
  getSocialIcon,
  getTextColor,
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
import { Badge } from "../ui/badge";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../store/hooks";
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
  useConnectFacebook,
  useConnectTikTok,
  useConnectYoutube,
  useDeleteAccount,
  useRefreshTwitterAccessToken,
  useRefreshYoutubeAccessToken,
  useRefreshTikTokAccessToken,
  useGetSocialAccounts,
  useConnectMeta,
} from "../../hooks/useSocialAccounts";
import PlatformSelector from "./PlatformSelector";
import { hasValidSubscription } from "../../lib/access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// const socialAccountSchema = z.object({
//   platform: z.string().min(1, "Select One Platform"),
//   instagramAccountType: z.string().min(1, "Select One Platform"),
// });

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

export default function SocialAccounts() {
  const { user } = useAuth();
  const { billing } = user;
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({
    id: "",
    isOpen: false,
    platform: "",
  });
  const { toast } = useToast();

  const { mutate: connectLinkedIn, isPending: isConnectingLinkedInPending } =
    useConnectLinkedIn();
  const { mutate: connectTwitter, isPending: isConnectingTwitterPending } =
    useConnectTwitter();
  const { mutate: connectThreads, isPending: isConnectingThreadsPending } =
    useConnectThreads();
  const { mutate: connectInstagram, isPending: isConnectingInstagramPending } =
    useConnectInstagram();
  const { mutate: connectFacebook, isPending: isConnectingFacebookPending } =
    useConnectFacebook();
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
  const {
    data: accounts = [],
    isPending: isAccountsLoading,
    refetch: refetchAccounts,
  } = useGetSocialAccounts(user?._id);

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
        connectFacebook();
        break;
      case "tiktok":
        connectTikTok();
        break;
      case "youtube":
        connectYoutube();
        break;
      default:
        toast({
          title: "Connection failed",
          description: "Failed to connect social account",
          variant: "destructive",
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
    isConnectingFacebookPending ||
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
        toast({
          title: "Social account connected",
          description: "Your social account has been connected successfully",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
        return;
      }

      // Legacy: ?error=someType
      if (searchParams.get("error")) {
        const message = searchParams.get("message");
        // OAuth error will be displayed in the toast below
        toast({
          title: "Social account connection failed",
          description: message ?? "Failed to connect social account",
          variant: "destructive",
        });
        window.history.replaceState({}, "", "/dashboard/accounts");
        return;
      }

      // Instagram Graph-style: ?status=failed&message=...
      if (searchParams.get("status") === "failed") {
        const decodedMessage = decodeURIComponent(
          searchParams.get("message") ?? ""
        );
        toast({
          title: "Social account connection failed",
          description: decodedMessage ?? "Something went wrong",
          variant: "destructive",
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
        refreshYoutubeAccessToken(account._id, {
          onSuccess: () => {
            refetchAccounts();
          },
        });
        break;
      default:
        toast({
          title: "Reauthorization failed",
          description: "Failed to reauthorize social account",
          variant: "destructive",
        });
        break;
    }
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
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {accounts.length} connected account
              {accounts.length !== 1 ? "s" : ""}
            </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account: any) => {
              const imageSrc = getImageSrc(account);
              return (
                <Card
                  key={account._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {imageSrc ? (
                          <img
                            src={imageSrc}
                            alt={`${account.accountName} profile`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div
                            className={`p-2 rounded-lg ${getClassName(
                              account.platform
                            )}`}
                          >
                            <i
                              className={`${getSocialIcon(
                                account.platform
                              )} text-xl ${getTextColor(account.platform)}`}
                            />
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base font-medium">
                            {account.accountName ?? "Unknown Account"}
                          </CardTitle>
                          <CardDescription className="capitalize">
                            {account.platform}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant={
                          account.status === "active"
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center gap-1"
                      >
                        {account.status === "active" ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="capitalize">
                          {account.status.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                        ID: {account.accountId?.substring(0, 8)}...
                      </span>
                    </div>
                    {account.tokenExpiry && (
                      <div className="flex items-center text-xs text-muted-foreground mt-2">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          Expires: {formatDate(account.tokenExpiry, "PPP pp")}
                        </span>
                      </div>
                    )}
                    {(account.connectedAt || account.createdAt) && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          Connected:{" "}
                          {formatDate(
                            account.connectedAt ?? account.createdAt ?? ""
                          )}
                        </span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2 pt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {account.status === "expired" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isLoading}
                              onClick={() => handleReauthorize(account)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Reauthorize
                            </Button>
                          )}
                        </TooltipTrigger>
                        <TooltipContent>
                          {account.status !== "active" &&
                            "This account needs reauthorization"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setDeleteConfig({
                                id: account._id,
                                isOpen: true,
                                platform: account.platform,
                              })
                            }
                            disabled={isDeletingPending}
                          >
                            {isDeletingPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Disconnect account</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
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
      {accounts.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-[60vh]">
          <div className="rounded-full bg-primary/10 p-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No accounts connected</h3>
          <p className="text-muted-foreground text-center max-w-md">
            You haven't created any accounts yet. Connect your first account to
            get started.
          </p>
          <Button
            onClick={() => setIsAddingAccount(true)}
            disabled={!hasValidSubscription(billing?.paymentStatus)}
          >
            <Plus size={16} className="mr-2" />
            Connect Account
          </Button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Social Accounts
            </h2>
            <p className="text-muted-foreground">
              Manage your connected social media accounts and their permissions
            </p>
          </div>
          <Button
            onClick={() => setIsAddingAccount(true)}
            className="w-full sm:w-auto"
            disabled={!hasValidSubscription(billing?.paymentStatus)}
          >
            <Plus size={16} className="mr-2" />
            Connect Account
          </Button>
        </div>
      )}

      {handleAccountsView()}

      <Dialog open={isAddingAccount} onOpenChange={setIsAddingAccount}>
        <DialogContent onClose={() => form.reset()} isLoading={isLoading}>
          <DialogHeader>
            <DialogTitle>Connect Social Account</DialogTitle>
            <DialogDescription>
              Enter the details to connect your social media account
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <DialogFooter>
                <div className="flex gap-2">
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
                  {/* {form.watch("platform") === "instagram" && (
                    <Select
                      disabled={isLoading}
                      value={form.watch("instagramAccountType")}
                      onValueChange={(value) => {
                        form.setValue("instagramAccountType", value);
                      }}
                    >
                      <SelectTrigger className="bg-primary text-primary-foreground">
                        <SelectValue placeholder="Connect Account" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">
                          Instagram Login
                        </SelectItem>
                        <SelectItem value="facebook">Facebook Login</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {form.watch("platform") !== "instagram" && (
                    <Button
                      type="submit"
                      disabled={isLoading || !form.watch("platform")}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Connect Account
                    </Button>
                  )} */}

                  {form.watch("platform") === "instagram" ? (
                    <div className="flex gap-2 items-center">
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
                          <SelectItem value="instagram">
                            Instagram Login
                          </SelectItem>
                          <SelectItem value="facebook">
                            Facebook Login
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="submit"
                        disabled={
                          isLoading ||
                          !form.watch("platform") ||
                          !form.watch("instagramAccountType")
                        }
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Connect Account
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isLoading || !form.watch("platform")}
                    >
                      {isLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Connect Account
                    </Button>
                  )}
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
