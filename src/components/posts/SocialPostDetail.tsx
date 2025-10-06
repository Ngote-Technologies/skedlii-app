import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ExternalLink,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

import { useToast } from "../../hooks/use-toast";
import { apiRequest } from "../../lib/queryClient";
import { formatDate, getSocialIcon } from "../../lib/utils";
import {
  AccountSummary,
  DraftSummary,
  ScheduledPostSummary,
  useSocialPostDetail,
} from "../../hooks/useSocialPostDetail";

type SocialPostRecord = {
  _id?: string;
  status?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
  mediaUrls?: string[];
  postUrl?: string;
  platform?: string;
  postId?: string;
  userId?: string;
  metadata?: {
    platform?: string;
    caption?: string;
    postUrl?: string;
    url?: string;
    mode?: string;
    externalPostId?: string;
  };
};

const toSentence = (value?: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatMaybeDate = (value?: string) => (value ? formatDate(value) : "—");

const SocialPostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useSocialPostDetail(postId);

  const socialRecord = (data?.socialPost ?? null) as SocialPostRecord | null;
  const account = data?.account as AccountSummary | undefined;
  const scheduledPost = data?.scheduledPost as ScheduledPostSummary | undefined;
  const draft = data?.draft as DraftSummary | undefined;
  const canDelete = Boolean(data?.operations?.canDelete);

  const deleteMutation = useMutation<void>({
    mutationFn: async () => {
      if (!postId) {
        throw new Error("Post id is required");
      }
      await apiRequest<unknown>("DELETE", `/social-posts/${postId}`);
    },
    onSuccess: () => {
      toast({
        title: "Post deleted",
        description: "The social post has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/social-posts"] });
      navigate(-1);
    },
    onError: (err) => {
      const description =
        typeof err === "object" && err && "message" in err
          ? String((err as { message?: unknown }).message ?? "")
          : "";
      toast({
        title: "Delete failed",
        description: description || "Unable to delete this post.",
        variant: "destructive",
      });
    },
  });

  if (!postId) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Post not found</CardTitle>
            <CardDescription>No post identifier was provided.</CardDescription>
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
          Loading post...
        </span>
      </div>
    );
  }

  if (isError || !socialRecord) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load post</CardTitle>
            <CardDescription>
              {(error as Error)?.message ||
                "We couldn't find this social post."}
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

  const platformName =
    socialRecord.metadata?.platform || socialRecord.platform || "";
  const platformLabel = toSentence(platformName);
  const iconClass = getSocialIcon(platformName.toLowerCase());
  const mediaUrls = Array.isArray(socialRecord.mediaUrls)
    ? socialRecord.mediaUrls
    : [];
  const postUrl =
    socialRecord.postUrl ||
    socialRecord.metadata?.postUrl ||
    socialRecord.metadata?.url;

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
              {platformLabel || "Social Post"}
            </h1>
            <Badge variant="outline" className="uppercase">
              {socialRecord.status || "published"}
            </Badge>
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Published{" "}
            {formatMaybeDate(
              socialRecord.publishedDate || socialRecord.updatedAt
            )}{" "}
            • Created {formatMaybeDate(socialRecord.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={!canDelete || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Content</CardTitle>
            <CardDescription>Caption captured at publish time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {iconClass && <i className={`${iconClass} text-base`}></i>}
              <span>{platformLabel || "Platform"}</span>
              {postUrl && (
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  View on platform <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <ScrollArea className="max-h-60 border rounded p-3 text-sm leading-6">
              <p className="whitespace-pre-wrap">
                {socialRecord.metadata?.caption ||
                  socialRecord.content ||
                  "No content"}
              </p>
            </ScrollArea>
            {mediaUrls.length > 0 && (
              <div className="space-y-2 text-sm">
                <p className="text-xs uppercase text-muted-foreground">Media</p>
                <ul className="space-y-1">
                  {mediaUrls.map((url) => (
                    <li
                      key={url}
                      className="flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{url}</span>
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Open
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
            <CardDescription>Linked resources and metadata.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-sm">
            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Account</p>
              {account ? (
                <div className="border rounded-lg p-3">
                  <p className="font-medium">
                    {account.accountName ||
                      account.accountId ||
                      "Unknown account"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {toSentence(account.platform)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last connected {formatMaybeDate(account.lastConnectedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Account not available.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">
                Scheduled post
              </p>
              {scheduledPost?._id ? (
                <Link
                  to={`/dashboard/scheduled/${scheduledPost._id}`}
                  className="text-primary hover:underline"
                >
                  View scheduled workflow
                </Link>
              ) : (
                <p className="text-muted-foreground">No schedule reference.</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-xs uppercase text-muted-foreground">Draft</p>
              {draft?._id ? (
                <Link
                  to={`/dashboard/drafts/${draft._id}`}
                  className="text-primary hover:underline"
                >
                  View originating draft
                </Link>
              ) : (
                <p className="text-muted-foreground">No draft reference.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>
            Raw payload details stored for this publish.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                Publish Mode
              </p>
              <p className="font-medium">
                {socialRecord.metadata?.mode ||
                  socialRecord.status ||
                  "scheduled"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                External Post ID
              </p>
              <p className="font-medium">
                {socialRecord.postId ||
                  socialRecord.metadata?.externalPostId ||
                  "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Team</p>
              <p className="font-medium">
                {draft?.currentRevision ? "Assigned" : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">User</p>
              <p className="font-medium">{socialRecord.userId || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPostDetail;
