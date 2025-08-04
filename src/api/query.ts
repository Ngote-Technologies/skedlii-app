import { useQuery } from "@tanstack/react-query";
import socialApi from "./socialApi";

export const useTikTokAccountsInfo = (accountIds: string[]) => {
  const sortedAccountIds = [...accountIds].sort((a, b) => a.localeCompare(b));
  return useQuery({
    queryKey: ["tiktok-accounts-info", ...sortedAccountIds],
    queryFn: async () => {
      const responses = await Promise.all(
        sortedAccountIds.map(async (id) => {
          try {
            const { creatorInfo } = await socialApi.getTikTokAccountInfo(id);
            return { accountId: id, creatorInfo: creatorInfo };
          } catch (error) {
            console.error("Failed to get TikTok account info:", error);
            return { accountId: id, creatorInfo: null };
          }
        })
      );
      return responses;
    },
    enabled: accountIds.length > 0,
    refetchOnMount: true,
  });
};
