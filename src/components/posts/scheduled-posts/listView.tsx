import { CheckCircle, Clock, Edit, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate } from "../../../lib/utils";
import { toast } from "../../../hooks/use-toast";
import { useAccessControl } from "../../../hooks/useAccessControl";
import {
  PlatformStatusPill,
  getAggregatePostStatus,
  getStatusBadge,
  hasActiveTarget,
  hasPendingTarget,
  hasPublishingTarget,
} from "./statusUtils";

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
        {scheduledItems.map((post: any) => {
          const platforms = Array.isArray(post.platforms) ? post.platforms : [];
          const aggregateStatus = getAggregatePostStatus(platforms);
          const canEdit = hasPendingTarget(platforms);
          const canCancel = hasPendingTarget(platforms) && !hasPublishingTarget(platforms);
          const canDelete = !hasActiveTarget(platforms);
          const content = post.content || "No content";

          return (
            <Card key={post._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    {getStatusBadge(aggregateStatus)}
                    <CardTitle className="mt-2 text-base">
                      {content.length > 60 ? `${content.substring(0, 60)}...` : content}
                    </CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/dashboard/scheduled/${post._id}`}>
                          <Clock size={14} className="mr-2" />
                          View details
                        </Link>
                      </DropdownMenuItem>
                      {canEdit && (
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/posts/${post._id}/edit`}>
                            <Edit size={14} className="mr-2" />
                            Edit Post
                          </Link>
                        </DropdownMenuItem>
                      )}
                      {canCancel && (
                        <DropdownMenuItem onClick={() => cancelPost(String(post._id))}>
                          <CheckCircle size={14} className="mr-2" />
                          Cancel Post
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={!canDelete}
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
                  {aggregateStatus === "partial" && (
                    <p className="flex items-center">
                      <CheckCircle size={14} className="mr-1.5" />
                      Some platforms need attention
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-1.5 border-t pt-2 bg-muted/30">
                <div className="flex flex-wrap gap-1.5">
                  {platforms.map((platform: any, index: number) => (
                    <PlatformStatusPill
                      key={platform.accountId || `${platform.platformName || platform.platform}-${index}`}
                      platform={platform}
                      scheduledFor={post.scheduledFor}
                    />
                  ))}
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }
  return null;
}
