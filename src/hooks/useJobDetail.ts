import { useQuery } from "@tanstack/react-query";
import type { JobHistoryItem } from "./useJobsList";

type JobDetailResponse = {
  job?: JobHistoryItem;
};

function normalizeJobDetail(data: unknown): JobHistoryItem | null {
  if (!data || typeof data !== "object") return null;
  const payload = data as JobDetailResponse;
  return (payload.job as JobHistoryItem | undefined) ?? null;
}

export function useJobDetail(jobId?: string) {
  return useQuery<JobHistoryItem | null, unknown, JobHistoryItem | null>({
    queryKey: jobId ? [`/admin/jobs/${jobId}`] : [],
    enabled: Boolean(jobId),
    select: normalizeJobDetail,
  });
}

export type JobDetailQuery = ReturnType<typeof useJobDetail>;
