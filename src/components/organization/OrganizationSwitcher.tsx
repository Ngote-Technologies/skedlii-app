import { useEffect, useMemo, useState } from "react";
import { Building, ChevronsUpDown, Plus } from "lucide-react";
import { cn, getInitials } from "../../lib/utils";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../store/hooks";
import { getApiClient, useV2Api } from "../../api/axios";
import { useToast } from "../../hooks/use-toast";

interface OrganizationSwitcherProps {
  className?: string;
  onCreateOrganization?: () => void;
}

export default function OrganizationSwitcher({
  className,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const {
    canManageOrganization,
    organization,
    setActiveOrganization,
    canCreateTeams,
  } = useAuth();
  const { toast } = useToast();
  const useV2 = useV2Api("organizations");
  const api = useMemo(() => getApiClient(useV2 ? "v2" : undefined), [useV2]);
  const [items, setItems] = useState<
    Array<{ _id: string; name?: string | null; status?: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/organizations");
        const list = (res.data?.organizations || []) as Array<any>;
        if (mounted) setItems(list);
      } catch (e: any) {
        toast.error({
          title: "Failed to load organizations",
          description: e?.response?.data?.message || e.message,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open && items.length === 0) load();
    return () => {
      mounted = false;
    };
  }, [open, api, items.length, toast]);
  // Hide switcher for inactive orgs or plans without collaboration
  const shouldShow =
    !!canCreateTeams &&
    (organization?.status || "").toLowerCase() !== "inactive";
  if (!shouldShow) return null;

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "admin":
        return "Admin";
      case "member":
        return "Member";
      case "viewer":
        return "Viewer";
      default:
        return role;
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {organization?.name ? (
                  getInitials(organization.name)
                ) : (
                  <Building className="h-3 w-3" />
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-sm font-medium">
                {organization?.name || "Select Organization"}
              </span>
              {organization && (
                <span className="text-xs text-muted-foreground">
                  {getRoleDisplayName(organization?.role || "member")}
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-[300px] md:w-[320px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command>
          <div className="p-1">
            <CommandInput
              placeholder="Search organizations..."
              className="h-9 border-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              {loading ? "Loading organizations..." : "No organizations found."}
            </CommandEmpty>
            <CommandGroup heading="Organizations" className="p-1">
              {items.map((org) => (
                <CommandItem
                  key={org._id}
                  value={org.name || org._id}
                  onSelect={async () => {
                    try {
                      setOpen(false);
                      await setActiveOrganization({
                        _id: org._id,
                        name: org.name || null,
                        status: org.status || undefined,
                        role: null,
                      });
                    } catch (e: any) {
                      toast.error({
                        title: "Failed to switch organization",
                        description: e?.response?.data?.message || e.message,
                      });
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer px-2 py-3 rounded-sm data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Avatar className="h-6 w-6" />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">
                        {org.name || "Untitled Organization"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {org.status || ""}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreateOrganization && canManageOrganization && (
              <>
                <CommandSeparator className="mx-1" />
                <CommandGroup className="p-1">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateOrganization();
                    }}
                    className="flex items-center space-x-2 cursor-pointer px-2 py-3 rounded-sm text-primary data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Organization</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Compact version for header/navigation
export function CompactOrganizationSwitcher({
  className,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const {
    canManageOrganization,
    organization,
    setActiveOrganization,
    canCreateTeams,
  } = useAuth();
  const { toast } = useToast();
  const useV2 = useV2Api("organizations");
  const api = useMemo(() => getApiClient(useV2 ? "v2" : undefined), [useV2]);
  const [items, setItems] = useState<
    Array<{ _id: string; name?: string | null; status?: string }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get("/organizations");
        const list = (res.data?.organizations || []) as Array<any>;
        if (mounted) setItems(list);
      } catch (e: any) {
        toast.error({
          title: "Failed to load organizations",
          description: e?.response?.data?.message || e.message,
        });
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (open && items.length === 0) load();
    return () => {
      mounted = false;
    };
  }, [open, api, items.length, toast]);
  // Hide compact switcher for inactive orgs or plans without collaboration
  const shouldShow =
    !!canCreateTeams &&
    (organization?.status || "").toLowerCase() !== "inactive";
  if (!shouldShow) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-8 px-2", className)}>
          <Avatar className="h-6 w-6">
            {/* <AvatarImage src={organization?.logo} alt={organization?.name} /> */}
            {/* <AvatarFallback className="text-xs">
              {organization?.name ? (
                getInitials(organization.name)
              ) : (
                <Building className="h-3 w-3" />
              )}
            </AvatarFallback> */}
          </Avatar>
          <span className="ml-2 text-sm max-w-[120px] truncate">
            {organization?.name || "Select"}
          </span>
          <ChevronsUpDown className="ml-2 h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[calc(100vw-2rem)] max-w-[280px] md:w-[300px] p-0"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command>
          <div className="p-1">
            <CommandInput
              placeholder="Search organizations..."
              className="h-8 border-0 outline-none focus:ring-0 focus:outline-none focus-visible:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty className="py-6 text-center text-sm">
              {loading ? "Loading organizations..." : "No organizations found."}
            </CommandEmpty>
            <CommandGroup className="p-1">
              {items.map((org) => (
                <CommandItem
                  key={org._id}
                  value={org.name || org._id}
                  onSelect={async () => {
                    try {
                      setOpen(false);
                      await setActiveOrganization({
                        _id: org._id,
                        name: org.name || null,
                        status: org.status || undefined,
                        role: null,
                      });
                    } catch (e: any) {
                      toast.error({
                        title: "Failed to switch organization",
                        description: e?.response?.data?.message || e.message,
                      });
                    }
                  }}
                  className="flex items-center justify-between cursor-pointer px-2 py-2 rounded-sm data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-6 w-6" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {org.name || "Untitled Organization"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {org.status || ""}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {onCreateOrganization && canManageOrganization && (
              <>
                <CommandSeparator className="mx-1" />
                <CommandGroup className="p-1">
                  <CommandItem
                    onSelect={() => {
                      setOpen(false);
                      onCreateOrganization();
                    }}
                    className="cursor-pointer px-2 py-2 rounded-sm text-primary data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Organization
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
