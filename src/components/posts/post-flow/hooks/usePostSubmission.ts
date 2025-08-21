import { useNavigate } from "react-router-dom";
import { toast } from "../../../../hooks/use-toast";
import socialApi from "../../../../api/socialApi";
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

  const handleFormData = async (postData: any, media: MediaItem[]) => {
    const formData = new FormData();
    formData.append("postData", JSON.stringify(postData));

    for (const item of media) {
      const dimensions =
        item.type === "image"
          ? await getImageDimensions(item.file)
          : await getMediaDimensions(item.file);
      formData.append("media", item.file, item.id);
      formData.append(
        "dimensions[]",
        JSON.stringify({
          id: item.id,
          width: dimensions.width,
          height: dimensions.height,
        })
      );
    }

    return formData;
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

    const platformData = platforms.map((platform) => ({
      platform,
      accounts: selectedAccountsData
        .filter((acc) => acc.platform === platform)
        .map((acc) => acc._id),
      caption: platformCaptions[platform] || globalCaption,
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

    const mediaUrls = media.map((item) => item.url);

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

      const method = isScheduled
        ? socialApi.schedulePost
        : socialApi.postToMultiPlatform;

      for (const { platform, accounts, caption } of platformData) {
        const platformAccounts = selectedAccountsData.filter(
          (acc) => acc.platform === platform && accounts.includes(acc._id)
        );

        for (const account of platformAccounts) {
          const basePost = isScheduled
            ? {
                content: caption,
                platforms: [
                  {
                    platform,
                    accountId: account.accountId,
                    accountName: account.accountName,
                    accountType: account.accountType,
                  },
                ],
                media: mediaUrls,
                scheduledFor: new Date(scheduledDate!),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                mediaType: postType,
              }
            : {
                content: caption,
                accountId: account.accountId,
                userId: account._id,
                media: mediaUrls,
                accountName: account.accountName,
                accountType: account.accountType,
                platform: platform,
                platformId: account.platformId,
                mediaType: postType,
              };

          if (platform === "tiktok") {
            const opts = tiktokAccountOptions[account._id];
            if (opts) {
              (basePost as any).tiktokAccountOptions = {
                title: opts.title,
                privacy: opts.privacy,
                allowComments: opts.allowComments,
                allowDuet: opts.allowDuet,
                allowStitch: opts.allowStitch,
                isCommercial: opts.isCommercial,
                brandType: opts.brandType,
                agreedToPolicy: opts.agreedToPolicy,
              };
            }
          }

          const formData = await handleFormData(basePost, media);
          await method(formData);
        }
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
