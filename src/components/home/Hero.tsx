import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import {
  CalendarCheck,
  BarChart2,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  Zap,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary-50/70 to-white dark:from-background dark:via-card/30 dark:to-background relative">
      {/* Enhanced Animated Background */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500 animate-pulse"></div>

      {/* Interactive Mouse-Following Gradient */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(var(--primary-500), 0.1), transparent 40%)`,
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-200/20 dark:bg-primary/10 blur-3xl animate-pulse"></div>
        <div
          className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-secondary-200/20 dark:bg-secondary/15 blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-primary-100/10 dark:bg-accent/8 blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 4) * 20}%`,
              animation: `floatParticle${(i % 3) + 1} ${6 + (i % 3) * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
            }}
          >
            <div 
              className={`rounded-full ${
                i % 4 === 0 ? 'w-3 h-3 bg-primary-400/60 dark:bg-primary/70' :
                i % 4 === 1 ? 'w-2 h-2 bg-secondary-400/50 dark:bg-secondary/60' :
                i % 4 === 2 ? 'w-1.5 h-1.5 bg-primary-300/40 dark:bg-primary/50' :
                'w-2.5 h-2.5 bg-purple-400/45 dark:bg-accent/55'
              } shadow-lg`}
              style={{
                animation: `particlePulse ${3 + (i % 2)}s ease-in-out infinite`,
                animationDelay: `${i * 0.3}s`,
              }}
            ></div>
          </div>
        ))}
      </div>

      {/* Add CSS animations for particles */}
      <style jsx>{`
        @keyframes floatParticle1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(90deg); }
          50% { transform: translate(-15px, -60px) rotate(180deg); }
          75% { transform: translate(-25px, -20px) rotate(270deg); }
        }
        
        @keyframes floatParticle2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(-25px, -40px) rotate(120deg); }
          66% { transform: translate(30px, -25px) rotate(240deg); }
        }
        
        @keyframes floatParticle3 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(15px, -50px) rotate(72deg); }
          40% { transform: translate(-20px, -35px) rotate(144deg); }
          60% { transform: translate(25px, -15px) rotate(216deg); }
          80% { transform: translate(-10px, -45px) rotate(288deg); }
        }
        
        @keyframes particlePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
          <div
            className={`lg:w-1/2 text-center lg:text-left transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300 border border-primary-200 dark:border-primary-700 hover:scale-105 transition-transform duration-200 cursor-default">
              <Sparkles className="w-4 h-4" />
              Streamlined Social Media Management
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-heading text-gray-900 dark:text-white mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-200">
              One Dashboard For All Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 dark:from-primary-500 dark:via-primary-400 dark:to-primary-200 animate-gradient-x">
                Social Content
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Schedule, analyze, and collaborate on content across all social
              platforms in one powerful workspace. Perfect for individuals,
              teams, and enterprises.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-500">
              <Link to="/register" className="group">
                <Button
                  variant="gradient"
                  size="xl"
                  icon={
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  }
                  iconPosition="right"
                  className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group-hover:shadow-primary-500/25"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/#features" className="group">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto px-8 py-6 text-base rounded-xl border-2 font-medium hover:bg-primary-50 dark:hover:bg-gray-800 hover:border-primary-300 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 group relative overflow-hidden"
                >
                  <span className="relative z-10">Learn More</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-gray-600 dark:text-gray-400 text-sm animate-in slide-in-from-bottom-8 duration-700 delay-700">
              {[
                { text: "Multiple platforms", delay: "0s" },
                { text: "Team collaboration", delay: "0.2s" },
                { text: "Advanced analytics", delay: "0.4s" },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 hover:scale-105 transition-transform duration-200 cursor-default group"
                >
                  <div
                    className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-shadow duration-200"
                    style={{ animationDelay: item.delay }}
                  >
                    <Check
                      className="w-3 h-3 text-white animate-in zoom-in duration-500"
                      style={{ animationDelay: `calc(700ms + ${item.delay})` }}
                    />
                  </div>
                  <span className="group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Social Proof Stats */}
            <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-8 animate-in slide-in-from-bottom-8 duration-700 delay-900">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex -space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <span className="font-medium">4.9/5 from 1,200+ users</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="font-medium">Join 50,000+ happy creators</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              * Requires card to begin. You won’t be charged until the 7-day
              trial ends.
            </p>
          </div>

          <div
            className={`lg:w-1/2 transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-12 opacity-0"
            }`}
          >
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all duration-500 hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 group">
                <div className="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center px-4 group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-300">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500 hover:scale-110 transition-transform duration-200 cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 hover:scale-110 transition-transform duration-200 cursor-pointer"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500 hover:scale-110 transition-transform duration-200 cursor-pointer"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="text-xs text-gray-400 font-mono bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border">
                      skedlii.xyz/dashboard
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    {[
                      {
                        icon: CalendarCheck,
                        value: "24",
                        label: "Scheduled",
                        color: "primary",
                        delay: "0s",
                      },
                      {
                        icon: BarChart2,
                        value: "1.2k",
                        label: "Engagements",
                        color: "secondary",
                        delay: "0.2s",
                      },
                      {
                        icon: Users,
                        value: "5",
                        label: "Team Members",
                        color: "gray",
                        delay: "0.4s",
                      },
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className={`bg-${stat.color}-50 dark:bg-gray-700 p-3 rounded-xl hover:scale-105 transition-all duration-300 cursor-pointer group/stat hover:shadow-lg`}
                        style={{ animationDelay: stat.delay }}
                      >
                        <stat.icon
                          className={`h-8 w-8 text-${stat.color}-500 dark:text-${stat.color}-400 mb-2 group-hover/stat:scale-110 transition-transform duration-200`}
                        />
                        <div className="text-lg font-bold group-hover/stat:text-primary-600 dark:group-hover/stat:text-primary-400 transition-colors duration-200">
                          {stat.value}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 group-hover/stat:text-gray-700 dark:group-hover/stat:text-gray-300 transition-colors duration-200">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                          <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-600 rounded-full mt-2"></div>
                        </div>
                        <div className="w-16 h-6 bg-primary-100 dark:bg-primary-900/30 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Enhanced Decorative element */}
              <div
                className="absolute -bottom-6 -right-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-5 rounded-lg shadow-lg transform rotate-3 hover:rotate-2 hover:scale-110 transition-all duration-300 cursor-pointer group/badge"
                style={{ animationDelay: "2s" }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 group-hover/badge:rotate-12 transition-transform duration-200" />
                  <span className="text-sm font-semibold">
                    7-Day Trial – Full Access
                  </span>
                  <div className="w-2 h-2 rounded-full bg-white/70 animate-pulse"></div>
                </div>
              </div>

              {/* Mobile app preview */}
              <div className="absolute -right-8 -top-12 w-40 h-60 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 transform rotate-6 hidden md:block">
                <div className="h-4 mx-auto w-10 bg-gray-200 dark:bg-gray-700 rounded-b-xl"></div>
                <div className="p-2">
                  <div className="h-2 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-full mb-2"></div>
                  <div className="grid grid-cols-2 gap-1">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md"
                      ></div>
                    ))}
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
