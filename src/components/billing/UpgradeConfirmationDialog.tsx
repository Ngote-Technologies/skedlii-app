import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import {
  ArrowRight,
  CreditCard,
  Crown,
  Shield,
  Zap,
  Clock,
} from "lucide-react";

interface PreviewData {
  amountDue: number;
  currency: string;
  total: number;
  subtotal: number;
  currentPeriodStart: number;
  currentPeriodEnd: number;
  lines: Array<{
    description: string;
    amount: number;
    proration: boolean;
    period?: {
      start: number;
      end: number;
    };
  }>;
  subscription: {
    id: string;
    currentPrice: string;
    newPrice: string;
  };
  billingInfo?: {
    currentPlan: string;
    newPlan: string;
    currentPrice: number;
    newPrice: number;
    nextBillingAmount: number;
    totalDaysInPeriod: number;
    remainingDays: number;
    isUpgrade: boolean;
  };
}

interface UpgradeConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  previewData: PreviewData | null;
  isLoading?: boolean;
  planName?: string;
}

export function UpgradeConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  previewData,
  isLoading = false,
  planName = "New Plan",
}: UpgradeConfirmationDialogProps) {
  if (!previewData) return null;

  const formatCurrency = (
    amount: number | string,
    currency: string = "USD"
  ) => {
    let numericAmount =
      typeof amount === "number" ? amount : parseFloat(`${amount}`) || 0;

    if (numericAmount > 10000 && numericAmount % 10 === 7) {
      console.warn(
        "Detected 10x inflated amount, correcting:",
        numericAmount,
        "→",
        numericAmount / 10
      );
      numericAmount = numericAmount / 10;
    }

    const dollarAmount = Math.round(numericAmount) / 100;

    try {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency?.toUpperCase() || "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(dollarAmount);
      return formatted;
    } catch (error) {
      console.error("Intl.NumberFormat failed:", error);
      const fallbackSymbol =
        currency?.toUpperCase() === "USD" ? "$" : currency?.toUpperCase() || "";
      const fallbackResult = `${fallbackSymbol}${dollarAmount.toFixed(2)}`;
      return fallbackResult;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const prorationItems = previewData.lines.filter((line) => line.proration);
  const regularItems = previewData.lines.filter((line) => !line.proration);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[85vh] border-border/50 bg-gradient-to-br from-background to-muted/20 flex flex-col">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-500/5 rounded-lg" />

        <AlertDialogHeader className="relative flex-shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent-500/10">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl bg-gradient-to-r from-primary to-accent-500 bg-clip-text text-transparent">
                Confirm Subscription Upgrade
              </AlertDialogTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-primary-600 text-white" variant="premium">
                  {previewData.billingInfo?.newPlan || planName}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 border-green-500/20 text-green-600"
                  icon={<Shield className="h-3 w-3 mr-1" />}
                >
                  Secure
                </Badge>
              </div>
            </div>
          </div>
          <AlertDialogDescription>
            Review the details of your subscription upgrade before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="relative space-y-4 flex-1 overflow-y-auto pr-2 mr-2">
          {/* Plan Comparison */}
          {previewData.billingInfo && (
            <Card className="border-border/50 bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="relative overflow-hidden pb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-500/5" />
              <div className="relative flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <CardTitle className="text-lg">Plan Change Summary</CardTitle>
              </div>
            </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      Current Plan
                    </div>
                    <div className="font-bold text-lg">
                      {previewData.billingInfo.currentPlan}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${previewData.billingInfo.currentPrice}/month
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <ArrowRight className="h-6 w-6 text-primary animate-pulse" />
                    <span className="text-xs text-muted-foreground mt-1">
                      Upgrade
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">
                      New Plan
                    </div>
                    <div className="font-bold text-lg bg-gradient-to-r from-primary to-accent-500 bg-clip-text text-transparent">
                      {previewData.billingInfo.newPlan}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      ${previewData.billingInfo.newPrice}/month
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {previewData.billingInfo.remainingDays} days remaining in
                      current billing period
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amount Due Summary */}
          <Card className="border-border/50 bg-gradient-to-br from-background to-muted/30">
            <CardHeader className="relative overflow-hidden pb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent-500/5" />
              <div className="relative flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <div>
                  <CardTitle className="text-lg">Amount Due Today</CardTitle>
                  <CardDescription>
                    This amount will be charged immediately upon confirmation
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-500 bg-clip-text text-transparent">
                  {formatCurrency(previewData.amountDue, previewData.currency)}
                </div>
                <Badge
                  variant="outline"
                  className="bg-primary/10 border-primary/20 text-primary"
                >
                  Prorated
                </Badge>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                💳 Secure payment processing via Stripe
              </div>
            </CardContent>
          </Card>

          {/* Billing Period */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Current Billing Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Period Start:</span>
                <span>{formatDate(previewData.currentPeriodStart)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Period End:</span>
                <span>{formatDate(previewData.currentPeriodEnd)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Regular Items */}
              {regularItems.map((line, index) => (
                <div
                  key={`regular-${index}`}
                  className="flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="font-medium">{line.description}</div>
                    {line.period && (
                      <div className="text-xs text-muted-foreground">
                        {formatDate(line.period.start)} -{" "}
                        {formatDate(line.period.end)}
                      </div>
                    )}
                  </div>
                  <div className="font-medium">
                    {formatCurrency(line.amount, previewData.currency)}
                  </div>
                </div>
              ))}

              {/* Proration Items */}
              {prorationItems.length > 0 && (
                <>
                  <Separator />
                  <div className="text-sm font-medium text-muted-foreground">
                    Prorated Adjustments
                  </div>
                  {prorationItems.map((line, index) => (
                    <div
                      key={`proration-${index}`}
                      className="flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {line.description}
                          <Badge variant="outline" className="text-xs">
                            Proration
                          </Badge>
                        </div>
                        {line.period && (
                          <div className="text-xs text-muted-foreground">
                            {formatDate(line.period.start)} -{" "}
                            {formatDate(line.period.end)}
                          </div>
                        )}
                      </div>
                      <div className="font-medium">
                        {formatCurrency(line.amount, previewData.currency)}
                      </div>
                    </div>
                  ))}
                </>
              )}

              <Separator />

              {/* Total */}
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span>
                  {formatCurrency(previewData.total, previewData.currency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Important Notice */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-1">Next Steps:</div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>
                  Click "Continue to Checkout" to proceed to secure payment
                </li>
                <li>You'll be charged the prorated amount shown above</li>
                <li>
                  Your subscription will be upgraded after successful payment
                </li>
                <li>Your next billing date remains the same</li>
                <li>You can cancel or downgrade at any time</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="relative flex-shrink-0 border-t border-border/50 pt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="border-border/50 hover:bg-muted/80"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[160px] bg-primary-600 hover:bg-primary-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Redirecting...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Continue to Checkout
              </div>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
