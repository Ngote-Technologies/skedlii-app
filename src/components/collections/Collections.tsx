import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, Plus, FolderOpen, FileText, Calendar } from "lucide-react";
import { CollectionsView } from "./CollectionView";
import { useAccessControl } from "../../hooks/useAccessControl";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function Collections() {
  const { toast } = useToast();
  const { hasValidSubscription } = useAccessControl();

  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCollection, setCurrentCollection] = useState<any>(null);

  // Get collections
  const {
    data: collections = [],
    isLoading,
    refetch: refetchCollections,
  } = useQuery({
    queryKey: ["/collections"],
  }) as { data: any; isLoading: boolean; refetch: any };

  // Create collection mutation
  const { mutate: createCollection, isPending: isCreatingPending } =
    useMutation({
      mutationFn: async (data: CollectionFormData) => {
        return await apiRequest("POST", "/collections", data);
      },
      onSuccess: () => {
        toast.success({
          title: "Collection Created",
          description: "Your collection has been created successfully.",
        });
        refetchCollections();
        setIsCreating(false);
        createForm.reset();
      },
      onError: () => {
        toast.error({
          title: "Collection Creation Failed",
          description: "Failed to create collection. Please try again.",
        });
      },
    });

  // Update collection mutation
  const { mutate: updateCollection, isPending: isUpdatingPending } =
    useMutation({
      mutationFn: async ({
        id,
        data,
      }: {
        id: number;
        data: CollectionFormData;
      }) => {
        return await apiRequest("PATCH", `collections/${id}`, data);
      },
      onSuccess: () => {
        toast.success({
          title: "Collection Updated",
          description: "Your collection has been updated successfully.",
        });
        refetchCollections();
        setIsEditing(false);
        setCurrentCollection(null);
      },
      onError: () => {
        toast.error({
          title: "Collection Update Failed",
          description: "Failed to update collection. Please try again.",
        });
      },
    });

  // Delete collection mutation
  const { mutate: deleteCollection } = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/collections/${id}`);
    },
    onSuccess: () => {
      refetchCollections();
      toast.success({
        title: "Collection Deleted",
        description: "The collection has been deleted.",
      });
    },
    onError: () => {
      toast.error({
        title: "Collection Deletion Failed",
        description: "Failed to delete the collection. Please try again.",
      });
    },
  });

  const createForm = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const editForm = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onCreateSubmit(data: CollectionFormData) {
    createCollection(data);
  }

  function onEditSubmit(data: CollectionFormData) {
    if (currentCollection) {
      updateCollection({ id: currentCollection._id, data });
    }
  }

  function handleEdit(collection: any) {
    setCurrentCollection(collection);
    editForm.reset({
      name: collection.name,
      description: collection.description ?? "",
    });
    setIsEditing(true);
  }

  return (
      <div className="space-y-6">
        {/* Enhanced Header Section */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
          <div className="relative flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                  <FolderOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                    Collections
                  </h2>
                  <p className="text-muted-foreground">
                    Organize your content into thematic collections
                  </p>
                </div>
              </div>

              {/* Statistics Summary */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {collections?.data?.length || 0} collections
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {collections?.data?.reduce(
                      (total: number, collection: any) =>
                        total + (collection.contentRefs?.length || 0),
                      0
                    ) || 0}{" "}
                    total posts
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {collections?.data?.filter(
                      (c: any) =>
                        new Date(c.createdAt) >
                        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    ).length || 0}{" "}
                    created this week
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              {hasValidSubscription && (
                <Button
                  onClick={() => setIsCreating(true)}
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Plus size={16} className="mr-2" />
                  New Collection
                </Button>
              )}
            </div>
          </div>
        </div>

        <CollectionsView
          isLoading={isLoading}
          collections={collections}
          setIsCreating={setIsCreating}
          handleEdit={handleEdit}
          deleteCollection={deleteCollection}
        />

        {/* Create Collection Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogContent className="sm:max-w-md" variant="elevated">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20">
                  <Plus className="h-5 w-5 text-primary" />
                </div>
                <DialogTitle className="text-xl">Create Collection</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                Create a new collection to organize your social media content
              </DialogDescription>
            </DialogHeader>

            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(onCreateSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Holiday Posts, Product Launches"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is this collection about?"
                          maxLength={200}
                          characterCount
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description to help identify this collection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isCreatingPending}
                      variant="gradient"
                      className="flex-1"
                    >
                      {isCreatingPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Collection
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Collection Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-md" variant="elevated">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/10 border border-blue-500/20">
                  <FolderOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <DialogTitle className="text-xl">Edit Collection</DialogTitle>
              </div>
              <DialogDescription className="text-base">
                Update the details of your collection
              </DialogDescription>
            </DialogHeader>

            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Collection name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What is this collection about?"
                          maxLength={200}
                          characterCount
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description to help identify this collection
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <div className="flex gap-2 w-full">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isUpdatingPending}
                      variant="gradient"
                      className="flex-1"
                    >
                      {isUpdatingPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Update Collection
                        </>
                      )}
                    </Button>
                  </div>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
  );
}
