import { useMutation, useQuery } from "@tanstack/react-query";
import socialApi from "../api/socialApi";
import { toast } from "./use-toast";

export const useConnectLinkedIn = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectLinkedIn();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to LinkedIn, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectTwitter = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectTwitter();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Twitter, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectThreads = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectThreads();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Threads, try again!",
        variant: "destructive",
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
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Meta, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectInstagram = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectInstagram();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Instagram, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectFacebook = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectFacebook();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Facebook, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectTikTok = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectTikTok();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to TikTok, try again!",
        variant: "destructive",
      });
    },
  });
};

export const useConnectYoutube = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await socialApi.connectYoutube();
      window.location.href = response;
    },
    onError: (err: any) => {
      const errorMsg = err?.response?.data?.error || err?.message;
      toast({
        title: "Connection Failed",
        description: errorMsg ?? "Failed to connect to Youtube, try again!",
        variant: "destructive",
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
      toast({
        title: "Connection Failed",
        description: err.message ?? "Failed to disconnect account, try again!",
        variant: "destructive",
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
      toast({
        title: "Connection Failed",
        description:
          err.message ?? "Failed to refresh access token, try again!",
        variant: "destructive",
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
      toast({
        title: "Connection Failed",
        description:
          err.message ?? "Failed to refresh access token, try again!",
        variant: "destructive",
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
      toast({
        title: "Connection Failed",
        description:
          err.message ?? "Failed to refresh access token, try again!",
        variant: "destructive",
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
