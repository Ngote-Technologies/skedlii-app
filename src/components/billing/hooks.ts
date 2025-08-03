import { useMemo } from "react";
import { useToast } from "../../hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { User } from "../../types";

export const useUrlParams = () => {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  return {
    subscribed: searchParams.get("subscribed") === "true",
    subscriptionUpdated: searchParams.get("subscription_updated") === "true",
    canceled: searchParams.get("canceled") === "true",
    error: searchParams.get("error"),
    message: searchParams.get("message"),
    // New parameters for hosted checkout redirects
    upgrade: searchParams.get("upgrade"),
    downgrade: searchParams.get("downgrade"),
    plan: searchParams.get("plan"),
  };
};

export const useBillingMutations = (
  user: User | undefined,
  billing: any,
  billingInterval: any,
  fetchUserData: () => void,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  const createCheckoutSession = useMutation({
    mutationFn: async ({
      priceId,
      action,
    }: {
      priceId: string;
      action: string;
    }) => {
      const billingData: any = {
        userId: user!._id,
        email: user!.email,
        priceId,
        action,
        usedTrial:
          billing?.hasUsedTrial ||
          billing?.lastInvoiceStatus === "paid" ||
          false,
        billingInterval,
      };

      if (billing?.stripeCustomerId) {
        billingData.stripeCustomerId = billing.stripeCustomerId;
      }

      const response = await apiRequest(
        "POST",
        "/checkout/create-checkout-session",
        billingData
      );
      window.location.href = response.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/checkout/create-checkout-session"],
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/billing/cancel-subscription", {
        customerId: billing?.stripeCustomerId,
        subscriptionId: billing?.subscriptionId,
      });
    },
    onSuccess: (data) => {
      fetchUserData();
      toast({
        title: "Subscription Cancelled",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Failed to cancel subscription",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
  });

  const previewSubscriptionChange = useMutation({
    mutationFn: async ({
      priceId,
      action,
    }: {
      priceId: string;
      action: string;
    }) => {
      return await apiRequest("POST", "/subscriptions/preview", {
        priceId,
        action,
      });
    },
  });

  // New implementation using hosted checkout
  const performUpgrade = useMutation({
    mutationFn: async ({
      priceId,
      action,
    }: {
      priceId: string;
      action: string;
    }) => {
      const billingData: any = {
        userId: user!._id,
        email: user!.email,
        priceId,
        action,
        usedTrial:
          billing?.hasUsedTrial ||
          billing?.lastInvoiceStatus === "paid" ||
          false,
        billingInterval,
      };

      if (billing?.stripeCustomerId) {
        billingData.stripeCustomerId = billing.stripeCustomerId;
      }

      const response = await apiRequest(
        "POST",
        "/checkout/create-checkout-session",
        billingData
      );
      window.location.href = response.url;
    },
  });

  return {
    createCheckoutSession,
    cancelSubscription,
    previewSubscriptionChange,
    performUpgrade,
  };
};
