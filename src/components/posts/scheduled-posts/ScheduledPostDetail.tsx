import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  RotateCcw,
  StopCircle,
} from "lucide-react";

import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { ScrollArea } from "../../ui/scroll-area";
import { Separator } from "../../ui/separator";

import { useToast } from "../../../hooks/use-toast";
import { apiRequest } from "../../../lib/queryClient";
import { formatDate } from "../../../lib/utils";
import {
  ScheduledPlatformDetail,
  ScheduledPostDetailPayload,
  ScheduledPostRecord,
  SocialPostSummary,
  useScheduledPostDetail,
} from "../../../hooks/useScheduledPostDetail";
import { getStatusBadge } from "./listView";

type CancelResponse = {
  jobResults?: Array<{ removed?: boolean }>;
};

type RetryResponse = {
  jobs?: Array<unknown>;
};

type SocialPostDetailRecord = SocialPostSummary & {
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

const emptyPayload: ScheduledPostDetailPayload = {
  scheduledPost: null,
  platforms: [],
  socialPosts: [],
  operations: {},
};

const toTitleCase = (value?: string) => {
  if (!value) return "";
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMaybeDate = (value?: string) => (value ? formatDate(value) : "—");

const ScheduledPostDetail = () => {
  const { scheduledId } = useParams<{ scheduledId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data = emptyPayload,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useScheduledPostDetail(scheduledId);

  const scheduledRecord = data.scheduledPost as ScheduledPostRecord | null;
  const platformList = data.platforms as ScheduledPlatformDetail[];
  const socialPostList = data.socialPosts as SocialPostDetailRecord[];

  const cancelMutation = useMutation<CancelResponse>({
    mutationFn: async () => {
      if (!scheduledId) {
        throw new Error("Scheduled post id is required");
      }
      return apiRequest<CancelResponse>(
        "POST",
        `/scheduled-posts/${scheduledId}/cancel`
      );
    },
    onSuccess: (res) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/scheduled-posts"] });
      queryClient.invalidateQueries({
        queryKey: ["/scheduled-posts?mode=scheduled"],
      });
      const removedCount = Array.isArray(res?.jobResults)
        ? res.jobResults.filter((job) => job?.removed).length
        : undefined;
      toast({
        title: "Scheduled post canceled",
        description:
          removedCount !== undefined
            ? `Removed ${removedCount} pending job${
                removedCount === 1 ? "" : "s"
              }.`
            : "Pending targets canceled successfully.",
      });
    },
    onError: (err) => {
      const description =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : "";
      toast({
        title: "Cancel failed",
        description: description || "Unable to cancel this scheduled post.",
        variant: "destructive",
      });
    },
  });

  const retryMutation = useMutation<RetryResponse>({
    mutationFn: async () => {
      if (!scheduledId) {
        throw new Error("Scheduled post id is required");
      }
      return apiRequest<RetryResponse>(
        "POST",
        `/scheduled-posts/${scheduledId}/retry-failed`
      );
    },
    onSuccess: (res) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["/scheduled-posts"] });
      toast({
        title: "Retry queued",
        description: Array.isArray(res?.jobs)
          ? `Restarted ${res.jobs.length} failed target${
              res.jobs.length === 1 ? "" : "s"
            }.`
          : "Failed platforms are being retried.",
      });
    },
    onError: (err) => {
      const description =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : "";
      toast({
        title: "Retry failed",
        description: description || "Unable to retry failed platforms.",
        variant: "destructive",
      });
    },
  });

  const platformGroups = useMemo(() => {
    const grouped: Record<string, ScheduledPlatformDetail[]> = {};
    platformList.forEach((plat) => {
      const status = (plat?.status || "unknown").toLowerCase();
      if (!grouped[status]) grouped[status] = [];
      grouped[status].push(plat);
    });
    return grouped;
  }, [platformList]);

  if (!scheduledId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Scheduled post not found</CardTitle>
            <CardDescription>
              No scheduled post identifier was provided.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading scheduled post...
        </span>
      </div>
    );
  }

  if (isError || !scheduledRecord) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load scheduled post</CardTitle>
            <CardDescription>
              {(error as Error)?.message ||
                "We couldn't find the requested scheduled post."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const headerStatus =
    scheduledRecord.status || platformList[0]?.status || "pending";
  const canCancel = Boolean(data.operations?.canCancel);
  const canRetry = Boolean(data.operations?.canRetry);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">
              Scheduled Post Overview
            </h1>
            <Badge variant="outline" className="uppercase">
              {headerStatus}
            </Badge>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Scheduled for {formatMaybeDate(scheduledRecord.scheduledFor)} •
            Created {formatMaybeDate(scheduledRecord.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="secondary"
            onClick={() => retryMutation.mutate()}
            disabled={!canRetry || retryMutation.isPending}
          >
            {retryMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Retry failed
          </Button>
          <Button
            variant="destructive"
            onClick={() => cancelMutation.mutate()}
            disabled={!canCancel || cancelMutation.isPending}
          >
            {cancelMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <StopCircle className="mr-2 h-4 w-4" />
            )}
            Cancel
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
            <CardDescription>
              Core metadata for this scheduled post.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Content</p>
              <ScrollArea className="max-h-40 rounded border p-3">
                <p className="whitespace-pre-wrap leading-6">
                  {scheduledRecord.content || "No content"}
                </p>
              </ScrollArea>
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase text-muted-foreground">Mode</p>
                <p className="font-medium">
                  {toTitleCase(scheduledRecord.mode) || "Scheduled"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Edit Policy
                </p>
                <p className="font-medium">
                  {scheduledRecord.editPolicy || "cancel_and_recreate"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Draft Reference
                </p>
                {scheduledRecord.sourceDraftId ? (
                  <Link
                    to={`/dashboard/drafts/${scheduledRecord.sourceDraftId}`}
                    className="text-primary hover:underline"
                  >
                    View draft
                  </Link>
                ) : (
                  <p className="font-medium text-muted-foreground">None</p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Media Type
                </p>
                <p className="font-medium">
                  {toTitleCase(scheduledRecord.mediaType) || "Text"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publishing Summary</CardTitle>
            <CardDescription>
              Targets grouped by their current status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {Object.keys(platformGroups).length === 0 ? (
              <p className="text-muted-foreground">
                No platform targets found.
              </p>
            ) : (
              Object.entries(platformGroups).map(([status, items]) => (
                <div key={status} className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(status)}
                    <span className="text-xs text-muted-foreground">
                      {items.length} target{items.length === 1 ? "" : "s"}
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {items.map((item, index) => (
                      <li
                        key={`${item.accountId ?? "account"}-${
                          item.platform ?? index
                        }`}
                        className="border rounded p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">
                              {item.accountName || item.accountId || "Unknown"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {item.platform ? item.platform.toUpperCase() : ""}
                            </p>
                          </div>
                          <div className="text-right text-xs text-muted-foreground space-y-1">
                            {item.startedAt && (
                              <p>Started: {formatMaybeDate(item.startedAt)}</p>
                            )}
                            {item.publishedAt && (
                              <p>
                                Published: {formatMaybeDate(item.publishedAt)}
                              </p>
                            )}
                            {item.lastError && (
                              <p className="text-destructive">
                                Error: {item.lastError}
                              </p>
                            )}
                          </div>
                        </div>
                        {item.queueJob && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Queue state: {item.queueJob.state || "unknown"}
                            {typeof item.queueJob.attemptsMade === "number" &&
                              typeof item.queueJob.attempts === "number" && (
                                <>
                                  {" "}
                                  • Attempts {item.queueJob.attemptsMade}/
                                  {item.queueJob.attempts}
                                </>
                              )}
                          </p>
                        )}
                        {item.socialPost?._id && (
                          <div className="mt-2">
                            <Link
                              to={`/dashboard/posts/${item.socialPost._id}`}
                              className="text-xs text-primary hover:underline"
                            >
                              View published result
                            </Link>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Targets</CardTitle>
          <CardDescription>
            Detailed breakdown of every platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Caption</TableHead>
                <TableHead>Published</TableHead>
                <TableHead>Last Error</TableHead>
                <TableHead>Queue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platformList.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground"
                  >
                    No platform data available.
                  </TableCell>
                </TableRow>
              ) : (
                platformList.map((plat, index) => (
                  <TableRow
                    key={`${plat.accountId ?? "account"}-${
                      plat.platform ?? index
                    }`}
                  >
                    <TableCell className="font-medium">
                      {toTitleCase(plat.platform) || "—"}
                    </TableCell>
                    <TableCell>
                      {plat.accountName || plat.accountId || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {plat.status || "unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <ScrollArea className="h-16">
                        <p className="text-sm whitespace-pre-wrap">
                          {plat.captionUsed ||
                            plat.caption ||
                            scheduledRecord.content ||
                            "—"}
                        </p>
                      </ScrollArea>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatMaybeDate(plat.publishedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-destructive">
                      {plat.lastError || ""}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {plat.queueJob?.state
                        ? `${plat.queueJob.state} (${
                            plat.queueJob.attemptsMade ?? 0
                          }/${plat.queueJob.attempts ?? 0})`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Published Results</CardTitle>
          <CardDescription>
            Posts created from this schedule. Click to open individual records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {socialPostList.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published results yet.
            </p>
          ) : (
            <div className="space-y-3">
              {socialPostList.map((post, index) => (
                <div
                  key={post._id ?? `result-${index}`}
                  className="border rounded-lg p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {toTitleCase(post.metadata?.platform) || "Post"}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Published {formatMaybeDate(post.publishedDate)}
                      </span>
                    </div>
                    {post._id && (
                      <Link
                        to={`/dashboard/posts/${post._id}`}
                        className="text-sm text-primary hover:underline"
                      >
                        View detail
                      </Link>
                    )}
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-6">
                    {post.metadata?.caption || post.content || "No caption"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledPostDetail;
