import axiosInstance from "./axios";
import {
  ContentItem,
  ContentCollection,
  AnalysisTemplate,
  RecommendationProfile,
} from "../types";
import {
  AIAssistantRequest,
  AIAssistantResponse,
  ContentPurpose,
  ContentTone,
} from "../types/aiAssistant";
import { useAuthStore } from "../store/authStore";

// AI Content Generation
export const generateContent = async (
  request: AIAssistantRequest
): Promise<AIAssistantResponse> => {
  const response = await axiosInstance.post(
    "/content/generate",
    withRecommendationProfileContext(request),
    {
      timeout: 60000, // 60 seconds specifically for AI generation
    }
  );
  return response.data;
};

const CONTENT_TONES: ContentTone[] = [
  "professional",
  "casual",
  "friendly",
  "humorous",
  "informative",
  "persuasive",
];

const PURPOSE_BY_GOAL: Array<[RegExp, ContentPurpose]> = [
  [/lead|prospect|demo|consult/i, "lead_generation"],
  [/sale|conversion|revenue|offer|promo/i, "sales"],
  [/educat|teach|learn|guide|tip/i, "education"],
  [/aware|reach|visibility|brand/i, "awareness"],
  [/entertain|fun|humor/i, "entertainment"],
  [/engage|community|comment|conversation/i, "engagement"],
];

const withRecommendationProfileContext = (
  request: AIAssistantRequest
): AIAssistantRequest => {
  const profile = useAuthStore.getState().organization?.recommendationProfile;
  if (!hasMeaningfulRecommendationProfile(profile)) return request;

  const profileKeywords = [
    ...(profile.keywords ?? []),
    ...(profile.contentPillars ?? []),
  ];
  const mergedKeywords = uniqueStrings([
    ...(request.context.keywords ?? []),
    ...profileKeywords,
  ]);
  const profileTone = normalizeTone(profile.brandTone);
  const profilePurpose = normalizePurpose(profile.contentGoals);

  return {
    ...request,
    context: {
      ...request.context,
      targetAudience:
        request.context.targetAudience?.trim() ||
        profile.targetAudience ||
        request.context.targetAudience,
      keywords: mergedKeywords,
      tone: request.context.tone || profileTone || request.context.tone,
      purpose:
        request.context.purpose || profilePurpose || request.context.purpose,
      contentStyle:
        request.context.contentStyle ||
        profile.contentPillars?.join(", ") ||
        request.context.contentStyle,
      brandProfile: profile,
    },
    constraints: {
      ...request.constraints,
      mustExclude: uniqueStrings([
        ...(request.constraints?.mustExclude ?? []),
        ...(profile.topicsToAvoid ?? []),
      ]),
    },
  };
};

const uniqueStrings = (values: string[]) =>
  Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean))
  );

const normalizeTone = (tone?: string | null): ContentTone | undefined => {
  if (!tone) return undefined;
  const lower = tone.toLowerCase();
  return CONTENT_TONES.find((item) => lower.includes(item));
};

const normalizePurpose = (
  goals?: string[] | null
): ContentPurpose | undefined => {
  const goalText = goals?.join(" ") ?? "";
  return PURPOSE_BY_GOAL.find(([pattern]) => pattern.test(goalText))?.[1];
};

const hasMeaningfulRecommendationProfile = (
  profile: RecommendationProfile | null | undefined
): profile is RecommendationProfile => {
  if (!profile || typeof profile !== "object") return false;
  return Object.values(profile).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
};

// Content Management
export const createContent = async (content: Omit<ContentItem, "id">) => {
  const response = await axiosInstance.post("/content", content);
  return response.data;
};

export const getContent = async (contentId: string) => {
  const response = await axiosInstance.get(`/content/${contentId}`);
  return response.data;
};

export const updateContent = async (
  contentId: string,
  updates: Partial<ContentItem>
) => {
  const response = await axiosInstance.put(`/content/${contentId}`, updates);
  return response.data;
};

export const deleteContent = async (contentId: string) => {
  const response = await axiosInstance.delete(`/content/${contentId}`);
  return response.data;
};

// Personal Content Management
export const getPersonalContent = async (userId: string) => {
  const response = await axiosInstance.get(`/social-posts/${userId}`);
  return response.data;
};

export const getPersonalCollections = async () => {
  const response = await axiosInstance.get("/collections/personal");
  return response.data;
};

export const getPersonalTemplates = async () => {
  const response = await axiosInstance.get("/analysis/personal/templates");
  return response.data;
};

// Team Content Management
export const listTeamContent = async (teamId: string) => {
  const response = await axiosInstance.get(`/content/team/${teamId}`);
  return response.data;
};

export const listTeamCollections = async (teamId: string) => {
  const response = await axiosInstance.get(`/collections/team/${teamId}`);
  return response.data;
};

export const listTeamTemplates = async (teamId: string) => {
  const response = await axiosInstance.get(
    `/analysis/templates/team/${teamId}`
  );
  return response.data;
};

export const analyzeContent = async (contentId: string, templateId: string) => {
  const response = await axiosInstance.post(
    `/content/${contentId}/analyze/${templateId}`
  );
  return response.data;
};

export const archiveContent = async (contentId: string) => {
  const response = await axiosInstance.post(`/content/${contentId}/archive`);
  return response.data;
};

// Collection Management
export const createCollection = async (
  collection: Omit<ContentCollection, "id">
) => {
  const response = await axiosInstance.post("/collections", collection);
  return response.data;
};

export const getCollection = async (collectionId: string) => {
  const response = await axiosInstance.get(`/collections/${collectionId}`);
  return response.data;
};

export const updateCollection = async (
  collectionId: string,
  updates: Partial<ContentCollection>
) => {
  const response = await axiosInstance.put(
    `/collections/${collectionId}`,
    updates
  );
  return response.data;
};

export const deleteCollection = async (collectionId: string) => {
  const response = await axiosInstance.delete(`/collections/${collectionId}`);
  return response.data;
};

export const addContentToCollection = async (
  collectionId: string,
  contentId: string
) => {
  const response = await axiosInstance.post(
    `/collections/${collectionId}/content/${contentId}`
  );
  return response.data;
};

export const removeContentFromCollection = async (
  collectionId: string,
  contentId: string
) => {
  const response = await axiosInstance.delete(
    `/collections/${collectionId}/content/${contentId}`
  );
  return response.data;
};

// Analysis Template Management
export const createTemplate = async (
  template: Omit<AnalysisTemplate, "id">
) => {
  const response = await axiosInstance.post("/analysis/templates", template);
  return response.data;
};

export const getTemplate = async (templateId: string) => {
  const response = await axiosInstance.get(`/analysis/templates/${templateId}`);
  return response.data;
};

export const updateTemplate = async (
  templateId: string,
  updates: Partial<AnalysisTemplate>
) => {
  const response = await axiosInstance.put(
    `/analysis/templates/${templateId}`,
    updates
  );
  return response.data;
};

export const deleteTemplate = async (templateId: string) => {
  const response = await axiosInstance.delete(
    `/analysis/templates/${templateId}`
  );
  return response.data;
};

export const applyTemplate = async (templateId: string, contentId: string) => {
  const response = await axiosInstance.post(
    `/analysis/templates/${templateId}/apply/${contentId}`
  );
  return response.data;
};
