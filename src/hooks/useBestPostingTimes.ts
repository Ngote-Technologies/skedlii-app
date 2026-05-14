import { useQuery } from "@tanstack/react-query";
import { fetchBestPostingTimes } from "../api/analytics";

export type BestPostingTimesParams = {
  timezone?: string;
  platform?: string;
  socialAccountId?: string;
  limit?: number;
};

export function useBestPostingTimes(
  params: BestPostingTimesParams,
  enabled: boolean
) {
  return useQuery({
    queryKey: ["analytics", "best-times", params],
    queryFn: () => fetchBestPostingTimes(params),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
