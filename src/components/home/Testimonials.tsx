import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Quote,
  ArrowRight,
  Sparkles,
  Users,
  ThumbsUp,
  Heart,
} from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  avatar: string;
  rating: number;
  content: string;
  platform?: string;
  verified: boolean;
  metrics?: {
    followers?: string;
    engagement?: string;
  };
}

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [visibleTestimonials, setVisibleTestimonials] = useState<number[]>([]);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Content Creator",
      company: "@sarahcreates",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612d97a?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "Skedlii has completely transformed how I manage my content across platforms. The AI-powered scheduling suggestions are spot-on, and I've seen a 40% increase in engagement since switching.",
      platform: "twitter",
      verified: true,
      metrics: {
        followers: "125K",
        engagement: "8.2%",
      },
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      role: "Marketing Director",
      company: "GrowthLab Agency",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "Managing 15+ client accounts was a nightmare until we found Skedlii. The team collaboration features and approval workflows have saved us 20+ hours per week. Game changer!",
      platform: "linkedin",
      verified: true,
      metrics: {
        followers: "50K",
        engagement: "12.5%",
      },
    },
    {
      id: 3,
      name: "Emily Johnson",
      role: "Social Media Manager",
      company: "TechStart Inc",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "The multi-platform publishing is incredible. I can create content once and optimize it for each platform automatically. Plus, the analytics insights help me double down on what works.",
      verified: true,
      metrics: {
        followers: "75K",
        engagement: "15.3%",
      },
    },
    {
      id: 4,
      name: "Alex Thompson",
      role: "Entrepreneur",
      company: "BuildFast Studios",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "As a solo founder, time is everything. Skedlii's content collections and bulk scheduling have freed up 10+ hours per week that I can now focus on building my product. Absolutely worth it!",
      verified: true,
      metrics: {
        followers: "32K",
        engagement: "9.8%",
      },
    },
    {
      id: 5,
      name: "Maya Patel",
      role: "Brand Strategist",
      company: "Creative Collective",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      content:
        "The platform's intuitive design makes it easy for our entire team to contribute. From content creation to approval and publishing - everything flows seamlessly. Our clients love the results!",
      verified: true,
      metrics: {
        followers: "95K",
        engagement: "11.7%",
      },
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-testimonial-index") || "0"
            );
            setVisibleTestimonials((prev) => [...new Set([...prev, index])]);
          }
        });
      },
      { threshold: 0.1 }
    );

    const testimonialCards = document.querySelectorAll(
      "[data-testimonial-index]"
    );
    testimonialCards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    setIsAutoPlaying(false);
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-40 w-80 h-80 rounded-full bg-secondary-100/30 dark:bg-secondary-900/10 blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-40 w-80 h-80 rounded-full bg-primary-100/30 dark:bg-primary-900/10 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <div className="badge badge-secondary px-4 py-1.5 text-sm">
              For Creators, By Creators
            </div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Built with Real Feedback
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Skedlii is actively evolving with insights from content creators,
            teams, and social media managers. We're building the scheduling
            platform we always wished existed.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  data-testimonial-index={index}
                  className={`w-full flex-shrink-0 px-4 transition-all duration-700 ${
                    visibleTestimonials.includes(index)
                      ? "animate-in slide-in-from-bottom-8 duration-700"
                      : "opacity-0"
                  }`}
                >
                  <div
                    className="relative p-8 mx-4 rounded-2xl overflow-hidden group cursor-pointer transform transition-all duration-500 hover:scale-105"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-secondary-500/5 to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-400/20 to-secondary-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                    {testimonial.verified && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Verified
                        </div>
                      </div>
                    )}

                    <div className="relative">
                      <div className="mb-6">
                        <Quote className="w-10 h-10 text-primary-400 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" />
                      </div>
                      <blockquote className="text-lg md:text-xl font-medium text-gray-800 dark:text-gray-200 mb-6 leading-relaxed group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors duration-300">
                        "{testimonial.content}"
                      </blockquote>

                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 transition-all duration-200 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              } group-hover:scale-110`}
                              style={{ animationDelay: `${i * 100}ms` }}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {testimonial.rating}.0/5
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-gray-700 shadow-lg group-hover:scale-110 transition-transform duration-300"
                          />
                          {testimonial.platform && (
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border-2 border-white dark:border-gray-700 flex items-center justify-center">
                              {testimonial.platform === "twitter" && (
                                <div className="w-3 h-3 rounded-sm bg-blue-400 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    𝕏
                                  </span>
                                </div>
                              )}
                              {testimonial.platform === "linkedin" && (
                                <div className="w-3 h-3 rounded-sm bg-blue-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">
                                    in
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                            {testimonial.role}
                          </p>
                          <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                            {testimonial.company}
                          </p>
                        </div>

                        {testimonial.metrics && (
                          <div className="text-right">
                            {testimonial.metrics.followers && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-1">
                                <Users className="w-3 h-3" />
                                <span className="font-medium">
                                  {testimonial.metrics.followers}
                                </span>
                              </div>
                            )}
                            {testimonial.metrics.engagement && (
                              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                <Heart className="w-3 h-3" />
                                <span className="font-medium">
                                  {testimonial.metrics.engagement}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="p-3 rounded-full bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 group"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" />
            </button>

            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 hover:scale-125 ${
                    index === currentIndex
                      ? "bg-primary-500 shadow-lg shadow-primary-500/50"
                      : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextTestimonial}
              className="p-3 rounded-full bg-white/10 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 hover:bg-white/20 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 group"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200" />
            </button>
          </div>

          <div className="flex items-center justify-center mt-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isAutoPlaying ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span>{isAutoPlaying ? "Auto-playing" : "Paused"}</span>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
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
                    <Sparkles className="w-4 h-4 text-primary-300/50" />
                  </div>
                ))}
              </div>

              <div className="relative">
                <div className="flex items-center justify-center mb-4">
                  <ThumbsUp className="w-6 h-6 text-primary-500 animate-pulse mr-2" />
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Join These Success Stories
                  </h3>
                  <Sparkles className="w-6 h-6 text-secondary-500 animate-pulse ml-2" />
                </div>

                <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                  Start your 7-day free trial and see why creators trust Skedlii
                  for their social media success
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link to="/register" className="group">
                    <Button
                      variant="premium"
                      size="lg"
                      className="group/cta shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
                    >
                      <ArrowRight className="w-5 h-5 group-hover/cta:translate-x-1 transition-transform duration-200" />
                      Start Free Trial
                      <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse ml-1"></div>
                    </Button>
                  </Link>

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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
