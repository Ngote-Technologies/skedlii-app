import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  MessageSquare,
  MoreVertical,
  Edit2,
  BarChart2,
  Trash2,
  Folder,
} from "lucide-react";
import { useAuth } from "../../store/hooks";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { formatDate, getSocialIcon } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { apiRequest } from "../../lib/queryClient";
import { toast } from "../../hooks/use-toast";
import DeleteDialog from "../dialog/DeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { hasValidSubscription } from "../../lib/access";

const STATUS_ICONS = {
  published: CheckCircle2,
  posted: CheckCircle2,
  scheduled: Clock,
  failed: AlertCircle,
  default: Clock,
};

const Posts = () => {
  const [deleteConfig, setDeleteConfig] = useState({
    id: "",
    isOpen: false,
    postAccountId: "",
  });
  const [collectionConfig, setCollectionConfig] = useState({
    collectionId: "",
    postId: "",
    isOpen: false,
  });

  const { user, isAuthenticated } = useAuth();
  const { billing } = user;
  const navigate = useNavigate();

  const {
    data: collections = [],
    isLoading: isLoadingCollections,
    refetch: refetchCollections,
  } = useQuery({
    queryKey: ["/collections"],
  }) as { data: any; isLoading: boolean; refetch: any };

  const {
    data: posts,
    isLoading: isLoadingPosts,
    isError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: [`/social-posts/${user?._id}`],
    enabled: isAuthenticated,
  }) as {
    data: { data: any[] };
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const useDeletePost = () => {
    return useMutation({
      mutationFn: async ({
        postId,
        accountId,
      }: {
        postId: string;
        accountId: string;
      }) => {
        return await apiRequest(
          "DELETE",
          `/social-posts/${postId}/${accountId}`
        );
      },
      onSuccess: () => {
        setDeleteConfig({ id: "", isOpen: false, postAccountId: "" });
        toast({
          title: "Post deleted",
          description: "The post has been removed successfully.",
        });
        refetchPosts();
      },
      onError: () => {
        setDeleteConfig({ id: "", isOpen: false, postAccountId: "" });
        toast({
          title: "Something went wrong",
          description: "Please try again!",
          variant: "destructive",
        });
      },
    });
  };

  const { mutate: deletePost, isPending: isDeletingPending } = useDeletePost();

  const { mutate: addToCollection, isPending: isAddingToCollection } =
    useMutation({
      mutationFn: async ({
        collectionId,
        postId,
      }: {
        collectionId: string;
        postId: string;
      }) => {
        return await apiRequest(
          "POST",
          `/collections/${collectionId}/content`,
          {
            contentId: postId,
            type: "socialposts",
          }
        );
      },
      onSuccess: () => {
        setCollectionConfig({ collectionId: "", postId: "", isOpen: false });
        toast({
          title: "Post added to collection",
          description: "The post has been added to the collection",
        });
        refetchCollections();
        refetchPosts();
      },
      onError: () => {
        toast({
          title: "Addition failed",
          description:
            "Failed to add the post to the collection. Please try again.",
          variant: "destructive",
        });
      },
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
      case "posted":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "scheduled":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return "text-blue-500";
      case "instagram":
      case "tiktok":
        return "text-pink-500";
      case "facebook":
        return "text-blue-600";
      case "linkedin":
        return "text-blue-700";
      case "threads":
        return "text-white-500 dark:text-white";
      case "youtube":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const handleEditPost = (postId: string) => {
    navigate(`/dashboard/edit-post/${postId}`);
  };

  const handleViewAnalytics = (postId: string) => {
    navigate(`/dashboard/analytics/${postId}`);
  };

  const isLoading =
    isLoadingPosts ||
    isLoadingCollections ||
    isDeletingPending ||
    isAddingToCollection;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Posts</h2>
            <p className="text-muted-foreground">
              Loading your social media posts...
            </p>
          </div>
          <Button disabled>
            <Plus size={16} className="mr-2" />
            New Post
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
                <Skeleton className="h-40 w-full rounded-md mt-2" />
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Skeleton className="h-8 w-24" />
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-[60vh]">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <h3 className="text-xl font-semibold">Failed to load posts</h3>
        <p className="text-muted-foreground text-center max-w-md">
          We couldn't load your posts. Please check your connection and try
          again.
        </p>
        <Button onClick={() => refetchPosts()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!posts?.data?.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 h-[60vh]">
        <div className="rounded-full bg-primary/10 p-4">
          <MessageSquare className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">No posts yet</h3>
        <p className="text-muted-foreground text-center max-w-md">
          You haven't created any posts yet. Create your first post to get
          started.
        </p>
        <Button
          onClick={() => {
            if (!hasValidSubscription(billing?.paymentStatus)) {
              toast({
                variant: "destructive",
                title: "Upgrade your plan to manage collections.",
              });
            } else {
              navigate("/dashboard/post-flow");
            }
          }}
        >
          <Plus size={16} className="mr-2" />
          Create Post
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Posts</h2>
          <p className="text-muted-foreground">
            View and manage your social media posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchPosts()}
            className="gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            onClick={() => {
              if (!hasValidSubscription(billing?.paymentStatus)) {
                toast({
                  variant: "destructive",
                  title: "Upgrade your plan to manage collections.",
                });
              } else {
                navigate("/dashboard/post-flow");
              }
            }}
            className="gap-2"
          >
            <Plus size={16} />
            New Post
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {posts.data.length} post{posts.data.length !== 1 ? "s" : ""} in
            total
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts?.data?.map((post: any) => {
            const StatusIcon =
              STATUS_ICONS[post.status as keyof typeof STATUS_ICONS] ||
              STATUS_ICONS.default;
            const platform = post.platform?.toLowerCase() ?? "";

            return (
              <Card
                key={post._id}
                className="overflow-hidden hover:shadow-md transition-shadow group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getPlatformColor(platform)
                          .replace("text-", "bg-")
                          .replace("-500", "-100")} dark:bg-opacity-20`}
                      >
                        <i
                          className={`${getSocialIcon(
                            platform
                          )} text-lg ${getPlatformColor(platform)}`}
                        />
                      </div>
                      <div className="space-y-0.5">
                        <CardTitle className="text-sm font-medium">
                          {post.metadata?.socialPost?.username ??
                            post.metadata?.socialPost?.accountName ??
                            post.metadata?.accountName ??
                            "Unknown Account"}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        className={`text-xs font-normal px-2 py-0.5 h-6 ${getStatusColor(
                          post.status
                        )}`}
                      >
                        <StatusIcon className="h-2.5 w-2.5 mr-1" />
                        <span className="capitalize">{post.status}</span>
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                          >
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => handleEditPost(post._id)}
                            disabled={["published", "posted"].includes(
                              post.status
                            )}
                            className="text-xs"
                          >
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              setCollectionConfig({
                                ...collectionConfig,
                                postId: post._id,
                                isOpen: true,
                              })
                            }
                            disabled={
                              !["posted", "published"].includes(post.status)
                            }
                            className="text-xs"
                          >
                            <Folder className="mr-2 h-3.5 w-3.5" />
                            <span>Add to Collection</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleViewAnalytics(post._id)}
                            disabled={
                              !["posted", "published"].includes(post.status)
                            }
                            className="text-xs"
                          >
                            <BarChart2 className="mr-2 h-3.5 w-3.5" />
                            <span>View Analytics</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-xs text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
                            onClick={() =>
                              setDeleteConfig({
                                id: post._id,
                                isOpen: true,
                                postAccountId: post.socialAccountId,
                              })
                            }
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0 px-4">
                  <div className="text-sm line-clamp-3 mb-3">
                    {post.content}
                  </div>
                  {post.imageUrl && (
                    <div className="mb-3 rounded-md overflow-hidden">
                      <img
                        src={post.imageUrl}
                        alt="Post Preview"
                        className="w-full h-40 object-cover"
                      />
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center pt-0 px-4 pb-3">
                  <div className="flex flex-col space-y-1">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(post.postedAt ?? post.createdAt, "PPP p")}
                    </span>
                    {post.collection && (
                      <div className="flex items-center space-x-1 text-xs">
                        <Folder className="h-3 w-3 text-muted-foreground" />
                        <Link
                          to={`/dashboard/collections/${post.collection._id}`}
                          className="text-primary hover:underline hover:text-primary/80 transition-colors"
                        >
                          {post.collection.name}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleViewAnalytics(post._id)}
                      disabled={!["posted", "published"].includes(post.status)}
                    >
                      <BarChart2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEditPost(post._id)}
                      disabled={["published", "posted"].includes(post.status)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
      <DeleteDialog
        config={deleteConfig}
        setConfig={setDeleteConfig}
        handleDelete={() =>
          deletePost({
            postId: deleteConfig.id,
            accountId: deleteConfig.postAccountId,
          })
        }
        message="Are you sure you want to delete this post?"
        title="Delete Post"
      />
      <Dialog
        open={collectionConfig.isOpen}
        onOpenChange={() =>
          setCollectionConfig({ ...collectionConfig, isOpen: false })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>
              <span className="text-sm text-muted-foreground mb-4 block">
                Select a collection to add this post to
              </span>
              <Select
                onValueChange={(value) =>
                  setCollectionConfig({
                    ...collectionConfig,
                    collectionId: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                {collections?.data?.length === 0 && (
                  <SelectContent>
                    <SelectItem value="null" disabled>
                      No collections found
                    </SelectItem>
                  </SelectContent>
                )}
                {collections?.data?.length > 0 && (
                  <SelectContent>
                    {collections.data.map((collection: any) => (
                      <SelectItem key={collection._id} value={collection._id}>
                        {collection.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                )}
              </Select>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setCollectionConfig({ ...collectionConfig, isOpen: false })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                addToCollection({
                  collectionId: collectionConfig.collectionId,
                  postId: collectionConfig.postId,
                })
              }
              disabled={!collectionConfig.collectionId}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Posts;
