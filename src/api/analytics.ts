import axiosInstance from "./axios";

export type BestPostingTimeRecommendation = {
  recommendedAt: string | null;
  localDayOfWeek: number;
  localHour: number;
  score: number;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  basis: string;
};

export type BestPostingTimesResponse = {
  personalized: boolean;
  timezone: string;
  timezoneSource: "request" | "organization" | "fallback";
  confidence: "low" | "medium" | "high";
  basis: "timezone_missing" | "insufficient_history" | "publishing_history" | string;
  sampleSize?: number;
  reason?: string;
  recommendations: BestPostingTimeRecommendation[];
  traceId?: string;
};

/**
 * Fetch content analytics data
 * @param period - Time period for analytics (week, month, quarter)
 */
export const fetchApiAnalytics = async (period: string = "month") => {
  const response = await axiosInstance.get(`/analytics/content?period=${period}`);
  return response;
};

/**
 * Fetch platform-specific analytics
 * @param platform - Social media platform (twitter, instagram, etc.)
 */
export const fetchApiPlatformAnalytics = async (platform: string) => {
  try {
    const response = await axiosInstance.get(`/analytics/platform/${platform}`);
    return response;
  } catch (error) {
    console.error(`Error fetching ${platform} analytics:`, error);
    throw error;
  }
};

/**
 * Export analytics data in specified format
 * @param format - Export format (json, csv)
 */
export const fetchApiExportAnalytics = async (format: string = "json") => {
  const response = await axiosInstance.get(`/analytics/export?format=${format}`, {
    responseType: format === "csv" ? "blob" : "json",
  });
  return response;
};

export const fetchBestPostingTimes = async (params?: {
  timezone?: string;
  platform?: string;
  socialAccountId?: string;
  limit?: number;
}): Promise<BestPostingTimesResponse> => {
  const response = await axiosInstance.get<BestPostingTimesResponse>(
    "/analytics/best-times",
    { params }
  );
  return response.data;
};
