import {
  FaXTwitter,
  FaYoutube,
  FaThreads,
  FaTiktok,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa6";

const isDev = import.meta.env.VITE_APP_ENV === "development";

export const platformConfigs = [
  {
    name: "Instagram",
    label: "instagram",
    logo: FaInstagram,
    theme: {
      bg: "bg-[#FCE4EC]",
      border: "border-[#C13584]",
      text: "text-[#C13584]",
    },
    description:
      "Schedule and publish media content to your connected account.",
    permissions: ["Post content", "Upload media"],
    constraints: "Instagram account must be a Business or Creator profile.",
    scopes: [
      "instagram_basic",
      "pages_show_list",
      "pages_read_engagement",
      "instagram_content_publish",
    ],
    platformDocsUrl: "https://developers.facebook.com/docs/instagram-api",
    comingSoon: false,
  },
  {
    name: "Facebook",
    label: "facebook",
    logo: FaFacebook,
    theme: {
      bg: "bg-[#E3F2FD]",
      border: "border-[#1877F2]",
      text: "text-[#1877F2]",
    },
    description:
      "Schedule and publish text/media content to your Facebook Page.",
    permissions: ["Post content", "Upload media"],
    constraints: "Facebook Page linked to your account.",
    scopes: ["pages_manage_posts", "pages_read_engagement", "pages_show_list"],
    platformDocsUrl: "https://developers.facebook.com/docs/pages",
    comingSoon: false,
  },
  {
    name: "Threads",
    label: "threads",
    logo: FaThreads,
    theme: {
      bg: "bg-[#EDEDED]",
      border: "border-black",
      text: "text-black",
    },
    description: "Schedule and publish threads to your connected account.",
    permissions: ["Post threads", "Upload media"],
    constraints: "Threads account connected to Instagram.",
    scopes: [], // currently non-public API
    platformDocsUrl: "https://developers.facebook.com/docs/threads",
    comingSoon: false,
  },
  {
    name: "YouTube",
    label: "youtube",
    logo: FaYoutube,
    theme: {
      bg: "bg-[#FFEBEE]",
      border: "border-[#FF0000]",
      text: "text-[#FF0000]",
    },
    description: "Schedule and publish videos to your connected channel.",
    permissions: ["Upload videos", "Edit metadata"],
    constraints: "YouTube channel.",
    scopes: ["https://www.googleapis.com/auth/youtube.upload"],
    platformDocsUrl:
      "https://developers.google.com/youtube/registering_an_application",
    comingSoon: false,
  },
  {
    name: "LinkedIn",
    label: "linkedin",
    logo: FaLinkedin,
    theme: {
      bg: "bg-[#E1F5FE]",
      border: "border-[#0077B5]",
      text: "text-[#0077B5]",
    },
    description:
      "Schedule and publish content to your LinkedIn feed or company page.",
    permissions: ["Post content", "Upload media"],
    constraints: "Appropriate post permissions (e.g. admin on Page).",
    scopes: ["w_member_social", "r_liteprofile", "r_emailaddress"],
    platformDocsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/",
    comingSoon: false,
  },
  {
    name: "TikTok",
    label: "tiktok",
    logo: FaTiktok,
    theme: {
      bg: "bg-[#F9F5FF]",
      border: "border-[#010101]",
      text: "text-[#010101]",
    },
    description: "Schedule and publish video posts to your TikTok account.",
    permissions: ["Upload videos", "Publish videos"],
    constraints: "Business or creator account.",
    scopes: ["video.upload", "video.publish"],
    platformDocsUrl:
      "https://developers.tiktok.com/doc/login-kit-manage-user-access-token",
    comingSoon: false,
  },
  {
    name: "X(Twitter)",
    label: "twitter",
    logo: FaXTwitter,
    theme: {
      bg: "bg-[#F9F5FF]",
      border: "border-[#010101]",
      text: "text-[#010101]",
    },
    description: "Post tweets, schedule threads, and view basic profile info.",
    permissions: ["Read basic profile information", "Post tweets"],
    constraints: "Only text posts are supported for now.",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
    platformDocsUrl: "https://developer.twitter.com/en/docs/twitter-api",
    comingSoon: !isDev,
  },
];
