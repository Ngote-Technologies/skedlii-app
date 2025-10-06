import { apiRequest } from "../lib/queryClient";
import type { JobHistoryItem } from "../hooks/useJobsList";

export type JobActionResponse = {
  job?: JobHistoryItem | null;
  jobId?: string;
  status?: string;
  canceled?: boolean;
};

export async function retryJob(jobDbId: string) {
  return apiRequest<JobActionResponse>("POST", `/admin/jobs/${jobDbId}/retry`);
}

export async function cancelJob(jobDbId: string) {
  return apiRequest<JobActionResponse>("POST", `/admin/jobs/${jobDbId}/cancel`);
}
