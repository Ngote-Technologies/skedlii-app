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
  Heart,
  TrendingUp,
  User,
  Building,
} from "lucide-react";

interface BackendPlan {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: string;
  isPopular: boolean;
  features: string[];
  priceMonthly: number;
  priceYearly: number;
  priceMonthlyId: string;
  priceYearlyId: string;
  productId: string;
}

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  yearlyTotal?: number;
  description: string;
  popular?: boolean;
  enterprise?: boolean;
  features: string[];
  highlights: string[];
  color: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
  badge?: string;
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>([]);

  // Fetch plans from backend - with timeout and error handling
  const {
    data: backendPlans = [],
    isLoading: plansLoading,
    error: plansError,
  } = useQuery({
    queryKey: [`/plans`],
    retry: false, // Don't retry on failure
    staleTime: 0, // Always try to fetch fresh data
  }) as { data: BackendPlan[]; isLoading: boolean; error: any };

  // Fallback plans in case API fails
  const fallbackPlans: BackendPlan[] = [
    {
      id: "creator",
      name: "Creator",
      description:
        "Perfect for individual creators getting started with social media management",
      badge: "7-Day Free Trial",
      badgeColor: "blue",
      isPopular: true,
      features: [
        "Up to 3 social accounts",
        "Schedule up to 30 posts/month",
        "Basic analytics",
        "Content calendar",
        "Post templates",
        "7-day free trial",
      ],
      priceMonthly: 5,
      priceYearly: 50,
      priceMonthlyId: "price_creator_monthly",
      priceYearlyId: "price_creator_yearly",
      productId: "prod_creator",
    },
    {
      id: "team",
      name: "Team",
      description: "Collaboration for small teams in one workspace",
      badge: "Most Popular",
      badgeColor: "purple",
      isPopular: false,
      features: [
        "Up to 10 social accounts",
        "Unlimited posts",
        "Approvals workflow + content calendar",
        "Advanced analytics & insights",
        "Team collaboration (5 members)",
        "25 GB content library",
        "Priority support",
      ],
      priceMonthly: 25,
      priceYearly: 250,
      priceMonthlyId: "price_team_monthly",
      priceYearlyId: "price_team_yearly",
      productId: "prod_team",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Complete solution for agencies and large organizations",
      badge: "Everything Included",
      badgeColor: "gold",
      isPopular: false,
      features: [
        "Unlimited social accounts",
        "Unlimited posts & scheduling",
        "Advanced team management",
        "White-label solution",
        "Custom integrations",
        "Dedicated account manager",
        "SLA guarantee",
        "Advanced security & compliance",
      ],
      priceMonthly: 50,
      priceYearly: 500,
      priceMonthlyId: "price_enterprise_monthly",
      priceYearlyId: "price_enterprise_yearly",
      productId: "prod_enterprise",
    },
  ];

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
  }, []);

  // Transform backend plans into UI-friendly format
  const transformPlan = (backendPlan: BackendPlan): PricingPlan => {
    const planIcons: Record<string, React.ReactNode> = {
      creator: <User className="h-6 w-6" />,
      team: <Crown className="h-6 w-6" />,
      enterprise: <Building className="h-6 w-6" />,
    };

    const planColors: Record<string, string> = {
      creator: "from-blue-500 to-blue-600",
      team: "from-purple-500 to-purple-600",
      enterprise: "from-amber-500 to-amber-600",
    };

    const planHighlights: Record<string, string[]> = {
      creator: ["7-day free trial", "Most popular", "Best for solo creators"],
      team: [
        "Power up social growth",
        "Advanced features",
        "Team collaboration",
      ],
      enterprise: [
        "Everything included",
        "Priority support",
        "Custom solutions",
      ],
    };

    // Use backend yearly pricing directly (backend provides total yearly price)
    const yearlyMonthlyEquivalent =
      Math.round((backendPlan.priceYearly / 12) * 100) / 100;

    return {
      id: backendPlan.id,
      name: backendPlan.name,
      price: backendPlan.priceMonthly,
      yearlyPrice: yearlyMonthlyEquivalent,
      yearlyTotal: backendPlan.priceYearly, // Add the full yearly price
      description: backendPlan.description,
      popular: backendPlan.isPopular,
      enterprise: backendPlan.id === "enterprise",
      features: backendPlan.features,
      highlights: planHighlights[backendPlan.id] || ["Great value"],
      color: planColors[backendPlan.id] || "from-gray-500 to-gray-600",
      icon: planIcons[backendPlan.id] || <Rocket className="h-6 w-6" />,
      badge: backendPlan.badge,
      comingSoon: false,
    };
  };

  // Use fallback plans if backend fails or returns empty data
  // For development, always use fallback plans to ensure UI works
  const plansToUse =
    plansError || backendPlans.length === 0 ? fallbackPlans : backendPlans;

  // Filter out test plans and transform for UI
  const plans: PricingPlan[] = plansToUse
    .filter((plan) => plan.id !== "test") // Exclude test plan
    .map(transformPlan);

  // Debug logging
  console.log("Pricing Debug:", {
    plansLoading,
    plansError,
    backendPlansLength: backendPlans.length,
    fallbackPlansLength: fallbackPlans.length,
    plansToUseLength: plansToUse.length,
    finalPlansLength: plans.length,
  });

  const yearlyDiscount = (originalPrice: number, yearlyPrice: number) => {
    return Math.round(((originalPrice - yearlyPrice) / originalPrice) * 100);
  };

  return (
    <div className="min-h-screen flex flex-col" id="pricing">
      <Header />
      <main className="flex-grow relative overflow-hidden">
        {/* Enhanced Background Elements */}
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

        {/* Hero Section */}
        <section className="py-24 text-center max-w-4xl mx-auto px-4 relative">
          <div className="inline-block mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:scale-105 transition-transform duration-200 cursor-default">
              <TrendingUp className="w-4 h-4" />
              Simple, Transparent Pricing
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6 animate-in slide-in-from-bottom-4 duration-700">
            Choose the Perfect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-secondary-500 to-primary-300 dark:from-primary-500 dark:via-secondary-400 dark:to-primary-200">
              Plan for You
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto animate-in slide-in-from-bottom-6 duration-700 delay-200">
            Scale your social media management from individual creator to
            enterprise team. All plans include our core features with no hidden
            fees.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12 animate-in slide-in-from-bottom-8 duration-700 delay-300">
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
                Save up to 20%
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-24 px-4">
          <div className="max-w-7xl mx-auto">
            {plansLoading && plans.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <span className="text-gray-600 dark:text-gray-400">
                    Loading pricing plans...
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`grid grid-cols-1 gap-8 ${
                  plans.length === 3
                    ? "md:grid-cols-3 max-w-6xl mx-auto"
                    : plans.length === 4
                    ? "md:grid-cols-2 lg:grid-cols-4"
                    : "md:grid-cols-2"
                }`}
              >
                {plans.map((plan, index) => (
                  <div
                    key={plan.id}
                    data-plan-index={index}
                    className={`relative rounded-2xl overflow-hidden group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                      visibleCards.includes(index)
                        ? "animate-in slide-in-from-bottom-8 duration-700"
                        : "opacity-0 translate-y-8"
                    } ${
                      plan.popular
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
                    {/* Plan Badge */}
                    {(plan.popular || plan.badge) && (
                      <div className="absolute left-1/2 transform -translate-x-1/2 z-10 w-max top-1">
                        <div
                          className={`flex items-center gap-1 px-4 py-1 text-xs font-medium rounded-full text-white shadow-lg ${
                            plan.popular
                              ? "bg-gradient-to-r from-purple-500 to-purple-600"
                              : plan.id === "team"
                              ? "bg-gradient-to-r from-purple-500 to-purple-600"
                              : "bg-gradient-to-r from-primary-500 to-primary-600"
                          }`}
                        >
                          <Star className="w-3 h-3 fill-current" />
                          {plan.badge || "Most Popular"}
                        </div>
                      </div>
                    )}

                    {/* Coming Soon Badge */}
                    {plan.comingSoon && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                          <Clock className="w-3 h-3" />
                          Coming Soon
                        </div>
                      </div>
                    )}

                    {/* Gradient Background Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                    />

                    {/* Glowing Border Effect */}
                    <div
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}
                    />

                    <div className="relative p-8">
                      {/* Plan Icon */}
                      <div className="flex items-center gap-3 mb-6">
                        <div
                          className={`w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br ${plan.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                        >
                          {plan.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold font-heading group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                            {plan.name}
                          </h3>
                          {plan.enterprise && (
                            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                              Enterprise
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="mb-6">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900 dark:text-white">
                            ${isYearly ? plan.yearlyPrice : plan.price}
                          </span>
                          <span className="text-gray-500 dark:text-gray-400">
                            /month
                          </span>
                        </div>
                        {isYearly && plan.price > 0 && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400 line-through">
                              ${plan.price}/month
                            </span>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                              {yearlyDiscount(plan.price, plan.yearlyPrice)}%
                              off
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* CTA Button */}
                      <div className="mb-8">
                        <Link to="/register" className="block w-full">
                          <Button
                            variant={plan.popular ? "premium" : "outline"}
                            size="lg"
                            className={`w-full group/btn ${
                              plan.popular ? "shadow-lg hover:shadow-xl" : ""
                            } ${
                              plan.comingSoon
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }`}
                            disabled={plan.comingSoon}
                          >
                            {plan.comingSoon ? (
                              <>
                                <Clock className="w-4 h-4 mr-2" />
                                Coming Soon
                              </>
                            ) : plan.id === "creator" ? (
                              <>
                                Start Free Trial
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                              </>
                            ) : (
                              <>
                                Get Started
                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-200" />
                              </>
                            )}
                          </Button>
                        </Link>
                      </div>

                      {/* Highlights */}
                      {plan.highlights && (
                        <div className="mb-6">
                          <div className="space-y-2">
                            {plan.highlights.map(
                              (highlight, highlightIndex) => (
                                <div
                                  key={highlightIndex}
                                  className="flex items-center gap-2 text-sm font-medium text-primary-600 dark:text-primary-400"
                                >
                                  <div
                                    className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${plan.color}`}
                                  />
                                  {highlight}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {/* Features List */}
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
                              <span className="leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* FAQ/Additional Info Section */}
        <section className="pb-24 px-4">
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
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 via-secondary-500/10 to-primary-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Floating Elements */}
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
        </section>
      </main>
    </div>
  );
}
