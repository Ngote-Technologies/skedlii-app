import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Image, Upload, X, AlertTriangle, ImageIcon, Video, Plus, CloudUpload } from "lucide-react";
import { cn } from "../../../lib/utils";
import { Button } from "../../ui/button";
import { Label } from "../../ui/label";
import { Slider } from "../../ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensors,
  useSensor,
  PointerSensor,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import {
  DraggableOverlayItem,
  // MediaUploadProps, // Assuming this will be updated or defined elsewhere to include selectedPlatforms
  SortableMediaItem,
} from "./mediaUploadComponents"; // Assuming MediaUploadProps is in here
import {
  handleDragCancel,
  handleDragEnd,
  handleDragLeaveEvent,
  handleDragOverEvent,
  handleDragStart,
  handleDropEvent,
  handleFileInputChange,
  handleUploadClick,
  handleVideoRef,
  handleVideoSeek,
  removeMediaItem,
  updateVideoThumbnailTime,
} from "../../../lib/mediaUtils";

// Define MediaItem if not already available from props (adjust as per actual type)
export interface MediaItem {
  id: string;
  url: string; // This might be a local URL (blob) initially, then Cloudinary URL
  file: File; // The actual file object
  type: "image" | "video";
  thumbnailTime?: number;
  thumbnailUrl?: string;
  // Add other relevant properties like uploadProgress, error, etc.
  uploadProgress?: number;
  error?: string;
  processedUrl?: string; // URL after backend processing
}

// Define or extend MediaUploadProps here for clarity, assuming it's not strictly from mediaUploadComponents.tsx for now
export interface MediaUploadProps {
  media: MediaItem[];
  onChange: (media: MediaItem[]) => void;
  accounts: any[];
  selectedAccounts: string[];
  tiktokSelected: boolean;
  handleTikTokSettingsClick: () => void;
}

export default function MediaUpload({
  media,
  onChange,
  accounts,
  selectedAccounts,
  tiktokSelected,
  handleTikTokSettingsClick,
}: Readonly<MediaUploadProps>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaActiveTab, setMediaActiveTab] = useState<string>("upload");
  const [isUploading, setIsUploading] = useState<boolean>(false); // This might represent uploading to our backend now
  const [uploadProgress, setUploadProgress] = useState<number>(0); // For individual file or overall batch
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [videoPreviewElement, setVideoPreviewElement] =
    useState<HTMLVideoElement | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(
    null
  ); // For validation messages
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  useEffect(() => {
    if (media.length > 0) {
      setMediaActiveTab("preview");
    } else {
      setMediaActiveTab("upload");
    }
  }, [media]);

  // Effect to display platform constraints or warnings based on selectedPlatforms
  useEffect(() => {
    if (selectedAccounts?.length > 0) {
      // Simple message for now, can be more sophisticated
      // This is a placeholder for where you might display combined constraints or warnings
      // The actual logic for combining/displaying constraints will be more complex
      // and might involve calling a utility function with selectedPlatforms.
      // For now, just acknowledge the selected platforms.
      const platforms = Array.from(
        new Set(
          accounts
            .filter((account) => selectedAccounts.includes(account._id))
            .map((account) => account.platform.toLowerCase())
        )
      );
      setSelectedPlatforms(platforms);
      // setValidationMessage(`Validating for: ${platformNames}. Specific rules will apply.`);
      // Clear message if no platforms or if it's handled elsewhere
    } else {
      setSelectedPlatforms([]);
      setValidationMessage(null);
    }
  }, [selectedAccounts]);

  const activeDraggedItem = activeDragId
    ? media.find((item) => item.id === activeDragId)
    : null;
  const activeDraggedItemIndex = activeDraggedItem
    ? media.indexOf(activeDraggedItem)
    : -1;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Media Upload</CardTitle>
              <CardDescription>
                Add visual content to make your post stand out
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {tiktokSelected && (
              <Button
                variant="outline"
                onClick={() => handleTikTokSettingsClick()}
                className="self-start border-pink-200 text-pink-700 hover:bg-pink-50 dark:border-pink-800 dark:text-pink-300 dark:hover:bg-pink-900/20"
              >
                ⚙️ TikTok Settings
              </Button>
            )}
            
            <Tabs
              defaultValue={mediaActiveTab}
              value={mediaActiveTab}
              onValueChange={setMediaActiveTab}
            >
              <TabsList className="bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl">
                <TabsTrigger
                  value="upload"
                  onClick={() => setMediaActiveTab("upload")}
                  disabled={isUploading}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                    "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                  )}
                >
                  <CloudUpload className="h-4 w-4" />
                  <span className="font-medium">Upload</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  onClick={() => setMediaActiveTab("preview")}
                  disabled={media.length === 0 || isUploading}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                    "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                  )}
                >
                  <Image className="h-4 w-4" />
                  <span className="font-medium">Preview</span>
                  {media.length > 0 && (
                    <div className="bg-primary text-white text-xs rounded-full px-2 py-0.5 ml-1">
                      {media.length}
                    </div>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {tiktokSelected && (
          <div className="flex items-center justify-between bg-muted p-3 rounded-md flex-col sm:flex-row gap-2">
            <p className="text-sm text-muted-foreground sm:text-left">
              TikTok accounts selected. You can update post settings for TikTok
              here.
            </p>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleTikTokSettingsClick()}
            >
              ⚙️ Edit TikTok Settings
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="mt-4">
        {validationMessage && (
          <div className="mb-4 p-3 rounded-md bg-yellow-100 dark:bg-yellow-700 border border-yellow-300 dark:border-yellow-600 text-yellow-700 dark:text-yellow-200 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm">{validationMessage}</p>
          </div>
        )}
        {mediaActiveTab === "upload" && (
          <div className="relative">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-2xl opacity-50" />
            
            <button
              type="button"
              aria-label="Upload media by dragging and dropping files here"
              className={cn(
                "relative w-full border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                dragOver
                  ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 scale-[1.02] shadow-lg ring-4 ring-primary/20"
                  : "border-gray-300 hover:border-primary/50 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 dark:border-gray-600 dark:hover:border-primary/60 dark:hover:from-blue-950/30 dark:hover:to-purple-950/30"
              )}
              onDragOver={(e) => handleDragOverEvent(e, setDragOver)}
              onDragLeave={(e) => handleDragLeaveEvent(e, setDragOver)}
              onDrop={(e) =>
                handleDropEvent(
                  e,
                  setDragOver,
                  media,
                  onChange,
                  setIsUploading,
                  setUploadProgress,
                  selectedPlatforms,
                  setValidationMessage,
                  validationMessage
                )
              }
              onClick={() => handleUploadClick(fileInputRef)}
            >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm" // This might be dynamically adjusted later based on constraints
              multiple
              onChange={(e) =>
                handleFileInputChange(
                  e,
                  fileInputRef,
                  media,
                  onChange,
                  setIsUploading,
                  setUploadProgress,
                  selectedPlatforms, // Pass selectedPlatforms
                  setValidationMessage, // Pass setter for validation messages
                  validationMessage
                )
              }
              disabled={isUploading || media.length >= 10}
            />
            {isUploading ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary animate-spin mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CloudUpload className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    Processing Media...
                  </p>
                  <div className="w-full max-w-xs mx-auto bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary to-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {uploadProgress}% complete
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Enhanced Upload Icon */}
                <div className="relative mx-auto w-24 h-24">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl opacity-20 animate-pulse"></div>
                  <div className="relative w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <CloudUpload className="h-12 w-12 text-white" />
                  </div>
                </div>

                {/* Enhanced Content */}
                <div className="space-y-4 text-center">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dragOver ? "Drop your files here!" : "Upload Your Media"}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Drag & drop files here, or click to browse
                    </p>
                  </div>

                  <Button 
                    variant="gradient" 
                    size="lg"
                    className="shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                    Choose Files
                  </Button>

                  {/* File Type Indicators */}
                  <div className="flex items-center justify-center gap-6 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <ImageIcon className="h-4 w-4" />
                      <span>Images</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Video className="h-4 w-4" />
                      <span>Videos</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                    Maximum 10 files • JPG, PNG, GIF, MP4, MOV supported
                  </p>
                </div>
              </div>
            )}
          </button>
          </div>
        )}

        {mediaActiveTab === "preview" && media.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(event) => handleDragStart(event, setActiveDragId)}
            onDragEnd={(event) =>
              handleDragEnd(event, setActiveDragId, media, onChange)
            }
            onDragCancel={() => handleDragCancel(setActiveDragId)}
          >
            <div className="space-y-6">
              {/* Main Preview Area */}
              <div className="relative w-full flex items-center justify-center bg-muted/10 dark:bg-gray-700/30 rounded-md min-h-[300px] max-h-[400px]">
                {media[0].type === "image" ? (
                  <img
                    src={media[0].url} // This should be local blob URL for preview before final upload
                    alt="Media preview"
                    className="max-h-[400px] object-contain rounded-md"
                  />
                ) : (
                  <div className="w-full">
                    <video
                      ref={(el) =>
                        handleVideoRef(
                          el,
                          media[0].id,
                          media,
                          setVideoPreviewElement
                        )
                      }
                      src={media[0].url} // This should be local blob URL
                      controls
                      className="w-full max-h-[400px] object-contain rounded-t-md bg-black"
                    >
                      <track kind="captions" srcLang="en" />
                    </video>
                    <div className="p-3 bg-muted/20 dark:bg-gray-700/50 rounded-b-md">
                      <div className="flex items-center gap-3">
                        <Label
                          htmlFor={`thumbnail-time-${media[0].id}`}
                          className="text-sm whitespace-nowrap"
                        >
                          Cover frame:
                        </Label>
                        <div className="flex-1">
                          <Slider
                            id={`thumbnail-time-${media[0].id}`}
                            defaultValue={[media[0].thumbnailTime ?? 0]}
                            max={
                              videoPreviewElement
                                ? Math.floor(videoPreviewElement.duration)
                                : 100
                            }
                            step={1}
                            onValueChange={(value) =>
                              handleVideoSeek(
                                media[0].id,
                                value,
                                media,
                                videoPreviewElement,
                                (itemId, time) =>
                                  updateVideoThumbnailTime(
                                    itemId,
                                    time,
                                    media,
                                    onChange
                                  )
                              )
                            }
                          />
                        </div>
                        <span className="text-xs whitespace-nowrap">
                          {Math.floor(media[0].thumbnailTime ?? 0)}s
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full"
                        onClick={() =>
                          removeMediaItem(media[0].id, media, onChange)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove current cover</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Sortable Thumbnail Grid */}
              <SortableContext
                items={media.map((item) => item.id)}
                strategy={rectSortingStrategy}
              >
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 pt-4 border-t border-border dark:border-gray-700">
                  {media.map((item, index) => (
                    <SortableMediaItem
                      key={item.id}
                      item={item}
                      index={index}
                      onRemove={() => removeMediaItem(item.id, media, onChange)}
                      // Ensure SortableMediaItem is also theme-aware if it has specific styles
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay dropAnimation={null}>
                {activeDragId && activeDraggedItem ? (
                  <DraggableOverlayItem
                    item={activeDraggedItem}
                    index={activeDraggedItemIndex}
                    // Ensure DraggableOverlayItem is also theme-aware
                  />
                ) : null}
              </DragOverlay>

              {media.length < 10 && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleUploadClick(fileInputRef)}
                    disabled={isUploading}
                    className="dark:border-gray-600 dark:hover:bg-gray-700"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Add More Media ({media.length}/10)
                  </Button>
                </div>
              )}
              <div className="text-center text-sm text-muted-foreground dark:text-gray-400">
                <p>Drag to reorder. The first item is the cover.</p>
                {/* Removed generic optimal dimensions, will be handled by platform specific warnings */}
                <p>Maximum files: 10 (You've uploaded {media.length})</p>
              </div>
            </div>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
}
