import { useMutation, useQuery } from "@tanstack/react-query";
import socialApi from "../api/socialApi";
import { toast } from "./use-toast";

export const useConnectLinkedIn = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectLinkedIn();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Connection Failed",
        description:
          errorMsg ?? "Failed to connect to LinkedIn. Please try again.",
      });
    },
  });
};

export const useConnectTwitter = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectTwitter();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Twitter Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to Twitter. Please check your account and try again.",
      });
    },
  });
};

export const useConnectThreads = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectThreads();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Threads Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to Threads. Please check your account and try again.",
      });
    },
  });
};

export const useConnectMeta = () => {
  return useMutation({
    mutationFn: async ({
      platform,
    }: {
      platform: "facebook" | "instagram";
    }) => {
      const response = await socialApi.connectViaMeta({
        platform,
      });
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Meta Connection Failed",
        description:
          errorMsg ?? "Failed to connect to Meta platform. Please try again.",
      });
    },
  });
};

export const useConnectInstagram = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectInstagram();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Instagram Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to Instagram. Please check your account and try again.",
      });
    },
  });
};

export const useConnectFacebook = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectFacebook();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "Facebook Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to Facebook. Please check your account and try again.",
      });
    },
  });
};

export const useConnectTikTok = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectTikTok();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "TikTok Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to TikTok. Please check your account and try again.",
      });
    },
  });
};

export const useConnectYoutube = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectYoutube();
      window.location.href = response.url;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast.error({
        title: "YouTube Connection Failed",
        description:
          errorMsg ??
          "Failed to connect to YouTube. Please check your account and try again.",
      });
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async ({ id, platform }: { id: string; platform: string }) => {
      const disconnectFn =
        platform === "tiktok"
          ? socialApi.disconnectTikTok
          : socialApi.disconnectSocialAccount;
      const response = await disconnectFn({
        accountId: id,
      });
      return response;
    },
    onError: (err: any) => {
      toast.error({
        title: "Disconnect Failed",
        description:
          err.message ?? "Failed to disconnect account. Please try again.",
      });
    },
  });
};

export const useRefreshTwitterAccessToken = () => {
  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await socialApi.refreshTwitterAccessToken({ accountId });
      return response;
    },
    onError: (err: any) => {
      toast.error({
        title: "Token Refresh Failed",
        description:
          err.message ??
          "Failed to refresh Twitter access token. Please try again.",
      });
    },
  });
};

export const useRefreshYoutubeAccessToken = () => {
  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await socialApi.refreshYoutubeAccessToken({ accountId });
      return response;
    },
    onError: (err: any) => {
      toast.error({
        title: "Token Refresh Failed",
        description:
          err.message ??
          "Failed to refresh YouTube access token. Please try again.",
      });
    },
  });
};

export const useRefreshTikTokAccessToken = () => {
  return useMutation({
    mutationFn: async (accountId: string) => {
      const response = await socialApi.refreshTikTokAccessToken({ accountId });
      return response;
    },
    onError: (err: any) => {
      toast.error({
        title: "Token Refresh Failed",
        description:
          err.message ??
          "Failed to refresh TikTok access token. Please try again.",
      });
    },
  });
};

export const useGetSocialAccounts = (userId: string) => {
  return useQuery({
    queryKey: ["/social-accounts"],
    queryFn: async () => {
      const response = await socialApi.getAccounts({ id: userId });
      return response;
    },
    enabled: !!userId,
  });
};

export const useGetOrganizationSocialAccounts = (organizationId: string) => {
  return useQuery({
    queryKey: ["/social-accounts/organization", organizationId],
    queryFn: async () => {
      const response = await socialApi.getOrganizationSocialAccounts(
        organizationId
      );
      return response;
    },
    enabled: !!organizationId,
  });
};
