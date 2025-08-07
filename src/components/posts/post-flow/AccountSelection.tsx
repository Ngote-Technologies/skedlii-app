import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../../ui/tabs";
import { Search, Check } from "lucide-react";
import { Input } from "../../ui/input";
import { Badge } from "../../ui/badge";
import {
  getPlatformIcon,
  getPlatformBgColor,
} from "../../../lib/platformUtils";
import { AccountSelectionProps } from "../../../types";
import {
  countSelectedByPlatform,
  getClassName,
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
    <Card>
      <CardHeader>
        <CardTitle>Select Social Accounts</CardTitle>
        <CardDescription>Choose which accounts to post to</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search accounts..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="w-max min-w-full border-b mb-4 flex-nowrap">
              <TabsTrigger
                value="all"
                className="flex-shrink-0 whitespace-nowrap"
              >
                All
                <Badge variant="secondary" className="ml-2">
                  {accounts.length}
                </Badge>
              </TabsTrigger>
              {platformCounts(accounts).instagram && (
                <TabsTrigger
                  value="instagram"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "instagram"
                      )} text-xl ${getTextColor("instagram")}`}
                    />
                    <span className="hidden sm:inline">Instagram</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).instagram}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).facebook && (
                <TabsTrigger
                  value="facebook"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "facebook"
                      )} text-xl ${getTextColor("facebook")}`}
                    />
                    <span className="hidden sm:inline">Facebook</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).facebook}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).twitter && (
                <TabsTrigger
                  value="twitter"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "twitter"
                      )} text-xl ${getTextColor("twitter")}`}
                    />
                    <span className="hidden sm:inline">Twitter</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).twitter}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).linkedin && (
                <TabsTrigger
                  value="linkedin"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "linkedin"
                      )} text-xl ${getTextColor("linkedin")}`}
                    />
                    <span className="hidden sm:inline">LinkedIn</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).linkedin}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).threads && (
                <TabsTrigger
                  value="threads"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "threads"
                      )} text-xl ${getTextColor("threads")}`}
                    />
                    <span className="hidden sm:inline">Threads</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).threads}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).tiktok && (
                <TabsTrigger
                  value="tiktok"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "tiktok"
                      )} text-xl ${getTextColor("tiktok")}`}
                    />
                    <span className="hidden sm:inline">TikTok</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).tiktok}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
              {platformCounts(accounts).youtube && (
                <TabsTrigger
                  value="youtube"
                  className="flex-shrink-0 whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <i
                      className={`${getSocialIcon(
                        "youtube"
                      )} text-xl ${getTextColor("youtube")}`}
                    />
                    <span className="hidden sm:inline">YouTube</span>
                    <Badge variant="secondary">
                      {platformCounts(accounts).youtube}
                    </Badge>
                  </div>
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          {/* Account List */}
          {filteredAccounts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredAccounts.map((account) => (
                <button
                  key={account._id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedAccounts.includes(account._id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => toggleAccount(account._id)}
                  // disabled={account.status === "expired"}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${getPlatformBgColor(
                        account.platform
                      )} flex items-center justify-center text-white overflow-hidden`}
                    >
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        @{account.accountName}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {account.status}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selectedAccounts.includes(account._id)
                          ? "bg-primary border-primary text-white"
                          : "border-muted-foreground"
                      } flex items-center justify-center`}
                    >
                      {selectedAccounts.includes(account._id) && (
                        <Check className="h-3 w-3" />
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No accounts found</p>
            </div>
          )}
        </Tabs>

        {/* Selection Summary */}
        {selectedAccounts.length > 0 && (
          <div className="bg-muted/40 p-3 rounded-md">
            <p className="text-sm font-medium mb-2">
              Selected Accounts ({selectedAccounts.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(selectedCounts).map(([platform, count]) => (
                <Badge
                  key={platform}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {getPlatformIcon(platform)}
                  <span>
                    {count as any} {platform}
                  </span>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
