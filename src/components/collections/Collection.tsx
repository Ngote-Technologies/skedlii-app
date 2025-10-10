import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import {
  ArrowLeft,
  Edit,
  Share2,
  FolderOpen,
  FileText,
  Calendar,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatDate } from "../../lib/utils";
import { Skeleton } from "../ui/skeleton";

export default function Collection() {
  const { collectionId } = useParams();
  const navigate = useNavigate();

  const [collectionPosts, setCollectionPosts] = useState<any[]>([]);

  const { data: collectionData, isLoading: isLoadingCollection } = useQuery({
    queryKey: [`/collections/collection/${collectionId}?include=posts`],
    queryFn: () =>
      apiRequest(
        "GET",
        `/collections/collection/${collectionId}?include=posts`
      ),
  }) as { data: any; isLoading: boolean };

  useEffect(() => {
    if (!collectionId) {
      navigate("/collections");
    }
  }, [collectionId]);

  useEffect(() => {
    if (collectionData?.collection?.items?.length) {
      setCollectionPosts(collectionData.collection.items);
    }
  }, [collectionData]);

  const isLoading = isLoadingCollection;

  if (isLoading) {
    return <CollectionSkeleton />;
  }

  if (!collectionData) {
    return <div>Collection not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="gap-2 hover:bg-muted/80 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Collections
        </Button>
        {/* <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800"
          >
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-green-50 dark:hover:bg-green-950/20 hover:border-green-200 dark:hover:border-green-800"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div> */}
      </div>

      <Card
        className="relative overflow-hidden border-border/50"
        variant="elevated"
      >
        <div className="absolute top-4 right-4 opacity-5">
          <Sparkles className="h-16 w-16" />
        </div>

        <CardHeader className="relative pb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent mb-2">
                  {collectionData.collection.name}
                </CardTitle>
                {collectionData.collection.description && (
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {collectionData.collection.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {collectionData.collection.items?.length ?? 0} post
                    {(collectionData.collection.items?.length ?? 0) !== 1
                      ? "s"
                      : ""}
                  </span>
                  {(collectionData.collection.items?.length ?? 0) > 0 && (
                    <Badge variant="success" className="text-xs">
                      Active
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Created{" "}
                    {formatDate(
                      new Date(collectionData.collection.createdAt),
                      "MMM d, yyyy"
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Last updated{" "}
                    {formatDate(
                      new Date(
                        collectionData.collection.updatedAt ||
                          collectionData.collection.createdAt
                      ),
                      "MMM d"
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {collectionPosts.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Collection Posts</h2>
            <Badge variant="outline" className="text-sm">
              {collectionPosts.length} item
              {collectionPosts.length !== 1 ? "s" : ""}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collectionPosts.map((post: any, index: number) => (
              <PostCard key={post._id} post={post} index={index} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed border-2" variant="gradient">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              This collection is empty. Start adding posts to organize your
              content.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard/post-flow")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Add Posts
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function CollectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>

      <Card
        className="relative overflow-hidden border-border/50"
        variant="elevated"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/30 to-primary/20 animate-pulse" />

        <CardHeader className="pb-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-14 w-14 rounded-xl" />

            <div className="flex-1 space-y-3">
              <div>
                <Skeleton className="h-9 w-72 mb-2" />
                <Skeleton className="h-6 w-96 max-w-full" />
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-28" />
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div>
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} variant="elevated" className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function PostCard({ post, index }: { readonly post: any; index: number }) {
  const platform = post.platform;
  const content = post.content;
  const profileImage =
    post.metadata?.profileImageUrl ??
    post.metadata?.socialPost?.profileImageUrl ??
    null;
  const accountName =
    post.metadata?.accountName ??
    post.metadata?.socialPost?.username ??
    "Unknown";

  const getPlatformColor = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "twitter":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "linkedin":
        return "text-blue-700 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "facebook":
        return "text-blue-600 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "instagram":
        return "text-pink-500 bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800";
      case "threads":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "tiktok":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      case "youtube":
        return "text-blue-500 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800";
      default:
        return "text-muted-foreground bg-muted/50 border-border";
    }
  };

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50"
      variant="elevated"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={`text-xs capitalize ${getPlatformColor(platform)}`}
          >
            {platform}
          </Badge>

          <a href={post.postUrl} target="_blank">
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt="profile"
              className="w-10 h-10 rounded-full border-2 border-border/50"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {accountName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium truncate">{accountName}</p>
            <p className="text-xs text-muted-foreground">
              {formatDate(new Date(post.createdAt || Date.now()), "MMM d")}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm leading-relaxed line-clamp-3 group-hover:text-foreground transition-colors duration-200">
            {content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <FileText className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {content?.length} chars
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Published
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
