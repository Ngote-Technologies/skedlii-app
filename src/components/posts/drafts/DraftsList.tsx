import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Loader2, FileText, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../../../lib/utils";

const STATUS_FILTERS = [
  "all",
  "draft",
  "ready",
  "scheduled",
  "archived",
] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];

const DraftsList = () => {
  const [status, setStatus] = useState<StatusFilter>("all");
  const navigate = useNavigate();

  const queryKey = useMemo(() => {
    if (status === "all") return "/post-drafts";
    return `/post-drafts?status=${status}`;
  }, [status]);

  const { data, isLoading, isRefetching, refetch, error } = useQuery({
    queryKey: [queryKey],
  });

  const drafts: any[] =
    ((data as any)?.items as any[]) || ((data as any)?.data as any[]) || [];

  const handleCreatePost = () => navigate("/dashboard/post-flow");

  const handleViewDraft = (id: string) => navigate(`/dashboard/drafts/${id}`);

  const handleContinueDraft = (id: string) =>
    navigate(`/dashboard/post-flow?draftId=${id}`);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">
            Loading drafts...
          </span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 space-y-4">
          <p className="text-sm text-muted-foreground">
            {(error as Error)?.message || "Unable to load drafts."}
          </p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      );
    }

    if (!drafts.length) {
      return (
        <div className="flex flex-col items-center justify-center h-48 space-y-4 text-center">
          <FileText className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="font-semibold">No drafts found</p>
            <p className="text-sm text-muted-foreground">
              Save a draft from the composer or adjust your filters.
            </p>
          </div>
          <Button onClick={handleCreatePost}>
            <Plus className="mr-2 h-4 w-4" /> Create new post
          </Button>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[60vh] w-full pr-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Draft</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft: any) => {
              const updated = draft.updatedAt
                ? formatDistanceToNow(new Date(draft.updatedAt), {
                    addSuffix: true,
                  })
                : "—";
              const captionCount = draft.platformCaptions
                ? Object.keys(draft.platformCaptions).length
                : 0;
              return (
                <TableRow key={draft._id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {draft.title || "Untitled draft"}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {draft.currentRevision?.content || "No content"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="uppercase">
                      {draft.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{updated}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {captionCount > 0 ? (
                        Object.keys(draft.platformCaptions || {}).map(
                          (platform) => (
                            <Badge
                              key={platform}
                              variant="secondary"
                              className="uppercase"
                            >
                              {platform}
                            </Badge>
                          )
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Using main caption
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDraft(draft._id)}
                    >
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleContinueDraft(draft._id)}
                    >
                      Continue
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
          <p className="text-sm text-muted-foreground">
            Manage saved drafts and continue where you left off.
          </p>
        </div>
        <Button onClick={handleCreatePost}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Saved drafts</CardTitle>
          <CardDescription>
            {isRefetching
              ? "Refreshing..."
              : `${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((filter) => (
              <Button
                key={filter}
                variant={status === filter ? "default" : "outline"}
                size="sm"
                onClick={() => setStatus(filter)}
                className="capitalize"
              >
                {filter === "all" ? "All" : filter}
              </Button>
            ))}
            <div className="flex-1" />
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <Loader2
                className={cn(
                  "mr-2 h-4 w-4",
                  isRefetching ? "animate-spin" : "opacity-60"
                )}
              />
              Refresh
            </Button>
          </div>

          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DraftsList;
