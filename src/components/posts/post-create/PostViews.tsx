import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import { Loader2, X } from "lucide-react";
import { getSocialIcon } from "../../../lib/utils";
import { SelectItem } from "../../ui/select";
import { useRef, useState } from "react";
import { toast } from "../../../hooks/use-toast";
import { UploadedMedia } from "../../../types/media";
import { uploadToCloudinary } from "../../../api/upload";

export function InstagramMediaDropzone({
  uploadedMedia,
  setUploadedMedia,
}: {
  readonly uploadedMedia: UploadedMedia[];
  readonly setUploadedMedia: (media: UploadedMedia[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);
    try {
      // const uploads = await uploadToCloudinary(files[0]);
      const uploadPromises = files.map((file) => uploadToCloudinary(file));
      // setUploadedMedia([...uploadedMedia, ...uploads]);
      try {
        const uploaded = await Promise.all(uploadPromises);
        setUploadedMedia([
          ...uploadedMedia,
          ...(uploaded.filter(Boolean) as any[]),
        ]);
      } catch (error) {
        console.error("Error uploading files:", error);
        setIsUploading(false);
        toast({
          title: "Error",
          description: "Error uploading files",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    if (droppedFiles.length) {
      handleUpload(droppedFiles);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    handleUpload(selected);
  };

  const handleRemove = (index: number) => {
    const updated = [...uploadedMedia];
    updated.splice(index, 1);
    setUploadedMedia(updated);
  };

  return (
    <div className="space-y-2">
      <label className="font-medium">Instagram Media</label>

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-muted p-6 rounded-md text-sm text-muted-foreground text-center cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            Uploading...
          </div>
        ) : (
          "Drag & drop media here, or click to select"
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {uploadedMedia.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
          {uploadedMedia.map((media, idx) => (
            <div
              key={media.publicId}
              className="relative border rounded overflow-hidden bg-muted"
            >
              {media.type === "image" ? (
                <img
                  src={media.url}
                  alt={`media-${idx}`}
                  className="object-cover w-full h-32"
                />
              ) : (
                <video
                  src={media.url}
                  className="w-full h-32 object-cover"
                  controls
                />
              )}
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-1 right-1 h-6 w-6"
                onClick={() => handleRemove(idx)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MediaLinksInput({
  mediaLinks,
  newMediaLink,
  setNewMediaLink,
  addMediaLink,
  removeMediaLink,
}: {
  readonly mediaLinks: string[];
  readonly newMediaLink: string;
  readonly setNewMediaLink: (v: string) => void;
  readonly addMediaLink: () => void;
  readonly removeMediaLink: (link: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="font-medium" htmlFor="media-link">
        Media
      </label>
      <div className="flex gap-2">
        <Input
          placeholder="Add image or video URL"
          value={newMediaLink}
          onChange={(e) => setNewMediaLink(e.target.value)}
          id="media-link"
        />
        <Button type="button" onClick={addMediaLink} size="sm">
          Add
        </Button>
      </div>

      {mediaLinks.length > 0 && (
        <div className="mt-2 space-y-2">
          {mediaLinks.map((link, index) => (
            <div
              key={`${link}-${index}`}
              className="flex items-center justify-between p-2 border rounded-md"
            >
              <div className="truncate flex-1">{link}</div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeMediaLink(link)}
              >
                <X size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AccountSelection({ socialAccounts, field, isFetching }: any) {
  if (isFetching) {
    return <p>Loading accounts...</p>;
  }

  if (socialAccounts.length === 0) {
    return (
      <div className="text-center p-2 border rounded-md bg-muted">
        <p className="text-muted-foreground">No social accounts connected</p>
        <Button variant="link" size="sm" asChild className="mt-1">
          <a href="/dashboard/accounts">Connect an account</a>
        </Button>
      </div>
    );
  }

  return (
    <>
      {socialAccounts.map((account: any) => (
        <div
          key={account._id}
          className="flex items-center space-x-2 border p-2 rounded-md"
        >
          <input
            type="radio"
            id={account._id}
            checked={field.value === account._id}
            onChange={() => field.onChange(account._id)}
            className="h-4 w-4"
          />
          <label
            htmlFor={account._id}
            className="flex items-center space-x-2 text-sm cursor-pointer"
          >
            <i className={`${getSocialIcon(account.platform)} text-lg`}></i>
            <span>{account?.metadata?.username ?? account.accountName}</span>
          </label>
        </div>
      ))}
    </>
  );
}

export function PostStatusControls({ field }: any) {
  return (
    <div className="flex space-x-2">
      <Button
        type="button"
        variant={field.value === "scheduled" ? "default" : "outline"}
        onClick={() => field.onChange("scheduled")}
        size="sm"
      >
        Schedule
      </Button>
      <Button
        type="button"
        variant={field.value === "published" ? "default" : "outline"}
        onClick={() => field.onChange("published")}
        size="sm"
      >
        Post Now
      </Button>
    </div>
  );
}

export const getCollectionDisplay = (
  isFetchingCollections: boolean,
  collections: any
) => {
  if (isFetchingCollections) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (collections.count > 0) {
    return collections.data.map((collection: any) => (
      <SelectItem key={collection._id} value={collection._id}>
        {collection.name}
      </SelectItem>
    ));
  }

  return (
    <SelectItem value="none" disabled>
      No collections available
    </SelectItem>
  );
};
