import Header from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Check,
  Star,
  Sparkles,
  ArrowRight,
  Clock,
  Crown,
  Rocket,
  TrendingUp,
} from "lucide-react";

interface BackendPlan {
  id: string;
  name: string;
  description: string;
  badge?: string;
  badgeColor?: string; // not used directly for classes
  isPopular?: boolean;
  comingSoon?: boolean;
  features: string[];
  intervals: Array<{
    cycle: "monthly" | "yearly";
    amount: number; // cents
    currency: string; // e.g. usd
    trialDays?: number;
  }>;
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Fetch plans from backend - with timeout and error handling
  const {
    data: plansResponse,
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: [`/billing/plans`],
    staleTime: 0, // Always try to fetch fresh data
  }) as { data: any; isLoading: boolean; error: any };
  const backendPlans = plansResponse?.plans || [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-plan-index") || "0"
            );
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const planCards = document.querySelectorAll("[data-plan-index]");
    planCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [backendPlans.length]);

  const getInterval = (plan: BackendPlan, cycle: "monthly" | "yearly") =>
    (plan.intervals || []).find((i) => i.cycle === cycle);

  const getSavingsPercent = (plan: BackendPlan) => {
    const m = getInterval(plan, "monthly");
    const y = getInterval(plan, "yearly");
    if (!m?.amount || !y?.amount) return null;
    const yearIfMonthly = m.amount * 12;
    if (y.amount >= yearIfMonthly) return 0;
    return Math.round(((yearIfMonthly - y.amount) / yearIfMonthly) * 100);
  };

  const currencyFormatter = (amountCents: number, currency: string) => {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency.toUpperCase(),
        maximumFractionDigits: amountCents % 100 === 0 ? 0 : 2,
      }).format(amountCents / 100);
    } catch {
      return `$${(amountCents / 100).toFixed(amountCents % 100 === 0 ? 0 : 2)}`;
    }
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
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

  const getPlanTheme = (planId: string, isPopular?: boolean) => {
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
          iconBg: "bg-gray-500 text-gray-600",
          badge: "bg-gray-500 text-gray-600",
        };
      case "creator":
        return {
          gradient: "from-blue-500 to-cyan-500",
          ring: "ring-blue-300",
          iconBg: "bg-blue-500 text-blue-600",
          badge: "bg-blue-500 text-blue-600",
        };
      case "team":
        return {
          gradient: "from-primary-600 to-primary-700",
          ring: "ring-primary-300",
          iconBg: "bg-accent-500 text-primary-600",
          badge: "bg-accent-500 text-primary-600",
        };
      case "enterprise":
        return {
          gradient: "from-orange-500 to-red-500",
          ring: "ring-orange-300",
          iconBg: "bg-orange-500 text-orange-600",
          badge: "bg-orange-500 text-orange-600",
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

  return (
    <div className="min-h-screen flex flex-col" id="pricing">
      <Header />
      <main className="flex-grow relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-40 w-80 h-80 rounded-full bg-primary-200/20 dark:bg-primary-900/10 blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-1/4 -left-40 w-80 h-80 rounded-full bg-secondary-200/20 dark:bg-secondary-900/10 blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-emerald-100/10 dark:bg-emerald-800/10 blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        <section className="py-16 text-center max-w-4xl mx-auto px-4 relative">
          <div className="inline-block mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:scale-105 transition-transform duration-200 cursor-default">
              <TrendingUp className="w-4 h-4" />
              Simple, Transparent Pricing
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 animate-in slide-in-from-bottom-4 duration-700">
            Choose the Perfect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 dark:from-primary-500 dark:via-primary-400 dark:to-primary-200 animate-gradient-x">
              Plan for You
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-6 duration-700 delay-200">
            Scale your social media management from individual creator to
            enterprise team. All plans include our core features with no hidden
            fees.
          </p>

          <div className="flex items-center justify-center gap-4 animate-in slide-in-from-bottom-8 duration-700 delay-300">
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                !isYearly
                  ? "text-gray-900 dark:text-white"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                isYearly ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
                  isYearly ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors duration-200 ${
                  isYearly
                    ? "text-gray-900 dark:text-white"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                Yearly
              </span>
              <div className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                <Sparkles className="w-3 h-3" />
                Save over 15%
              </div>
            </div>
          </div>
        </section>

        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            {plansLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading pricing plans...
                  </span>
                </div>
              </div>
            ) : plansError ? (
              <div className="flex flex-col items-center justify-center h-64 text-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold">
                  !
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  We couldn’t load pricing right now. Please try again.
                </p>
                <Button onClick={() => window.location.reload()}>Reload</Button>
              </div>
            ) : backendPlans.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No plans available yet.
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 gap-8 ${
                  backendPlans.length === 3
                    ? "md:grid-cols-3 max-w-6xl mx-auto"
                    : backendPlans.length === 4
                    ? "md:grid-cols-2 lg:grid-cols-4"
                    : "md:grid-cols-2"
                }`}
              >
                {backendPlans.map((plan: BackendPlan, index: number) => {
                  const cycle: "monthly" | "yearly" = isYearly
                    ? "yearly"
                    : "monthly";
                  const interval = getInterval(plan, cycle);
                  const monthly = getInterval(plan, "monthly");
                  const yearly = getInterval(plan, "yearly");
                  const currency =
                    interval?.currency ||
                    monthly?.currency ||
                    yearly?.currency ||
                    "usd";
                  const amountCents = interval?.amount ?? 0;
                  const isEnterprise = plan.id === "enterprise";
                  const isComingSoon = !!plan.comingSoon;
                  const showPrice =
                    !isEnterprise && !isComingSoon && !!amountCents;
                  const displayPrice = showPrice
                    ? currencyFormatter(amountCents, currency)
                    : isEnterprise
                    ? "Contact Sales"
                    : "—";
                  const savings = getSavingsPercent(plan);
                  const PlanIcon = getPlanIcon(plan.id);
                  const theme = getPlanTheme(plan.id, plan.isPopular);
                  return (
                    <div
                      key={plan.id}
                      data-plan-index={index}
                      className={`relative rounded-2xl ring-2 overflow-hidden group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                        visibleCards.includes(index)
                          ? "animate-in slide-in-from-bottom-8 duration-700"
                          : "opacity-0 translate-y-8"
                      } ${
                        plan.isPopular
                          ? "ring-2 ring-primary-500 ring-offset-2 ring-offset-background"
                          : ""
                      }`}
                      style={{
                        animationDelay: `${index * 150}ms`,
                        background:
                          "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {(plan.isPopular || plan.badge) && (
                        <div className="absolute left-1/2 transform -translate-x-1/2 z-10 w-max top-1">
                          <div
                            className={`flex items-center gap-1 px-4 py-1 text-xs font-medium rounded-full text-white shadow-lg ${
                              plan.isPopular
                                ? "bg-gradient-to-r from-primary-600 to-primary-700"
                                : plan.id === "team"
                                ? "bg-gradient-to-r from-primary-600 to-primary-700"
                                : "bg-gradient-to-r from-primary-500 to-primary-600"
                            }`}
                          >
                            <Star className="w-3 h-3 fill-current" />
                            {plan.badge || "Most Popular"}
                          </div>
                        </div>
                      )}

                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                      />
                      <div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                      />

                      <div className="relative p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div
                            className={`w-12 h-12 flex items-center justify-center rounded-xl ${theme.iconBg} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                          >
                            <PlanIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold font-heading group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                              {plan.name}
                            </h3>
                          </div>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-baseline gap-2 mb-2">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              {displayPrice}
                            </span>
                            {showPrice && (
                              <span className="text-gray-500 dark:text-gray-400">
                                /{cycle}
                              </span>
                            )}
                          </div>
                          {isYearly && savings != null && showPrice && (
                            <div className="flex items-center gap-2 text-sm">
                              {monthly?.amount ? (
                                <span className="text-gray-400 line-through">
                                  {currencyFormatter(monthly.amount, currency)}
                                </span>
                              ) : null}
                              {typeof savings === "number" && savings > 0 ? (
                                <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                  Save {savings}%
                                </div>
                              ) : null}
                            </div>
                          )}
                          <p className="text-sm font-medium font-semibold text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                            Everything included:
                          </h4>
                          <ul className="space-y-3">
                            {plan.features.map((feature, featureIndex) => (
                              <li
                                key={featureIndex}
                                className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400"
                              >
                                <div className="flex-shrink-0 mt-0.5">
                                  <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                                  </div>
                                </div>
                                <span className="leading-relaxed">
                                  {feature}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-8">
                          {(() => {
                            const monthlyInt = getInterval(plan, "monthly");
                            const yearlyInt = getInterval(plan, "yearly");
                            const trialDays =
                              (isYearly
                                ? yearlyInt?.trialDays
                                : monthlyInt?.trialDays) || 0;
                            const isTrial = trialDays > 0;
                            const ctaLabel =
                              plan.id === "enterprise"
                                ? "Contact Sales"
                                : plan.comingSoon
                                ? "Coming Soon"
                                : isTrial
                                ? "Start Free Trial"
                                : "Get Started";

                            const base =
                              "w-full h-11 rounded-xl group/btn transition-all duration-200";
                            const solid =
                              "bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl";
                            const outline =
                              "border border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/40";
                            const disabledCls =
                              plan.comingSoon && plan.id !== "enterprise"
                                ? "opacity-50 cursor-not-allowed"
                                : "";

                            return (
                              <Link
                                to={
                                  plan.id === "enterprise"
                                    ? "/contact"
                                    : "/register"
                                }
                                className={`block w-full ${
                                  plan.comingSoon && plan.id !== "enterprise"
                                    ? "pointer-events-none"
                                    : ""
                                }`}
                              >
                                <Button
                                  variant={isTrial ? "default" : "outline"}
                                  size="xl"
                                  className={`${base} ${
                                    isTrial ? solid : outline
                                  } ${disabledCls}`}
                                  disabled={
                                    plan.comingSoon && plan.id !== "enterprise"
                                  }
                                >
                                  {plan.comingSoon &&
                                  plan.id !== "enterprise" ? (
                                    <span className="inline-flex items-center">
                                      <Clock className="w-4 h-4 mr-2" />
                                      Coming Soon
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center">
                                      {ctaLabel}
                                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                                    </span>
                                  )}
                                </Button>
                              </Link>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* <section className="pb-24 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="relative p-8 rounded-2xl overflow-hidden group hover:scale-105 transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-pulse"
                    style={{
                      left: `${10 + i * 12}%`,
                      top: `${20 + (i % 2) * 60}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${2 + (i % 2)}s`,
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-primary-300/50" />
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-primary-500 animate-pulse mr-2" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Still Have Questions?
                  </h3>
                  <Sparkles className="w-6 h-6 text-secondary-500 animate-pulse ml-2" />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  All plans include a free trial. No setup fees, no hidden
                  charges. Cancel anytime with full data export.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex -space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-current"
                        />
                      ))}
                    </div>
                    <span>Trusted by 50,000+ creators</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Join thousands of happy users</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}
