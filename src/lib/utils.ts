import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { apiRequest } from "./queryClient";
import { MediaItem } from "../components/posts/post-flow/MediaUpload";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getDateKey = (date: string) =>
  format(parseISO(date), "yyyy-MM-dd");

export function formatDate(date: string | Date, formatStr: string = "PPP") {
  if (!date) return "";
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function getSocialIcon(platform: string) {
  switch (platform.toLowerCase()) {
    case "twitter":
      return "ri-twitter-fill";
    case "instagram":
      return "ri-instagram-line";
    case "linkedin":
      return "ri-linkedin-box-fill";
    case "facebook":
      return "ri-facebook-circle-fill";
    case "threads":
      return "ri-threads-line";
    case "tiktok":
      return "ri-tiktok-line";
    case "youtube":
      return "ri-youtube-line";
    default:
      return "ri-global-line";
  }
}

export async function joinWaitlist(data: any) {
  const response = await apiRequest("POST", "/waitlist", data);
  return response;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Could not copy text: ", err);
    return false;
  }
}

export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

export function getClassName(platform: string) {
  switch (platform) {
    case "twitter":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "instagram":
      return "bg-pink-50 dark:bg-pink-900/20";
    case "linkedin":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "facebook":
      return "bg-blue-50 dark:bg-blue-900/20";
    case "threads":
      return "bg-black dark:bg-white dark:text-black";
    default:
      return "bg-gray-50 dark:bg-gray-800";
  }
}

export function getTextColor(platform: string) {
  switch (platform) {
    case "twitter":
      return "text-blue-500";
    case "instagram":
      return "text-pink-500";
    case "linkedin":
      return "text-blue-600";
    case "threads":
      return "text-black dark:text-white";
    case "tiktok":
      return "text-pink-500";
    case "youtube":
      return "text-red-500";
    case "facebook":
      return "text-blue-600";
    default:
      return "text-gray-500";
  }
}

// Count accounts by platform
export const platformCounts = (accounts: any[]) => {
  return accounts.reduce((acc, account) => {
    const platform = account.platform.toLowerCase();
    acc[platform] = (acc[platform] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const handleMediaChange = (
  mediaItems: MediaItem[],
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>
) => {
  setMedia(mediaItems);
};

export const handleSchedulingChange = (
  scheduled: boolean,
  date: Date | null,
  setIsScheduled: React.Dispatch<React.SetStateAction<boolean>>,
  setScheduledDate: React.Dispatch<React.SetStateAction<Date | null>>
) => {
  setIsScheduled(scheduled);
  setScheduledDate(date);
};


// Helper to count selected accounts per platform
export const countSelectedByPlatform = (
  accounts: any[],
  selectedAccounts: string[]
) => {
  return accounts
    .filter((account) => selectedAccounts.includes(account._id))
    .reduce((acc, account) => {
      const platform = account.platform.toLowerCase();
      acc[platform] = (acc[platform] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);
};

