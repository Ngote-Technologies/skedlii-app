import { useEffect, useMemo, useState } from "react";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Loader2, Save, Clock, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../store/hooks";
import { MediaItem } from "./MediaUpload";
import TikTokSettingsDrawer, {
  isValidTikTokOptions,
  TikTokOptions,
} from "./TikTokSettingsDrawer";
import { getTikTokAccountsInfo } from "../../../api/query";
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

export default function PostFlow() {
  const { user } = useAuth();

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

  // Get social accounts
  const { data: socialAccounts = [], isLoading: isFetchingAccounts } = useQuery(
    {
      queryKey: [`/social-accounts/${user?._id}`],
    }
  ) as { data: any[]; isLoading: boolean };

  const isLoading = isFetchingAccounts;

  // Check if we can proceed to the next step
  const canProceedToCaption = selectedAccounts.length > 0;
  const canProceedToMedia =
    canProceedToCaption && globalCaption.trim().length > 0;

  const tabItems = [
    {
      value: "accounts",
      label: "Accounts",
      disabled: false,
    },
    {
      value: "caption",
      label: "Caption",
      disabled: isSubmitting || !canProceedToCaption,
    },
    {
      value: "media",
      label: "Media",
      disabled: isSubmitting || !canProceedToMedia,
    },
    {
      value: "schedule",
      label: "Schedule",
      disabled: isSubmitting || !canProceedToMedia,
    },
  ];

  const { handleSubmit } = usePostSubmission({
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
  });

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
    getTikTokAccountsInfo(tiktokAccountIdsToFetch);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Post</h1>
          <p className="text-muted-foreground">
            Compose and schedule your content across multiple platforms
          </p>
        </div>
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
            <TabsList className="w-full mb-8">
              {tabItems.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                >
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>

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
                >
                  Continue to Caption
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
                >
                  Back to Accounts
                </Button>
                <Button
                  onClick={() => setActiveTab("media")}
                  disabled={!canProceedToMedia}
                >
                  Continue to Media
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
                >
                  Back to Caption
                </Button>
                <Button onClick={() => setActiveTab("schedule")}>
                  Continue to Schedule
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

              {/* Post preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Post Preview</CardTitle>
                  <CardDescription>
                    Here's how your post will look
                  </CardDescription>
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
                  className="w-full md:w-auto"
                >
                  Back to Media
                </Button>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                  <Button
                    variant={isScheduled ? "outline" : "default"}
                    onClick={handleSubmit}
                    disabled={isSubmitting || isScheduled}
                    className="min-w-[120px] w-full md:w-auto"
                  >
                    {isSubmitting && !isScheduled ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Now
                      </>
                    )}
                  </Button>

                  <Button
                    variant={isScheduled ? "default" : "outline"}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !isScheduled || !scheduledDate}
                    className="min-w-[120px] w-full md:w-auto"
                  >
                    {isSubmitting && isScheduled ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Schedule
                      </>
                    )}
                  </Button>
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
