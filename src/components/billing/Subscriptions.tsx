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
  Copy,
  AlertTriangle,
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
import { formatDate, copyToClipboard } from "../../lib/utils";
import { useToast } from "../../hooks/use-toast";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Link } from "react-router-dom";
import PromotionCodeForm from "./PromotionCodeForm";

const Subscriptions = ({
  billing,
  showCancelDialog,
  setShowCancelDialog,
  cancelSubscription,
  setActiveTab,
  canManageBilling,
  onPreviewPromo,
  onApplyPromo,
}: {
  billing: any;
  showCancelDialog: boolean;
  setShowCancelDialog: (value: boolean) => void;
  cancelSubscription: (payload?: {
    reason?: string;
    details?: string;
    immediate?: boolean;
  }) => void;
  setActiveTab: (value: string) => void;
  canManageBilling?: boolean;
  onPreviewPromo?: (code: string) => Promise<any> | void;
  onApplyPromo?: (code: string) => Promise<any> | void;
}) => {
  const { toast } = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [cancelReason, setCancelReason] = useState<string>("");
  const [cancelDetails, setCancelDetails] = useState<string>("");

  const handleCopy = async (label: string, value: string) => {
    const ok = await copyToClipboard(value);
    if (ok) {
      toast.success({ title: `${label} copied` });
    } else {
      toast.error({ title: `Failed to copy ${label}` });
    }
  };

  const renderBillingStatus = () => {
    switch (billing?.subscriptionStatus) {
      case "active":
        if (billing?.cancelAtPeriodEnd) {
          return (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Cancellation scheduled — active until{" "}
              {billing?.currentPeriodEnd
                ? formatDate(billing.currentPeriodEnd, "PPP pp")
                : "period end"}
            </p>
          );
        }
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
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-500/5" />

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

          <div className="relative space-y-4 mb-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Posts this month</span>
                <span className="font-medium whitespace-nowrap">
                  0 / {billing?.planLimits?.maxPostsPerMonth || "50"}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Social accounts</span>
                <span className="font-medium whitespace-nowrap">
                  0 / {billing?.planLimits?.maxSocialAccounts || "5"}
                </span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Team members</span>
                <span className="font-medium whitespace-nowrap">
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
            className="w-full bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-500/5" />

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold bg-gradient-to-r capitalize from-primary to-primary-500 bg-clip-text text-transparent">
                  {billing?.subscriptionTier} Plan
                </h3>

                {billing?.cancelAtPeriodEnd ? (
                  <Badge variant="warning" size="sm" className="mt-1">
                    Cancels at period end
                  </Badge>
                ) : (
                  <StatusBadge
                    status={
                      billing?.subscriptionStatus === "trialing"
                        ? "trialing"
                        : billing?.subscriptionStatus
                    }
                    size="sm"
                  />
                )}
              </div>
            </div>
            <Badge
              variant="outline"
              className="bg-green-500/10 border-green-500/20 text-green-600"
              icon={<Shield className="h-3 w-3 mr-1" />}
            >
              Secure
            </Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Billing Information</span>
              </div>
              {renderBillingStatus()}

              {/* Promotion code form */}
              <div className="mt-4">
                <div className="text-sm font-medium mb-1">Have a code?</div>
                <PromotionCodeForm
                  canManageBilling={canManageBilling}
                  onPreview={async (code) =>
                    onPreviewPromo ? await onPreviewPromo(code) : undefined}
                  onApply={async (code) =>
                    onApplyPromo ? await onApplyPromo(code) : undefined}
                />
              </div>

              {billing?.subscriptionId && (
                <div className="text-sm w-full">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Subscription ID:
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="font-medium font-mono text-xs truncate flex-1 min-w-0"
                      title={billing.subscriptionId}
                    >
                      {billing.subscriptionId}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      aria-label="Copy subscription ID"
                      onClick={() =>
                        handleCopy("Subscription ID", billing.subscriptionId)
                      }
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {billing?.customerId && (
                <div className="text-sm w-full">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Customer ID:</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="font-medium font-mono text-xs truncate flex-1 min-w-0"
                      title={billing.customerId}
                    >
                      {billing.customerId}
                    </span>
                    <Button
                      variant="ghost"
                      size="xs"
                      aria-label="Copy customer ID"
                      onClick={() =>
                        handleCopy("Customer ID", billing.customerId)
                      }
                      title="Copy"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart3 className="h-4 w-4" />
                <span>Usage Overview</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Posts this month
                    </span>
                    <span className="font-medium whitespace-nowrap">
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
                    <span className="font-medium whitespace-nowrap">
                      0 /{" "}
                      {billing?.planLimits?.maxSocialAccounts || "Unlimited"}
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Team members</span>
                    <span className="font-medium whitespace-nowrap">
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

        {billing?.subscriptionStatus === "active" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t border-border/50">
            {billing?.cancelAtPeriodEnd ? (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Cancellation scheduled — active until{" "}
                  {billing?.currentPeriodEnd
                    ? formatDate(billing.currentPeriodEnd, "PPP pp")
                    : "period end"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span>Subscription is active and up to date</span>
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto flex-col sm:flex-row">
              {canManageBilling && !billing?.cancelAtPeriodEnd && (
                <AlertDialog
                  open={showCancelDialog}
                  onOpenChange={(open) => {
                    setShowCancelDialog(open);
                    if (!open) {
                      setConfirmCancel(false);
                      setIsCanceling(false);
                    }
                  }}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full sm:w-auto">
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-xl flex flex-col max-h-[85svh] sm:max-h-[80vh]">
                    <div className="h-1.5 w-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-500" />
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                      <AlertDialogHeader className="text-center">
                        <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 border border-red-500/20">
                          <PauseCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <AlertDialogTitle className="text-2xl font-bold text-red-600">
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center space-y-2">
                          <span className="block">
                            Your subscription remains active until the end of
                            your current billing period
                            {billing?.currentPeriodEnd && (
                              <>
                                : {formatDate(billing.currentPeriodEnd, "PPP")}
                              </>
                            )}
                            .
                          </span>
                          <span className="block text-sm">
                            After that, your account reverts to the Free plan
                            with limited features. You can reactivate any time.
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="mt-4 rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground space-y-3">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5" />
                          <div>
                            <p>
                              Scheduled posts after the end of the billing
                              period will not run.
                            </p>
                            <div className="mt-1">
                              <Button asChild variant="outline" size="sm">
                                <Link to="/dashboard/scheduled">
                                  View scheduled posts
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                        <ul className="list-disc pl-4 space-y-1 text-left">
                          <li>Team and social account limits will decrease.</li>
                          <li>Billing stops once the period ends.</li>
                        </ul>
                      </div>

                      <div className="mt-5 text-left">
                        <p className="text-sm font-medium mb-2">
                          Tell us why you’re canceling (optional)
                        </p>
                        <RadioGroup
                          className="gap-2"
                          value={cancelReason}
                          onValueChange={setCancelReason}
                        >
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="expensive" />
                            <span>Too expensive</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="missing-features" />
                            <span>Missing features I need</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="switching" />
                            <span>Switching to another tool</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="temporary" />
                            <span>Temporary pause</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="bugs" />
                            <span>Bug or reliability issues</span>
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <RadioGroupItem value="other" />
                            <span>Other</span>
                          </label>
                        </RadioGroup>

                        <Textarea
                          className="mt-3"
                          placeholder="Any details you’d like to share (optional)"
                          value={cancelDetails}
                          onChange={(e) => setCancelDetails(e.target.value)}
                          size="sm"
                          autoResize
                        />
                      </div>

                      <label className="mt-4 flex items-start gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4 rounded border-border"
                          checked={confirmCancel}
                          onChange={(e) => setConfirmCancel(e.target.checked)}
                        />
                        <span>I understand the above and want to proceed.</span>
                      </label>
                    </div>
                    <div className="p-4 border-t bg-background pb-[env(safe-area-inset-bottom)] sm:pb-4">
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="flex-1 w-full">
                          Keep Subscription
                        </AlertDialogCancel>
                        <AlertDialogAction
                          disabled={!confirmCancel || isCanceling}
                          onClick={async () => {
                            if (!confirmCancel || isCanceling) return;
                            try {
                              setIsCanceling(true);
                              await Promise.resolve(
                                cancelSubscription({
                                  reason: cancelReason || undefined,
                                  details: cancelDetails || undefined,
                                })
                              );
                            } finally {
                              setIsCanceling(false);
                              setConfirmCancel(false);
                              setCancelReason("");
                              setCancelDetails("");
                            }
                          }}
                          className="flex-1 w-full bg-red-600 hover:bg-red-700 text-white border-0"
                        >
                          <PauseCircle className="h-4 w-4 mr-2" />
                          {isCanceling ? "Canceling..." : "Cancel Subscription"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant="default"
                onClick={() => setActiveTab("plans")}
                disabled={!canManageBilling}
                title={
                  !canManageBilling
                    ? "Only account owners can manage billing"
                    : ""
                }
                className="w-full sm:w-auto"
              >
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
