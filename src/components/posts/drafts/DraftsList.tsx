import { useMemo } from "react";
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

const DraftsList = () => {
  const navigate = useNavigate();

  const queryKey = useMemo(() => {
    return "/post-drafts";
  }, []);

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
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Drafts
                </h2>
                <p className="text-muted-foreground">
                  Manage saved drafts and continue where you left off.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
            <Button onClick={handleCreatePost}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>
            <div className="flex justify-between">
              Saved drafts
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
          </CardTitle>
          <CardDescription>
            {isRefetching
              ? "Refreshing..."
              : `${drafts.length} draft${drafts.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{renderContent()}</CardContent>
      </Card>
    </div>
  );
};

export default DraftsList;
