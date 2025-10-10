import {
  Calendar,
  Users,
  FolderHeart,
  BarChart2,
  Globe,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Zap,
  ChevronRight,
  Clock,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  preview?: string;
  benefits?: string[];
  status?: "available" | "coming-soon";
}

export default function Features() {
  const [visibleCards, setVisibleCards] = useState<number[]>([]);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            setVisibleCards((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = document.querySelectorAll("[data-index]");
    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const features: Feature[] = [
    {
      icon: <Calendar className="h-7 w-7" />,
      title: "Smart Scheduling",
      description:
        "Plan your content calendar with AI-powered recommendations for optimal posting times.",
      color: "from-blue-500 to-blue-600",
      preview: "Schedule posts for peak engagement across all time zones",
      benefits: [
        "AI-powered timing",
        "Cross-timezone scheduling",
        "Bulk scheduling",
      ],
      status: "available",
    },
    {
      icon: <Users className="h-7 w-7" />,
      title: "Team Collaboration",
      description:
        "Work together with your team to create, approve, and schedule content seamlessly.",
      color: "from-primary-600 to-primary-700",
      preview: "Streamlined approval workflows for team content creation",
      benefits: [
        "Approval workflows",
        "Role-based permissions",
        "Team notifications",
      ],
      status: "coming-soon",
    },
    {
      icon: <FolderHeart className="h-7 w-7" />,
      title: "Content Collections",
      description:
        "Organize your posts into thematic collections for campaigns, products, or events.",
      color: "from-pink-500 to-pink-600",
      preview: "Organize campaigns with drag-and-drop collection management",
      benefits: [
        "Campaign organization",
        "Content templates",
        "Batch operations",
      ],
      status: "available",
    },
    {
      icon: <BarChart2 className="h-7 w-7" />,
      title: "Analytics Dashboard",
      description:
        "Track performance metrics across all platforms in one comprehensive view.",
      color: "from-emerald-500 to-emerald-600",
      preview:
        "Comprehensive insights with cross-platform performance tracking",
      benefits: [
        "Cross-platform metrics",
        "Growth insights",
        "Performance reports",
      ],
      status: "coming-soon",
    },
    {
      icon: <Globe className="h-7 w-7" />,
      title: "Multi-Platform Publishing",
      description:
        "Create once, publish everywhere with platform-specific formatting and previews.",
      color: "from-amber-500 to-amber-600",
      preview: "Publish to 8+ platforms with optimized formatting",
      benefits: ["8+ platforms", "Auto-formatting", "Platform previews"],
      status: "available",
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: "Role-Based Access",
      description:
        "Control who can create, approve, and publish with granular permission settings.",
      color: "from-cyan-500 to-cyan-600",
      preview: "Enterprise-grade security with granular permission controls",
      benefits: ["Granular permissions", "Audit logs", "Team management"],
      status: "coming-soon",
    },
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-primary-100/50 dark:bg-primary-900/20 blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-24 right-0 w-96 h-96 rounded-full bg-secondary-100/30 dark:bg-secondary-900/10 blur-3xl animate-pulse"
          style={{ animationDuration: "6s", animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-emerald-100/40 dark:bg-emerald-900/20 blur-2xl animate-pulse"
          style={{ animationDuration: "5s", animationDelay: "1s" }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-block mb-4 animate-in zoom-in duration-500 delay-200">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:scale-105 transition-all duration-200 cursor-default shadow-lg">
              <Sparkles className="w-4 h-4" />
              Powerful Features
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 animate-in slide-in-from-bottom-6 duration-700 delay-300">
            Your Social Media Workflow,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 dark:from-primary-500 dark:via-primary-400 dark:to-primary-200 animate-gradient-x">
              Reimagined
            </span>
          </h2>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-500">
            Skedlii brings all your social media management needs into one
            powerful, intuitive platform designed for modern creators and
            businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              data-index={index}
              className={`relative overflow-hidden rounded-2xl p-8 group cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                visibleCards.includes(index)
                  ? "animate-in slide-in-from-bottom-8 duration-700"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                animationDelay: `${index * 200}ms`,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-all duration-500`}
              />
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 transition-all duration-500 blur-xl`}
              />

              {feature.status === "coming-soon" && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                    <Clock className="w-3 h-3" />
                    Coming Soon
                  </div>
                </div>
              )}

              <div className="relative mb-6 transform group-hover:scale-110 transition-all duration-300">
                <div
                  className={`w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-lg group-hover:shadow-xl relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-full transition-transform duration-700" />

                  <div className="relative transform group-hover:rotate-12 transition-transform duration-300">
                    {feature.icon}
                  </div>
                </div>

                {hoveredCard === index && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-ping"
                        style={{
                          top: `${20 + i * 15}%`,
                          left: `${30 + i * 20}%`,
                          animationDelay: `${i * 200}ms`,
                          animationDuration: "2s",
                        }}
                      >
                        <Sparkles className="w-3 h-3 text-primary-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <h3 className="text-xl font-bold mb-3 font-heading group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                {feature.preview && (
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      hoveredCard === index
                        ? "max-h-20 opacity-100 mb-4"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="p-3 rounded-lg bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 border border-primary-100 dark:border-primary-800">
                      <p className="text-sm font-medium text-primary-700 dark:text-primary-300 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        {feature.preview}
                      </p>
                    </div>
                  </div>
                )}

                {feature.benefits && (
                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      hoveredCard === index
                        ? "max-h-32 opacity-100"
                        : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="space-y-2">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div
                          key={benefitIndex}
                          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                          style={{
                            animationDelay: `${benefitIndex * 100}ms`,
                          }}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${feature.color}`}
                          />
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`transition-all duration-300 ${
                    hoveredCard === index
                      ? "translate-y-0 opacity-100 mt-4"
                      : "translate-y-4 opacity-0 mt-0"
                  }`}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="group/btn hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300"
                    disabled={feature.status === "coming-soon"}
                  >
                    {feature.status === "coming-soon"
                      ? "Coming Soon"
                      : "Learn More"}
                    <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-200" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center animate-in slide-in-from-bottom-4 duration-700 delay-1000">
          <div className="max-w-2xl mx-auto">
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
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-pulse"
                    style={{
                      left: `${15 + i * 15}%`,
                      top: `${20 + (i % 2) * 60}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${2 + (i % 2)}s`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-300/50" />
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary-500 animate-pulse mr-2" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Ready to Transform Your Workflow?
                  </h3>
                  <Sparkles className="w-6 h-6 text-secondary-500 animate-pulse ml-2" />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Join thousands of creators and businesses who've streamlined
                  their social media management
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="group/cta shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    <Link to="/register" className="flex items-center gap-2">
                      <Zap className="w-5 h-5 group-hover/cta:animate-pulse" />
                      Start Free Trial
                      <ArrowRight className="w-4 h-4 group-hover/cta:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Card required</span>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
