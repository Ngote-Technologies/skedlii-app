import { useToast } from "../../hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "../../lib/queryClient";
import { User } from "../../types";

export const useBillingQueries = (
  user: User | undefined,
  billing: any,
  billingInterval: any,
  fetchUserData: () => void,
  toast: ReturnType<typeof useToast>["toast"]
) => {
  type PlanInterval = "monthly" | "yearly";
  type CreateSessionInput = {
    plan: string;
    interval: PlanInterval;
    action: string;
  };
  const createCheckoutSession = useMutation({
    mutationFn: async ({ plan, interval, action }: CreateSessionInput) => {
      const billingData: any = {
        userId: user!._id,
        email: user!.email,
        plan,
        interval,
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
      plan,
      interval,
      action,
    }: {
      plan: string;
      interval: PlanInterval;
      action: string;
    }) => {
      return await apiRequest("POST", "/checkout/preview", {
        plan,
        interval,
        action,
      });
    },
  });

  // New implementation using hosted checkout
  const performUpgrade = useMutation({
    mutationFn: async ({
      plan,
      interval,
      action,
    }: {
      plan: string;
      interval: PlanInterval;
      action: string;
    }) => {
      const billingData: any = {
        plan,
        interval,
        action,
      };

      const response = await apiRequest(
        "POST",
        "/checkout/confirm-change",
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
