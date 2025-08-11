import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { CalendarCheck, BarChart2, Users, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="py-20 md:py-32 overflow-hidden bg-gradient-to-b from-primary-50/70 to-white dark:from-gray-900 dark:to-gray-800 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 via-primary-500 to-secondary-500"></div>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary-200/20 dark:bg-primary-900/20 blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-secondary-200/20 dark:bg-secondary-900/20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="inline-block px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-800 dark:text-primary-300">
              Streamlined Social Media Management
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-heading text-gray-900 dark:text-white mb-6">
              One Dashboard For All Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-300 dark:from-primary-500 dark:to-primary-200">
                Social Content
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Schedule, analyze, and collaborate on content across all social
              platforms in one powerful workspace. Perfect for individuals,
              teams, and enterprises.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
              <Link to="/register">
                <Button
                  variant="gradient"
                  size="xl"
                  icon={<ArrowRight className="h-5 w-5" />}
                  iconPosition="right"
                  className="w-full sm:w-auto px-8 py-6 text-base rounded-xl font-semibold"
                >
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/#features">
                <Button
                  variant="outline"
                  size="xl"
                  className="w-full sm:w-auto px-8 py-6 text-base rounded-xl border-2 font-medium hover:bg-primary-50 dark:hover:bg-gray-800 hover:border-primary-300"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-8 text-gray-600 dark:text-gray-400 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Multiple platforms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Team collaboration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12L10 17L20 7"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Advanced analytics</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              * Requires card to begin. You won’t be charged until the 7-day
              trial ends.
            </p>
          </div>

          <div className="lg:w-1/2">
            <div className="relative">
              {/* Main dashboard mockup */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl transform hover:-translate-y-1">
                <div className="h-12 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center px-4">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                    <div className="bg-primary-50 dark:bg-gray-700 p-3 rounded-xl">
                      <CalendarCheck className="h-8 w-8 text-primary-500 dark:text-primary-400 mb-2" />
                      <div className="text-lg font-bold">24</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Scheduled
                      </div>
                    </div>
                    <div className="bg-secondary-50 dark:bg-gray-700 p-3 rounded-xl">
                      <BarChart2 className="h-8 w-8 text-secondary-500 dark:text-secondary-400 mb-2" />
                      <div className="text-lg font-bold">1.2k</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Engagements
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                      <Users className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" />
                      <div className="text-lg font-bold">5</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Team Members
                      </div>
                    </div>
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

              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-primary-500 to-secondary-500 text-white py-3 px-5 rounded-lg shadow-lg transform rotate-3">
                {/* <span className="text-sm font-medium">
                  Free Trial Available
                </span> */}
                <span className="text-sm font-semibold">
                  7-Day Trial – Full Access
                </span>
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
