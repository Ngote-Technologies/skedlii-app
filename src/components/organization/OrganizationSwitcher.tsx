import { useState } from "react";
import { ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
// import { useNavigate } from "react-router-dom";
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
// import { Badge } from "../ui/badge";
import { Avatar } from "../ui/avatar";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// import { getInitials } from "../../lib/utils";
import { useAuth } from "../../store/hooks";

interface OrganizationSwitcherProps {
  className?: string;
  onCreateOrganization?: () => void;
}

export default function OrganizationSwitcher({
  className,
  onCreateOrganization,
}: OrganizationSwitcherProps) {
  const [open, setOpen] = useState(false);
  const { canManageOrganization } = useAuth();
  // const {
  //   organizations,
  //   activeOrganization,
  //   switchOrganization,
  //   fetchUserOrganizations,
  //   isLoading
  // } = useOrganizationStore();

  // Fetch organizations on component mount
  // useEffect(() => {
  //   fetchUserOrganizations();
  // }, [fetchUserOrganizations]);

  // const handleOrganizationSelect = async (organizationId: string) => {
  //   console.log("Main switcher - Selecting organization:", organizationId);
  //   // await switchOrganization(organizationId);
  //   setOpen(false);
  // };

  // const getRoleBadgeVariant = (role: string) => {
  //   switch (role) {
  //     case "owner":
  //       return "default"; // Blue badge - highest authority
  //     case "admin":
  //       return "success"; // Green badge - management role
  //     case "member":
  //       return "warning"; // Yellow badge - active contributor
  //     case "viewer":
  //       return "outline"; // Subtle badge - read-only access
  //     default:
  //       return "outline";
  //   }
  // };

  // const getRoleDisplayName = (role: string) => {
  //   switch (role) {
  //     case "owner":
  //       return "Owner";
  //     case "admin":
  //       return "Admin";
  //     case "member":
  //       return "Member";
  //     case "viewer":
  //       return "Viewer";
  //     default:
  //       return role;
  //   }
  // };

  // if (isLoading && organizations.length === 0) {
  //   return (
  //     <div className={cn("flex items-center space-x-2", className)}>
  //       <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
  //       <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
  //     </div>
  //   );
  // }

  // If no organizations, show create organization prompt (only for org owners)
  // if (organizations.length === 0) {
  //   if (canManageOrganization && onCreateOrganization) {
  //     return (
  //       <Button
  //         variant="outline"
  //         onClick={onCreateOrganization}
  //         className={cn("justify-start", className)}
  //       >
  //         <Plus className="mr-2 h-4 w-4" />
  //         Create Organization
  //       </Button>
  //     );
  //   }

  //   // For non-org owners with no organizations, show a disabled state
  //   return (
  //     <Button
  //       variant="outline"
  //       disabled
  //       className={cn("justify-start opacity-60", className)}
  //       title="No organizations available"
  //     >
  //       <Building className="mr-2 h-4 w-4" />
  //       No Organizations
  //     </Button>
  //   );
  // }

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
              {/* <AvatarImage 
                src={activeOrganization?.logo} 
                alt={activeOrganization?.name}
              />
              <AvatarFallback className="text-xs">
                {activeOrganization?.name 
                  ? getInitials(activeOrganization.name)
                  : <Building className="h-3 w-3" />
                }
              </AvatarFallback> */}
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="truncate text-sm font-medium">
                {/* {activeOrganization?.name || 'Select Organization'} */}
              </span>
              {/* {activeOrganization && (
                <span className="text-xs text-muted-foreground">
                  {getRoleDisplayName(activeOrganization.userRole)}
                </span>
              )} */}
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
              No organizations found.
            </CommandEmpty>
            <CommandGroup heading="Organizations" className="p-1">
              {/* {organizations.map((organization) => (
                <CommandItem
                  key={organization._id}
                  value={organization.name}
                  onSelect={() => handleOrganizationSelect(organization._id)}
                  className="flex items-center justify-between cursor-pointer px-2 py-3 rounded-sm data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={organization.logo} 
                        alt={organization.name}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(organization.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm font-medium">
                        {organization.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={getRoleBadgeVariant(organization.userRole)}
                          className="text-xs"
                        >
                          {getRoleDisplayName(organization.userRole)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {organization.memberCount} member{organization.memberCount !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      activeOrganization?._id?.toString() === organization._id?.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))} */}
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
  // const navigate = useNavigate();
  const { canManageOrganization } = useAuth();
  // const {
  //   activeOrganization,
  //   organizations,
  //   switchOrganization,
  //   fetchUserOrganizations,
  // } = useOrganizationStore();

  // Fetch organizations on component mount
  // useEffect(() => {
  //   fetchUserOrganizations();
  // }, [fetchUserOrganizations]);

  // const handleOrganizationSelect = async (organizationId: string) => {
  //   // await switchOrganization(organizationId);
  //   setOpen(false);

  //   // Navigate to the organization dashboard
  //   navigate("/dashboard/organizations");
  // };

  // if (organizations.length === 0) {
  //   if (canManageOrganization && onCreateOrganization) {
  //     return (
  //       <Button
  //         variant="ghost"
  //         size="sm"
  //         onClick={onCreateOrganization}
  //         className={cn("h-8 px-2", className)}
  //         title="Create Organization"
  //       >
  //         <Plus className="h-4 w-4" />
  //       </Button>
  //     );
  //   }

  //   // For non-org owners with no organizations, show disabled state
  //   return (
  //     <Button
  //       variant="ghost"
  //       size="sm"
  //       disabled
  //       className={cn("h-8 px-2 opacity-60", className)}
  //       title="No organizations available"
  //     >
  //       <Building className="h-4 w-4" />
  //     </Button>
  //   );
  // }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className={cn("h-8 px-2", className)}>
          <Avatar className="h-6 w-6">
            {/* <AvatarImage
              src={activeOrganization?.logo}
              alt={activeOrganization?.name}
            />
            <AvatarFallback className="text-xs">
              {activeOrganization?.name ? (
                getInitials(activeOrganization.name)
              ) : (
                <Building className="h-3 w-3" />
              )}
            </AvatarFallback> */}
          </Avatar>
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
              No organizations found.
            </CommandEmpty>
            <CommandGroup className="p-1">
              {/* {organizations.map((organization) => (
                <CommandItem
                  key={organization._id}
                  value={organization.name}
                  onSelect={() => handleOrganizationSelect(organization._id)}
                  className="flex items-center justify-between cursor-pointer px-2 py-2 rounded-sm data-[selected='true']:bg-transparent hover:data-[selected='true']:bg-accent hover:bg-accent hover:text-accent-foreground"
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage 
                        src={organization.logo} 
                        alt={organization.name}
                      />
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getInitials(organization.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{organization.name}</span>
                      <span className="text-xs text-muted-foreground">{organization.userRole}</span>
                    </div>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4",
                      activeOrganization?._id?.toString() === organization._id?.toString()
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))} */}
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
