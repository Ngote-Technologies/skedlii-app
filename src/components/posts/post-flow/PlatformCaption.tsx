import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import {
  Globe,
  Image,
  Info,
  Type,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../../lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import {
  getPlatformIcon,
  getPlatformTextColor,
} from "../../../lib/platformUtils";

interface PlatformCaptionsProps {
  accounts: any[];
  selectedAccounts: string[];
  globalCaption: string;
  platformCaptions: Record<string, string>;
  onPlatformCaptionChange: (platform: string, caption: string) => void;
}

export default function PlatformCaptions({
  accounts,
  selectedAccounts,
  globalCaption,
  platformCaptions,
  onPlatformCaptionChange,
}: Readonly<PlatformCaptionsProps>) {
  const [activeTab, setActiveTab] = useState("global");

  // Get platforms from selected accounts
  const getSelectedPlatforms = (): string[] => {
    const selectedAccountsData = accounts.filter((account) =>
      selectedAccounts.includes(account._id)
    );

    // Extract unique platforms
    const platforms = Array.from(
      new Set(
        selectedAccountsData.map((account) => account.platform.toLowerCase())
      )
    );

    return platforms;
  };

  const selectedPlatforms = getSelectedPlatforms();

  // Get character count for each platform
  const getCharacterLimits = (platform: string): number => {
    switch (platform.toLowerCase()) {
      case "twitter":
        return 280;
      case "instagram":
        return 2200;
      case "facebook":
        return 63206;
      case "linkedin":
        return 3000;
      case "tiktok":
        return 2200;
      case "threads":
        return 500;
      default:
        return 2000;
    }
  };

  // Get platform-specific caption
  const getPlatformCaption = (platform: string): string => {
    return platformCaptions[platform] || globalCaption;
  };

  // Calculate character count
  const getCharacterCount = (platform: string): number => {
    return getPlatformCaption(platform).length;
  };

  // Format platform name
  const formatPlatformName = (platform: string): string => {
    if (platform === "global") return "Global";
    return platform.charAt(0).toUpperCase() + platform.slice(1);
  };

  // Change tab and load appropriate caption
  const handleTabChange = (platform: string) => {
    setActiveTab(platform);
  };

  // Handle caption change
  const handleCaptionChange = (platform: string, caption: string) => {
    onPlatformCaptionChange(platform, caption);
  };

  // Compose a suggested caption based on platform
  const suggestCaption = (platform: string) => {
    const baseCaption = globalCaption;

    // Add platform-specific modifications
    switch (platform.toLowerCase()) {
      case "twitter":
        // For Twitter, shorter caption and add hashtags
        return baseCaption.length > 220
          ? `${baseCaption.substring(0, 217)}...`
          : baseCaption;

      case "instagram":
        // For Instagram, add more hashtags
        const hashtagMatch = baseCaption.match(/#[a-z0-9_]+/gi);
        if (!hashtagMatch || hashtagMatch.length < 3) {
          // Add more hashtags if there are few
          return `${baseCaption}\n\n#skedlii #socialmedia #contentcreator`;
        }
        return baseCaption;

      case "linkedin":
        // For LinkedIn, more professional tone
        return baseCaption.replace(/#([a-z0-9_]+)/gi, "#$1");

      default:
        return baseCaption;
    }
  };

  // Get accounts for platform
  const getAccountsForPlatform = (platform: string): any[] => {
    return accounts.filter(
      (account) =>
        account.platform.toLowerCase() === platform.toLowerCase() &&
        selectedAccounts.includes(account._id)
    );
  };

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
            <Type className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Write Your Content</CardTitle>
            <CardDescription>
              Craft compelling captions for each platform with custom character
              limits
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <CardContent className="pb-0">
          <div className="overflow-x-auto scrollbar-hide mb-6">
            <TabsList className="w-max min-w-full bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl flex-nowrap">
              <TabsTrigger
                value="global"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300",
                  "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                )}
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">Global</span>
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    globalCaption.length > 0 ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              </TabsTrigger>

              {selectedPlatforms.map((platform) => {
                const hasCustomCaption = platformCaptions[platform];
                const characterCount = getCharacterCount(platform);
                const characterLimit = getCharacterLimits(platform);
                const isOverLimit = characterCount > characterLimit;

                return (
                  <TabsTrigger
                    key={platform}
                    value={platform}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 flex-shrink-0",
                      "data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                    )}
                  >
                    {getPlatformIcon(platform)}
                    <span className="font-medium">
                      {formatPlatformName(platform)}
                    </span>

                    {/* Status indicator */}
                    <div className="flex items-center gap-1">
                      {hasCustomCaption ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                      )}

                      {/* Character count indicator */}
                      <div
                        className={cn(
                          "text-xs px-1.5 py-0.5 rounded-full font-medium",
                          isOverLimit
                            ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                            : characterCount > characterLimit * 0.8
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        )}
                      >
                        {Math.round((characterCount / characterLimit) * 100)}%
                      </div>
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="global" className="mt-0">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Label
                    htmlFor="global-caption"
                    className="text-lg font-semibold"
                  >
                    Global Caption
                  </Label>
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    All Platforms
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs hover:text-destructive"
                    onClick={() => handleCaptionChange("global", "")}
                    disabled={!globalCaption}
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              </div>

              <div className="relative">
                <Textarea
                  id="global-caption"
                  value={globalCaption}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleCaptionChange("global", e.target.value)
                  }
                  placeholder="Write your caption here. This will be used for all platforms unless you customize per platform."
                  className="min-h-[200px] resize-y pr-16 text-base leading-relaxed"
                />

                {/* Character count overlay */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border text-xs font-medium">
                    {globalCaption.length} chars
                  </div>
                </div>
              </div>

              {/* Platform distribution preview */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/20 dark:to-green-950/20 p-4 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100">
                      Platform Distribution
                    </span>
                  </div>
                  <span className="text-xs text-blue-700 dark:text-blue-300">
                    How your content fits across platforms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedPlatforms.map((platform) => {
                    const limit = getCharacterLimits(platform);
                    const percentage = Math.min(
                      (globalCaption.length / limit) * 100,
                      100
                    );
                    const isOverLimit = globalCaption.length > limit;

                    return (
                      <div
                        key={platform}
                        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            {getPlatformIcon(platform)}
                            <span className="text-sm font-medium">
                              {formatPlatformName(platform)}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              isOverLimit ? "text-red-600" : "text-green-600"
                            )}
                          >
                            {globalCaption.length}/{limit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={cn(
                              "h-1.5 rounded-full transition-all duration-300",
                              isOverLimit
                                ? "bg-red-500"
                                : percentage > 80
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            )}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>

          {selectedPlatforms.map((platform) => (
            <TabsContent key={platform} value={platform} className="mt-0">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`${platform}-caption`}
                      className="text-base flex items-center gap-2"
                    >
                      {getPlatformIcon(platform)}
                      <span>{formatPlatformName(platform)} Caption</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                          >
                            <Info className="h-3.5 w-3.5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Character limit: {getCharacterLimits(platform)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() =>
                        handleCaptionChange(platform, suggestCaption(platform))
                      }
                    >
                      Suggest
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCaptionChange(platform, "")}
                      disabled={!platformCaptions[platform]}
                    >
                      Reset to Global
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Textarea
                    id={`${platform}-caption`}
                    value={getPlatformCaption(platform)}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      handleCaptionChange(platform, e.target.value)
                    }
                    placeholder={`Write a custom caption for ${formatPlatformName(
                      platform
                    )}...`}
                    className="min-h-[200px] resize-y"
                  />

                  <div className="flex justify-between items-center text-sm">
                    <div className="flex flex-wrap gap-2">
                      {getAccountsForPlatform(platform).map((account) => (
                        <Badge
                          key={account._id}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {getPlatformIcon(platform)}
                          <span>{account.accountName}</span>
                        </Badge>
                      ))}
                    </div>

                    <span
                      className={`text-sm ${
                        getCharacterCount(platform) >
                        getCharacterLimits(platform)
                          ? "text-destructive"
                          : "text-muted-foreground"
                      }`}
                    >
                      {getCharacterCount(platform)} /{" "}
                      {getCharacterLimits(platform)}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>
          ))}
        </CardContent>
      </Tabs>
      <CardFooter className="flex justify-between pt-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Image className="h-4 w-4" />
          <span>Add media in the next step</span>
        </div>
        {selectedPlatforms.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {selectedPlatforms.map((platform) => (
              <Button
                key={platform}
                variant="ghost"
                size="sm"
                className={`h-7 gap-1 ${
                  platformCaptions[platform]
                    ? getPlatformTextColor(platform)
                    : ""
                }`}
                onClick={() => handleTabChange(platform)}
              >
                {getPlatformIcon(platform)}
                <span className="text-xs">
                  {platformCaptions[platform] ? "Customized" : "Default"}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
