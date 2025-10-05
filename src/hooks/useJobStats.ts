import { useQuery } from "@tanstack/react-query";

export type JobStatusCounts = Record<string, number>;
export type QueueCounts = Record<string, number>;

export type JobStatsResponse = {
  statuses?: JobStatusCounts;
  queue?: QueueCounts;
};

function normalizeStats(data: unknown): JobStatsResponse {
  if (!data || typeof data !== "object") {
    return { statuses: {}, queue: {} };
  }

  const payload = data as JobStatsResponse;
  return {
    statuses: payload.statuses ?? {},
    queue: payload.queue ?? {},
  };
}

export function useJobStats(enabled: boolean = true) {
  return useQuery<JobStatsResponse, unknown, JobStatsResponse>({
    queryKey: ["/admin/jobs/stats"],
    enabled,
    select: normalizeStats,
    refetchInterval: enabled ? 10000 : false,
  });
}

export type JobStatsQuery = ReturnType<typeof useJobStats>;
