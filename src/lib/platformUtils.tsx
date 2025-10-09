import {
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaTiktok,
  FaThreads,
  FaYoutube,
} from "react-icons/fa6";
import { Globe } from "lucide-react";

// Helper function to get platform icon
export const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return <FaInstagram className="h-4 w-4" />;
    case "twitter":
      return <FaXTwitter className="h-4 w-4" />;
    case "facebook":
      return <FaFacebook className="h-4 w-4" />;
    case "linkedin":
      return <FaLinkedin className="h-4 w-4" />;
    case "tiktok":
      return <FaTiktok className="h-4 w-4" />;
    case "threads":
      return <FaThreads className="h-4 w-4" />;
    case "youtube":
      return <FaYoutube className="h-4 w-4" />;
    case "global":
      return <Globe className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

// Helper function to get platform background colors
export const getPlatformBgColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "bg-[#E1306C]";
    case "twitter":
      return "bg-[#1DA1F2]";
    case "facebook":
      return "bg-[#1877F2]";
    case "linkedin":
      return "bg-[#0A66C2]";
    case "tiktok":
      return "bg-[#010101]";
    case "threads":
      return "bg-black dark:bg-white dark:text-black";
    case "youtube":
      return "bg-[#FF0000]";
    default:
      return "bg-gray-500";
  }
};

// Helper function to get platform text colors
export const getPlatformTextColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "instagram":
      return "text-[#E1306C]";
    case "twitter":
      return "text-[#1DA1F2]";
    case "facebook":
      return "text-[#1877F2]";
    case "linkedin":
      return "text-[#0A66C2]";
    case "tiktok":
      return "text-[#000000] dark:text-white";
    case "threads":
      return "text-[#000000] dark:text-white";
    case "youtube":
      return "text-[#FF0000]";
    default:
      return "text-gray-500";
  }
};

// Helper function to get simplified platform text colors
export const getPlatformSimpleTextColor = (platform: string): string => {
  switch (platform.toLowerCase()) {
    case "twitter":
      return "text-blue-500";
    case "instagram":
    case "tiktok":
      return "text-pink-500";
    case "facebook":
      return "text-blue-600";
    case "linkedin":
      return "text-blue-700";
    case "threads":
      return "text-black dark:text-white";
    case "youtube":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
};
