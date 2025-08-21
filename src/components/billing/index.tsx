import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/hooks";
import { useToast } from "../../hooks/use-toast";
import { useAccessControl } from "../../hooks/useAccessControl";
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
import { CreditCard, FileText, Zap } from "lucide-react";
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
  { value: "subscription" as const, label: "Subscription", icon: CreditCard },
  { value: "plans" as const, label: "Plans", icon: Zap },
  { value: "invoices" as const, label: "Invoices", icon: FileText },
];
type TabValue = "subscription" | "plans" | "invoices";

const Billing = () => {
  const { user, fetchUserData } = useAuth();
  const { billing } = user;
  const { toast } = useToast();
  const { canManageBilling } = useAccessControl();
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
      toast.success({
        title: "Subscription Created",
        description: "Your subscription has been created successfully.",
      });
    } else if (subscriptionUpdated) {
      toast.success({
        title: "Subscription Updated",
        description: "Your subscription has been updated successfully.",
      });
    } else if (upgrade === "success") {
      toast.success({
        title: "Subscription Upgraded Successfully!",
        description: plan ? `Welcome to ${plan}!` : "Your subscription has been upgraded.",
      });
    } else if (downgrade === "success") {
      toast.success({
        title: "Subscription Downgraded",
        description: plan ? `Changed to ${plan}` : "Your subscription has been downgraded.",
      });
    } else if (upgrade === "canceled" || downgrade === "canceled") {
      toast.warning({
        title: "Subscription Change Canceled",
        description: "Your subscription change was canceled. No changes were made.",
      });
    } else if (error) {
      toast.error({
        title: "Subscription Operation Failed",
        description: message ?? "Failed to process subscription change.",
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
        toast.error({
          title: "Preview Error",
          description: data.data.error,
        });
        return;
      }

      if (data.success && data.data) {
        setUpgradePreviewData(data.data);
        setShowUpgradeDialog(true);
      } else {
        fetchUserData();
        toast.success({
          title: "Subscription Updated",
          description: data.message || "Subscription has been updated successfully.",
        });
      }
    },
    [fetchUserData, toast]
  );

  const handlePreviewError = useCallback(
    (error: any) => {
      toast.error({
        title: "Subscription Change Failed",
        description: error?.response?.data?.error || "Something went wrong, please try again.",
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
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-background to-muted/30 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Billing & Subscription
            </h2>
            <p className="text-muted-foreground mt-1">
              Manage your subscription and payment details
            </p>
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">
                {billing?.paymentStatus === "active" ? "Active" : "Inactive"}
              </div>
              <div className="text-xs text-muted-foreground">Status</div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="text-center">
              <div className="text-sm font-bold text-foreground">
                ${billing?.amountPaid || "0"}
              </div>
              <div className="text-xs text-muted-foreground">Last Payment</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="subscription">
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
              <div className="relative flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Subscription Details
                  </CardTitle>
                  <CardDescription>
                    View and manage your current subscription
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Subscriptions
                billing={billing || {}}
                showCancelDialog={showCancelDialog}
                setShowCancelDialog={setShowCancelDialog}
                cancelSubscription={handleCancelSubscription}
                setActiveTab={setActiveTab as any}
                canManageBilling={canManageBilling}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Available Plans</CardTitle>
                    <CardDescription>
                      Choose the plan that works best for you
                    </CardDescription>
                  </div>
                </div>

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <span
                    className={`text-sm transition-all duration-200 ${
                      billingInterval === "monthly"
                        ? "font-bold text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Monthly
                  </span>
                  <Switch
                    checked={billingInterval === "yearly"}
                    onCheckedChange={toggleBillingInterval}
                    aria-label="Toggle yearly billing"
                    className="data-[state=checked]:bg-primary"
                  />
                  <span
                    className={`text-sm transition-all duration-200 ${
                      billingInterval === "yearly"
                        ? "font-bold text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    Yearly
                  </span>
                  {billingInterval === "yearly" && (
                    <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
                      Save 20%
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Plans
                displayedPlans={displayedPlans}
                isYearly={billingInterval === "yearly"}
                billing={billing}
                handleUpgradeDowngrade={handleUpgradeDowngrade}
                canManageBilling={canManageBilling}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Invoice History</CardTitle>
                    <CardDescription>
                      View and download your past invoices
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Invoice Stats */}
                  <div className="hidden md:flex items-center gap-4 mr-4">
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">
                        {invoices.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="w-px h-8 bg-border" />
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">
                        {invoices.filter((i) => i.status === "paid").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Paid</div>
                    </div>
                  </div>

                  <Button
                    onClick={toggleViewMode}
                    variant="outline"
                    size="sm"
                    className="hidden lg:flex items-center gap-2 bg-background/50 hover:bg-background/80"
                  >
                    {viewMode === "card" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <CreditCard className="h-4 w-4" />
                    )}
                    {viewMode === "card" ? "Table" : "Card"} View
                  </Button>
                </div>
              </div>
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
