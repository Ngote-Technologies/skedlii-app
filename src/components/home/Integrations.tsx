import {
  FaXTwitter,
  FaThreads,
  FaTiktok,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa6";

interface SocialPlatform {
  name: string;
  icon: React.ReactNode;
  color: string;
  comingSoon?: boolean;
}

export default function Integrations() {
  const platforms: SocialPlatform[] = [
    {
      name: "Threads",
      icon: <FaThreads className="h-6 w-6" />,
      color: "bg-black dark:bg-white dark:text-black",
    },
    {
      name: "YouTube",
      icon: <FaYoutube className="h-6 w-6" />,
      color: "bg-[#FF0000]",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="h-6 w-6" />,
      color: "bg-[#0A66C2]",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="h-6 w-6" />,
      color: "bg-[#E1306C]",
    },
    {
      name: "Facebook",
      icon: <FaFacebook className="h-6 w-6" />,
      color: "bg-[#1877F2]",
    },
    {
      name: "TikTok",
      icon: <FaTiktok className="h-6 w-6" />,
      color: "bg-black dark:bg-white dark:text-black",
    },
    {
      name: "X (Twitter)",
      icon: <FaXTwitter className="h-6 w-6" />,
      color: "bg-black dark:bg-white dark:text-black",
      comingSoon: true,
    },
  ];

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-600 dark:text-gray-300 mb-2">
            Integrates With Your Favorite Platforms
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Connect and manage all your social media accounts in one place, with
            platform-specific formatting and previews.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8 max-w-4xl mx-auto">
          {platforms.map((platform) => (
            <div key={platform.name} className="group relative cursor-pointer">
              <div
                className={`flex items-center space-x-3 px-5 py-3 rounded-full ${
                  platform.comingSoon
                    ? "bg-gray-100 dark:bg-gray-800"
                    : "bg-white dark:bg-gray-800"
                } shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${platform.color}`}
                >
                  {platform.icon}
                </div>
                <span className="font-medium">{platform.name}</span>

                {platform.comingSoon && (
                  <span className="ml-1 inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-300">
                    Soon
                  </span>
                )}
              </div>

              {/* Decorative hover effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-300 to-accent-300 dark:from-primary-700 dark:to-accent-700 rounded-full opacity-0 group-hover:opacity-30 blur transition duration-1000 group-hover:duration-200"></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block bg-gray-50 dark:bg-gray-800 rounded-full px-6 py-2 border border-gray-200 dark:border-gray-700">
            <p className="text-muted-foreground text-sm">
              More platforms coming soon.{" "}
              <span className="font-medium text-primary-600 dark:text-primary-400">
                Request your favorite!
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
