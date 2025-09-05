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
}: {
  displayedPlans: any[];
  isYearly: boolean;
  billing: any;
  handleUpgradeDowngrade: (plan: any, interval: 'monthly' | 'yearly') => void;
  canManageBilling?: boolean;
}) => {
  const getPlanActionText = (planId: string) => {
    if (!billing?.subscriptionTier) {
      return "Choose Plan";
    }

    if (billing.subscriptionTier === planId) return "Current Plan";

    const tiers = ["test", "creator", "pro", "enterprise"];
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
      case "pro":
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
        gradient: "from-primary to-purple-500",
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
      case "pro":
        return {
          gradient: "from-purple-500 to-pink-500",
          ring: "ring-purple-300",
          iconBg: "bg-purple-500/10 text-purple-600",
          badge: "bg-purple-500/10 text-purple-600",
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

  const currencyFormatter = (amountCents?: number | null, currency?: string | null) => {
    if (amountCents == null) return null;
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: (currency || 'USD').toUpperCase(),
        maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
      }).format(amountCents / 100);
    } catch {
      return `$${(amountCents / 100).toFixed(amountCents % 100 === 0 ? 0 : 2)}`;
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {displayedPlans.map((plan) => {
        const cycle: 'monthly' | 'yearly' = isYearly ? 'yearly' : 'monthly';
        const interval = (plan.intervals || []).find((i: any) => i.cycle === cycle);
        const formatted = currencyFormatter(interval?.amount, interval?.currency);
        const displayPrice = formatted ?? (isYearly ? plan.priceYearly : plan.priceMonthly) ?? '—';
        const displayPeriod = cycle;
        const isCurrentPlan: boolean = (billing?.subscriptionTier && billing.subscriptionTier === plan.id) || false;
        const PlanIcon = getPlanIcon(plan.id);
        const theme = getPlanTheme(plan.id, plan.isPopular);

        return (
          <div
            key={plan.id}
            className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
              plan.isPopular
                ? "ring-2 ring-offset-2 ring-offset-background " + theme.ring
                : "hover:shadow-lg hover:shadow-primary/10"
            }`}
          >
            {/* Background Card */}
            <div className="relative h-full rounded-xl border border-border/50 bg-gradient-to-br from-background to-muted/30 p-6 backdrop-blur-sm">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Popular badge */}
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge
                    className={`bg-gradient-to-r ${theme.gradient} text-white shadow-lg animate-pulse`}
                  >
                    <Crown className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              {/* Current plan indicator */}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4">
                  <Badge
                    variant="outline"
                    className="bg-green-500/10 border-green-500/20 text-green-600"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                </div>
              )}

              {/* Plan Header */}
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${theme.iconBg}`}>
                    <PlanIcon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg capitalize bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                      {plan.name}
                    </h3>
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

                {/* Pricing */}
                <div className="text-center py-4">
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      {typeof displayPrice === 'string' && displayPrice.startsWith('$') ? displayPrice : `$${displayPrice}`}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground font-medium">
                      /{displayPeriod}
                    </span>
                  </div>
                  {isYearly && (
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span className="text-xs text-green-600 font-medium">
                        Save 20%
                      </span>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="space-y-3">
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

                {/* Action Button */}
                <Button
                  className={`w-full mt-6 transition-all duration-200 ${
                    isCurrentPlan
                      ? "bg-green-500/10 border-green-500/20 text-green-600 hover:bg-green-500/20"
                      : plan.isPopular
                      ? `bg-gradient-to-r ${theme.gradient} hover:shadow-lg hover:shadow-primary/25 text-white border-0`
                      : "hover:bg-primary/5 border-border/50"
                  } ${
                    !canManageBilling
                      ? "disabled:opacity-50 disabled:cursor-not-allowed"
                      : ""
                  }`}
                  variant={
                    isCurrentPlan
                      ? "outline"
                      : plan.isPopular
                      ? "default"
                      : "outline"
                  }
                  onClick={() => handleUpgradeDowngrade(plan, cycle)}
                  disabled={isCurrentPlan || !canManageBilling}
                  title={
                    !canManageBilling
                      ? "Only account owners can manage billing"
                      : ""
                  }
                >
                  {isCurrentPlan && <CheckCircle2 className="h-4 w-4 mr-2" />}
                  {plan.isPopular && !isCurrentPlan && (
                    <Zap className="h-4 w-4 mr-2" />
                  )}
                  {!canManageBilling ? "View Only" : getPlanActionText(plan.id)}
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
