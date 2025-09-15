import { useEffect } from "react";
import { TikTokOptions } from "../TikTokSettingsDrawer";

interface Params {
  selectedAccounts: string[];
  media: any[];
  socialAccounts: any[];
  platformCaptions: Record<string, string>;
  globalCaption: string;
  tiktokAccountOptions: Record<string, TikTokOptions>;
  setTiktokSelected: (v: boolean) => void;
  setTiktokAccountOptions: (opts: Record<string, TikTokOptions>) => void;
  setOpenTikTokDrawer: (v: boolean) => void;
}

export function useInitializeTikTokDrawer({
  selectedAccounts,
  media,
  socialAccounts,
  platformCaptions,
  globalCaption,
  tiktokAccountOptions,
  setTiktokSelected,
  setTiktokAccountOptions,
  setOpenTikTokDrawer,
}: Params) {
  useEffect(() => {
    const tiktokAccounts = (socialAccounts || []).filter(
      (account) =>
        (selectedAccounts || []).includes(account._id) && account.platform === "tiktok"
    );

    if (tiktokAccounts.length > 0 && ((media || []).length > 0)) {
      setTiktokSelected(true);

      const newOptions = { ...(tiktokAccountOptions || {}) } as Record<string, TikTokOptions>;
      let anyMissing = false;

      const caption = (platformCaptions?.["tiktok"] as string) || globalCaption || "";

      for (const account of tiktokAccounts) {
        if (!newOptions[account._id]) {
          newOptions[account._id] = {
            title: caption,
            privacy: "",
            allowComments: false,
            allowDuet: false,
            allowStitch: false,
            isCommercial: false,
            agreedToPolicy: false,
            accountName: account.accountName,
          };
          anyMissing = true;
        }
      }

      setTiktokAccountOptions(newOptions);

      if (anyMissing) {
        setOpenTikTokDrawer(true);
      }
    } else {
      setTiktokSelected(false);
    }
  }, [selectedAccounts, media, socialAccounts, platformCaptions, globalCaption, tiktokAccountOptions]);
}
