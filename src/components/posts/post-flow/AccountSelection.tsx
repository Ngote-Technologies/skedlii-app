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
  FaXTwitter,
  FaInstagram,
  FaLinkedin,
  FaFacebook,
  FaTiktok,
  FaThreads,
} from "react-icons/fa6";
import {
  AccountSelectionProps,
  countSelectedByPlatform,
  getPlatformColor,
  platformCounts,
} from "./methods";

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

  // Helper function to get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return <FaInstagram className="h-4 w-4" />;
      case "twitter":
        return <FaXTwitter className="h-4 w-4" />;
      case "facebook":
        return <FaFacebook className="h-4 w-4" />;
      case "linkedin":
        return <FaLinkedin className="h-4 w-4" />;
      case "tiktok":
        return <FaTiktok className="h-4 w-4" />;
      case "threads":
        return <FaThreads className="h-4 w-4" />;
      default:
        return null;
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
          <TabsList className="w-full border-b mb-4">
            <TabsTrigger value="all" className="flex-1">
              All
              <Badge variant="secondary" className="ml-2">
                {accounts.length}
              </Badge>
            </TabsTrigger>
            {platformCounts(accounts).instagram && (
              <TabsTrigger value="instagram" className="flex-1">
                <div className="flex items-center gap-2">
                  <FaInstagram className="h-4 w-4" />
                  <span className="hidden sm:inline">Instagram</span>
                  <Badge variant="secondary">
                    {platformCounts(accounts).instagram}
                  </Badge>
                </div>
              </TabsTrigger>
            )}
            {platformCounts(accounts).twitter && (
              <TabsTrigger value="twitter" className="flex-1">
                <div className="flex items-center gap-2">
                  <FaXTwitter className="h-4 w-4" />
                  <span className="hidden sm:inline">Twitter</span>
                  <Badge variant="secondary">
                    {platformCounts(accounts).twitter}
                  </Badge>
                </div>
              </TabsTrigger>
            )}
            {platformCounts(accounts).linkedin && (
              <TabsTrigger value="linkedin" className="flex-1">
                <div className="flex items-center gap-2">
                  <FaLinkedin className="h-4 w-4" />
                  <span className="hidden sm:inline">LinkedIn</span>
                  <Badge variant="secondary">
                    {platformCounts(accounts).linkedin}
                  </Badge>
                </div>
              </TabsTrigger>
            )}
            {platformCounts(accounts).threads && (
              <TabsTrigger value="threads" className="flex-1">
                <div className="flex items-center gap-2">
                  <FaThreads className="h-4 w-4" />
                  <span className="hidden sm:inline">Threads</span>
                  <Badge variant="secondary">
                    {platformCounts(accounts).threads}
                  </Badge>
                </div>
              </TabsTrigger>
            )}
          </TabsList>

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
                      className={`w-10 h-10 rounded-full ${getPlatformColor(
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
