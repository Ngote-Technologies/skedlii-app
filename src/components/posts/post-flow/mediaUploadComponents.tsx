import { useSortable } from "@dnd-kit/sortable";
import { FileImage, FileVideo, X } from "lucide-react";
import { CSS } from "@dnd-kit/utilities";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Button } from "../../ui/button";
import { MediaItem } from "./MediaUpload";

export function MediaItemDisplayContent({
  item,
  index,
  isCover,
}: {
  readonly item: MediaItem;
  readonly index: number;
  readonly isCover: boolean;
}) {
  return (
    <>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
        {item.type === "image" ? (
          <img
            src={item.url}
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={item.thumbnailUrl ?? ""} // Provide a fallback empty string for thumbnailUrl
            alt={`Media ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-white text-xs flex items-center justify-center pointer-events-none">
        {item.type === "image" ? (
          <FileImage className="h-3 w-3 mr-1" />
        ) : (
          <FileVideo className="h-3 w-3 mr-1" />
        )}
        {isCover ? "Cover" : `#${index + 1}`}
      </div>
    </>
  );
}

export function SortableMediaItem({
  item,
  index,
  onRemove,
}: {
  readonly item: MediaItem;
  readonly index: number;
  readonly onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined, // Ensure dragged item placeholder doesn't overlap overlay
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative aspect-square border rounded-md overflow-hidden cursor-move ${
        index === 0 ? "ring-2 ring-primary" : "shadow-sm"
      }
      }`}
    >
      <MediaItemDisplayContent
        item={item}
        index={index}
        isCover={index === 0}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 h-5 w-5 rounded-full z-20" // Ensure button is above overlays
              onClick={(e) => {
                e.stopPropagation(); // Prevent drag from starting on remove click
                onRemove();
              }}
            >
              <X className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remove</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function DraggableOverlayItem({
  item,
  index,
}: {
  readonly item: MediaItem;
  readonly index: number;
}) {
  return (
    <div
      className={`relative aspect-square border rounded-md overflow-hidden shadow-2xl ${
        index === 0 ? "ring-2 ring-primary" : ""
      } bg-background`}
    >
      <MediaItemDisplayContent
        item={item}
        index={index}
        isCover={index === 0}
      />
    </div>
  );
}
