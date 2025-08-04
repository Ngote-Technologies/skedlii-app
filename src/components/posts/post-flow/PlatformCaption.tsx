import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../../ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../ui/tabs";
import { Globe, Image, Info } from "lucide-react";
import { Label } from "../../ui/label";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { getPlatformIcon, getPlatformTextColor } from "../../../lib/platformUtils";

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
    <Card>
      <CardHeader>
        <CardTitle>Content</CardTitle>
        <CardDescription>
          Write your post content for each platform
        </CardDescription>
      </CardHeader>
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <CardContent className="pb-0">
          <TabsList className="w-full justify-start mb-4 overflow-x-auto">
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>Global</span>
            </TabsTrigger>

            {selectedPlatforms.map((platform) => (
              <TabsTrigger
                key={platform}
                value={platform}
                className="flex items-center gap-2"
              >
                {getPlatformIcon(platform)}
                <span>{formatPlatformName(platform)}</span>
                {platformCaptions[platform] && (
                  <Badge
                    variant="outline"
                    className="h-4 w-4 p-0 flex items-center justify-center"
                  >
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="global" className="mt-0">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label htmlFor="global-caption" className="text-base">
                  Global Caption
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs hover:text-primary"
                    onClick={() => handleCaptionChange("global", "")}
                    disabled={!globalCaption}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <Textarea
                id="global-caption"
                value={globalCaption}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  handleCaptionChange("global", e.target.value)
                }
                placeholder="Write your caption here. This will be used for all platforms unless you customize per platform."
                className="min-h-[200px] resize-y"
              />

              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Will be used for all platforms</span>
                <span>{globalCaption.length} characters</span>
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
                  platformCaptions[platform] ? getPlatformTextColor(platform) : ""
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
