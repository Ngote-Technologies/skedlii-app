import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Search, Check, Users2, Filter } from "lucide-react";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";
import {
  getPlatformIcon,
  getPlatformBgColor,
} from "../../../lib/platformUtils";
import { AccountSelectionProps } from "../../../types";
import {
  countSelectedByPlatform,
  getSocialIcon,
  getTextColor,
  platformCounts,
} from "../../../lib/utils";

export default function AccountSelection({
  accounts,
  selectedAccounts,
  onSelectionChange,
}: Readonly<AccountSelectionProps>) {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>(accounts);

  // When accounts change, update filtered accounts
  useEffect(() => {
    filterAccounts(activeTab, searchQuery);
  }, [accounts, activeTab, searchQuery]);

  // Filter accounts based on tab and search query
  const filterAccounts = (tab: string, query: string) => {
    let filtered = accounts;

    // Filter by platform
    if (tab !== "all") {
      filtered = filtered.filter(
        (account) => account.platform.toLowerCase() === tab.toLowerCase()
      );
    }

    // Filter by search query
    if (query.trim() !== "") {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (account) =>
          account.accountName?.toLowerCase().includes(lowerQuery) ??
          account.accountId.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredAccounts(filtered);
  };

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    filterAccounts(tab, searchQuery);
  };

  // Handle search query change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    filterAccounts(activeTab, query);
  };

  // Toggle account selection
  const toggleAccount = (accountId: string) => {
    if (selectedAccounts.includes(accountId)) {
      onSelectionChange(selectedAccounts.filter((id) => id !== accountId));
    } else {
      onSelectionChange([...selectedAccounts, accountId]);
    }
  };

  const selectedCounts = countSelectedByPlatform(accounts, selectedAccounts);

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Users2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Select Social Accounts</CardTitle>
            <CardDescription>
              Choose which platforms to share your content on
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 h-11 bg-gray-50 border-gray-200 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:focus:bg-gray-900 transition-colors"
          />
          {searchQuery && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Badge variant="secondary" className="text-xs">
                {filteredAccounts.length} found
              </Badge>
            </div>
          )}
        </div>

        {/* Enhanced Platform Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="w-max min-w-full bg-gray-50 dark:bg-gray-800/50 p-1 rounded-xl mb-6 flex-nowrap">
              <TabsTrigger
                value="all"
                className="flex-shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
              >
                <Filter className="h-4 w-4" />
                All Platforms
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  {accounts.length}
                </Badge>
              </TabsTrigger>
              {platformCounts(accounts).instagram && (
                <TabsTrigger
                  value="instagram"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "instagram"
                      )} text-lg ${getTextColor("instagram")}`}
                    />
                    <span className="hidden sm:inline font-medium">Instagram</span>
                    <Badge variant="secondary" className="bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                      {platformCounts(accounts).instagram}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).facebook && (
                <TabsTrigger
                  value="facebook"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "facebook"
                      )} text-lg ${getTextColor("facebook")}`}
                    />
                    <span className="hidden sm:inline font-medium">Facebook</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {platformCounts(accounts).facebook}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).twitter && (
                <TabsTrigger
                  value="twitter"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "twitter"
                      )} text-lg ${getTextColor("twitter")}`}
                    />
                    <span className="hidden sm:inline font-medium">Twitter</span>
                    <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-900 dark:text-sky-300">
                      {platformCounts(accounts).twitter}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).linkedin && (
                <TabsTrigger
                  value="linkedin"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "linkedin"
                      )} text-lg ${getTextColor("linkedin")}`}
                    />
                    <span className="hidden sm:inline font-medium">LinkedIn</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {platformCounts(accounts).linkedin}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).threads && (
                <TabsTrigger
                  value="threads"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "threads"
                      )} text-lg ${getTextColor("threads")}`}
                    />
                    <span className="hidden sm:inline font-medium">Threads</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300">
                      {platformCounts(accounts).threads}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).tiktok && (
                <TabsTrigger
                  value="tiktok"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "tiktok"
                      )} text-lg ${getTextColor("tiktok")}`}
                    />
                    <span className="hidden sm:inline font-medium">TikTok</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {platformCounts(accounts).tiktok}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).youtube && (
                <TabsTrigger
                  value="youtube"
                  className="flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg transition-all duration-300 data-[state=active]:bg-white data-[state=active]:shadow-lg dark:data-[state=active]:bg-gray-900"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "youtube"
                      )} text-lg ${getTextColor("youtube")}`}
                    />
                    <span className="hidden sm:inline font-medium">YouTube</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                      {platformCounts(accounts).youtube}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Enhanced Account Grid */}
          {filteredAccounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAccounts.map((account) => {
                const isSelected = selectedAccounts.includes(account._id);
                return (
                  <button
                    key={account._id}
                    className={cn(
                      "group relative border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg",
                      isSelected
                        ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-lg ring-2 ring-primary/20"
                        : "border-gray-200 bg-white hover:border-primary/30 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-750"
                    )}
                    onClick={() => toggleAccount(account._id)}
                  >
                    {/* Selection indicator */}
                    <div className="absolute top-3 right-3">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                          isSelected
                            ? "bg-primary border-primary text-white scale-110"
                            : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      {/* Platform Icon */}
                      <div className="relative">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform duration-300",
                            getPlatformBgColor(account.platform),
                            "group-hover:scale-110"
                          )}
                        >
                          {getPlatformIcon(account.platform)}
                        </div>
                        {/* Status indicator */}
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                          account.status === "active" ? "bg-green-500" : "bg-yellow-500"
                        )} />
                      </div>

                      {/* Account Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="font-semibold text-gray-900 dark:text-white truncate text-base">
                          @{account.accountName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                          {account.platform}
                        </div>
                        <div className={cn(
                          "text-xs mt-1 font-medium capitalize",
                          account.status === "active" 
                            ? "text-green-600 dark:text-green-400"
                            : "text-yellow-600 dark:text-yellow-400"
                        )}>
                          {account.status}
                        </div>
                      </div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className={cn(
                      "absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none",
                      isSelected 
                        ? "bg-gradient-to-br from-primary/5 to-transparent opacity-100"
                        : "bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 opacity-0 group-hover:opacity-100"
                    )} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No accounts found</p>
            </div>
          )}
        </Tabs>

        {/* Enhanced Selection Summary */}
        {selectedAccounts.length > 0 && (
          <Card className="border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-lg bg-green-500 flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      {selectedAccounts.length} Account{selectedAccounts.length !== 1 ? 's' : ''} Selected
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      Ready to post to multiple platforms
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedCounts).map(([platform, count]) => (
                  <Badge
                    key={platform}
                    variant="secondary"
                    className="flex items-center gap-1.5 bg-white/80 border border-green-200 text-green-800 dark:bg-green-900/30 dark:border-green-700 dark:text-green-200"
                  >
                    {getPlatformIcon(platform)}
                    <span className="font-medium">
                      {count as any} {platform}
                    </span>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
