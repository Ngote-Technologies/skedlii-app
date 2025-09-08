import {
  CheckCircle,
  Clock,
  Edit,
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
import { getStatusBadge } from "./listView";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { formatDate, getSocialIcon } from "../../../lib/utils";
import { toast } from "../../../hooks/use-toast";
import { useAccessControl } from "../../../hooks/useAccessControl";

export function getScheduledPostCalendarView({
  isFetchingScheduledPosts,
  postsByDate = [],
  updatePostStatus,
  handleDeletePost,
  navigate,
}: any) {
  const { hasValidSubscription } = useAccessControl();

  if (isFetchingScheduledPosts) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (postsByDate.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">
          No posts scheduled for this date
        </p>
        <Button
          variant="link"
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
          className="mt-2"
        >
          Create a post
        </Button>
      </div>
    );
  }

  if (postsByDate.length > 0) {
    return (
      <div className="space-y-4">
        {postsByDate.map((post: any) => (
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
                    <DropdownMenuItem asChild>
                      <Link to={`/dashboard/posts/${post._id}/edit`}>
                        <Edit size={14} className="mr-2" />
                        Edit Post
                      </Link>
                    </DropdownMenuItem>
                    {post.status === "scheduled" && (
                      <DropdownMenuItem
                        onClick={() =>
                          updatePostStatus({
                            id: post._id,
                            status: "published",
                          })
                        }
                      >
                        <CheckCircle size={14} className="mr-2" />
                        Publish Now
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
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
              {post.scheduleTime && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Clock size={14} className="mr-1.5" />
                  {formatDate(post.scheduleTime, "p")}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex flex-wrap gap-1 border-t pt-2 bg-muted/30">
              {post.platforms?.map((platform: any, index: number) => (
                <div
                  key={`${platform.platform}-${index}`}
                  className="text-xs bg-muted px-2 py-1 rounded-full flex items-center"
                >
                  <i
                    className={`${getSocialIcon(platform.platform ?? "")} mr-1`}
                  ></i>
                  <span>
                    {post.account ? (
                      <>
                        {post.account.accountName} at{" "}
                        {formatDate(post.scheduledFor, "p")}
                      </>
                    ) : (
                      <>
                        {platform.platform} at{" "}
                        {formatDate(post.scheduledFor, "p")}
                      </>
                    )}
                  </span>
                </div>
              ))}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  return null;
}
