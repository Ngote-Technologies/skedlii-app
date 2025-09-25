import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent } from "../../ui/tabs";
import {
  Loader2,
  Save,
  Clock,
  Send,
  Users,
  Type,
  Image,
  Calendar,
  Check,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../store/hooks";
import postDraftsApi from "../../../api/postDrafts";
import { MediaItem } from "./MediaUpload";
import TikTokSettingsDrawer, {
  isValidTikTokOptions,
  TikTokOptions,
} from "./TikTokSettingsDrawer";
import { useTikTokAccountsInfo } from "../../../api/query";
import { useInitializeTikTokDrawer } from "./hooks/useInitializeTikTokDrawer";

import AccountSelection from "./AccountSelection";
import PlatformCaptions from "./PlatformCaption";
import MediaUpload from "./MediaUpload";
import SchedulingOptions from "./SchedulingOptions";
import { usePostSubmission } from "./hooks/usePostSubmission";
import {
  handleAccountSelection,
  handleCaptionChange,
} from "../../../services/postFlow";
import { handleMediaChange, handleSchedulingChange } from "../../../lib/utils";
import { useGetOrganizationSocialAccounts } from "../../../hooks/useSocialAccounts";
import { toast } from "../../../hooks/use-toast";

export default function PostFlow() {
  const { organization } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("accounts");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Post data state
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [globalCaption, setGlobalCaption] = useState("");
  const [platformCaptions, setPlatformCaptions] = useState<
    Record<string, string>
  >({});
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [tiktokSelected, setTiktokSelected] = useState<boolean>(false);
  const [filledTikTokAccounts, setFilledTikTokAccounts] = useState<string[]>(
    []
  );
  const [openTikTokDrawer, setOpenTikTokDrawer] = useState<boolean>(false);
  const [tiktokAccountOptions, setTiktokAccountOptions] = useState<
    Record<string, TikTokOptions>
  >({});
  const [tiktokCreatorInfoMap, setTiktokCreatorInfoMap] = useState<
    Record<string, any>
  >({});
  const [hasInitializedDraft, setHasInitializedDraft] = useState(false);

  const {
    data: organizationAccounts = [],
    isLoading: isFetchingOrganizationAccounts,
  } = useGetOrganizationSocialAccounts(organization?._id || "");
  const socialAccounts: any[] = (organizationAccounts as any)?.items ?? [];

  const [searchParams] = useSearchParams();
  const rawDraftId = searchParams.get("draftId");
  const draftId =
    rawDraftId && rawDraftId !== "null" && rawDraftId !== "undefined"
      ? rawDraftId
      : null;

  const {
    data: draftResponse,
    isLoading: isDraftLoading,
    isError: isDraftError,
    error: draftError,
  } = useQuery({
    queryKey: ["/post-drafts", draftId],
    queryFn: () => postDraftsApi.get(draftId!),
    enabled: Boolean(draftId),
  });

  const draft = draftResponse?.draft;

  const isLoading =
    isFetchingOrganizationAccounts || Boolean(draftId && isDraftLoading);

  // Check if we can proceed to the next step
  const canProceedToCaption = selectedAccounts.length > 0;
  const hasAnyCaption =
    globalCaption.trim().length > 0 ||
    Object.values(platformCaptions || {}).some(
      (caption) => caption.trim().length > 0
    );
  const canProceedToMedia = canProceedToCaption && hasAnyCaption;

  const {
    handleSaveDraft,
    handlePostNow,
    handleSchedulePost,
    pendingAction,
    currentDraftId,
    lastSavedAt,
  } = usePostSubmission({
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
    initialDraftId: draftId,
  });

  useEffect(() => {
    setHasInitializedDraft(false);
    setSelectedAccounts([]);
    setGlobalCaption("");
    setPlatformCaptions({});
    setMedia([]);
    setIsScheduled(false);
    setScheduledDate(null);
    setTiktokAccountOptions({});
    setFilledTikTokAccounts([]);
  }, [draftId]);

  useEffect(() => {
    if (!draftId || !draft || hasInitializedDraft) return;

    const revision = draft.currentRevision || {};
    const baseContent =
      typeof revision.content === "string"
        ? revision.content
        : typeof draft.content === "string"
        ? draft.content
        : "";
    setGlobalCaption(baseContent);

    const captionsSource =
      (revision.platformCaptions as Record<string, string> | undefined) ??
      (draft.platformCaptions as Record<string, string> | undefined) ??
      {};
    setPlatformCaptions({ ...captionsSource });

    const targetsSource =
      Array.isArray(draft.targets) && draft.targets.length
        ? draft.targets
        : revision.targets || [];
    const restoredAccountIds = Array.from(
      new Set<string>(
        (targetsSource || [])
          .map((target: any) => target?.socialAccountId)
          .filter(
            (id: unknown): id is string =>
              typeof id === "string" && id.length > 0
          )
      )
    );
    setSelectedAccounts(restoredAccountIds);

    const revisionMedia = Array.isArray(revision.media) ? revision.media : [];
    const restoredMedia: MediaItem[] = revisionMedia
      .map((item: any, index: number) => {
        if (!item) return null;
        const url = item.url ? String(item.url) : "";
        const type = item.type === "video" ? "video" : "image";
        const id =
          (item.ref && String(item.ref)) ||
          (url ? `${url}-${index}` : `draft-media-${index}`);
        const thumbnail = item.thumbnailUrl
          ? String(item.thumbnailUrl)
          : undefined;
        return {
          id,
          url,
          type,
          file: undefined,
          ref: item.ref ? String(item.ref) : undefined,
          width: item.width,
          height: item.height,
          durationSec: item.durationSec,
          thumbnailUrl: thumbnail ?? (url || undefined),
        } as MediaItem;
      })
      .filter(Boolean) as MediaItem[];

    setMedia(restoredMedia);
    setIsScheduled(draft.status === "scheduled");
    setHasInitializedDraft(true);
  }, [draftId, draft, hasInitializedDraft]);

  useEffect(() => {
    if (isDraftError && draftError) {
      const message =
        (draftError as any)?.response?.data?.message ||
        (draftError as Error)?.message ||
        "Unable to load draft.";
      toast.error({
        title: "Failed to load draft",
        description: message,
      });
    }
  }, [isDraftError, draftError]);

  useInitializeTikTokDrawer({
    selectedAccounts,
    media,
    socialAccounts,
    platformCaptions,
    globalCaption,
    tiktokAccountOptions,
    setTiktokSelected,
    setTiktokAccountOptions,
    setOpenTikTokDrawer,
  });

  const tiktokAccountIdsToFetch = useMemo(() => {
    return openTikTokDrawer && tiktokSelected
      ? selectedAccounts
          .filter(
            (id) =>
              socialAccounts.find((acc) => acc._id === id)?.platform ===
              "tiktok"
          )
          .filter((id) => !tiktokCreatorInfoMap[id])
      : [];
  }, [
    openTikTokDrawer,
    tiktokSelected,
    selectedAccounts,
    socialAccounts,
    tiktokCreatorInfoMap,
  ]);

  const { data: accountsData, isLoading: tiktokAccountsLoading } =
    useTikTokAccountsInfo(tiktokAccountIdsToFetch);

  useEffect(() => {
    if (accountsData) {
      setTiktokCreatorInfoMap((prev) => {
        const updated = { ...prev };
        accountsData.forEach(({ accountId, creatorInfo }) => {
          if (creatorInfo) updated[accountId] = creatorInfo;
        });
        return updated;
      });
    }
  }, [accountsData]);

  const steps = [
    {
      id: "accounts",
      label: "Select Accounts",
      icon: Users,
      description: "Choose your social platforms",
      completed: selectedAccounts.length > 0,
      active: activeTab === "accounts",
      disabled: false,
    },
    {
      id: "caption",
      label: "Write Caption",
      icon: Type,
      description: "Create your content",
      completed: hasAnyCaption,
      active: activeTab === "caption",
      disabled: isSubmitting || !canProceedToCaption,
    },
    {
      id: "media",
      label: "Add Media",
      icon: Image,
      description: "Upload images or videos",
      completed: true, // Media is optional
      active: activeTab === "media",
      disabled: isSubmitting || !canProceedToMedia,
    },
    {
      id: "schedule",
      label: "Schedule & Post",
      icon: Calendar,
      description: "Choose when to publish",
      completed: false,
      active: activeTab === "schedule",
      disabled: isSubmitting || !canProceedToMedia,
    },
  ];

  // Navigation functions for step clicking and mobile swipe
  const navigateToStep = (stepId: string) => {
    const step = steps.find((s) => s.id === stepId);
    if (step && !step.disabled) {
      setActiveTab(stepId);
    }
  };

  return (
    <div className="space-y-8 touch-pan-y">
      {/* Enhanced Header with Step Progress */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Create Post
            </h1>
            <p className="text-muted-foreground">
              Compose and schedule your content across multiple platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSavedAt && (
              <span className="text-xs text-muted-foreground">
                Draft saved{" "}
                {lastSavedAt.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting && pendingAction === "save" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                currentDraftId &&
                navigate(`/dashboard/drafts/${currentDraftId}`)
              }
              disabled={!currentDraftId}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Draft
            </Button>
          </div>
        </div>

        {/* Interactive Step Progress Navigation */}
        <Card className="border-0 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isLast = index === steps.length - 1;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center relative">
                      {/* Interactive Step Circle */}
                      <button
                        onClick={() => navigateToStep(step.id)}
                        disabled={step.disabled}
                        className={cn(
                          "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 group relative",
                          // Base styles
                          "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2",
                          // Active state
                          step.active && [
                            "border-primary bg-primary text-white shadow-lg scale-110",
                            "hover:shadow-xl hover:scale-105",
                          ],
                          // Completed state
                          step.completed &&
                            !step.active && [
                              "border-green-500 bg-green-500 text-white",
                              !step.disabled &&
                                "hover:border-green-600 hover:bg-green-600 hover:scale-105 cursor-pointer",
                            ],
                          // Default/incomplete state
                          !step.active &&
                            !step.completed && [
                              "border-gray-300 bg-white dark:bg-gray-800 text-gray-400",
                              !step.disabled &&
                                "hover:border-primary/50 hover:bg-primary/5 hover:scale-105 cursor-pointer",
                              !step.disabled && "hover:text-primary",
                            ],
                          // Disabled state
                          step.disabled && ["opacity-50 cursor-not-allowed"]
                        )}
                        title={
                          step.disabled
                            ? "Complete previous steps first"
                            : `Go to ${step.label}`
                        }
                      >
                        {step.completed && !step.active ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <StepIcon className="h-5 w-5" />
                        )}

                        {/* Hover tooltip */}
                        {!step.disabled && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                            {step.active ? step.label : `Go to ${step.label}`}
                          </div>
                        )}
                      </button>

                      {/* Step Label */}
                      <div className="mt-3 text-center min-w-0">
                        <button
                          onClick={() => navigateToStep(step.id)}
                          disabled={step.disabled}
                          className={cn(
                            "text-sm font-medium transition-colors text-center",
                            step.active
                              ? "text-primary"
                              : step.completed
                              ? "text-green-600 dark:text-green-400"
                              : "text-gray-500",
                            !step.disabled &&
                              "hover:text-primary cursor-pointer",
                            step.disabled && "cursor-not-allowed opacity-50"
                          )}
                        >
                          {step.label}
                        </button>
                        <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                          {step.description}
                        </div>
                      </div>
                    </div>

                    {/* Connector Line */}
                    {!isLast && (
                      <div className="flex-1 mx-4">
                        <div
                          className={cn(
                            "h-0.5 w-full transition-colors duration-300",
                            step.completed && steps[index + 1].active
                              ? "bg-primary"
                              : step.completed
                              ? "bg-green-500"
                              : "bg-gray-300"
                          )}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsContent value="accounts" className="space-y-6">
              <AccountSelection
                accounts={socialAccounts}
                selectedAccounts={selectedAccounts}
                onSelectionChange={(accountIds) =>
                  handleAccountSelection(accountIds, setSelectedAccounts)
                }
              />

              <div className="flex justify-end space-x-3">
                <Button
                  onClick={() => setActiveTab("caption")}
                  disabled={!canProceedToCaption}
                  variant="gradient"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Continue to Caption
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="caption" className="space-y-6">
              <PlatformCaptions
                accounts={socialAccounts}
                selectedAccounts={selectedAccounts}
                globalCaption={globalCaption}
                platformCaptions={platformCaptions}
                onPlatformCaptionChange={(platform, caption) =>
                  handleCaptionChange(
                    platform,
                    caption,
                    setGlobalCaption,
                    setPlatformCaptions,
                    platformCaptions
                  )
                }
              />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("accounts")}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back to Accounts
                </Button>
                <Button
                  onClick={() => setActiveTab("media")}
                  disabled={!canProceedToMedia}
                  variant="gradient"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Continue to Media
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-6">
              <MediaUpload
                media={media}
                onChange={(mediaItems: any) =>
                  handleMediaChange(mediaItems, setMedia)
                }
                accounts={socialAccounts}
                selectedAccounts={selectedAccounts}
                tiktokSelected={tiktokSelected}
                handleTikTokSettingsClick={() => setOpenTikTokDrawer(true)}
              />

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("caption")}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back to Caption
                </Button>
                <Button
                  onClick={() => setActiveTab("schedule")}
                  variant="gradient"
                  className="shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Continue to Schedule
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <SchedulingOptions
                isScheduled={isScheduled}
                scheduledDate={scheduledDate}
                onSchedulingChange={(scheduled, date) =>
                  handleSchedulingChange(
                    scheduled,
                    date,
                    setIsScheduled,
                    setScheduledDate
                  )
                }
              />

              {/* Enhanced Post Preview */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                      <Send className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Post Preview</CardTitle>
                      <CardDescription>
                        Here's how your content will appear across platforms
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex -space-x-2">
                      {socialAccounts
                        .filter((account) =>
                          selectedAccounts.includes(account._id)
                        )
                        .slice(0, 3)
                        .map((account) => (
                          <div
                            key={account._id}
                            className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden"
                          >
                            {account.avatar ? (
                              <img
                                src={account.avatar}
                                alt={account.accountName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs font-bold uppercase">
                                {account.accountName.charAt(0)}
                              </div>
                            )}
                          </div>
                        ))}

                      {selectedAccounts.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs">
                          +{selectedAccounts.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Posting to {selectedAccounts.length} account
                      {selectedAccounts.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm">{globalCaption}</p>

                    {media.length > 0 && (
                      <div className="aspect-video w-full max-w-md bg-muted/30 rounded-md overflow-hidden">
                        {media[0].type === "image" ? (
                          <img
                            src={media[0].url}
                            alt="Post preview"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <video
                            src={media[0].url}
                            className="w-full h-full object-contain"
                            controls
                            muted
                          />
                        )}
                      </div>
                    )}

                    {isScheduled && scheduledDate && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>
                          Scheduled for{" "}
                          {new Date(scheduledDate).toLocaleDateString(
                            undefined,
                            {
                              weekday: "long",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <Button
                  variant="outline"
                  onClick={() => setActiveTab("media")}
                  disabled={isSubmitting}
                  className="w-full md:w-auto hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Back to Media
                </Button>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  {isScheduled ? (
                    <Button
                      variant={isScheduled ? "gradient" : "outline"}
                      onClick={handleSchedulePost}
                      disabled={isSubmitting || !isScheduled || !scheduledDate}
                      className="min-w-[140px] w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting && pendingAction === "schedule" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Clock className="h-4 w-4 mr-2" />
                      )}
                      {isSubmitting && pendingAction === "schedule"
                        ? "Scheduling..."
                        : "Schedule Post"}
                    </Button>
                  ) : (
                    <Button
                      variant={isScheduled ? "outline" : "gradient"}
                      onClick={handlePostNow}
                      disabled={isSubmitting}
                      className="min-w-[140px] w-full md:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      {isSubmitting && pendingAction === "post" ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      {isSubmitting && pendingAction === "post"
                        ? "Publishing..."
                        : "Post Now"}
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <TikTokSettingsDrawer
        open={openTikTokDrawer}
        isLoading={tiktokAccountsLoading}
        onClose={() => setOpenTikTokDrawer(false)}
        accountOptions={tiktokAccountOptions}
        creatorInfoMap={tiktokCreatorInfoMap}
        onSave={(newOptions) => {
          setTiktokAccountOptions(newOptions);
          const valid = Object.entries(newOptions)
            .filter(([_, opts]) => isValidTikTokOptions(opts))
            .map(([id]) => id);
          setFilledTikTokAccounts(valid);
          setOpenTikTokDrawer(false);
        }}
      />
    </div>
  );
}
