import { QueryClient, QueryFunction } from "@tanstack/react-query";
import axiosInstance from "../api/axios";
import { useProgressStore } from "../store/progressStore";

type UnauthorizedBehavior = "returnNull" | "throw";

export async function apiRequest<T = any>(
  method: string,
  url: string,
  data?: unknown
): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error: any) {
    // If it's an axios error with a response, throw the response data
    if (error?.response?.data) {
      throw error.response.data;
    }
    // Otherwise, throw the original error
    throw error;
  }
}

export const getQueryFn =
  <T>(options: { on401: UnauthorizedBehavior }): QueryFunction<T> =>
  async ({ queryKey }) => {
    try {
      const response = await axiosInstance.get<T>(queryKey[0] as string);
      return response.data;
    } catch (error: any) {
      if (options.on401 === "returnNull" && error?.response?.status === 401) {
        return null as any;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      onMutate: () => {
        useProgressStore.getState().startProgress();
      },
      onSettled: () => {
        useProgressStore.getState().finishProgress();
      },
    },
  },
});
