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
  TrendingUp,
  TrendingDown,
  Eye,
  Clock,
  CheckCircle2,
  Sparkles,
  Calendar,
  Zap,
  Target,
} from "lucide-react";
import {
  formatDate,
  getClassName,
  getSocialIcon,
  getTextColor,
} from "../../lib/utils";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useAuth } from "../../store/hooks";
import { useQuery } from "@tanstack/react-query";
import { Badge, StatusBadge, BadgeGroup } from "../ui/badge";
import { DashboardStatsSkeleton } from "../ui/skeleton";
import { useAccessControl } from "../../hooks/useAccessControl";
import { toast } from "../../hooks/use-toast";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, authLoading } = useAuth();
  const { hasValidSubscription } = useAccessControl();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["/dashboard/summary"],
    enabled: isAuthenticated,
    staleTime: 10_000,
  }) as { data: any; isLoading: boolean };

  // Lightweight lists for UI sections (keep one counts call; lists are small)
  // Small lists for previews
  const { data: recentPostsResp } = useQuery({
    queryKey: ["/social-posts?limit=3"],
    enabled: isAuthenticated,
    staleTime: 10_000,
  }) as { data: { items: any[] } };

  const upcomingFrom = useMemo(() => new Date().toISOString(), []);
  const { data: upcomingResp } = useQuery({
    // Use v2 scheduled-posts with active scheduled filter and time window
    queryKey: [
      `/scheduled-posts?mode=scheduled&status=pending&from=${encodeURIComponent(
        upcomingFrom
      )}&limit=3&order=scheduledAsc`,
    ],
    enabled: isAuthenticated,
    staleTime: 10_000,
  }) as { data: { items: any[] } };

  const { data: socialAccountsResp = { items: [] } } = useQuery({
    queryKey: [`/social-accounts/${user?._id}`],
    enabled: isAuthenticated,
    staleTime: 10_000,
  }) as { data: { items: any[] } };

  const recentPosts = recentPostsResp?.items || [];
  const recentScheduledPosts = (upcomingResp?.items || []).slice(0, 3);
  const socialAccounts = socialAccountsResp?.items || [];

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

  const getFooter = (loading: boolean, count: number, status: string) => {
    if (loading) return "Loading...";
    if (count > 0) return status;
    return "No posts yet";
  };

  return (
    <main className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {!hasValidSubscription && (
          <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                    Unlock Your Creative Potential
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    You're on the free plan. Upgrade to access advanced
                    scheduling, analytics, and team features.
                  </p>
                </div>
              </div>
              <Button
                asChild
                variant="gradient"
                className="shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link to="/dashboard/billing">
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
            <div className="relative flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                      Welcome Back {user?.name || ""}!
                    </h2>
                    <p className="text-muted-foreground">
                      Ready to create amazing content today? ✨
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                <Button
                  onClick={() => navigate("/dashboard/post-flow")}
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300 group"
                  disabled={!hasValidSubscription}
                >
                  <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                  Create Post
                </Button>
                <Button
                  onClick={() => navigate("/dashboard/scheduled")}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  View Schedule
                </Button>
              </div>
            </div>
          </div>

          {summaryLoading ? (
            <DashboardStatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  label: "Total Posts",
                  value: summary?.counts?.posts?.total ?? 0,
                  icon: <Activity className="h-6 w-6" />,
                  color: "bg-blue-500",
                  gradient: "from-blue-500 to-cyan-500",
                  footer: getFooter(
                    summaryLoading,
                    summary?.counts?.posts?.total ?? 0,
                    "Published content"
                  ),
                  to: "/dashboard/posts",
                  trend: "+12%",
                  trendUp: true,
                },
                {
                  label: "Scheduled Posts",
                  value: summary?.counts?.posts?.scheduled ?? 0,
                  icon: <CalendarClock className="h-6 w-6" />,
                  color: "bg-primary-600",
                  gradient: "from-primary-600 to-primary-700",
                  footer: getFooter(
                    summaryLoading,
                    summary?.counts?.posts?.scheduled ?? 0,
                    "Ready to publish"
                  ),
                  to: "/dashboard/scheduled",
                  trend: "+8%",
                  trendUp: true,
                },
                {
                  label: "Social Accounts",
                  value: summary?.counts?.socialAccounts ?? 0,
                  icon: <Users className="h-6 w-6" />,
                  color: "bg-green-500",
                  gradient: "from-green-500 to-emerald-500",
                  footer: getFooter(
                    summaryLoading,
                    summary?.counts?.socialAccounts ?? 0,
                    "Connected platforms"
                  ),
                  to: "/dashboard/accounts",
                  trend: "2 new",
                  trendUp: true,
                },
                {
                  label: "Collections",
                  value: summary?.counts?.collections ?? 0,
                  icon: <FolderPlus className="h-6 w-6" />,
                  color: "bg-orange-500",
                  gradient: "from-orange-500 to-red-500",
                  footer: getFooter(
                    summaryLoading,
                    summary?.counts?.collections ?? 0,
                    "Organized content"
                  ),
                  to: "/dashboard/collections",
                  trend: "+3",
                  trendUp: true,
                },
              ].map(
                ({
                  label,
                  value,
                  icon,
                  gradient,
                  footer,
                  to,
                  trend,
                  trendUp,
                }) => {
                  return (
                    <Link to={to} key={label} className="group">
                      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group-hover:scale-[1.02] group-hover:-translate-y-1 group-active:scale-[0.98]">
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                        ></div>

                        <CardContent className="relative p-4 sm:p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-sm group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                            >
                              <div className="text-white group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                                {icon}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              {trendUp ? (
                                <TrendingUp className="h-4 w-4 text-green-500" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-red-500" />
                              )}
                              <span
                                className={`font-medium ${
                                  trendUp
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }`}
                              >
                                {trend}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {label}
                            </p>
                            <div className="flex items-baseline space-x-2">
                              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {value ?? (
                                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                )}
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {footer}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                }
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="lg:col-span-2 border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-primary" />
                      <span>Quick Actions</span>
                    </CardTitle>
                    <CardDescription>
                      Jump to your most used features
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    {
                      label: "Create Post",
                      icon: (
                        <Plus className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                      ),
                      description: "New content",
                      color: "hover:bg-blue-50 dark:hover:bg-blue-900/20",
                      onClick: () => {
                        if (!hasValidSubscription) {
                          toast.warning({
                            title: "Upgrade Required",
                            description:
                              "Upgrade your plan to start creating and scheduling content.",
                          });
                        } else {
                          navigate("/dashboard/post-flow");
                        }
                      },
                    },
                    {
                      label: "Schedule",
                      icon: (
                        <CalendarClock className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                      ),
                      description: "Plan ahead",
                      color: "hover:bg-primary-50 dark:hover:bg-primary-900/20",
                      onClick: () => navigate("/dashboard/scheduled"),
                    },
                    {
                      label: "Analytics",
                      icon: (
                        <BarChart2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                      ),
                      description: "View stats",
                      color: "hover:bg-green-50 dark:hover:bg-green-900/20",
                      onClick: () => navigate("/dashboard/analytics"),
                    },
                    {
                      label: "Accounts",
                      icon: (
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                      ),
                      description: "Manage links",
                      color: "hover:bg-orange-50 dark:hover:bg-orange-900/20",
                      onClick: () => navigate("/dashboard/accounts"),
                    },
                  ].map(({ label, icon, description, color, onClick }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      className={`group p-4 sm:p-6 rounded-xl sm:rounded-2xl transition-all duration-200 text-center border border-gray-100 dark:border-gray-800 ${color} hover:shadow-md hover:scale-105 active:scale-95 min-h-[100px] sm:min-h-[120px] flex flex-col items-center justify-center gap-2 sm:gap-3`}
                    >
                      {icon}
                      <div className="flex flex-col items-center gap-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                          {label}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-tight">
                          {description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Today's Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">Posts Published</span>
                  </div>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    3
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Scheduled</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {summary?.counts?.posts?.scheduled ?? 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <div className="flex items-center space-x-3">
                    <Eye className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                    <span className="text-sm font-medium">Views Today</span>
                  </div>
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    1.2k
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent">Recent Posts</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              {hasValidSubscription && (
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

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="flex items-center space-x-2 mb-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Connected Accounts</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your linked social media platforms
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard/accounts")}
                  className="hover:bg-primary-50 dark:hover:bg-primary-900/20 self-start sm:self-auto"
                >
                  Manage All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {socialAccounts.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {socialAccounts.slice(0, 6).map((account: any) => (
                      <div
                        key={account._id}
                        className="group p-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="relative flex-shrink-0">
                            {account.metadata?.profileImageUrl ||
                            account.metadata?.picture ||
                            account.metadata?.profile
                              ?.threads_profile_picture_url ? (
                              <img
                                src={
                                  account.metadata.profileImageUrl ??
                                  account.metadata.picture ??
                                  account.metadata.profile
                                    .threads_profile_picture_url
                                }
                                alt={`${account.accountName} profile`}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className={`w-12 h-12 flex items-center justify-center rounded-full ${getClassName(
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
                            {/* Status indicator positioned better */}
                            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-white dark:border-gray-800"></div>
                          </div>
                          <div className="flex-1 min-w-0 py-1">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                                {account.accountName ?? "Unknown Account"}
                              </h3>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
                              {account.platform}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {socialAccounts.length > 6 && (
                    <div className="text-center pt-2">
                      <Button
                        variant="link"
                        onClick={() => navigate("/dashboard/accounts")}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        View {socialAccounts.length - 6} more account
                        {socialAccounts.length - 6 > 1 ? "s" : ""}
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    No accounts connected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    Connect your social media accounts to start posting
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard/accounts")}
                    variant="gradient"
                    className="shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Connect Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
