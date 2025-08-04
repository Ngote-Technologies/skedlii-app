import { Button } from "../ui/button";
import { CheckCircle2 } from "lucide-react";

const Plans = ({
  displayedPlans,
  isYearly,
  billing,
  handleUpgradeDowngrade,
}: {
  displayedPlans: any[];
  isYearly: boolean;
  billing: any;
  handleUpgradeDowngrade: (plan: any) => void;
}) => {
  const getPlanActionText = (planId: string) => {
    if (!billing?.planId) {
      return "Choose Plan";
    }

    if (billing.planId === planId) return "Current Plan";

    const tiers = ["test", "creator", "pro", "enterprise"];
    const currentIndex = tiers.indexOf(billing.planId);
    const targetIndex = tiers.indexOf(planId);

    if (targetIndex > currentIndex) return "Upgrade";
    if (targetIndex < currentIndex) return "Downgrade";

    return "Choose Plan";
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {displayedPlans.map((plan) => {
        const displayPrice = isYearly ? plan.priceYearly : plan.priceMonthly;
        const displayPeriod = isYearly ? "yearly" : "monthly";
        const isCurrentPlan: boolean = billing?.productId === plan.productId;

        return (
          <div
            key={plan.id}
            className={`border rounded-lg p-6 space-y-4 ${
              plan.isPopular
                ? "border-primary-500 shadow-lg"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <div className="flex items-center space-x-3">
              <h3 className="font-bold text-lg capitalize">{plan.name}</h3>
              {plan.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800 dark:bg-secondary-900/30 dark:text-secondary-300">
                  {plan.badge}
                </span>
              )}
            </div>

            <div className="flex items-baseline">
              <span className="text-3xl font-bold">${displayPrice}</span>
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                {displayPeriod}
              </span>
            </div>

            <ul className="space-y-2">
              {plan.features.map((feature: string) => (
                <li key={feature} className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              variant={isCurrentPlan ? "outline" : "default"}
              onClick={() => handleUpgradeDowngrade(plan)}
              disabled={isCurrentPlan}
            >
              {getPlanActionText(plan.id)}
            </Button>
          </div>
        );
      })}
    </div>
  );
};

export default Plans;
