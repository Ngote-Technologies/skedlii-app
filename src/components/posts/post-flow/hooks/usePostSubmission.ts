import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../../../hooks/use-toast";
import postDraftsApi, {
  CreatePostDraftPayload,
  DraftTargetPayload,
  PostDraftMediaPayload,
  PlatformName,
} from "../../../../api/postDrafts";
import socialApi from "../../../../api/socialApi";
import { uploadToCloudinary } from "../../../../api/upload";
import { useAuth } from "../../../../store/hooks";
import {
  getImageDimensions,
  getMediaDimensions,
} from "../../../../lib/mediaUtils";
import { TikTokOptions, isValidTikTokOptions } from "../TikTokSettingsDrawer";
import { MediaItem } from "../MediaUpload";

const PLATFORM_VALUES: PlatformName[] = [
  "twitter",
  "linkedin",
  "instagram",
  "threads",
  "tiktok",
  "youtube",
  "facebook",
];

interface Account {
  _id: string;
  accountId: string;
  accountName: string;
  accountType: string;
  platform: string;
  platformId: string;
  avatar?: string;
  teamId?: string;
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
  initialDraftId?: string | null;
}

type PendingAction = "save" | "post" | "schedule" | null;

type ValidationResult = {
  selectedAccountsData: Account[];
  captionsByPlatform: Record<string, string>;
  globalCaption: string;
};

const sanitizePlatformCaptions = (captions: Record<string, string>) => {
  if (!captions) return {} as Record<string, string>;
  const entries = Object.entries(captions)
    .map(([platform, caption]) => [
      platform.toLowerCase(),
      caption?.trim?.() ?? "",
    ])
    .filter(([, caption]) => caption.length > 0);
  return Object.fromEntries(entries) as Record<string, string>;
};

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
  initialDraftId = null,
}: UsePostSubmissionParams) {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(
    initialDraftId ?? null
  );
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (initialDraftId) {
      setCurrentDraftId(initialDraftId);
    } else if (initialDraftId === null) {
      setCurrentDraftId(null);
    }
  }, [initialDraftId]);

  const isRecognizedPlatform = (value: string): value is PlatformName => {
    const normalized = value.toLowerCase() as PlatformName;
    return PLATFORM_VALUES.includes(normalized);
  };

  const buildDraftTargets = (): DraftTargetPayload[] => {
    const targets: DraftTargetPayload[] = [];
    for (const accountId of selectedAccounts) {
      const account = socialAccounts.find((acc) => acc._id === accountId);
      if (!account) continue;
      let platformValue = String(account.platform || "").toLowerCase();
      if (platformValue === "x") {
        platformValue = "twitter";
      }
      if (!isRecognizedPlatform(platformValue)) continue;
      const target: DraftTargetPayload = {
        platform: platformValue as PlatformName,
        socialAccountId: account._id,
      };
      if (account.teamId) {
        target.teamId = String(account.teamId);
      }
      targets.push(target);
    }
    return targets;
  };

  const buildSSOTMedia = async (items: MediaItem[]) => {
    const result: PostDraftMediaPayload[] = [];

    for (const item of items) {
      let url = item.url;
      let ref = item.ref;
      let width = item.width;
      let height = item.height;
      let durationSec = item.durationSec;

      if (item.file) {
        const needsUpload = /^blob:/.test(url);
        if (needsUpload) {
          const uploaded = await uploadToCloudinary(item.file);
          if (!uploaded) throw new Error("Cloudinary upload failed");
          url = uploaded.url;
          ref = uploaded.id;
        }

        const dims =
          item.type === "image"
            ? await getImageDimensions(item.file)
            : await getMediaDimensions(item.file);
        width = dims?.width ?? width;
        height = dims?.height ?? height;
        durationSec = (dims as any)?.duration ?? durationSec;
      }

      if (!url) {
        continue;
      }

      result.push({
        type: item.type,
        url,
        width,
        height,
        durationSec,
        ref,
      });
    }

    return result;
  };

  const computeIdempotencyKey = (
    targets: Array<{ socialAccountId: string }>,
    mediaPayload: PostDraftMediaPayload[],
    scheduleAt: string | null,
    captionsByPlatform: Record<string, string>
  ) => {
    const trimmedGlobal = globalCaption.trim();
    const sortedCaptions = Object.entries(captionsByPlatform || {})
      .map(([platform, caption]) => [platform, caption.trim()])
      .sort((a, b) => a[0].localeCompare(b[0]));
    const baseString = JSON.stringify({
      orgId: organization?._id,
      content: trimmedGlobal,
      targets: targets.map((t) => t.socialAccountId).sort(),
      media: mediaPayload.map((m) => m.ref || m.url).sort(),
      scheduleAt,
      platformCaptions: sortedCaptions,
    });

    const base64 =
      typeof window !== "undefined" && window.btoa
        ? window.btoa(unescape(encodeURIComponent(baseString)))
        : Buffer.from(baseString).toString("base64");

    return base64.slice(0, 128);
  };

  const ensureSingleMediaType = () => {
    const mediaTypes = Array.from(new Set(media.map((item) => item.type)));
    if (media.length === 0) return "text" as const;
    if (mediaTypes.length === 1) return mediaTypes[0] as "image" | "video";
    return "mixed" as const;
  };

  const validatePostingInputs = (): ValidationResult | null => {
    if (selectedAccounts.length === 0) {
      toast.error({
        title: "No Account Selected",
        description: "Select at least one account to post to.",
      });
      return null;
    }

    const sanitizedCaptions = sanitizePlatformCaptions(platformCaptions);
    const trimmedGlobal = globalCaption.trim();

    if (
      trimmedGlobal.length === 0 &&
      Object.keys(sanitizedCaptions).length === 0
    ) {
      toast.error({
        title: "Caption Required",
        description:
          "Add a global caption or at least one platform-specific caption.",
      });
      return null;
    }

    const selectedAccountsData = socialAccounts.filter((account) =>
      selectedAccounts.includes(account._id)
    );

    const platforms = Array.from(
      new Set(selectedAccountsData.map((account) => account.platform))
    );

    const allValidTikTok = Object.entries(tiktokAccountOptions).every(
      ([id, opts]) =>
        filledTikTokAccounts.includes(id) && isValidTikTokOptions(opts)
    );

    if (platforms.includes("tiktok") && !allValidTikTok) {
      toast.warning({
        title: "TikTok Settings Incomplete",
        description:
          "Go to media tab, select TikTok Settings and fill out all required fields to complete your post.",
      });
      return null;
    }

    const mediaType = ensureSingleMediaType();
    if (mediaType === "mixed") {
      toast.error({
        title: "Unsupported Media Combination",
        description: "Please upload only images or only videos, not both.",
      });
      return null;
    }

    const captionViolations = selectedAccountsData.filter((account) => {
      const platformKey = String(account.platform || "").toLowerCase();
      const override = sanitizedCaptions[platformKey];
      const resolved = (override && override.trim()) || trimmedGlobal;
      return !resolved || resolved.length === 0;
    });

    if (captionViolations.length) {
      const platformsNeedingCaption = Array.from(
        new Set(
          captionViolations.map((acc) =>
            String(acc.platform || "").toLowerCase()
          )
        )
      ).filter(Boolean);
      toast.error({
        title: "Caption Missing",
        description:
          platformsNeedingCaption.length > 0
            ? `Add a caption for ${platformsNeedingCaption.join(", ")}.`
            : "Add a caption for each selected account.",
      });
      return null;
    }

    return {
      selectedAccountsData,
      captionsByPlatform: sanitizedCaptions,
      globalCaption: trimmedGlobal,
    };
  };

  const saveDraftInternal = async () => {
    const mediaPayload = await buildSSOTMedia(media);
    const sanitizedCaptions = sanitizePlatformCaptions(platformCaptions);
    const targetsPayload = buildDraftTargets();

    const draftPayload: CreatePostDraftPayload = {
      title: globalCaption.trim().slice(0, 80) || undefined,
      content: globalCaption,
      media: mediaPayload,
      platformCaptions: sanitizedCaptions,
      targets: targetsPayload,
    };

    const response = currentDraftId
      ? await postDraftsApi.update(currentDraftId, draftPayload)
      : await postDraftsApi.create(draftPayload);

    setCurrentDraftId(response.draft._id);
    setLastSavedAt(new Date());
    return {
      draft: response.draft,
      mediaPayload,
      platformCaptions: sanitizedCaptions,
    };
  };

  const handleSaveDraft = async () => {
    try {
      setPendingAction("save");
      setIsSubmitting(true);
      await saveDraftInternal();
      toast.success({
        title: "Draft Saved",
        description: "Your draft has been saved.",
      });
    } catch (err: any) {
      console.error("Save draft error:", err);
      toast.error({
        title: "Failed to Save Draft",
        description: err.message || "Please try again.",
      });
    } finally {
      setPendingAction(null);
      setIsSubmitting(false);
    }
  };

  const handlePostNow = async () => {
    const validated = validatePostingInputs();
    if (!validated) return;

    try {
      setPendingAction("post");
      setIsSubmitting(true);
      toast.loading({
        title: "Processing",
        description: "Preparing your content...",
      });

      const mediaPayload = await buildSSOTMedia(media);
      const targets = validated.selectedAccountsData.map((acc) => ({
        platform: acc.platform,
        socialAccountId: acc._id,
      }));

      const idempotencyKey = computeIdempotencyKey(
        targets,
        mediaPayload,
        null,
        validated.captionsByPlatform
      );

      const tiktokOptionsPayload: Record<string, any> = {};
      for (const acc of validated.selectedAccountsData) {
        if (acc.platform === "tiktok" && tiktokAccountOptions[acc._id]) {
          tiktokOptionsPayload[acc._id] = tiktokAccountOptions[acc._id];
        }
      }

      const formattedMedia = mediaPayload.map((item) => ({
        type: item.type,
        url: item.url ?? "",
        width: item.width,
        height: item.height,
        durationSec: item.durationSec,
        ref: item.ref,
      }));

      await socialApi.postNowSSOT(
        {
          content: validated.globalCaption,
          targets,
          media: formattedMedia,
          scheduleAt: null,
          tiktokOptions: tiktokOptionsPayload,
          platformCaptions: validated.captionsByPlatform,
        },
        { headers: { "Idempotency-Key": idempotencyKey } }
      );

      toast.success({
        title: "Post Published",
        description: "Your post has been published!",
      });
      navigate("/dashboard/posts");
    } catch (err: any) {
      console.error("Post now error:", err);
      toast.error({
        title: "Failed to Publish",
        description: err.message || "Please try again.",
      });
    } finally {
      setPendingAction(null);
      setIsSubmitting(false);
    }
  };

  const handleSchedulePost = async () => {
    if (!isScheduled) {
      toast.error({
        title: "Enable Scheduling",
        description: "Turn on scheduling before scheduling a post.",
      });
      return;
    }

    if (!scheduledDate) {
      toast.error({
        title: "Schedule Time Required",
        description: "Select a future date and time to schedule your post.",
      });
      return;
    }

    const validated = validatePostingInputs();
    if (!validated) return;

    try {
      setPendingAction("schedule");
      setIsSubmitting(true);
      toast.loading({
        title: "Processing",
        description: "Scheduling your post...",
      });

      const mediaPayload = await buildSSOTMedia(media);
      const targets = validated.selectedAccountsData.map((acc) => ({
        platform: acc.platform,
        socialAccountId: acc._id,
      }));

      const scheduleAtIso = new Date(scheduledDate).toISOString();
      const idempotencyKey = computeIdempotencyKey(
        targets,
        mediaPayload,
        scheduleAtIso,
        validated.captionsByPlatform
      );

      const tiktokOptionsPayload: Record<string, any> = {};
      for (const acc of validated.selectedAccountsData) {
        if (acc.platform === "tiktok" && tiktokAccountOptions[acc._id]) {
          tiktokOptionsPayload[acc._id] = tiktokAccountOptions[acc._id];
        }
      }

      const formattedMedia = mediaPayload.map((item) => ({
        type: item.type,
        url: item.url ?? "",
        width: item.width,
        height: item.height,
        durationSec: item.durationSec,
        ref: item.ref,
      }));

      await socialApi.scheduleSSOT(
        {
          content: validated.globalCaption,
          targets,
          media: formattedMedia,
          scheduleAt: scheduleAtIso,
          tiktokOptions: tiktokOptionsPayload,
          platformCaptions: validated.captionsByPlatform,
        },
        { headers: { "Idempotency-Key": idempotencyKey } }
      );

      toast.success({
        title: "Post Scheduled",
        description: "Your post has been scheduled!",
      });
      navigate("/dashboard/scheduled");
    } catch (err: any) {
      console.error("Schedule post error:", err);
      toast.error({
        title: "Failed to Schedule",
        description: err.message || "Please try again.",
      });
    } finally {
      setPendingAction(null);
      setIsSubmitting(false);
    }
  };

  return {
    handleSaveDraft,
    handlePostNow,
    handleSchedulePost,
    currentDraftId,
    pendingAction,
    lastSavedAt,
  };
}
