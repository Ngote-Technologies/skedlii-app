import {
  Edit,
  Folder,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
  FileText,
  Clock,
  Sparkles,
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
import { Badge } from "../ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link } from "react-router-dom";
import { formatDate } from "../../lib/utils";

export function CollectionsView({
  isLoading,
  collections,
  setIsCreating,
  handleEdit,
  deleteCollection,
}: any) {
  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20" />
            <Loader2 className="h-12 w-12 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading collections...
          </p>
        </div>
      </div>
    );
  }

  if (collections?.items?.length === 0) {
    return (
      <Card
        className="border-dashed border-2 relative overflow-hidden"
        variant="gradient"
      >
        <div className="absolute top-4 right-4 opacity-10">
          <Sparkles className="h-12 w-12" />
        </div>
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 w-fit">
            <Folder className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            No collections yet
          </CardTitle>
          <CardDescription className="text-base max-w-md mx-auto">
            Create collections to organize your social media content into
            thematic groups for better management
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pb-8">
          <Button
            onClick={() => setIsCreating(true)}
            variant="gradient"
            size="lg"
            className="shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus size={18} className="mr-2" />
            Create Your First Collection
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (collections?.items?.length > 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections?.items.map((collection: any, index: number) => {
          const postCount = collection?.items?.length ?? 0;
          const createdAt = new Date(collection.createdAt);
          const isRecent =
            createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

          return (
            <Card
              key={collection._id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-border/50"
              variant="elevated"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient header background */}
              {/* <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 to-primary/30" /> */}

              <CardHeader className="pb-3 relative">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 group-hover:scale-110 transition-transform duration-200">
                      <Folder className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate group-hover:text-primary transition-colors duration-200">
                        {collection.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {isRecent && (
                          <Badge variant="success" className="text-xs">
                            New
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(createdAt, "MMM d, yyyy")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-muted/80"
                      >
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
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

                <CardDescription className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {collection.description?.trim()
                    ? collection.description
                    : "No description provided for this collection"}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-2 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{postCount}</span>
                      <span className="text-xs text-muted-foreground">
                        post{postCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  {postCount > 0 && (
                    <Badge
                      variant="success"
                      className="text-xs"
                      icon={<Clock className="h-3 w-3 mr-1" />}
                    >
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="bg-gradient-to-r from-muted/30 to-muted/50 py-3 px-4">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full group-hover:bg-primary/10 group-hover:text-primary transition-colors duration-200"
                  asChild
                >
                  <Link to={`/dashboard/collections/${collection._id}`}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Content
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }
  return null;
}
