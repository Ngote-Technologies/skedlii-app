import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import {
  CalendarClock,
  BarChart2,
  Users,
  FolderPlus,
  Plus,
  Activity,
} from "lucide-react";
import {
  formatDate,
  getClassName,
  getSocialIcon,
  getTextColor,
} from "../../lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../../store/hooks";
import { useQuery } from "@tanstack/react-query";
import { Badge, StatusBadge, BadgeGroup } from "../ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { getStatusBadge } from "../posts/scheduled-posts/listView";
import { hasValidSubscription } from "../../lib/access";
import { toast } from "../../hooks/use-toast";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAuth();
  const { billing } = user;

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: [`/social-posts/${user?._id}`],
    enabled: isAuthenticated,
  }) as { data: { data: any[] }; isLoading: boolean };

  const { data: socialAccounts = [], isLoading: socialAccountsLoading } =
    useQuery({
      queryKey: [`/social-accounts/${user?._id}`],
      enabled: isAuthenticated,
    }) as { data: any[]; isLoading: boolean };

  const {
    data: collections = { count: 0, data: [] },
    isLoading: collectionsLoading,
  } = useQuery({
    queryKey: ["/collections"],
    enabled: isAuthenticated,
  }) as { data: { count: number; data: any[] }; isLoading: boolean };

  const { data: scheduledPosts, isLoading: scheduledPostsLoading } = useQuery({
    queryKey: ["/scheduled-posts"],
    enabled: isAuthenticated,
  }) as { data: { data: any[] }; isLoading: boolean };

  const recentPosts = posts?.data?.slice(0, 3);
  const recentScheduledPosts = scheduledPosts?.data?.slice(0, 3);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  function getPostStatus(post: any) {
    if (post.status === "published" || post.status === "posted") {
      return `${formatDate(post.publishedDate ?? post.postedAt, "PPPpp")}`;
    } else if (post.status === "scheduled") {
      return `${formatDate(post.scheduleTime, "PPPpp")}`;
    } else {
      return `Draft • Created on ${formatDate(
        post.createdAt ?? new Date(),
        "PPPpp"
      )}`;
    }
  }

  const renderSocialAccountIconArea = (account: any) => {
    return (
      <div className="flex items-center gap-3" key={account._id}>
        {account.metadata?.profileImageUrl ||
        account.metadata?.picture ||
        account.metadata?.profile?.threads_profile_picture_url ? (
          <img
            src={
              account.metadata.profileImageUrl ??
              account.metadata.picture ??
              account.metadata.profile.threads_profile_picture_url
            }
            alt={`${account.accountName} profile`}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className={`p-2 rounded-lg ${getClassName(account.platform)}`}>
            <i
              className={`${getSocialIcon(
                account.platform
              )} text-xl ${getTextColor(account.platform)}`}
            />
          </div>
        )}
        <div className="flex flex-col">
          <CardTitle className="text-base font-medium">
            {account.accountName ?? "Unknown Account"}
          </CardTitle>
          <CardDescription className="capitalize">
            {account.platform}
          </CardDescription>
        </div>
      </div>
    );
  };

  const getFooter = (loading: boolean, count: number, status: string) => {
    if (loading) return "Loading...";
    if (count > 0) return status;
    return "No posts yet";
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {!hasValidSubscription(billing?.paymentStatus) && (
          <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 text-sm text-center rounded-md mb-4">
            You're currently on a limited plan.{" "}
            <Link to="/dashboard/billing" className="underline font-semibold">
              Upgrade now to unlock full features.
            </Link>
          </div>
        )}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground text-sm">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ""} 👋
              </p>
            </div>
            <Button
              onClick={() => navigate("/dashboard/post-flow")}
              className="w-full sm:w-auto"
              disabled={!hasValidSubscription(billing?.paymentStatus)}
            >
              <Plus size={16} className="mr-2" />
              Create Post
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "Total Posts",
                value: posts?.data?.length ?? 0,
                icon: <Activity size={20} className="text-primary" />,
                footer: getFooter(
                  postsLoading,
                  posts?.data?.length ?? 0,
                  "Active"
                ),
                to: "/dashboard/posts",
              },
              {
                label: "Scheduled Posts",
                value: scheduledPosts?.data?.length ?? 0,
                icon: <CalendarClock size={20} className="text-primary" />,
                footer: getFooter(
                  scheduledPostsLoading,
                  scheduledPosts?.data?.length ?? 0,
                  "Upcoming posts"
                ),
                to: "/dashboard/scheduled",
              },
              {
                label: "Connected Accounts",
                value: socialAccounts?.length ?? 0,
                icon: <Users size={20} className="text-primary" />,
                footer: getFooter(
                  socialAccountsLoading,
                  socialAccounts?.length ?? 0,
                  "Social profiles"
                ),
                to: "/dashboard/accounts",
              },
              {
                label: "Collections",
                value: collections?.count ?? 0,
                icon: <FolderPlus size={20} className="text-primary" />,
                footer: getFooter(
                  collectionsLoading,
                  collections?.count ?? 0,
                  "Content organization"
                ),
                to: "/dashboard/collections",
              },
            ].map(({ label, value, icon, footer, to }) => {
              if (!hasValidSubscription(billing?.paymentStatus)) {
                return null;
              }
              return (
                <Link to={to} key={label}>
                  <Card variant="elevated" interactive>
                    <CardHeader className="pb-1 flex flex-row items-center justify-between space-y-0">
                      <CardDescription className="text-sm font-medium">
                        {label}
                      </CardDescription>
                      {icon}
                    </CardHeader>
                    <CardContent className="pt-1">
                      <div className="text-4xl font-bold text-foreground">
                        {value ?? (
                          <div className="h-8 w-12 bg-muted rounded animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {footer}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Posts</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              {hasValidSubscription(billing?.paymentStatus) && (
                <TabsTrigger value="insights">Insights</TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Recent Posts</CardTitle>
                  <CardDescription>
                    Your most recent content across platforms
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentPosts?.map((post: any) => {
                    const status = post.status ?? "published";
                    const content =
                      post.content?.length > 100
                        ? post.content.substring(0, 100) + "..."
                        : post.content;

                    return (
                      <div
                        key={post._id}
                        className="border-b pb-4 last:border-none flex flex-col gap-2 mb-4"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium text-base text-foreground">
                              {content}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{getPostStatus(post)}</span>
                              <BadgeGroup spacing="tight">
                                <StatusBadge
                                  status={
                                    status === "published" ||
                                    status === "posted"
                                      ? "published"
                                      : status === "scheduled"
                                      ? "pending"
                                      : "draft"
                                  }
                                  size="sm"
                                />
                                <Badge
                                  variant="outline"
                                  size="sm"
                                  className="capitalize"
                                >
                                  {post.platform}
                                </Badge>
                              </BadgeGroup>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() => navigate(`/dashboard/posts`)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upcoming">
              <Card variant="gradient">
                <CardHeader>
                  <CardTitle>Upcoming Posts</CardTitle>
                  <CardDescription>Your scheduled content</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentScheduledPosts?.map((post: any) => {
                    const scheduledDate = post.scheduledFor
                      ? formatDate(post.scheduledFor, "PPP 'at' p")
                      : "—";
                    const status = post.platforms?.[0]?.status ?? "pending";

                    return (
                      <div
                        key={post._id}
                        className="flex flex-col gap-2 border-b pb-4 mb-4 last:border-none"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col">
                            <p className="text-base font-medium text-foreground">
                              {post.content.length > 100
                                ? post.content.substring(0, 100) + "..."
                                : post.content}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                              <CalendarClock size={14} className="mr-1" />
                              <span>Scheduled for {scheduledDate}</span>
                              {/* {getStatusBadge(status)} */}
                              <StatusBadge
                                status={
                                  status === "published" || status === "posted"
                                    ? "published"
                                    : status === "scheduled"
                                    ? "pending"
                                    : "draft"
                                }
                                size="sm"
                              />
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="self-start"
                            onClick={() =>
                              navigate(
                                `/dashboard/scheduled?date=${
                                  new Date(post.scheduledFor)
                                    .toISOString()
                                    .split("T")[0]
                                }`
                              )
                            }
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <Card variant="premium">
                <CardHeader>
                  <CardTitle>Content Insights</CardTitle>
                  <CardDescription>
                    Performance metrics for your social media content
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex flex-col items-center justify-center py-10">
                  <div className="animate-pulse mb-6">
                    <BarChart2 size={48} className="text-muted-foreground" />
                  </div>
                  <h4 className="text-lg font-semibold">
                    Skedlii Insights Engine
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your analytics are almost ready — just fine-tuning the
                    magic.
                  </p>
                  <span className="text-xs text-muted-foreground mt-4 px-3 py-1 bg-muted rounded-full">
                    Launching soon · v1
                  </span>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <CardDescription>Frequently used tools</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      label: "Create Post",
                      icon: <Plus className="h-5 w-5 mb-1 text-primary" />,
                      onClick: () => {
                        if (!hasValidSubscription(billing?.paymentStatus)) {
                          toast({
                            variant: "destructive",
                            title: "Upgrade your plan to post content.",
                          });
                        } else {
                          navigate("/dashboard/post-flow");
                        }
                      },
                    },
                    {
                      label: "View Schedule",
                      icon: (
                        <CalendarClock className="h-5 w-5 mb-1 text-primary" />
                      ),
                      onClick: () => {
                        if (!hasValidSubscription(billing?.paymentStatus)) {
                          toast({
                            variant: "destructive",
                            title: "Upgrade your plan to view scheduled posts.",
                          });
                        } else {
                          navigate("/dashboard/scheduled");
                        }
                      },
                    },
                    {
                      label: "Manage Accounts",
                      icon: <Users className="h-5 w-5 mb-1 text-primary" />,
                      onClick: () => {
                        if (!hasValidSubscription(billing?.paymentStatus)) {
                          toast({
                            variant: "destructive",
                            title: "Upgrade your plan to manage accounts.",
                          });
                        } else {
                          navigate("/dashboard/accounts");
                        }
                      },
                    },
                    {
                      label: "Collections",
                      icon: (
                        <FolderPlus className="h-5 w-5 mb-1 text-primary" />
                      ),
                      onClick: () => {
                        if (!hasValidSubscription(billing?.paymentStatus)) {
                          toast({
                            variant: "destructive",
                            title: "Upgrade your plan to manage collections.",
                          });
                        } else {
                          navigate("/dashboard/collections");
                        }
                      },
                    },
                  ].map(({ label, icon, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className="rounded-2xl bg-muted/60 hover:bg-muted shadow-sm transition-all py-5 px-4 flex flex-col items-center text-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      {icon}
                      <span className="text-sm font-medium text-foreground">
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
                <CardDescription>Your social media platforms</CardDescription>
              </CardHeader>
              <CardContent>
                {socialAccounts.length > 0 ? (
                  <div className="space-y-3">
                    {socialAccounts
                      .slice(0, 3)
                      .map((account: any) =>
                        renderSocialAccountIconArea(account)
                      )}

                    {socialAccounts.length > 3 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center -space-x-2 pl-1">
                          {socialAccounts.slice(3, 6).map((account: any) => (
                            <TooltipProvider key={account._id}>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div
                                    className="w-8 h-8 cursor-pointer rounded-full bg-muted flex items-center justify-center border-2 border-background"
                                    title={account.accountName}
                                  >
                                    <i
                                      className={`${getSocialIcon(
                                        account.platform
                                      )} text-xl ${getTextColor(
                                        account.platform
                                      )}`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{account.accountName}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                          {socialAccounts.length > 6 && (
                            <Link
                              to="/dashboard/accounts"
                              className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center border-2 border-background"
                            >
                              +{socialAccounts.length - 6}
                            </Link>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate("/dashboard/accounts")}
                          className="text-xs text-muted-foreground"
                        >
                          Manage
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      No accounts connected
                    </p>
                    <Button
                      variant="link"
                      onClick={() => navigate("/dashboard/accounts")}
                      className="mt-2"
                    >
                      Connect an account
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
