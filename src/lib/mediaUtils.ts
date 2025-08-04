import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { MediaItem } from "../components/posts/post-flow/MediaUpload";
import { toast } from "../hooks/use-toast";
import {
  getPlatformConstraints,
  platformConstraints,
  PlatformMediaConstraints,
} from "../constants/platformConstraints";

// --- Existing Helper Functions (removeMediaItem, handleVideoRef, etc. - keeping them as they are unless modification is needed) ---

export const removeMediaItem = (
  idToRemove: string,
  media: MediaItem[],
  onChange: (media: MediaItem[]) => void
) => {
  const itemToRemove = media.find((m) => m.id === idToRemove);
  if (itemToRemove) {
    // Revoke old blob URLs if they exist to prevent memory leaks
    if (itemToRemove.url?.startsWith("blob:")) {
      URL.revokeObjectURL(itemToRemove.url);
    }
    // Assuming thumbnailUrl might also be a blob from client-side generation
    // if (itemToRemove.thumbnailUrl?.startsWith("blob:")) {
    //   URL.revokeObjectURL(itemToRemove.thumbnailUrl);
    // }
  }
  onChange(media.filter((item) => item.id !== idToRemove));
};

export const handleVideoRef = (
  element: HTMLVideoElement | null,
  itemId: string,
  media: MediaItem[],
  setVideoPreviewElement: React.Dispatch<
    React.SetStateAction<HTMLVideoElement | null>
  >
) => {
  if (media.length > 0 && media[0].id === itemId) {
    setVideoPreviewElement(element);
  }
};

export const handleDragCancel = (
  setActiveDragId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  setActiveDragId(null);
};

export const handleDragStart = (
  event: DragStartEvent,
  setActiveDragId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  setActiveDragId(event.active.id as string);
};

export const handleDragEnd = (
  event: DragEndEvent,
  setActiveDragId: React.Dispatch<React.SetStateAction<string | null>>,
  media: MediaItem[],
  onChange: (media: MediaItem[]) => void
) => {
  setActiveDragId(null);
  const { active, over } = event;
  if (over && active.id !== over.id) {
    const oldIndex = media.findIndex((item) => item.id === active.id);
    const newIndex = media.findIndex((item) => item.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(media, oldIndex, newIndex));
    }
  }
};

export const handleVideoSeek = (
  itemId: string,
  value: number[],
  media: MediaItem[],
  videoPreviewElement: HTMLVideoElement | null,
  updateVideoThumbnailTimeCallback: (itemId: string, time: number) => void // Renamed for clarity
) => {
  const time = value[0];
  const item = media.find((m) => m.id === itemId);

  if (videoPreviewElement && media.length > 0 && media[0].id === itemId) {
    videoPreviewElement.currentTime = time;
  }

  if (item && item.type === "video") {
    updateVideoThumbnailTimeCallback(itemId, time);
  }
};

// This function might need to be adapted if thumbnail generation is also deferred to backend
export const updateVideoThumbnailTime = async (
  idToUpdate: string,
  time: number,
  media: MediaItem[],
  onChange: (media: MediaItem[]) => void
) => {
  const itemIndex = media.findIndex((m) => m.id === idToUpdate);
  if (itemIndex === -1 || media[itemIndex].type !== "video") return;

  const item = media[itemIndex];
  try {
    // For now, keep client-side thumbnail extraction for preview purposes
    const thumbnailUrl = await extractVideoThumbnail(item.file, time);
    if (thumbnailUrl) {
      const newMedia = [...media];
      // Revoke old thumbnail blob URL if it exists
      if (newMedia[itemIndex].thumbnailUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(newMedia[itemIndex].thumbnailUrl);
      }
      newMedia[itemIndex] = {
        ...newMedia[itemIndex],
        thumbnailUrl,
        thumbnailTime: time,
      };
      onChange(newMedia);
    }
  } catch (error) {
    console.error("Error updating thumbnail:", error);
    toast({
      title: "Thumbnail Error",
      description: "Could not generate video thumbnail preview.",
      variant: "destructive",
    });
  }
};

const extractVideoThumbnail = async (
  file: File,
  time: number
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(time, video.duration || 0);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrlDataUrl = canvas.toDataURL("image/jpeg"); // Data URL for immediate use
        URL.revokeObjectURL(url);
        resolve(thumbnailUrlDataUrl);
      } else {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
      }
    };
    video.onerror = (err: any) => {
      URL.revokeObjectURL(url);
      reject(new Error(`Error loading video: ${err?.toString()}`));
    };
  });
};

export const handleUploadClick = (
  fileInputRef: React.RefObject<HTMLInputElement>
) => {
  if (fileInputRef.current) {
    fileInputRef.current.click();
  }
};

// --- NEW/MODIFIED Functions ---

const getFileMetadata = async (
  file: File
): Promise<{ width?: number; height?: number; duration?: number }> => {
  return new Promise((resolve) => {
    if (file.type.startsWith("image/")) {
      if (!["image/jpeg", "image/png", "image/gif"].includes(file.type)) {
        resolve({});
        return;
      }
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => resolve({});
      img.src = URL.createObjectURL(file);
    } else if (file.type.startsWith("video/")) {
      if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type)) {
        resolve({});
        return;
      }
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
        });
        URL.revokeObjectURL(video.src);
      };
      video.onerror = () => resolve({});
      video.src = URL.createObjectURL(file);
    } else {
      resolve({});
    }
  });
};

const combineConstraints = (platforms: string[]): PlatformMediaConstraints => {
  if (platforms.length === 0) return platformConstraints.general;
  if (platforms.length === 1) return getPlatformConstraints(platforms[0]);

  let combined: PlatformMediaConstraints = JSON.parse(
    JSON.stringify(getPlatformConstraints(platforms[0]))
  ); // Deep copy

  for (let i = 1; i < platforms.length; i++) {
    const currentPlatformConstraints = getPlatformConstraints(platforms[i]);

    // Combine allowedMediaTypes (intersection)
    if (
      combined.allowedMediaTypes &&
      currentPlatformConstraints.allowedMediaTypes
    ) {
      combined.allowedMediaTypes = combined.allowedMediaTypes.filter((type) =>
        currentPlatformConstraints.allowedMediaTypes?.includes(type)
      );
    } else {
      combined.allowedMediaTypes = undefined; // If one doesn't specify, or if intersection is empty
    }

    // MaxFileSizeMB: take the minimum
    if (currentPlatformConstraints.maxFileSizeMB !== undefined) {
      combined.maxFileSizeMB = Math.min(
        combined.maxFileSizeMB ?? Infinity,
        currentPlatformConstraints.maxFileSizeMB
      );
    }

    // Image constraints
    combined.image ??= {};
    if (currentPlatformConstraints.image) {
      if (currentPlatformConstraints.image.maxDimensions) {
        combined.image.maxDimensions = {
          width: Math.min(
            combined.image.maxDimensions?.width ?? Infinity,
            currentPlatformConstraints.image.maxDimensions.width
          ),
          height: Math.min(
            combined.image.maxDimensions?.height ?? Infinity,
            currentPlatformConstraints.image.maxDimensions.height
          ),
        };
      }
      if (currentPlatformConstraints.image.minDimensions) {
        combined.image.minDimensions = {
          width: Math.max(
            combined.image.minDimensions?.width ?? 0,
            currentPlatformConstraints.image.minDimensions.width
          ),
          height: Math.max(
            combined.image.minDimensions?.height ?? 0,
            currentPlatformConstraints.image.minDimensions.height
          ),
        };
      }
      // Aspect ratios: more complex, for now, we might just list all or prioritize common ones.
      // For strict validation, we'd need to find common supported aspect ratios.
      // This example doesn't implement full aspect ratio combination logic for brevity.
    }

    // Video constraints (similar logic)
    combined.video ??= {};
    if (currentPlatformConstraints.video) {
      if (currentPlatformConstraints.video.maxDurationSeconds) {
        combined.video.maxDurationSeconds = Math.min(
          combined.video.maxDurationSeconds ?? Infinity,
          currentPlatformConstraints.video.maxDurationSeconds
        );
      }
      if (currentPlatformConstraints.video.minDurationSeconds) {
        combined.video.minDurationSeconds = Math.max(
          combined.video.minDurationSeconds ?? 0,
          currentPlatformConstraints.video.minDurationSeconds
        );
      }
      // Similar logic for dimensions and bitrates
    }
  }
  if (combined.maxFileSizeMB === Infinity) combined.maxFileSizeMB = undefined;
  return combined;
};

export const validateFileWithPlatforms = async (
  file: File,
  selectedPlatforms: string[]
): Promise<{
  valid: boolean;
  message?: string;
  combinedRules?: PlatformMediaConstraints;
}> => {
  const effectiveConstraints = combineConstraints(
    selectedPlatforms.length > 0 ? selectedPlatforms : ["general"]
  );

  const metadata = await getFileMetadata(file);

  const hardErrors: string[] = [];
  const softWarnings: string[] = [];

  // --- File Type ---
  if (
    effectiveConstraints.allowedMediaTypes &&
    !effectiveConstraints.allowedMediaTypes.includes(file.type)
  ) {
    hardErrors.push(
      `Unsupported file type (${
        file.type
      }). Allowed: ${effectiveConstraints.allowedMediaTypes.join(", ")}.`
    );
  }

  // --- File Size ---
  if (
    effectiveConstraints.maxFileSizeMB &&
    file.size > effectiveConstraints.maxFileSizeMB * 1024 * 1024
  ) {
    hardErrors.push(
      `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max: ${
        effectiveConstraints.maxFileSizeMB
      }MB.`
    );
  }

  // --- Image Constraints ---
  if (file.type.startsWith("image/") && effectiveConstraints.image) {
    const img = effectiveConstraints.image;
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const actualRatio = +(width / height).toFixed(2);

    if (
      img.minDimensions &&
      (width < img.minDimensions.width || height < img.minDimensions.height)
    ) {
      hardErrors.push(
        `Image dimensions too small (min ${img.minDimensions.width}x${img.minDimensions.height}px).`
      );
    }

    if (
      img.maxDimensions &&
      (width > img.maxDimensions.width || height > img.maxDimensions.height)
    ) {
      softWarnings.push(
        `Image dimensions exceed recommended max (${img.maxDimensions.width}x${img.maxDimensions.height}px). Most platforms will resize automatically.`
      );
    }

    if (img.aspectRatios && img.aspectRatios.length > 0) {
      const ratioOk = img.aspectRatios.some((ratioStr) => {
        const [w, h] = ratioStr.split(":").map(Number);
        const expected = +(w / h).toFixed(2);
        return Math.abs(expected - actualRatio) <= 0.05;
      });

      if (!ratioOk) {
        softWarnings.push(
          `Aspect ratio is ${actualRatio.toFixed(
            2
          )}. Recommended ratios: ${img.aspectRatios.join(", ")}.`
        );
      }
    }
  }

  // --- Video Constraints ---
  if (file.type.startsWith("video/") && effectiveConstraints.video) {
    const vid = effectiveConstraints.video;
    const duration = metadata.duration ?? 0;
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const actualRatio = +(width / height).toFixed(2);

    if (vid.minDurationSeconds && duration < vid.minDurationSeconds) {
      hardErrors.push(`Video too short (min ${vid.minDurationSeconds}s).`);
    }

    if (vid.maxDurationSeconds && duration > vid.maxDurationSeconds) {
      hardErrors.push(`Video too long (max ${vid.maxDurationSeconds}s).`);
    }

    if (
      vid.minDimensions &&
      (width < vid.minDimensions.width || height < vid.minDimensions.height)
    ) {
      hardErrors.push(
        `Video dimensions too small (min ${vid.minDimensions.width}x${vid.minDimensions.height}px).`
      );
    }

    if (
      vid.maxDimensions &&
      (width > vid.maxDimensions.width || height > vid.maxDimensions.height)
    ) {
      softWarnings.push(
        `Video dimensions exceed recommended max (${vid.maxDimensions.width}x${vid.maxDimensions.height}px). Most platforms will resize automatically.`
      );
    }

    if (vid.aspectRatios && vid.aspectRatios.length > 0) {
      const ratioOk = vid.aspectRatios.some((ratioStr) => {
        const [w, h] = ratioStr.split(":").map(Number);
        const expected = +(w / h).toFixed(2);
        return Math.abs(expected - actualRatio) <= 0.05;
      });

      if (!ratioOk) {
        softWarnings.push(
          `Aspect ratio is ${actualRatio.toFixed(
            2
          )}. Recommended ratios: ${vid.aspectRatios.join(", ")}.`
        );
      }
    }
  }

  // --- Compose Message ---
  if (hardErrors.length > 0) {
    let fullMessage = `File "${file.name}" cannot be used:\n• ${hardErrors.join(
      "\n• "
    )}`;
    return {
      valid: false,
      message: fullMessage,
      combinedRules: effectiveConstraints,
    };
  }

  if (softWarnings.length > 0) {
    const warnMessage = `File "${
      file.name
    }" was accepted with warnings:\n• ${softWarnings.join("\n• ")}`;
    return {
      valid: true,
      message: warnMessage,
      combinedRules: effectiveConstraints,
    };
  }

  return { valid: true, combinedRules: effectiveConstraints };
};

export const handleFileInputChange = async (
  e: React.ChangeEvent<HTMLInputElement>,
  fileInputRef: React.RefObject<HTMLInputElement>,
  media: MediaItem[],
  onChange: (media: MediaItem[]) => void,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  selectedPlatforms: string[],
  setValidationMessage: React.Dispatch<React.SetStateAction<string | null>>,
  validationMessage: string | null
) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    await processFiles(
      files,
      media,
      onChange,
      setIsUploading,
      setUploadProgress,
      selectedPlatforms,
      setValidationMessage,
      validationMessage
    );
  }
  if (fileInputRef.current) {
    fileInputRef.current.value = ""; // Reset file input
  }
};

export const handleDropEvent = async (
  e: React.DragEvent<HTMLButtonElement>,
  setDragOver: React.Dispatch<React.SetStateAction<boolean>>,
  media: MediaItem[],
  onChange: (media: MediaItem[]) => void,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  selectedPlatforms: string[],
  setValidationMessage: React.Dispatch<React.SetStateAction<string | null>>,
  validationMessage: string | null
) => {
  e.preventDefault();
  setDragOver(false);
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    await processFiles(
      files,
      media,
      onChange,
      setIsUploading,
      setUploadProgress,
      selectedPlatforms,
      setValidationMessage,
      validationMessage
    );
  }
};

export const processFiles = async (
  files: FileList,
  currentMedia: MediaItem[],
  onChange: (media: MediaItem[]) => void,
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>,
  selectedPlatforms: string[],
  setValidationMessage: React.Dispatch<React.SetStateAction<string | null>>,
  validationMessage: string | null
) => {
  setValidationMessage(null); // Clear previous messages
  const newMediaItems: MediaItem[] = [];
  let combinedRulesMessageShown = false;

  const filesToProcess = Array.from(files).slice(0, 10 - currentMedia.length);

  if (filesToProcess.length === 0 && files.length > 0) {
    setValidationMessage("Maximum of 10 files already reached.");
    return;
  }

  for (const file of filesToProcess) {
    const validationResult = await validateFileWithPlatforms(
      file,
      selectedPlatforms
    );
    if (!validationResult.valid) {
      setValidationMessage(
        validationResult.message ?? "File validation failed."
      );
      // As per user: stop and warn. The message is set, user can decide.
      // If we need to show combined rules for *all* selected platforms even if one file is fine:
      if (
        selectedPlatforms.length > 1 &&
        validationResult.combinedRules &&
        !combinedRulesMessageShown
      ) {
        // This part of the message is now included in validateFileWithPlatforms
        // setValidationMessage( (prev) => (prev ? prev + "\n" : "") + `Applied combined rules for ${selectedPlatforms.join(', ')}.`);
        combinedRulesMessageShown = true;
      }
      // For now, we stop processing further files if one fails hard validation, or collect all errors.
      // Current logic: sets message and stops adding this file. Continues to next file.
      toast({
        title: "Validation Error",
        description: validationResult.message,
        variant: "destructive",
      });
      continue; // Skip this file
    }

    // If user wants to be warned about combined rules even if file is fine for those combined rules:
    if (
      selectedPlatforms.length > 1 &&
      validationResult.combinedRules &&
      !combinedRulesMessageShown
    ) {
      const platformNames = selectedPlatforms.join(", ");
      const generalWarning = `Media will be checked against the combined strictest rules for: ${platformNames}. Some platforms might have more lenient individual rules not applied here.`;
      setValidationMessage(generalWarning);
      toast({
        title: "Multi-Platform Upload",
        description: generalWarning,
        variant: "default",
      });
      combinedRulesMessageShown = true; // Show this general warning only once per batch
    }

    let processedFile = file;

    const mediaItem: MediaItem = {
      id: crypto.randomUUID(),
      file: processedFile,
      url: URL.createObjectURL(processedFile),
      type: processedFile.type.startsWith("image/") ? "image" : "video",
      uploadProgress: 0,
    };

    if (mediaItem.type === "video") {
      try {
        const thumbnailUrl = await generateVideoThumbnail(processedFile);
        mediaItem.thumbnailUrl = thumbnailUrl;
      } catch (err) {
        console.warn(`Could not generate thumbnail for ${file.name}:`, err);
        toast({
          title: "Thumbnail Warning",
          description: `Preview thumbnail for ${file.name} could not be generated.`,
          variant: "default",
        });
      }
    }
    newMediaItems.push(mediaItem);
  }

  if (
    newMediaItems.length === 0 &&
    filesToProcess.length > 0 &&
    !validationMessage
  ) {
    // This case means files were skipped due to validation, and a message should already be set.
    // If no message, it's an unexpected state.
    setValidationMessage(
      "No valid files were selected or an unknown error occurred."
    );
    return;
  }

  if (
    newMediaItems.length === 0 &&
    filesToProcess.length === 0 &&
    files.length > 0
  ) {
    // This means files were attempted but filtered out by the 10 file limit before validation
    // The message for this is handled before the loop
    return;
  }

  if (newMediaItems.length > 0) {
    onChange([...currentMedia, ...newMediaItems]);
    // Simulate backend upload process for each new item
    setIsUploading(true);
    // This part needs to be more granular if tracking individual file progress to backend
    // For now, a general progress for the batch
    let overallProgress = 0;
    const progressInterval = setInterval(() => {
      overallProgress += 10;
      if (overallProgress <= 100) {
        setUploadProgress(overallProgress);
        // Update individual media items' progress if needed
        // const updatedOnChangeMedia = currentMedia.map(m => newMediaItems.find(nm => nm.id === m.id) ? {...m, uploadProgress: overallProgress} : m);
        // onChange([...updatedOnChangeMedia, ...newMediaItems.filter(nm => !currentMedia.find(m => m.id === nm.id))]);
      } else {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0); // Reset after completion
        toast({
          title: "Upload Complete",
          description: `${newMediaItems.length} file(s) processed and ready for backend. (Simulated)`,
        });

        // Here, you would typically call your actual backend API for each item
        // e.g., newMediaItems.forEach(item => uploadToServer(item.file));
        // And update item.processedUrl and item.status upon success/failure from backend
      }
    }, 200);
  }
};

// --- Keep existing DragOver/DragLeave handlers ---
export const handleDragOverEvent = (
  e: React.DragEvent<HTMLButtonElement>,
  setDragOver: React.Dispatch<React.SetStateAction<boolean>>
) => {
  e.preventDefault();
  setDragOver(true);
};

export const handleDragLeaveEvent = (
  e: React.DragEvent<HTMLButtonElement>,
  setDragOver: React.Dispatch<React.SetStateAction<boolean>>
) => {
  e.preventDefault();
  setDragOver(false);
};

export const generateVideoThumbnail = (
  file: File,
  timeInSeconds = 1
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    // Create object URL
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = () => {
      // Clamp time to duration if too long
      const clampedTime = Math.min(timeInSeconds, video.duration - 0.1);
      video.currentTime = clampedTime;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.8);

      // Cleanup
      URL.revokeObjectURL(url);
      resolve(thumbnailDataUrl);
    };

    video.onerror = (e) => {
      console.error("Error loading video:", e);
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load video for thumbnail generation"));
    };
  });
};

export function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(url); // Clean up blob URL
    };

    img.onerror = (err) => {
      console.error("Error loading image:", err);
      reject(new Error("Could not load image to determine dimensions"));
      URL.revokeObjectURL(url);
    };

    img.src = url;
  });
}

export function getMediaDimensions(
  file: File
): Promise<{ width: number; height: number; type: "image" | "video" }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);

    if (file.type.startsWith("image/")) {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height, type: "image" });
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        reject(new Error("Could not load image to determine dimensions"));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    } else if (file.type.startsWith("video/")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          type: "video",
        });
        URL.revokeObjectURL(url);
      };
      video.onerror = () => {
        reject(new Error("Could not load video to determine dimensions"));
        URL.revokeObjectURL(url);
      };
      video.src = url;
    } else {
      URL.revokeObjectURL(url);
      reject(new Error("Unsupported media type"));
    }
  });
}
