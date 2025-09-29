import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import {
  AlertCircle,
  Plus,
  RefreshCw,
  MessageSquare,
  MoreVertical,
  Edit2,
  BarChart2,
  Trash2,
  Folder,
  Image,
  Video,
  FileText,
  ChevronLeft,
  ChevronRight,
  Play,
  Loader2,
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
import { StatusBadge, type StatusBadgeProps } from "../ui/badge";
import { formatDate, getSocialIcon } from "../../lib/utils";
import { getPlatformSimpleTextColor } from "../../lib/platformUtils";
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
import { useAccessControl } from "../../hooks/useAccessControl";
import { useImmediateScheduledPosts } from "../../hooks/useImmediateScheduledPosts";

const formatPlatformLabel = (platform?: string) => {
  if (!platform) return "Platform";
  return platform
    .toString()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

// Media Carousel Component
const MediaCarousel = ({
  mediaUrls,
  mediaType,
}: {
  mediaUrls: string[];
  mediaType: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!mediaUrls || mediaUrls.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaUrls.length) % mediaUrls.length);
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
      {/* Media Display */}
      <div className="relative aspect-video">
        {mediaType === "video" ? (
          <video
            src={mediaUrls[currentIndex]}
            className="w-full h-full object-cover"
            controls
            playsInline
          />
        ) : (
          <img
            src={mediaUrls[currentIndex]}
            alt={`Media ${currentIndex + 1}`}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        )}

        {/* Navigation Buttons */}
        {mediaUrls.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        {/* Video Play Overlay */}
        {mediaType === "video" && (
          <div className="absolute top-2 left-2 bg-black/50 text-white rounded-full p-1">
            <Play className="h-3 w-3 fill-current" />
          </div>
        )}
      </div>

      {/* Indicators */}
      {mediaUrls.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
          {mediaUrls.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Media Counter */}
      {mediaUrls.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {currentIndex + 1} / {mediaUrls.length}
        </div>
      )}
    </div>
  );
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

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { hasValidSubscription } = useAccessControl();

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
    // Organization-scoped posts listing (v2): axios injects x-organization-id header
    queryKey: ["/social-posts"],
    enabled: isAuthenticated,
  }) as {
    // Support both v1 { data: [...] } and v2 { items: [...], nextCursor }
    data: { items?: any[]; data?: any[]; nextCursor?: string } | undefined;
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  // Normalize response shape across API versions
  const postItems: any[] =
    (posts?.items as any[]) || (posts as any)?.data || [];

  const {
    data: immediateTargets = [],
    isLoading: isLoadingImmediate,
    isFetching: isFetchingImmediate,
  } = useImmediateScheduledPosts(isAuthenticated);

  const pendingPosts = immediateTargets.map((target) => {
    const rawPlatform = (target.platformName || "").toString().toLowerCase();
    const platformLabel = formatPlatformLabel(target.platformName || "");
    return {
      _id: target.id,
      content: target.caption || target.content || "",
      mediaUrls: Array.isArray(target.mediaUrls) ? target.mediaUrls : [],
      mediaType: target.mediaType || "text",
      platform: rawPlatform,
      status: (target.status || "pending").toLowerCase(),
      metadata: {
        accountName: `${platformLabel} Publishing`,
        platform: rawPlatform,
        accountId: target.accountId,
        scheduledPostId: target.scheduledPostId,
        immediate: true,
        lastError: target.lastError,
        postUrl: target.postUrl,
      },
      createdAt: target.createdAt,
      scheduledFor: target.scheduledFor,
      socialAccountId: target.accountId,
      __isImmediatePending: true,
    };
  });

  const combinedPosts = [...pendingPosts, ...postItems];

  const previousPendingCount = useRef<number>(pendingPosts.length);

  useEffect(() => {
    if (
      previousPendingCount.current > 0 &&
      pendingPosts.length === 0 &&
      !isFetchingImmediate
    ) {
      refetchPosts();
    }
    previousPendingCount.current = pendingPosts.length;
  }, [pendingPosts.length, isFetchingImmediate, refetchPosts]);

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
        toast.success({
          title: "Post Deleted",
          description: "The post has been removed successfully.",
        });
        refetchPosts();
      },
      onError: () => {
        setDeleteConfig({ id: "", isOpen: false, postAccountId: "" });
        toast.error({
          title: "Post Deletion Failed",
          description: "Failed to delete post. Please try again.",
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
        toast.success({
          title: "Post Added to Collection",
          description: "The post has been added to the collection.",
        });
        refetchCollections();
        refetchPosts();
      },
      onError: () => {
        toast.error({
          title: "Collection Addition Failed",
          description:
            "Failed to add the post to the collection. Please try again.",
        });
      },
    });

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
    isAddingToCollection ||
    isLoadingImmediate;

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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card
              key={i}
              className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 mb-6 break-inside-avoid"
            >
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

  if (!combinedPosts?.length) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 h-[60vh]">
        <div className="rounded-full bg-gradient-to-br from-primary/10 to-primary/5 p-6 shadow-lg">
          <MessageSquare className="h-12 w-12 text-primary" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            No posts yet
          </h3>
          <p className="text-muted-foreground text-center max-w-md text-lg">
            You haven't created any posts yet. Create your first post to get
            started with your social media journey.
          </p>
        </div>
        {hasValidSubscription && (
          <Button onClick={() => navigate("/dashboard/post-flow")}>
            <Plus size={16} className="mr-2" />
            Create Post
          </Button>
        )}
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
          {hasValidSubscription && (
            <Button
              onClick={() => navigate("/dashboard/post-flow")}
              className="gap-2"
            >
              <Plus size={16} />
              New Post
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-900 dark:to-transparent rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {postItems.length} post{postItems.length !== 1 ? "s" : ""}{" "}
              published
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>Latest activity</span>
            {(pendingPosts.length > 0 || isFetchingImmediate) && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-300">
                <Loader2
                  className={`h-3 w-3 ${
                    isFetchingImmediate ? "animate-spin" : ""
                  }`}
                />
                {pendingPosts.length} publishing
              </span>
            )}
          </div>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {combinedPosts.map((post: any) => {
            const rawPlatform = (
              post.platform ??
              post.metadata?.platform ??
              ""
            ).toString();
            const platform = rawPlatform.toLowerCase();
            const platformLabel = formatPlatformLabel(rawPlatform);
            const isImmediate = Boolean(post.__isImmediatePending);
            const statusValue =
              post.status === "posted" || post.status === "published"
                ? "published"
                : (post.status || "pending").toLowerCase();
            const immediateStatus = isImmediate
              ? statusValue === "failed"
                ? {
                    className:
                      "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300",
                    icon: (
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-red-500 dark:text-red-300" />
                    ),
                    text: post.metadata?.lastError
                      ? `Publishing failed: ${post.metadata.lastError}`
                      : "Publishing failed.",
                  }
                : {
                    className:
                      "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-200",
                    icon: (
                      <Loader2 className="mt-0.5 h-3.5 w-3.5 animate-spin text-blue-500 dark:text-blue-200" />
                    ),
                    text: `Publishing to ${platformLabel}...`,
                  }
              : null;
            const timestampValue = isImmediate
              ? post.scheduledFor || post.createdAt || post.updatedAt
              : post.publishedDate ?? post.postedAt ?? post.createdAt;
            const timestampLabel = isImmediate ? "Queued" : "Published";
            const timestampFormat = isImmediate
              ? "MMM d, yyyy h:mm a"
              : "MMM d, yyyy";
            const formattedTimestamp = timestampValue
              ? formatDate(timestampValue, timestampFormat)
              : null;

            return (
              <Card
                key={post._id}
                className="overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50 shadow-md mb-6 break-inside-avoid"
              >
                <CardHeader className="pb-4 px-6 pt-6 bg-gradient-to-r from-transparent to-gray-50/30 dark:to-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="relative">
                          <img
                            src={
                              post.metadata?.profileImageUrl ??
                              post.metadata?.profile
                                ?.threads_profile_picture_url ??
                              'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="transparent"/></svg>'
                            }
                            alt="Profile"
                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div
                            className={`absolute inset-0 h-10 w-10 rounded-full border-2 border-gray-100 dark:border-gray-700 flex items-center justify-center ${getPlatformSimpleTextColor(
                              platform
                            )} bg-gray-50 dark:bg-gray-800`}
                            style={{
                              display:
                                !post.metadata?.profileImageUrl &&
                                !post.metadata?.profile
                                  ?.threads_profile_picture_url
                                  ? "flex"
                                  : "none",
                            }}
                          >
                            <i
                              className={`${getSocialIcon(platform)} text-lg`}
                            />
                          </div>
                          {/* Platform badge */}
                          <div
                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center ${getPlatformSimpleTextColor(
                              platform
                            )} bg-white dark:bg-gray-800`}
                          >
                            <i
                              className={`${getSocialIcon(platform)} text-xs`}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 min-w-0 flex-1">
                        <CardTitle className="text-sm font-semibold truncate">
                          {post.metadata?.accountName ??
                            post.metadata?.socialPost?.username ??
                            post.metadata?.socialPost?.accountName ??
                            "Unknown Account"}
                        </CardTitle>
                        <CardDescription className="text-xs capitalize text-muted-foreground">
                          {platformLabel.toLowerCase() === "platform"
                            ? "Unknown platform"
                            : platformLabel}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.mediaType && (
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {post.mediaType === "image" && (
                            <Image className="h-3 w-3" />
                          )}
                          {post.mediaType === "video" && (
                            <Video className="h-3 w-3" />
                          )}
                          {post.mediaType === "text" && (
                            <FileText className="h-3 w-3" />
                          )}
                          <span className="capitalize">{post.mediaType}</span>
                        </div>
                      )}
                      <StatusBadge
                        status={statusValue as StatusBadgeProps["status"]}
                        size="sm"
                      />
                      {!isImmediate && (
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
                            {hasValidSubscription && (
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
                            )}
                            {hasValidSubscription && (
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
                            )}
                            {hasValidSubscription && (
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
                            )}
                            {hasValidSubscription && (
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
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0 px-6">
                  <div className="text-sm line-clamp-3 mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
                    {post.content}
                  </div>
                  {/* Media Display with Carousel */}
                  {(post.mediaUrls?.length > 0 ||
                    post.imageUrl ||
                    post.metadata?.videoUrl) && (
                    <div className="mb-3">
                      <MediaCarousel
                        mediaUrls={
                          post.mediaUrls?.length > 0
                            ? post.mediaUrls
                            : post.imageUrl
                            ? [post.imageUrl]
                            : post.metadata?.videoUrl
                            ? [post.metadata.videoUrl]
                            : []
                        }
                        mediaType={post.mediaType || "image"}
                      />
                    </div>
                  )}
                  {immediateStatus && (
                    <div
                      className={`mb-3 flex items-start gap-2 rounded-md px-3 py-2 text-xs ${immediateStatus.className}`}
                    >
                      {immediateStatus.icon}
                      <span className="leading-5">{immediateStatus.text}</span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-3 pt-0 px-6 pb-6">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col space-y-1">
                      <span className="text-xs text-muted-foreground flex items-center space-x-1">
                        <span>
                          {timestampLabel} {formattedTimestamp ?? "—"}
                        </span>
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
                      {!isImmediate && hasValidSubscription && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={() => handleViewAnalytics(post._id)}
                          disabled={
                            !["posted", "published"].includes(post.status)
                          }
                          title="View Analytics"
                        >
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                      )}
                      {!isImmediate && hasValidSubscription && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          onClick={() => handleEditPost(post._id)}
                          disabled={["published", "posted"].includes(
                            post.status
                          )}
                          title="Edit Post"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {/* {post.mediaUrls?.length > 1 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-gray-100 dark:border-gray-800">
                      <span className="flex items-center space-x-1">
                        <Image className="h-3 w-3" />
                        <span>{post.mediaUrls.length} media files</span>
                      </span>
                      <span>{post.mediaType}</span>
                    </div>
                  )} */}
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
        <DialogContent variant="elevated">
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
