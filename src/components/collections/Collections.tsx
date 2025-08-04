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
import { Loader2, Plus } from "lucide-react";
import { CollectionsView } from "./CollectionView";

const collectionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

export default function Collections() {
  const { toast } = useToast();

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
        toast({
          title: "Collection created",
          description: "Your collection has been created successfully",
        });
        refetchCollections();
        setIsCreating(false);
        createForm.reset();
      },
      onError: () => {
        toast({
          title: "Creation failed",
          description: "Failed to create collection. Please try again.",
          variant: "destructive",
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
        toast({
          title: "Collection updated",
          description: "Your collection has been updated successfully",
        });
        refetchCollections();
        setIsEditing(false);
        setCurrentCollection(null);
      },
      onError: () => {
        toast({
          title: "Update failed",
          description: "Failed to update collection. Please try again.",
          variant: "destructive",
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
      toast({
        title: "Collection deleted",
        description: "The collection has been deleted",
      });
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Failed to delete the collection. Please try again.",
        variant: "destructive",
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
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold">Collections</h2>
          <p className="text-muted-foreground">
            Organize your content into thematic collections
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus size={16} className="mr-2" />
          New Collection
        </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Collection</DialogTitle>
            <DialogDescription>
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
                      <Input placeholder="Collection name" {...field} />
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsCreating(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreatingPending}>
                    {isCreatingPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Collection
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Collection Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Collection</DialogTitle>
            <DialogDescription>
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
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isUpdatingPending}>
                    {isUpdatingPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Collection
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
