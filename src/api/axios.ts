import axios, { InternalAxiosRequestConfig, AxiosInstance } from "axios";
import { toast } from "../hooks/use-toast";
import { logoutUser } from "../store/authStore";

// Environment configuration
const API_V1_URL =
  (import.meta as any).env.VITE_API_V1_URL ||
  (import.meta as any).env.VITE_API_URL ||
  "/api";
const API_V2_URL = (import.meta as any).env.VITE_API_V2_URL || "/api";
const USE_V2_API = (import.meta as any).env.VITE_USE_V2_API === "true";

// Feature flag for API version (can be overridden per request)
export const API_VERSION_CONFIG = {
  useV2: USE_V2_API,
  v1BaseURL: API_V1_URL,
  v2BaseURL: API_V2_URL,
};

// Create V1 instance (legacy)
export const axiosV1Instance = axios.create({
  baseURL: API_V1_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create V2 instance (new)
export const axiosV2Instance = axios.create({
  baseURL: API_V2_URL,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// Default instance (backwards compatibility)
const axiosInstance = API_VERSION_CONFIG.useV2
  ? axiosV2Instance
  : axiosV1Instance;

let hasShownTokenExpiredToast = false;

// Shared interceptor logic for request handling
const createRequestInterceptor = (version: "v1" | "v2") => {
  return async (config: InternalAxiosRequestConfig) => {
    // console.log(`[DEBUG] ${version.toUpperCase()} Request Interceptor:`, {
    //   method: config.method?.toUpperCase(),
    //   url: config.url,
    //   baseURL: config.baseURL,
    //   fullURL: (config.baseURL || "") + (config.url || ""),
    // });

    // Get tokens from localStorage
    const accessToken = localStorage.getItem("auth_token");
    const refreshToken = localStorage.getItem("refresh_token");

    // Don't add auth header for specific auth endpoints (exact match, not substring)
    const path = config.url || "";
    const matches = (ep: string) => path === ep || path.endsWith(ep);
    const isAuthEndpoint = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ].some(matches);

    if (accessToken && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${accessToken}`;
      // console.log(
      //   `[DEBUG] ${version.toUpperCase()} Request: Added Authorization header`
      // );
    }
    // else if (isAuthEndpoint) {
    //   console.log(
    //     `[DEBUG] ${version.toUpperCase()} Request: Skipping auth header for auth endpoint`
    //   );
    // }

    // Add request timestamp for debugging
    config.headers["X-Request-Time"] = new Date().toISOString();

    // Note: Removed X-API-Version header to avoid CORS preflight issues
    // Version information is implicit based on the baseURL being used

    // V2 specific: Add refresh token ONLY for the exact refresh endpoint
    if (version === "v2" && refreshToken && matches("/auth/refresh")) {
      config.data = { ...config.data, refreshToken };
    }

    // console.log(
    //   `[DEBUG] ${version.toUpperCase()} Request: Final config ready`,
    //   {
    //     hasAuth: !!config.headers.Authorization,
    //     contentType: config.headers["Content-Type"],
    //   }
    // );

    return config;
  };
};

// Shared interceptor logic for response handling
const createResponseInterceptor = (version: "v1" | "v2") => {
  return {
    success: (response: any) => {
      // console.log(`[DEBUG] ${version.toUpperCase()} Response Success:`, {
      //   status: response.status,
      //   url: response.config?.url,
      //   hasData: !!response.data,
      // });
      return response;
    },
    error: async (error: any) => {
      console.error(`[DEBUG] ${version.toUpperCase()} Response Error:`, {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        hasResponse: !!error.response,
      });
      const status = error.response?.status;
      const errorData = error.response?.data;

      // Check if this is a password reset request
      const isPasswordResetRequest = error.config?.url?.includes(
        "/auth/reset-password"
      );

      if (
        status === 401 &&
        !isPasswordResetRequest &&
        !hasShownTokenExpiredToast
      ) {
        hasShownTokenExpiredToast = true;

        console.warn(
          `[DEBUG] ${version.toUpperCase()} API (${
            version === "v2" ? "port 3001" : "port 3002"
          }): Token expired or unauthorized`
        );

        // For V2, try refresh token rotation first
        if (version === "v2" && localStorage.getItem("refresh_token")) {
          try {
            // Attempt token refresh (will be implemented in auth API)
            const refreshResponse = await axiosV2Instance.post(
              "/auth/refresh",
              {
                refreshToken: localStorage.getItem("refresh_token"),
              }
            );

            if (refreshResponse.data.accessToken) {
              localStorage.setItem(
                "auth_token",
                refreshResponse.data.accessToken
              );
              localStorage.setItem(
                "refresh_token",
                refreshResponse.data.refreshToken
              );

              // Retry the original request
              const originalRequest = error.config;
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
              return axios.request(originalRequest);
            }
          } catch (refreshError) {
            console.warn("[DEBUG] Token refresh failed, logging out");
          }
        }

        await logoutUser();

        toast({
          title: "Session expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      }

      if (status === 403) {
        console.warn(
          `[DEBUG] ${version.toUpperCase()} API (${
            version === "v2" ? "port 3001" : "port 3002"
          }): Access forbidden`
        );
      }

      // V2 API: Handle standardized error format
      if (version === "v2" && errorData) {
        const standardizedError = {
          ...error,
          response: {
            ...error.response,
            data: {
              code: errorData.code || "unknown_error",
              message: errorData.message || "An error occurred",
              details: errorData.details,
              traceId: errorData.traceId,
            },
          },
        };
        return Promise.reject(standardizedError);
      }

      return Promise.reject(error);
    },
  };
};

// Apply interceptors to both instances
const v1Interceptors = createResponseInterceptor("v1");
const v2Interceptors = createResponseInterceptor("v2");

axiosV1Instance.interceptors.request.use(createRequestInterceptor("v1"));
axiosV1Instance.interceptors.response.use(
  v1Interceptors.success,
  v1Interceptors.error
);

axiosV2Instance.interceptors.request.use(createRequestInterceptor("v2"));
axiosV2Instance.interceptors.response.use(
  v2Interceptors.success,
  v2Interceptors.error
);

// Inject active organization context header for v2 requests
axiosV2Instance.interceptors.request.use((config) => {
  try {
    // Lazy import to avoid circular deps
    const store = require("../store/authStore");
    const state =
      store.useAuthStore?.getState?.() || store.default?.getState?.() || {};
    const activeOrgId =
      state.user?.defaultOrganizationId || state.organization?._id;
    if (activeOrgId) {
      config.headers = {
        ...(config.headers || {}),
        "x-organization-id": activeOrgId,
      } as any;
    }
  } catch (_) {
    /* ignore */
  }
  return config;
});

// Apply interceptors to default instance
const defaultInterceptors = createResponseInterceptor(
  API_VERSION_CONFIG.useV2 ? "v2" : "v1"
);
axiosInstance.interceptors.request.use(
  createRequestInterceptor(API_VERSION_CONFIG.useV2 ? "v2" : "v1")
);
axiosInstance.interceptors.response.use(
  defaultInterceptors.success,
  defaultInterceptors.error
);

// API version selection utility
export const getApiClient = (version?: "v1" | "v2"): AxiosInstance => {
  if (version === "v1") return axiosV1Instance;
  if (version === "v2") return axiosV2Instance;
  return axiosInstance;
};

// Feature flag utilities
export const useV2Api = (feature?: string): boolean => {
  // Global flag
  if (API_VERSION_CONFIG.useV2) return true;

  // Feature-specific flags (can be added later)
  if (feature) {
    const featureFlag = (import.meta as any).env[
      `VITE_USE_V2_${feature.toUpperCase()}`
    ];
    return featureFlag === "true";
  }

  return false;
};

// Reset token expired state (for testing)
export const resetTokenExpiredState = () => {
  hasShownTokenExpiredToast = false;
};

export default axiosInstance;
