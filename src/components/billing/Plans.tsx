import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  CheckCircle2,
  Crown,
  Zap,
  Star,
  Sparkles,
  TrendingUp,
  Users,
  Rocket,
} from "lucide-react";

const Plans = ({
  displayedPlans,
  isYearly,
  billing,
  handleUpgradeDowngrade,
  canManageBilling,
  hasValidSubscription,
}: {
  displayedPlans: any[];
  isYearly: boolean;
  billing: any;
  handleUpgradeDowngrade: (plan: any, interval: "monthly" | "yearly") => void;
  canManageBilling?: boolean;
  hasValidSubscription?: boolean;
}) => {
  const getPlanActionText = (planId: string) => {
    if (!billing?.subscriptionTier || !hasValidSubscription) {
      return "Choose Plan";
    }

    if (billing.subscriptionTier === planId) return "Current Plan";

    const tiers = ["test", "creator", "team", "enterprise"];
    const currentIndex = tiers.indexOf(billing.subscriptionTier);
    const targetIndex = tiers.indexOf(planId);

    if (targetIndex > currentIndex) return "Upgrade";
    if (targetIndex < currentIndex) return "Downgrade";

    return "Choose Plan";
  };

  // Enhanced plan styling
  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "test":
        return Users;
      case "creator":
        return Star;
      case "team":
        return Crown;
      case "enterprise":
        return Rocket;
      default:
        return Sparkles;
    }
  };

  const getPlanTheme = (planId: string, isPopular: boolean) => {
    if (isPopular) {
      return {
        gradient: "from-primary-600 to-primary-700",
        ring: "ring-primary/50",
        iconBg: "bg-primary text-white",
        badge: "bg-primary text-white",
      };
    }

    switch (planId) {
      case "test":
        return {
          gradient: "from-gray-500 to-gray-600",
          ring: "ring-gray-300",
          iconBg: "bg-gray-500/10 text-gray-600",
          badge: "bg-gray-500/10 text-gray-600",
        };
      case "creator":
        return {
          gradient: "from-blue-500 to-cyan-500",
          ring: "ring-blue-300",
          iconBg: "bg-blue-500/10 text-blue-600",
          badge: "bg-blue-500/10 text-blue-600",
        };
      case "team":
        return {
          gradient: "from-primary-600 to-primary-700",
          ring: "ring-primary-300",
          iconBg: "bg-primary-500/10 text-primary-600",
          badge: "bg-primary-500/10 text-primary-600",
        };
      case "enterprise":
        return {
          gradient: "from-orange-500 to-red-500",
          ring: "ring-orange-300",
          iconBg: "bg-orange-500/10 text-orange-600",
          badge: "bg-orange-500/10 text-orange-600",
        };
      default:
        return {
          gradient: "from-gray-500 to-gray-600",
          ring: "ring-gray-300",
          iconBg: "bg-gray-500/10 text-gray-600",
          badge: "bg-gray-500/10 text-gray-600",
        };
    }
  };

  const currencyFormatter = (
    amountCents?: number | null,
    currency?: string | null
  ) => {
    if (amountCents == null) return null;
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "USD").toUpperCase(),
        maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
      }).format(amountCents / 100);
    } catch {
      return `$${(amountCents / 100).toFixed(amountCents % 100 === 0 ? 0 : 2)}`;
    }
  };

  return (
    <div className="mx-auto max-w-6xl grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
      {displayedPlans.map((plan) => {
        const cycle: "monthly" | "yearly" = isYearly ? "yearly" : "monthly";
        const interval = (plan.intervals || []).find(
          (i: any) => i.cycle === cycle
        );
        const isEnterprise = plan.id === "enterprise";
        const isComingSoon = !!plan.comingSoon;
        const showPrice = !isEnterprise && !isComingSoon;
        const formatted = showPrice
          ? currencyFormatter(interval?.amount, interval?.currency)
          : null;
        const displayValue = showPrice
          ? formatted ??
            (isYearly ? plan.priceYearly : plan.priceMonthly) ??
            "—"
          : isEnterprise
          ? "Contact Sales"
          : "—";
        const displayPeriod = cycle;
        const isCurrentPlan: boolean =
          (billing?.subscriptionTier &&
            billing.subscriptionTier === plan.id &&
            hasValidSubscription) ||
          false;
        const PlanIcon = getPlanIcon(plan.id);
        const theme = getPlanTheme(plan.id, plan.isPopular);

        return (
          <div
            key={plan.id}
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 h-full`}
          >
            <div
              className={`relative h-full rounded-xl border bg-gradient-to-br from-background to-muted/30 p-6 backdrop-blur-sm flex flex-col ${
                isCurrentPlan ? "border-green-300" : "border-border/50"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative space-y-4 flex-1 flex flex-col">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                    <PlanIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg capitalize bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                        {plan.name}
                      </h3>
                      {isCurrentPlan && (
                        <Badge
                          icon={<CheckCircle2 className="h-3 w-3" />}
                          className="h-5 px-2 bg-green-500/10 text-green-700 border border-green-500/20"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                    {plan.badge && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${theme.badge}`}
                      >
                        {plan.badge}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-center py-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-500 bg-clip-text text-transparent">
                      {showPrice
                        ? typeof displayValue === "string" &&
                          displayValue.startsWith("$")
                          ? displayValue
                          : `$${displayValue}`
                        : displayValue}
                    </span>
                    {showPrice && (
                      <span className="text-sm text-muted-foreground font-medium">
                        /{displayPeriod}
                      </span>
                    )}
                  </div>
                  {isYearly && showPrice && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        Over 15% saved
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    What's included:
                  </h4>
                  <ul className="space-y-2">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground/90">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={`w-full mt-auto transition-all duration-200 h-10 font-semibold tracking-tight ${
                    isCurrentPlan
                      ? "bg-green-500/10 border-green-500/30 text-green-700 hover:bg-green-500/15"
                      : plan.isPopular
                      ? `bg-gradient-to-r ${theme.gradient} hover:shadow-lg hover:shadow-primary/25 text-white border-0`
                      : "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/15"
                  } ${
                    !canManageBilling ||
                    plan.comingSoon ||
                    plan.id === "enterprise"
                      ? "disabled:opacity-50 disabled:cursor-not-allowed"
                      : ""
                  }`}
                  variant={
                    isCurrentPlan
                      ? "outline"
                      : plan.isPopular
                      ? "default"
                      : "secondary"
                  }
                  onClick={() => handleUpgradeDowngrade(plan, cycle)}
                  disabled={
                    isCurrentPlan ||
                    !canManageBilling ||
                    !!plan.comingSoon ||
                    plan.id === "enterprise"
                  }
                  title={
                    !canManageBilling
                      ? "Only account owners can manage billing"
                      : plan.id === "enterprise"
                      ? "Contact our team for Enterprise"
                      : plan.comingSoon
                      ? "This plan is coming soon"
                      : ""
                  }
                >
                  {isCurrentPlan && <CheckCircle2 className="h-4 w-4 mr-2" />}
                  {plan.isPopular && !isCurrentPlan && (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {plan.id === "enterprise"
                    ? "Contact Sales"
                    : plan.comingSoon
                    ? "Coming Soon"
                    : !canManageBilling
                    ? "View Only"
                    : getPlanActionText(plan.id)}
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Plans;
