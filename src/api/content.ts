import axiosInstance from "./axios";
import { ContentItem, ContentCollection, AnalysisTemplate } from "../types";
import { AIAssistantRequest, AIAssistantResponse } from "../types/aiAssistant";

// AI Content Generation
export const generateContent = async (
  request: AIAssistantRequest
): Promise<AIAssistantResponse> => {
  const response = await axiosInstance.post("/content/generate", request, {
    timeout: 60000, // 60 seconds specifically for AI generation
  });
  return response.data;
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
