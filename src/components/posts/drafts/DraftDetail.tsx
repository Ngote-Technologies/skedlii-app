import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Separator } from "../../ui/separator";
import { ScrollArea } from "../../ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../ui/table";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import DeleteDialog from "../../dialog/DeleteDialog";
import postDraftsApi from "../../../api/postDrafts";
import { toast } from "../../../hooks/use-toast";

const formatDate = (value?: string | Date) => {
  if (!value) return "—";
  try {
    return format(new Date(value), "PPP p");
  } catch (err) {
    return String(value);
  }
};

const DraftDetail = () => {
  const { draftId } = useParams<{ draftId: string }>();
  const navigate = useNavigate();
  const [deleteConfig, setDeleteConfig] = useState<{ isOpen: boolean; id: string }>({ isOpen: false, id: "" });
  const [deleting, setDeleting] = useState(false);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    error,
  } = useQuery({
    queryKey: draftId ? [`/post-drafts/${draftId}`] : [],
    enabled: Boolean(draftId),
  });

  const draft = (data as any)?.draft;

  const currentRevision = draft?.currentRevision ?? {};
  const mediaItems: Array<{
    type: "image" | "video";
    url?: string;
    ref?: string;
  }> = Array.isArray(currentRevision.media) ? currentRevision.media : [];
  const platformCaptions: Record<string, string> =
    draft?.platformCaptions || currentRevision.platformCaptions || {};

  const revisions = useMemo(() => {
    const items = Array.isArray(draft?.revisions) ? draft.revisions : [];
    return items
      .slice()
      .sort((a: any, b: any) => (b.revision ?? 0) - (a.revision ?? 0));
  }, [draft]);

  if (!draftId) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Draft not found</CardTitle>
            <CardDescription>No draft identifier was provided.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Go back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading draft...
        </span>
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="p-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Unable to load draft</CardTitle>
            <CardDescription>
              {(error as Error)?.message ||
                "The requested draft could not be found."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {draft.title || "Untitled Draft"}
            </h1>
            <Badge variant="outline" className="uppercase">
              {draft.status}
            </Badge>
            {isRefetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Created {formatDate(draft.createdAt)} • Updated {formatDate(draft.updatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteConfig({ isOpen: true, id: draft._id })}
          >
            Delete Draft
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Current Content</CardTitle>
            <CardDescription>
              Latest revision ({currentRevision.revision ?? 0})
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-1">
                Body
              </p>
              <ScrollArea className="max-h-48 rounded border p-3">
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {currentRevision.content || "No content"}
                </p>
              </ScrollArea>
            </div>

            <Separator />

            <div>
              <p className="font-semibold text-sm text-muted-foreground mb-2">
                Platform Captions
              </p>
              {Object.keys(platformCaptions).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No overrides set. Platforms will use the main caption.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {Object.entries(platformCaptions).map(([platform, caption]) => (
                    <li key={platform} className="border rounded p-2">
                      <span className="font-semibold uppercase text-xs text-muted-foreground">
                        {platform}
                      </span>
                      <p className="mt-1 whitespace-pre-wrap leading-6">
                        {caption}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Media</CardTitle>
            <CardDescription>
              {mediaItems.length > 0
                ? `${mediaItems.length} attachment${
                    mediaItems.length === 1 ? "" : "s"
                  }`
                : "No media attached"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mediaItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Add media in the composer to include images or video.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {mediaItems.map((item, idx) => (
                  <div
                    key={`${item.ref || item.url || idx}-${idx}`}
                    className="rounded border overflow-hidden"
                  >
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        controls
                        className="w-full aspect-video bg-black"
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`Draft media ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="px-3 py-2 text-xs text-muted-foreground flex justify-between">
                      <span className="uppercase">{item.type}</span>
                      {item.ref && <span className="truncate">{item.ref}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revision History</CardTitle>
          <CardDescription>
            All saved revisions appear in descending order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No revisions yet.</p>
          ) : (
            <ScrollArea className="max-h-72">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">Revision</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Updated At</TableHead>
                    <TableHead>Content Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {revisions.map((rev: any) => (
                    <TableRow key={rev.revision}>
                      <TableCell>
                        <Badge
                          variant={
                            rev.revision === currentRevision.revision
                              ? "default"
                              : "outline"
                          }
                        >
                          {rev.revision}
                        </Badge>
                      </TableCell>
                      <TableCell>{rev.updatedBy || "—"}</TableCell>
                      <TableCell>{formatDate(rev.updatedAt)}</TableCell>
                      <TableCell>
                        <p className="text-sm max-w-md truncate">
                          {rev.content || "(empty)"}
                        </p>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      <DeleteDialog
        config={deleteConfig}
        setConfig={setDeleteConfig}
        handleDelete={async () => {
          try {
            setDeleting(true);
            await postDraftsApi.archive(deleteConfig.id);
            toast.success({ title: "Draft deleted", description: "This draft was permanently removed." });
            setDeleteConfig({ isOpen: false, id: "" });
            navigate("/dashboard/drafts");
          } catch (err: any) {
            toast.error({ title: "Failed to delete draft", description: err?.message || "Please try again." });
          } finally {
            setDeleting(false);
          }
        }}
        title="Delete draft permanently?"
        message="This action cannot be undone. This will permanently delete the draft and its revision history."
        loading={deleting}
      />
    </div>
  );
};

export default DraftDetail;
