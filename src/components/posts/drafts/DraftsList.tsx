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
import {
  Loader2,
  FileText,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "../../../lib/utils";
import DeleteDialog from "../../dialog/DeleteDialog";
import postDraftsApi from "../../../api/postDrafts";
import { toast } from "../../../hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";

const DraftsList = () => {
  const navigate = useNavigate();
  const [deleteConfig, setDeleteConfig] = useState<{
    isOpen: boolean;
    id: string;
  }>({ isOpen: false, id: "" });
  const [deleting, setDeleting] = useState(false);

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

  const requestDelete = (id: string) => setDeleteConfig({ isOpen: true, id });
  const handleDelete = async () => {
    if (!deleteConfig.id) return;
    try {
      setDeleting(true);
      await postDraftsApi.archive(deleteConfig.id);
      setDeleteConfig({ isOpen: false, id: "" });
      toast.success({
        title: "Draft deleted",
        description: "This draft was permanently removed.",
      });
      await refetch();
    } catch (err: any) {
      toast.error({
        title: "Failed to delete draft",
        description: err?.message || "Please try again.",
      });
    } finally {
      setDeleting(false);
    }
  };

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
      // Make the list feel on-brand and ensure mobile horizontal scroll.
      // We keep a vertical ScrollArea for height control and add a horizontal
      // scroll via a min-width table so small screens can scroll sideways.
      <ScrollArea className="h-[60vh] w-full">
        <Table className="min-w-[880px] md:min-w-0">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[44%] text-foreground/90">
                Draft
              </TableHead>
              <TableHead className="whitespace-nowrap text-foreground/70">
                Updated
              </TableHead>
              <TableHead className="whitespace-nowrap text-foreground/70">
                Platforms
              </TableHead>
              <TableHead className="text-right whitespace-nowrap text-foreground/70">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft: any) => {
              console.log({ draft });
              const updated = draft.updatedAt
                ? formatDistanceToNow(new Date(draft.updatedAt), {
                    addSuffix: true,
                  })
                : "—";
              const captionCount = draft.platformCaptions
                ? Object.keys(draft.platformCaptions).length
                : 0;
              return (
                <TableRow key={draft._id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-semibold tracking-[-0.01em]">
                        {draft.title || "Untitled draft"}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {draft.currentRevision?.content || "No content"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground/80 whitespace-nowrap">
                      {updated}
                    </p>
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
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label="Draft actions"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem
                          className="text-sm"
                          onClick={() => handleViewDraft(draft._id)}
                        >
                          <Eye className="mr-2 h-4 w-4" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm"
                          onClick={() => handleContinueDraft(draft._id)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" /> Continue
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-sm text-destructive focus:text-destructive"
                          onClick={() => requestDelete(draft._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="vertical" />
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col md:flex-row justify-between gap-4">
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
          <div className="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
            <Button onClick={handleCreatePost} className="w-full md:w-auto">
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

      <DeleteDialog
        config={deleteConfig}
        setConfig={setDeleteConfig}
        handleDelete={handleDelete}
        title="Delete draft permanently?"
        message="This action cannot be undone. This will permanently delete the draft and its revision history."
        loading={deleting}
      />
    </div>
  );
};

export default DraftsList;
