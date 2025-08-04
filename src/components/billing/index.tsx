import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/hooks";
import { useToast } from "../../hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { Switch } from "../ui/switch";
import { InvoiceGrid } from "./InvoiceGrid";
import { InvoiceTableFallback } from "./InvoiceTableFallback";
import Subscriptions from "./Subscriptions";
import Plans from "./Plans";
import { UpgradeConfirmationDialog } from "./UpgradeConfirmationDialog";
import { useBillingQueries } from "../../api/queryFn/billingQuery";
import { useUrlParams } from "../../hooks/useUrlParams";

const PLAN_TIERS = ["test", "creator", "pro", "enterprise"] as const;
type PlanTier = (typeof PLAN_TIERS)[number];
const TAB_ITEMS = [
  { value: "subscription" as const, label: "Subscription" },
  { value: "plans" as const, label: "Plans" },
  { value: "invoices" as const, label: "Invoices" },
];
type TabValue = "subscription" | "plans" | "invoices";

const Billing = () => {
  const { user, fetchUserData } = useAuth();
  const { billing } = user;
  const { toast } = useToast();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<TabValue>("subscription");
  const [billingInterval, setBillingInterval] = useState("monthly");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [upgradePreviewData, setUpgradePreviewData] = useState<any>(null);
  const [pendingUpgrade, setPendingUpgrade] = useState<{
    priceId: string;
    planName: string;
  } | null>(null);

  const urlParams = useUrlParams();

  const {
    createCheckoutSession,
    cancelSubscription,
    previewSubscriptionChange,
    performUpgrade,
  } = useBillingQueries(user, billing, billingInterval, fetchUserData, toast);

  useEffect(() => {
    const {
      subscribed,
      subscriptionUpdated,
      canceled,
      error,
      message,
      upgrade,
      downgrade,
      plan,
    } = urlParams;
    const needsFetch =
      subscribed ||
      subscriptionUpdated ||
      canceled ||
      error ||
      upgrade ||
      downgrade;

    if (needsFetch) {
      fetchUserData();
    }

    if (subscribed) {
      toast({
        title: "Subscription created",
        description: "Your subscription has been created successfully",
      });
    } else if (subscriptionUpdated) {
      toast({
        title: "Subscription updated",
        description: "Your subscription has been updated successfully",
      });
    } else if (upgrade === "success") {
      toast({
        title: "Subscription upgraded successfully!",
        description: plan
          ? `Welcome to ${plan}!`
          : "Your subscription has been upgraded",
      });
    } else if (downgrade === "success") {
      toast({
        title: "Subscription downgraded",
        description: plan
          ? `Changed to ${plan}`
          : "Your subscription has been downgraded",
      });
    } else if (upgrade === "canceled" || downgrade === "canceled") {
      toast({
        title: "Subscription change canceled",
        description:
          "Your subscription change was canceled. No changes were made.",
        variant: "destructive",
      });
    } else if (error) {
      toast({
        title: "Subscription operation failed",
        description: message ?? "Failed to process subscription change",
        variant: "destructive",
      });
    }

    window.history.replaceState({}, "", "/dashboard/billing");
  }, [urlParams, fetchUserData, toast]);

  const determineSubscriptionAction = (
    billing: any | undefined,
    currentPlanId: string | undefined,
    targetPlanId: string
  ): string => {
    if (!billing || !billing.lastInvoiceStatus) {
      return "new_subscription";
    }

    const currentPlanIndex = PLAN_TIERS.indexOf(currentPlanId as PlanTier);
    const targetPlanIndex = PLAN_TIERS.indexOf(targetPlanId as PlanTier);

    if (targetPlanIndex > currentPlanIndex) {
      return "upgrade";
    } else if (targetPlanIndex < currentPlanIndex) {
      return "downgrade";
    }

    return "new_subscription";
  };

  const { data: plans = [] } = useQuery({
    queryKey: [`/plans`],
  }) as { data: any[] };

  const { data: invoices = [] } = useQuery({
    queryKey: [`/invoices/user/${user?._id}`],
  }) as { data: any[] };

  const displayedPlans = plans.map((plan) => ({
    ...plan,
    displayPrice:
      billingInterval === "yearly" ? plan.priceYearly : plan.priceMonthly,
    displayPeriod: billingInterval,
  }));

  // Handlers
  const handleCancelSubscription = useCallback(() => {
    cancelSubscription.mutate();
    setShowCancelDialog(false);
  }, [cancelSubscription]);

  const handlePreviewSuccess = useCallback(
    (data: any) => {
      if (data.data?.error) {
        toast({
          title: "Preview Error",
          description: data.data.error,
          variant: "destructive",
        });
        return;
      }

      if (data.success && data.data) {
        setUpgradePreviewData(data.data);
        setShowUpgradeDialog(true);
      } else {
        fetchUserData();
        toast({
          title: "Subscription Updated",
          description:
            data.message || "Subscription has been updated successfully",
        });
      }
    },
    [fetchUserData, toast]
  );

  const handlePreviewError = useCallback(
    (error: any) => {
      toast({
        title: "Failed to process subscription change",
        description:
          error?.response?.data?.error ||
          "Something went wrong, please try again.",
        variant: "destructive",
      });
    },
    [toast]
  );

  const handleUpgradeDowngrade = useCallback(
    (plan: any) => {
      const priceId =
        billingInterval === "yearly" ? plan.priceYearlyId : plan.priceMonthlyId;

      const action = determineSubscriptionAction(
        billing,
        billing?.planId,
        plan.id
      );

      if (action === "upgrade") {
        setPendingUpgrade({ priceId, planName: plan.name || plan.id });
        previewSubscriptionChange.mutate(
          { priceId, action: "preview" },
          {
            onSuccess: handlePreviewSuccess,
            onError: handlePreviewError,
          }
        );
      } else {
        createCheckoutSession.mutate({ priceId, action });
      }
    },
    [
      billing,
      billingInterval,
      createCheckoutSession,
      previewSubscriptionChange,
      handlePreviewSuccess,
      handlePreviewError,
    ]
  );

  const handleUpgradeConfirm = useCallback(() => {
    if (pendingUpgrade) {
      performUpgrade.mutate(
        { priceId: pendingUpgrade.priceId, action: "upgrade" },
        {
          onSettled: () => {
            setShowUpgradeDialog(false);
            setUpgradePreviewData(null);
            setPendingUpgrade(null);
          },
        }
      );
    }
  }, [pendingUpgrade, performUpgrade]);

  const handleUpgradeCancel = useCallback(() => {
    setShowUpgradeDialog(false);
    setUpgradePreviewData(null);
    setPendingUpgrade(null);
  }, []);

  const toggleBillingInterval = useCallback((checked: boolean) => {
    setBillingInterval(checked ? "yearly" : "monthly");
  }, []);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "card" ? "table" : "card"));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing & Subscription</h2>
        <p className="text-muted-foreground">
          Manage your subscription and payment details
        </p>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList>
          {TAB_ITEMS.map((item) => (
            <TabsTrigger key={item.value} value={item.value}>
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="subscription">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                View and manage your current subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Subscriptions
                billing={billing || {}}
                showCancelDialog={showCancelDialog}
                setShowCancelDialog={setShowCancelDialog}
                cancelSubscription={handleCancelSubscription}
                setActiveTab={setActiveTab as any}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card>
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
              <CardDescription>
                Choose the plan that works best for you
              </CardDescription>
              <div className="flex items-center gap-2 mt-4">
                <span
                  className={billingInterval === "monthly" ? "font-bold" : ""}
                >
                  Monthly
                </span>
                <Switch
                  checked={billingInterval === "yearly"}
                  onCheckedChange={toggleBillingInterval}
                  aria-label="Toggle yearly billing"
                />
                <span
                  className={billingInterval === "yearly" ? "font-bold" : ""}
                >
                  Yearly
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <Plans
                displayedPlans={displayedPlans}
                isYearly={billingInterval === "yearly"}
                billing={billing}
                handleUpgradeDowngrade={handleUpgradeDowngrade}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader className="relative">
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
              <Button
                onClick={toggleViewMode}
                variant="default"
                size="sm"
                className="hidden lg:block rounded-lg absolute top-3 right-7"
              >
                Switch to {viewMode === "card" ? "Table" : "Card"} View
              </Button>
            </CardHeader>
            <CardContent>
              {viewMode === "card" ? (
                <InvoiceGrid invoices={invoices} />
              ) : (
                <InvoiceTableFallback invoices={invoices} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <UpgradeConfirmationDialog
        isOpen={showUpgradeDialog}
        onClose={handleUpgradeCancel}
        onConfirm={handleUpgradeConfirm}
        previewData={upgradePreviewData}
        isLoading={performUpgrade.isPending}
        planName={pendingUpgrade?.planName}
      />
    </div>
  );
};

export default Billing;
