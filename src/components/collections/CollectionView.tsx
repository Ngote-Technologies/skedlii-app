import {
  Edit,
  Folder,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "react-router-dom";

export function CollectionsView({
  isLoading,
  collections,
  setIsCreating,
  handleEdit,
  deleteCollection,
}: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (collections.data.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>No collections yet</CardTitle>
          <CardDescription>
            Create collections to organize your social media content
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-6">
          <Button onClick={() => setIsCreating(true)}>
            <Plus size={16} className="mr-2" />
            Create Your First Collection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (collections.data.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections?.data.map((collection: any) => (
          <Card key={collection._id} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center gap-2">
                  <Folder size={18} className="text-primary" />
                  {collection.name}
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(collection)}>
                      <Edit size={14} className="mr-2" />
                      Edit Collection
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => deleteCollection(collection._id)}
                    >
                      <Trash2 size={14} className="mr-2" />
                      Delete Collection
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription>
                {collection.description?.trim()
                  ? collection.description
                  : "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm">
                {collection?.contentRefs?.length ?? "0"} posts
              </p>
            </CardContent>
            <CardFooter className="bg-muted/40 py-2">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link to={`/dashboard/collections/${collection._id}`}>
                  View Content
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }
  return null;
}
