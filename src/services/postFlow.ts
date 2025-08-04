export const handleAccountSelection = (
  accountIds: string[],
  setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>
) => {
  setSelectedAccounts(accountIds);
};

export const handleCaptionChange = (
  platform: string,
  caption: string,
  setGlobalCaption: React.Dispatch<React.SetStateAction<string>>,
  setPlatformCaptions: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >,
  platformCaptions: Record<string, string>
) => {
  if (platform === "global") {
    setGlobalCaption(caption);
  } else {
    setPlatformCaptions({
      ...platformCaptions,
      [platform]: caption,
    });
  }
};
