import {
  CheckCircle2,
  ArrowRightCircle,
  PauseCircle,
  AlertCircle,
} from "lucide-react";
import { Badge, StatusBadge } from "../ui/badge";
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
}: {
  billing: any;
  showCancelDialog: boolean;
  setShowCancelDialog: (value: boolean) => void;
  cancelSubscription: () => void;
  setActiveTab: (value: string) => void;
}) => {
  const getStatusBadge = () => {
    switch (billing?.paymentStatus) {
      case "paid":
      case "active":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Active
          </Badge>
        );
      case "trialing":
        return (
          <Badge className="bg-blue-500 hover:bg-blue-600">
            <ArrowRightCircle className="h-3 w-3 mr-1" /> Trial Active
          </Badge>
        );
      case "cancelled":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <PauseCircle className="h-3 w-3 mr-1" /> Cancelled
          </Badge>
        );
      case "inactive":
      default:
        return (
          <Badge className="bg-gray-500 hover:bg-gray-600">
            <AlertCircle className="h-3 w-3 mr-1" /> Inactive
          </Badge>
        );
    }
  };

  const renderBillingStatus = () => {
    switch (billing?.subscriptionStatus) {
      case "active":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Next billing date: {formatDate(billing?.renewalDate, "PPP pp")}
          </p>
        );
      case "trialing":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Trial ends at: {formatDate(billing?.trialEndsAt, "PPP pp")}
          </p>
        );
      case "cancelled":
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cancelled at: {formatDate(billing?.cancelAt, "PPP pp")}
          </p>
        );
      case "inactive":
      default:
        return (
          <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
        );
    }
  };

  if (!billing?.stripeCustomerId || !billing?.renewalDate) {
    return (
      <div className="space-y-4">
        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You're currently on the Free plan. Upgrade to unlock premium
            features.
          </p>
          <Button onClick={() => setActiveTab("plans")}>Upgrade Now</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between gap-y-4">
          <div>
            <h3 className="text-lg font-medium mb-1">
              {billing?.paymentDescription}
            </h3>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={billing?.paymentStatus} size="sm" />
            </div>
            {renderBillingStatus()}
          </div>
        </div>

        {billing?.subscriptionStatus === "active" && (
          <div className="mt-6 flex flex-wrap gap-2">
            <AlertDialog
              open={showCancelDialog}
              onOpenChange={setShowCancelDialog}
            >
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <PauseCircle className="h-4 w-4 mr-2" />
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your subscription will remain active until the end of your
                    current billing period, after which your account will revert
                    to the Basic plan with limited features.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction onClick={() => cancelSubscription()}>
                    Cancel Subscription
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
