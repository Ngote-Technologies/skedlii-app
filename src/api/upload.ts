import { MediaItem } from "../components/posts/post-flow/MediaUpload";
import axiosInstance from "./axios";

export async function uploadToCloudinary(
  file: File,
  onProgress?: (percent: number) => void
): Promise<MediaItem | null> {
  const publicId = `${file.name.split(".")[0]}-${Date.now()}`;

  const res = await axiosInstance.post("/media/cloudinary/signature", {
    public_id: publicId,
    folder: "skedlii",
  });

  if (!res.data) throw new Error("Failed to get Cloudinary signature");
  const { signature, timestamp, apiKey, cloudName } = res.data;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("public_id", publicId);
  formData.append("folder", "skedlii");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    });

    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({
              id: publicId,
              url: data.secure_url,
              file,
              type: file.type.startsWith("video/") ? "video" : "image",
              thumbnailUrl: file.type.startsWith("video/")
                ? "" // You may add thumbnail logic later
                : data.secure_url,
              thumbnailTime: 0,
            });
          } else {
            reject(new Error(data.error?.message ?? "Upload failed"));
          }
        } catch (err) {
          reject(err as Error);
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));

    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`
    );
    xhr.send(formData);
  });
}
