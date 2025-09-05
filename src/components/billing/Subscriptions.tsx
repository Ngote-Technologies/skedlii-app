import {
  PauseCircle,
  TrendingUp,
  Calendar,
  CreditCard,
  Users,
  BarChart3,
  Zap,
  Crown,
  Shield,
} from "lucide-react";
import { Badge, StatusBadge } from "../ui/badge";
import { Progress } from "../ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { formatDate } from "../../lib/utils";

const Subscriptions = ({
  billing,
  showCancelDialog,
  setShowCancelDialog,
  cancelSubscription,
  setActiveTab,
  canManageBilling,
}: {
  billing: any;
  showCancelDialog: boolean;
  setShowCancelDialog: (value: boolean) => void;
  cancelSubscription: () => void;
  setActiveTab: (value: string) => void;
  canManageBilling?: boolean;
}) => {
  const renderBillingStatus = () => {
    switch (billing?.subscriptionStatus) {
      case "active":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next billing date:{" "}
            {billing?.currentPeriodEnd
              ? formatDate(billing.currentPeriodEnd, "PPP pp")
              : "N/A"}
          </p>
        );
      case "trialing":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trial subscription -{" "}
            {billing?.trialEnd
              ? `ends ${formatDate(billing.trialEnd, "PPP pp")}`
              : "no end date set"}
          </p>
        );
      case "canceled":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Subscription canceled -{" "}
            {billing?.cancelAtPeriodEnd
              ? "active until period end"
              : "cancelled"}
          </p>
        );
      case "inactive":
      default:
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {billing?.hasValidSubscription ? "Active" : "Inactive"}
          </p>
        );
    }
  };

  if (!billing?.hasValidSubscription || billing?.subscriptionTier === "free") {
    return (
      <div className="space-y-4">
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50 p-6">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />

          <div className="relative flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gray-500/10">
              <Users className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {billing?.subscriptionTier === "trial"
                  ? "Trial Plan"
                  : "Free Plan"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {billing?.subscriptionTier === "trial"
                  ? "Free trial - full features included"
                  : "Basic features included"}
              </p>
            </div>
          </div>

          {/* Usage Display */}
          <div className="relative space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts this month</span>
                <span className="font-medium">
                  0 / {billing?.planLimits?.maxPostsPerMonth || "50"}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Social accounts</span>
                <span className="font-medium">
                  0 / {billing?.planLimits?.maxSocialAccounts || "5"}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Team members</span>
                <span className="font-medium">
                  1 / {billing?.planLimits?.maxTeamMembers || "3"}
                </span>
              </div>
              <Progress value={33} className="h-2" />
            </div>
          </div>

          <p className="text-muted-foreground mb-4">
            Upgrade to unlock unlimited posts, more social accounts, and premium
            features.
          </p>

          <Button
            onClick={() => setActiveTab("plans")}
            disabled={!canManageBilling}
            className="w-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              !canManageBilling ? "Only account owners can manage billing" : ""
            }
          >
            <Crown className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Subscription Card */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />

        <div className="relative p-6">
          {/* Subscription Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r capitalize from-primary to-purple-500 bg-clip-text text-transparent">
                  {billing?.subscriptionTier} Plan
                </h3>
                <StatusBadge
                  status={
                    billing?.subscriptionStatus === "trialing"
                      ? "trialing"
                      : billing?.subscriptionStatus
                  }
                  size="sm"
                />
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-green-500/10 border-green-500/20 text-green-600"
            >
              <Shield className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          </div>

          {/* Billing Information */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Billing Information</span>
              </div>
              {renderBillingStatus()}

              {billing?.subscriptionId && (
                <div className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Subscription ID:
                  </span>
                  <span className="font-medium font-mono text-xs">
                    {billing.subscriptionId}
                  </span>
                </div>
              )}

              {billing?.customerId && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Customer ID:</span>
                  <span className="font-medium font-mono text-xs">
                    {billing.customerId}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Usage Overview</span>
              </div>

              {/* Usage Meters */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Posts this month
                    </span>
                    <span className="font-medium">
                      0 / {billing?.planLimits?.maxPostsPerMonth || "Unlimited"}
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Social accounts
                    </span>
                    <span className="font-medium">
                      0 /{" "}
                      {billing?.planLimits?.maxSocialAccounts || "Unlimited"}
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team members</span>
                    <span className="font-medium">
                      1 / {billing?.planLimits?.maxTeamMembers || "Unlimited"}
                    </span>
                  </div>
                  <Progress
                    value={
                      billing?.planLimits?.maxTeamMembers
                        ? (1 / billing.planLimits.maxTeamMembers) * 100
                        : 10
                    }
                    className="h-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {billing?.subscriptionStatus === "active" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Subscription is active and up to date</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setActiveTab("plans")}
                disabled={!canManageBilling}
                className="border-border/50 hover:bg-primary/5 disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !canManageBilling
                    ? "Only account owners can manage billing"
                    : ""
                }
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>

              {canManageBilling && (
                <AlertDialog
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader className="text-center">
                      <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 border border-red-500/20">
                        <PauseCircle className="h-8 w-8 text-red-600" />
                      </div>
                      <AlertDialogTitle className="text-xl font-bold text-red-600">
                        Cancel Subscription?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-center space-y-2">
                        <span className="block">
                          Your subscription will remain active until the end of
                          your current billing period.
                        </span>
                        <span className="block text-sm">
                          After that, your account will revert to the Free plan
                          with limited features.
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="flex-1">
                        Keep Subscription
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelSubscription()}
                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
                      >
                        <PauseCircle className="h-4 w-4 mr-2" />
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
