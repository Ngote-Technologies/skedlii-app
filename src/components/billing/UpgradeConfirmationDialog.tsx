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
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            Confirm Subscription Upgrade
            <Badge variant="secondary">
              {previewData.billingInfo?.newPlan || planName}
            </Badge>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Review the details of your subscription upgrade before confirming.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {/* Plan Comparison */}
          {previewData.billingInfo && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Plan Change Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Current Plan
                    </div>
                    <div className="font-medium">
                      {previewData.billingInfo.currentPlan}
                    </div>
                    <div className="text-sm">
                      ${previewData.billingInfo.currentPrice}/month
                    </div>
                  </div>
                  <div className="text-2xl text-muted-foreground">→</div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">
                      New Plan
                    </div>
                    <div className="font-medium">
                      {previewData.billingInfo.newPlan}
                    </div>
                    <div className="text-sm">
                      ${previewData.billingInfo.newPrice}/month
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {previewData.billingInfo.remainingDays} days remaining in
                  current billing period
                </div>
              </CardContent>
            </Card>
          )}

          {/* Amount Due Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Amount Due Today</CardTitle>
              <CardDescription>
                This amount will be charged immediately upon confirmation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {formatCurrency(previewData.amountDue, previewData.currency)}
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

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? "Redirecting..." : "Continue to Checkout"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
