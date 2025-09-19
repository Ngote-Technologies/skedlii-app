import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Loader2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Badge } from "../../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate, getSocialIcon } from "../../../lib/utils";
import { toast } from "../../../hooks/use-toast";
import { useAccessControl } from "../../../hooks/useAccessControl";

export function getScheduledPostListView(
  isFetchingScheduledPosts: boolean,
  scheduledItems: any[],
  cancelPost: (id: string) => void,
  handleDeletePost: (post: any) => void,
  navigate: any
) {
  const { hasValidSubscription } = useAccessControl();

  if (isFetchingScheduledPosts) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (scheduledItems.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          You haven't created any posts yet
        </p>
        <Button
          variant="link"
          className="mt-2"
          onClick={() => {
            if (!hasValidSubscription) {
              toast({
                variant: "destructive",
                title: "Upgrade your plan to manage collections.",
              });
            } else {
              navigate("/dashboard/post-flow");
            }
          }}
        >
          Create your first post
        </Button>
      </div>
    );
  }

  if (scheduledItems.length > 0) {
    return (
      <div className="space-y-4">
        {scheduledItems.map((post: any) => (
          <Card key={post._id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  {getStatusBadge(post.platforms[0].status)}
                  <CardTitle className="mt-2 text-base">
                    {post.content.length > 60
                      ? post.content.substring(0, 60) + "..."
                      : post.content ?? "No content"}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {post.platforms[0].status !== "published" && (
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/posts/${post._id}/edit`}>
                          <Edit size={14} className="mr-2" />
                          Edit Post
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {/* Cancel is allowed when there are pending targets and none are publishing */}
                    {Array.isArray(post.platforms) &&
                      post.platforms.some((p: any) => p?.status === "pending") &&
                      !post.platforms.some((p: any) => p?.status === "publishing") && (
                        <DropdownMenuItem onClick={() => cancelPost(String(post._id))}>
                          <CheckCircle size={14} className="mr-2" />
                          Cancel Post
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      disabled={Array.isArray(post.platforms) && post.platforms.some((p: any) => p?.status === "pending" || p?.status === "publishing")}
                      onClick={() => handleDeletePost(post)}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                {post.scheduledFor && (
                  <p className="flex items-center">
                    <Clock size={14} className="mr-1.5" />
                    {formatDate(post.scheduledFor, "PPP 'at' p")}
                  </p>
                )}
                {post.platforms[0].publishedAt && (
                  <p className="flex items-center">
                    <CheckCircle size={14} className="mr-1.5" />
                    Published:{" "}
                    {formatDate(post.platforms[0].publishedAt, "PPP 'at' p")}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-1 border-t pt-2 bg-muted/30">
              {post.platforms?.map((platform: any) => {
                const name = (platform.platformName || platform.platform || "").toString().toLowerCase();
                return (
                <div
                  key={platform.accountId}
                  className="text-xs bg-muted px-2 py-1 rounded-full flex items-center"
                >
                  <i className={`${getSocialIcon(name)} mr-1`}></i>
                  <span className="capitalize">{name || platform.platformId}</span>
                </div>
              );})}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  return null;
}

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 w-fit"
          icon={<FileText size={12} />}
        >
          Draft
        </Badge>
      );
    case "published":
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 w-fit"
          icon={<CheckCircle size={12} />}
        >
          Published
        </Badge>
      );
    case "scheduled":
    case "pending": // backend initial state
      return (
        <Badge
          variant="default"
          className="flex items-center gap-1 w-fit"
          icon={<Clock size={12} />}
        >
          Scheduled
        </Badge>
      );
    case "publishing": // backend while job runs
      return (
        <Badge
          variant="info"
          className="flex items-center gap-1 w-fit"
          icon={<Loader2 size={12} className="animate-spin" />}
        >
          Publishing
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="destructive"
          className="flex items-center gap-1 w-fit"
          icon={<AlertCircle size={12} />}
        >
          Failed
        </Badge>
      );
    case "canceled":
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 w-fit"
          icon={<Clock size={12} />}
        >
          Canceled
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="flex items-center gap-1 w-fit"
          icon={<FileText size={12} />}
        >
          {status}
        </Badge>
      );
  }
};
