import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../../ui/dialog";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Checkbox } from "../../ui/checkbox";
import { Button } from "../../ui/button";
import { useState, useEffect } from "react";
import { toast } from "../../../hooks/use-toast";
import { Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";

export default function TikTokSettingsDrawer({
  open,
  isLoading,
  onClose,
  accountOptions,
  creatorInfoMap,
  onSave,
}: Readonly<{
  open: boolean;
  isLoading: boolean;
  onClose: () => void;
  accountOptions: Record<string, TikTokOptions>;
  creatorInfoMap: Record<string, any>;
  onSave: (updated: Record<string, TikTokOptions>) => void;
}>) {
  const [localOptions, setLocalOptions] =
    useState<Record<string, LocalTikTokOptions>>(accountOptions);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  useEffect(() => {
    setLocalOptions((prev) => {
      const updated: Record<string, LocalTikTokOptions> = {};
      for (const [id, option] of Object.entries(accountOptions)) {
        updated[id] = {
          ...option,
          hasCustomTitle: prev?.[id]?.hasCustomTitle ?? false,
          title: prev?.[id]?.hasCustomTitle ? prev[id].title : option.title,
        };
      }
      return updated;
    });
  }, [accountOptions]);

  const getPrivacyLevelDisplay = (level: string) => {
    switch (level) {
      case "FOLLOWER_OF_CREATOR":
        return "Followers";
      case "PUBLIC_TO_EVERYONE":
        return "Public";
      case "MUTUAL_FOLLOW_FRIENDS":
        return "Mutual Friends";
      case "SELF_ONLY":
        return "Only Me";
      default:
        return level;
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
        <DialogContent isLoading>
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold mb-2">
              Fetching TikTok accounts info
            </DialogTitle>
            <DialogDescription>
              Please wait while we fetch the TikTok accounts info.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-center h-full">
            <Loader2 className="animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update TikTok Settings</DialogTitle>
          <DialogDescription>
            Please review and complete the required fields for each TikTok
            account.
          </DialogDescription>
        </DialogHeader>

        <Accordion
          type="multiple"
          className="max-h-[75vh] p-4 space-y-2"
        >
          {Object.entries(localOptions).map(([accountId, opts]) => (
            <AccordionItem key={accountId} value={accountId}>
              <AccordionTrigger>
                <div className="flex items-center space-x-3">
                  {creatorInfoMap[accountId]?.data?.creator_avatar_url && (
                    <img
                      src={creatorInfoMap[accountId].data.creator_avatar_url}
                      alt="avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                  <span className="text-sm font-medium flex items-center space-x-1">
                    <span>
                      {creatorInfoMap[accountId]?.data?.creator_nickname ??
                        opts.accountName}
                    </span>
                    {validationErrors[accountId]?.length > 0 ? (
                      <span className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block" />
                    ) : (
                      <span className="ml-2 w-2 h-2 rounded-full bg-green-500 inline-block" />
                    )}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {creatorInfoMap[accountId]?.data?.monetizationEligibility
                    ? "Eligible for branded content"
                    : "Branded content not supported"}
                </p>
              </AccordionTrigger>
              <AccordionContent>
                <div className="border p-4 rounded-md space-y-3">
                  <Input
                    placeholder="Video title"
                    value={opts.title}
                    disabled={!opts.hasCustomTitle}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setLocalOptions((prev) => ({
                        ...prev,
                        [accountId]: {
                          ...prev[accountId],
                          title: newTitle,
                          hasCustomTitle: true,
                        },
                      }));
                    }}
                  />

                  <Select
                    value={opts.privacy}
                    onValueChange={(val) => {
                      setLocalOptions((prev) => ({
                        ...prev,
                        [accountId]: { ...prev[accountId], privacy: val },
                      }));
                      setValidationErrors((prev) => {
                        const updated = { ...prev };
                        if (updated[accountId]) {
                          updated[accountId] = updated[accountId].filter(
                            (field) => field !== "privacy"
                          );
                          if (updated[accountId].length === 0) {
                            delete updated[accountId];
                          }
                        }
                        return updated;
                      });
                    }}
                    disabled={
                      !creatorInfoMap[accountId]?.data?.privacy_level_options
                        ?.length
                    }
                  >
                    <SelectTrigger
                      className={cn(
                        validationErrors[accountId]?.includes("privacy") &&
                          "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Select Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        creatorInfoMap[accountId]?.data
                          ?.privacy_level_options ?? []
                      ).map((level: string) => (
                        <SelectItem key={level} value={level}>
                          {getPrivacyLevelDisplay(level)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`allowComments-${accountId}`}
                      checked={opts.allowComments}
                      onCheckedChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            allowComments: Boolean(val),
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "allowComments"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                    />
                    <label
                      htmlFor={`allowComments-${accountId}`}
                      className={cn(
                        "cursor-pointer text-sm",
                        validationErrors[accountId]?.includes(
                          "allowComments"
                        ) && "text-red-500"
                      )}
                    >
                      Allow Comments
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`allowDuet-${accountId}`}
                      checked={opts.allowDuet}
                      onCheckedChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            allowDuet: Boolean(val),
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "allowDuet"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                      disabled={!creatorInfoMap[accountId]?.data?.allow_duet}
                    />
                    <label
                      htmlFor={`allowDuet-${accountId}`}
                      className={cn(
                        "cursor-pointer text-sm",
                        validationErrors[accountId]?.includes("allowDuet") &&
                          "text-red-500"
                      )}
                    >
                      Allow Duet
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`allowStitch-${accountId}`}
                      checked={opts.allowStitch}
                      onCheckedChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            allowStitch: Boolean(val),
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "allowStitch"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                      disabled={!creatorInfoMap[accountId]?.data?.allow_stitch}
                    />
                    <label
                      htmlFor={`allowStitch-${accountId}`}
                      className={cn(
                        "cursor-pointer text-sm",
                        validationErrors[accountId]?.includes("allowStitch") &&
                          "text-red-500"
                      )}
                    >
                      Allow Stitch
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`isCommercial-${accountId}`}
                      checked={opts.isCommercial}
                      onCheckedChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            isCommercial: Boolean(val),
                            brandType: val ? "your_brand" : undefined,
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "isCommercial"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                      disabled={
                        !creatorInfoMap[accountId]?.data
                          ?.monetization_eligibility
                      }
                    />
                    <label
                      htmlFor={`isCommercial-${accountId}`}
                      className={cn(
                        "cursor-pointer text-sm",
                        validationErrors[accountId]?.includes("isCommercial") &&
                          "text-red-500"
                      )}
                    >
                      This is branded content
                    </label>
                  </div>

                  {opts.isCommercial && (
                    <Select
                      value={opts.brandType}
                      onValueChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            brandType: val as any,
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "brandType"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Brand Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="your_brand">Your Brand</SelectItem>
                        <SelectItem value="branded_content">
                          Sponsored
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`agreedToPolicy-${accountId}`}
                      checked={opts.agreedToPolicy}
                      onCheckedChange={(val) => {
                        setLocalOptions((prev) => ({
                          ...prev,
                          [accountId]: {
                            ...prev[accountId],
                            agreedToPolicy: Boolean(val),
                          },
                        }));
                        setValidationErrors((prev) => {
                          const updated = { ...prev };
                          if (updated[accountId]) {
                            updated[accountId] = updated[accountId].filter(
                              (field) => field !== "agreedToPolicy"
                            );
                            if (updated[accountId].length === 0) {
                              delete updated[accountId];
                            }
                          }
                          return updated;
                        });
                      }}
                    />
                    <label
                      htmlFor={`agreedToPolicy-${accountId}`}
                      className={cn(
                        "cursor-pointer text-sm",
                        validationErrors[accountId]?.includes(
                          "agreedToPolicy"
                        ) && "text-red-500"
                      )}
                    >
                      I agree to TikTok’s policy for{" "}
                      <a
                        href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en"
                        target="_blank"
                        className="underline text-blue-500"
                      >
                        music and commercial content
                      </a>{" "}
                      .
                    </label>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <DialogFooter className="flex justify-end mt-4">
          <Button
            onClick={() => {
              const { valid, fieldErrors, invalidAccounts } =
                validateAllTikTokOptions(localOptions, creatorInfoMap);
              if (!valid) {
                setValidationErrors(fieldErrors);
                const accountLabels = invalidAccounts.map((id) => {
                  const nickname =
                    creatorInfoMap[id]?.data?.creator_nickname ??
                    localOptions[id]?.accountName ??
                    id;
                  return `• ${nickname}`;
                });

                toast({
                  title: "TikTok Settings Incomplete",
                  description: `Please complete all required fields for:\n\n${accountLabels.join(
                    "\n"
                  )}`,
                  variant: "destructive",
                });
                return;
              }

              onSave(localOptions);
            }}
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const validateAllTikTokOptions = (
  optionsMap: Record<string, TikTokOptions>,
  creatorInfoMap: Record<string, any>
): {
  valid: boolean;
  invalidAccounts: string[];
  fieldErrors: Record<string, string[]>;
} => {
  const invalidAccounts: string[] = [];
  const fieldErrors: Record<string, string[]> = {};

  for (const [accountId, opts] of Object.entries(optionsMap)) {
    const info = creatorInfoMap[accountId]?.data ?? {};
    const errors: string[] = [];

    if (!opts.title?.trim()) errors.push("title");
    if (!opts.privacy) errors.push("privacy");

    if (opts.isCommercial) {
      if (!info.monetization_eligibility) {
        // Commercial not allowed; this should ideally be disabled in UI
        errors.push("isCommercial");
      } else if (!opts.brandType) {
        errors.push("brandType");
      }
    }

    if (!opts.agreedToPolicy) errors.push("agreedToPolicy");

    // Skip duet/stitch validation if TikTok doesn’t allow them for this account
    if (info.allow_duet && opts.allowDuet === undefined) {
      errors.push("allowDuet");
    }

    if (info.allow_stitch && opts.allowStitch === undefined) {
      errors.push("allowStitch");
    }

    if (errors.length > 0) {
      invalidAccounts.push(accountId);
      fieldErrors[accountId] = errors;
    }
  }

  return {
    valid: invalidAccounts.length === 0,
    invalidAccounts,
    fieldErrors,
  };
};

export type TikTokOptions = {
  title: string;
  privacy: string;
  allowComments: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  isCommercial: boolean;
  brandType?: "your_brand" | "branded_content";
  agreedToPolicy: boolean;
  accountName: string;
};

type LocalTikTokOptions = TikTokOptions & { hasCustomTitle?: boolean };

export const isValidTikTokOptions = (
  options: TikTokOptions | null
): boolean => {
  if (!options) return false;
  const { title, privacy, agreedToPolicy, brandType, isCommercial } = options;

  if (!title?.trim()) return false;
  if (!privacy) return false;
  if (isCommercial && !brandType) return false;
  if (!agreedToPolicy) return false;

  return true;
};
