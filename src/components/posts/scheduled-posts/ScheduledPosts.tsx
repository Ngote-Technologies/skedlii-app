import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../lib/queryClient";
import { useToast } from "../../../hooks/use-toast";
import { formatDate, getDateKey } from "../../../lib/utils";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Calendar } from "../../ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Loader2,
  Calendar as CalendarIcon,
  Plus,
  List,
  Sparkles,
  Clock,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { getScheduledPostListView } from "./listView";
import { getScheduledPostCalendarView } from "./calendarView";
import { useNavigate } from "react-router-dom";
import { useAccessControl } from "../../../hooks/useAccessControl";
import { ScrollArea } from "../../ui/scroll-area";

export default function ScheduledPosts() {
  const { hasValidSubscription } = useAccessControl();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!selectedDate) setSelectedDate(new Date());
  }, [selectedDate]);

  // Get posts
  const {
    data: scheduledResp,
    isLoading: isFetchingScheduledPosts,
  } = useQuery({
    // Organization-scoped v2 endpoint; axios injects x-organization-id
    queryKey: ["/scheduled-posts"],
  }) as {
    data:
      | { items?: any[]; nextCursor?: string }
      | { data?: any[] }
      | undefined;
    isLoading: boolean;
  };

  // Normalize API response shape
  const scheduledItems: any[] =
    ((scheduledResp as any)?.items as any[]) ||
    ((scheduledResp as any)?.data as any[]) ||
    [];

  // Delete post mutation
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/scheduled-posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/scheduled-posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedPost(null);
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Change post status mutation
  const { mutate: updatePostStatus } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest("PATCH", `/scheduled-posts/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/scheduled-posts"] });
      toast({
        title: "Status updated",
        description: "The post status has been updated",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update the post status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const filterPostsByDate = (date: Date | undefined) => {
    if (!date) return [];

    return scheduledItems.filter((post: any) => {
      if (!post.scheduledFor) return false;
      const postDate = new Date(post.scheduledFor);
      return (
        postDate.getFullYear() === date.getFullYear() &&
        postDate.getMonth() === date.getMonth() &&
        postDate.getDate() === date.getDate()
      );
    });
  };

  // Group posts by date for showing on the calendar
  const getPostsByDate = () => {
    const postsByDate: Record<string, number> = {};

    scheduledItems.forEach((post: any) => {
      if (post.scheduledFor) {
        const dateKey = getDateKey(post.scheduledFor);
        postsByDate[dateKey] = (postsByDate[dateKey] || 0) + 1;
      }
    });

    return postsByDate;
  };

  const handleDeletePost = (post: any) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPost) {
      deletePost(selectedPost._id);
    }
  };

  const scheduleHasPostsForDate = (date: Date) => {
    const dateStr = getDateKey(date.toISOString());
    return !!getPostsByDate()[dateStr];
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Content Schedule
            </h2>
            <p className="text-muted-foreground text-lg">
              Manage and preview your scheduled social media posts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats Summary */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {scheduledItems.length}
              </div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {filterPostsByDate(selectedDate).length}
              </div>
              <div className="text-xs text-gray-500">Today</div>
            </div>
          </div>

          <Button
            disabled={!hasValidSubscription}
            onClick={() => navigate("/dashboard/post-flow")}
            variant="default"
            className="shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <Plus
              size={16}
              className="mr-2 group-hover:rotate-90 transition-transform duration-200"
            />
            Create Post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-6">
        <div className="flex justify-center">
          <TabsList className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
            <TabsTrigger
              value="calendar"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="font-medium">Calendar View</span>
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-300",
                "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
              )}
            >
              <List className="h-4 w-4" />
              <span className="font-medium">List View</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Enhanced Calendar Card */}
            <Card className="lg:w-[350px] border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle>Calendar</CardTitle>
                    <CardDescription>
                      Select a date to view scheduled posts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-inner">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    modifiers={{
                      hasPost: (date) => scheduleHasPostsForDate(new Date(date)),
                    }}
                    modifiersClassNames={{
                      // Small dot indicator for days that have posts
                      hasPost:
                        "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:h-1.5 after:w-1.5 after:rounded-full after:bg-blue-500 dark:after:bg-blue-400",
                    }}
                    classNames={{
                      // Make today visually distinct (ring) from hasPost dot and selection
                      day_today:
                        "rounded-md outline-none ring-2 ring-primary/70 dark:ring-primary/60",
                    }}
                    className="rounded-lg"
                  />
                </div>

                {/* Calendar legend */}
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-500"></div>
                    <span className="text-blue-700 dark:text-blue-300">
                      Days with scheduled posts
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Posts Card */}
            <div className="flex-1">
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          Posts for{" "}
                          {selectedDate
                            ? formatDate(selectedDate, "PPP")
                            : "today"}
                        </CardTitle>
                        <CardDescription>
                          {filterPostsByDate(selectedDate).length} posts
                          scheduled for this date
                        </CardDescription>
                      </div>
                    </div>

                    {filterPostsByDate(selectedDate).length > 0 && (
                      <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                        {filterPostsByDate(selectedDate).length} post
                        {filterPostsByDate(selectedDate).length !== 1
                          ? "s"
                          : ""}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Mobile/stacked: natural height (no scroll container) */}
                  <div className="block lg:hidden">
                    {getScheduledPostCalendarView({
                      isFetchingScheduledPosts,
                      postsByDate: filterPostsByDate(selectedDate),
                      updatePostStatus,
                      handleDeletePost,
                      navigate,
                    })}
                  </div>
                  {/* Desktop side-by-side: fixed height scroll */}
                  <div className="hidden lg:block">
                    <ScrollArea className="h-[65vh] pr-2">
                      {getScheduledPostCalendarView({
                        isFetchingScheduledPosts,
                        postsByDate: filterPostsByDate(selectedDate),
                        updatePostStatus,
                        handleDeletePost,
                        navigate,
                      })}
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <List className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      All Scheduled Posts
                    </CardTitle>
                    <CardDescription>
                      Complete overview of your content pipeline
                    </CardDescription>
                  </div>
                </div>

                {scheduledItems.length > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-medium">
                      {scheduledItems.length} total post
                      {scheduledItems.length !== 1 ? "s" : ""}
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Mobile/stacked: natural height */}
              <div className="block lg:hidden">
                {getScheduledPostListView(
                  isFetchingScheduledPosts,
                  scheduledItems,
                  updatePostStatus,
                  handleDeletePost,
                  navigate
                )}
              </div>
              {/* Desktop side-by-side: fixed height scroll */}
              <div className="hidden lg:block">
                <ScrollArea className="h-[70vh] pr-2">
                  {getScheduledPostListView(
                    isFetchingScheduledPosts,
                    scheduledItems,
                    updatePostStatus,
                    handleDeletePost,
                    navigate
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
