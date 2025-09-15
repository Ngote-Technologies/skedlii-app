import { useNavigate } from "react-router-dom";
import { toast } from "../../../../hooks/use-toast";
import socialApi from "../../../../api/socialApi";
import { uploadToCloudinary } from "../../../../api/upload";
import { useAuth } from "../../../../store/hooks";
import {
  getImageDimensions,
  getMediaDimensions,
} from "../../../../lib/mediaUtils";
import { TikTokOptions, isValidTikTokOptions } from "../TikTokSettingsDrawer";
import { MediaItem } from "../MediaUpload";

interface Account {
  _id: string;
  accountId: string;
  accountName: string;
  accountType: string;
  platform: string;
  platformId: string;
  avatar?: string;
}

interface UsePostSubmissionParams {
  selectedAccounts: string[];
  globalCaption: string;
  platformCaptions: Record<string, string>;
  socialAccounts: Account[];
  tiktokAccountOptions: Record<string, TikTokOptions>;
  filledTikTokAccounts: string[];
  media: MediaItem[];
  isScheduled: boolean;
  scheduledDate: Date | null;
  setIsSubmitting: (v: boolean) => void;
}

export function usePostSubmission({
  selectedAccounts,
  globalCaption,
  platformCaptions,
  socialAccounts,
  tiktokAccountOptions,
  filledTikTokAccounts,
  media,
  isScheduled,
  scheduledDate,
  setIsSubmitting,
}: UsePostSubmissionParams) {
  const navigate = useNavigate();
  const { organization } = useAuth();

  // Build SSOT media array; upload local files to Cloudinary when needed
  const buildSSOTMedia = async (items: MediaItem[]) => {
    const result: Array<{
      type: "image" | "video";
      url: string;
      width?: number;
      height?: number;
      durationSec?: number;
      ref?: string;
    }> = [];

    for (const item of items) {
      let url = item.url;
      let ref: string | undefined = undefined;

      // Upload if we still have a blob URL or no publicId
      const needsUpload = /^blob:/.test(url);
      if (needsUpload) {
        const uploaded = await uploadToCloudinary(item.file);
        if (!uploaded) throw new Error("Cloudinary upload failed");
        url = uploaded.url;
        // our upload helper returns id as the publicId
        ref = uploaded.id;
      }

      const dims =
        item.type === "image"
          ? await getImageDimensions(item.file)
          : await getMediaDimensions(item.file);

      result.push({
        type: item.type,
        url,
        width: dims?.width,
        height: dims?.height,
        // durationSec best-effort from getMediaDimensions for videos
        durationSec: (dims as any)?.duration ?? undefined,
        ref,
      });
    }
    return result;
  };

  const handleSubmit = async () => {
    if (selectedAccounts.length === 0) {
      toast.error({
        title: "No Account Selected",
        description: "Select at least one account to post to.",
      });
      return;
    }

    if (globalCaption.trim().length === 0) {
      toast.error({
        title: "Caption Required",
        description: "Caption cannot be empty.",
      });
      return;
    }

    const selectedAccountsData = socialAccounts.filter((account) =>
      selectedAccounts.includes(account._id)
    );
    const platforms = Array.from(
      new Set(selectedAccountsData.map((account) => account.platform))
    );

    const allValid = Object.entries(tiktokAccountOptions).every(
      ([id, opts]) =>
        filledTikTokAccounts.includes(id) && isValidTikTokOptions(opts)
    );

    if (platforms.includes("tiktok") && !allValid) {
      toast.warning({
        title: "TikTok Settings Incomplete",
        description: "Go to media tab, select TikTok Settings and fill out all required fields to complete your post.",
      });
      return;
    }

    setIsSubmitting(true);

    const targets = selectedAccountsData.map((acc) => ({
      platform: acc.platform,
      socialAccountId: acc._id,
    }));

    const mediaTypes = Array.from(new Set(media.map((item) => item.type)));

    let postType: "image" | "video" | "text" | "mixed";

    if (media.length === 0) {
      postType = "text";
    } else if (mediaTypes.length === 1) {
      postType = mediaTypes[0] as any;
    } else {
      postType = "mixed";
    }

    if (postType === "mixed") {
      toast.error({
        title: "Unsupported Media Combination",
        description: "Please upload only images or only videos, not both.",
      });
      setIsSubmitting(false);
      return;
    }

    // Prepare SSOT media (uploads to Cloudinary if needed)
    const ssotMedia = await buildSSOTMedia(media);

    // Compute Idempotency-Key (simple stable key from payload)
    const baseString = JSON.stringify({
      orgId: organization?._id,
      content: globalCaption,
      targets: targets.map((t) => t.socialAccountId).sort(),
      media: ssotMedia.map((m) => m.ref || m.url).sort(),
      scheduleAt: isScheduled && scheduledDate
        ? new Date(scheduledDate).toISOString()
        : null,
    });
    // Base64-encode to a stable, ASCII-safe key
    const base64 = typeof window !== 'undefined' && window.btoa
      ? window.btoa(unescape(encodeURIComponent(baseString)))
      : Buffer.from(baseString).toString('base64');
    const idemKey = base64.slice(0, 128);

    try {
      // Simulate progress
      await new Promise((res) => setTimeout(res, 500));
      toast.loading({ title: "Processing", description: "Preparing your content..." });

      if (media.length > 0) {
        await new Promise((res) => setTimeout(res, 1000));
        toast.loading({
          title: "Processing",
          description: "Warming up your hashtags...",
        });
      }

      await new Promise((res) => setTimeout(res, 1500));

      if (isScheduled && scheduledDate) {
        toast.loading({
          title: "Processing",
          description: "Skedlii is lining up your post...",
        });
      } else {
        toast.loading({
          title: "Processing",
          description: "Queueing your awesomeness...",
        });
      }

      if (isScheduled && scheduledDate) {
        await socialApi.scheduleSSOT(
          {
            content: globalCaption,
            targets,
            media: ssotMedia,
            scheduleAt: new Date(scheduledDate).toISOString(),
          },
          { headers: { "Idempotency-Key": idemKey } }
        );
      } else {
        await socialApi.postNowSSOT(
          {
            content: globalCaption,
            targets,
            media: ssotMedia,
            scheduleAt: null,
          },
          { headers: { "Idempotency-Key": idemKey } }
        );
      }

      toast.success({
        title: "Success",
        description: isScheduled
          ? "Your post has been scheduled!"
          : "Your post has been published!",
      });

      navigate(`/dashboard/${isScheduled ? "scheduled" : "posts"}`);
    } catch (err: any) {
      console.error("Submission error:", err);
      toast.error({
        title: "Post Submission Failed",
        description: err.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return { handleSubmit };
}
