import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";
import { useActiveOrganization } from "../organization";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Users, Link2, Unlink } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription } from "../ui/alert";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { getInitials } from "../../lib/utils";
import { Loader2, Plus, UserPlus, X } from "lucide-react";
import { useAccessControl } from "../../hooks/useAccessControl";
import { useAuth } from "../../store/hooks";
import { teamsApi } from "../../api/teams";

const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
});

const memberSchema = z.object({
  userId: z.string().min(1, "User is required"),
  role: z.string().min(1, "Role is required"),
});

type TeamFormData = z.infer<typeof teamSchema>;
type MemberFormData = z.infer<typeof memberSchema>;

export default function TeamManagement() {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamToDelete, setTeamToDelete] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("teams");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const activeOrganization = useActiveOrganization();
  const { canCreateTeams } = useAccessControl();
  const { fetchUserData } = useAuth();

  // Get teams for active organization
  const { data: teams = [] } = useQuery({
    queryKey: ["/teams", "organization", activeOrganization?._id],
    queryFn: () =>
      activeOrganization
        ? apiRequest("GET", `/teams/organization/${activeOrganization._id}`)
        : Promise.resolve([]),
    enabled: !!activeOrganization,
  }) as { data: any[]; isLoading: boolean };

  console.log({ teams });

  // Get organization members (for team member addition)
  const { data: organizationData, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["/organizations", activeOrganization?._id],
    queryFn: () =>
      activeOrganization
        ? apiRequest("GET", `/organizations/${activeOrganization._id}`)
        : Promise.resolve(null),
    enabled: !!activeOrganization,
  });

  const users = organizationData?.members || [];

  // Get team members for selected team
  const { data: teamMembers = [], isLoading: isLoadingMembers } = useQuery({
    queryKey: [
      "/teams",
      "organization",
      activeOrganization?._id,
      selectedTeam?._id,
      "members",
    ],
    queryFn: () => {
      if (!selectedTeam || !activeOrganization) return Promise.resolve([]);
      // Use organization-scoped endpoint
      return apiRequest(
        "GET",
        `/teams/organization/${activeOrganization._id}/${selectedTeam._id}/members`
      );
    },
    enabled: !!selectedTeam && !!activeOrganization,
  }) as { data: any[]; isLoading: boolean };

  // Get organization social accounts (for assignment)
  const { data: organizationSocialAccounts = [] } = useQuery({
    queryKey: ["/social-accounts", activeOrganization?._id],
    queryFn: () =>
      activeOrganization
        ? apiRequest(
            "GET",
            `/social-accounts/organization/${activeOrganization._id}`
          )
        : Promise.resolve([]),
    enabled: !!activeOrganization,
  }) as { data: any[]; isLoading: boolean };

  // Get team's assigned social accounts
  const {
    data: teamSocialAccounts = [],
    isLoading: isLoadingTeamSocialAccounts,
  } = useQuery({
    queryKey: [
      "/teams",
      activeOrganization?._id,
      selectedTeam?._id,
      "social-accounts",
    ],
    queryFn: () => {
      if (!selectedTeam || !activeOrganization) return Promise.resolve([]);
      return teamsApi.getTeamSocialAccounts(
        activeOrganization._id,
        selectedTeam._id
      );
    },
    enabled: !!selectedTeam && !!activeOrganization,
  }) as { data: any[]; isLoading: boolean };

  // Create team mutation
  const { mutate: createTeam, isPending: isCreatingTeamPending } = useMutation({
    mutationFn: async (data: TeamFormData) => {
      if (!activeOrganization) throw new Error("No active organization");
      return await apiRequest(
        "POST",
        `/teams/organization/${activeOrganization._id}`,
        data
      );
    },
    onSuccess: () => {
      fetchUserData();
      queryClient.invalidateQueries({
        queryKey: ["/teams", "organization", activeOrganization?._id],
      });
      toast.success({
        title: "Team Created",
        description: "Your team has been created successfully.",
      });
      setIsCreatingTeam(false);
      teamForm.reset();
    },
    onError: () => {
      toast.error({
        title: "Team Creation Failed",
        description: "Failed to create team. Please try again.",
      });
    },
  });

  // Add team member mutation
  const { mutate: addTeamMember, isPending: isAddingMemberPending } =
    useMutation({
      mutationFn: async (data: { teamId: string; member: MemberFormData }) => {
        if (!activeOrganization) throw new Error("No active organization");
        return await apiRequest(
          "POST",
          `/teams/organization/${activeOrganization._id}/${data.teamId}/members`,
          data.member
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "/teams",
            "organization",
            activeOrganization?._id,
            selectedTeam?._id,
            "members",
          ],
        });
        toast.success({
          title: "Member Added",
          description: "The team member has been added successfully.",
        });
        setIsAddingMember(false);
        memberForm.reset();
      },
      onError: () => {
        toast.error({
          title: "Member Addition Failed",
          description:
            "Failed to add team member. User may already be part of the team.",
        });
      },
    });

  // Remove team member mutation
  const { mutate: removeTeamMember, isPending: isRemovingMemberPending } =
    useMutation({
      mutationFn: async ({
        teamId,
        userId,
      }: {
        teamId: string;
        userId: number;
      }) => {
        if (!activeOrganization) throw new Error("No active organization");
        return await apiRequest(
          "DELETE",
          `/teams/organization/${activeOrganization._id}/${teamId}/members/${userId}`
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "/teams",
            "organization",
            activeOrganization?._id,
            selectedTeam?._id,
            "members",
          ],
        });
        toast.success({
          title: "Member Removed",
          description: "The team member has been removed from the team.",
        });
      },
      onError: () => {
        toast.error({
          title: "Member Removal Failed",
          description: "Failed to remove team member. Please try again.",
        });
      },
    });

  // Delete team mutation
  const { mutate: deleteTeam, isPending: isDeletingTeam } = useMutation({
    mutationFn: async (teamId: string) => {
      if (!activeOrganization) throw new Error("No active organization");
      return await apiRequest(
        "DELETE",
        `/teams/organization/${activeOrganization._id}/${teamId}`
      );
    },
    onSuccess: () => {
      fetchUserData();
      queryClient.invalidateQueries({
        queryKey: ["/teams", "organization", activeOrganization?._id],
      });
      toast.success({
        title: "Team Deleted",
        description: "The team has been deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setTeamToDelete(null);
      // Clear selected team if it was the deleted one
      if (selectedTeam && selectedTeam._id === teamToDelete?._id) {
        setSelectedTeam(null);
      }
    },
    onError: () => {
      toast.error({
        title: "Team Deletion Failed",
        description: "Failed to delete team. Please try again.",
      });
    },
  });

  // Assign social account to team mutation
  const { mutate: assignSocialAccount, isPending: isAssigningSocialAccount } =
    useMutation({
      mutationFn: async ({ accountId }: { accountId: string }) => {
        if (!activeOrganization || !selectedTeam)
          throw new Error("Missing context");
        return await teamsApi.assignSocialAccountToTeam(
          activeOrganization._id,
          selectedTeam._id,
          accountId
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "/teams",
            activeOrganization?._id,
            selectedTeam?._id,
            "social-accounts",
          ],
        });
        toast.success({
          title: "Account Assigned",
          description:
            "Social account has been assigned to the team successfully.",
        });
      },
      onError: () => {
        toast.error({
          title: "Assignment Failed",
          description:
            "Failed to assign social account to team. Please try again.",
        });
      },
    });

  // Remove social account from team mutation
  const { mutate: removeSocialAccount, isPending: isRemovingSocialAccount } =
    useMutation({
      mutationFn: async ({ accountId }: { accountId: string }) => {
        if (!activeOrganization || !selectedTeam)
          throw new Error("Missing context");
        return await teamsApi.removeSocialAccountFromTeam(
          activeOrganization._id,
          selectedTeam._id,
          accountId
        );
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [
            "/teams",
            activeOrganization?._id,
            selectedTeam?._id,
            "social-accounts",
          ],
        });
        toast.success({
          title: "Account Removed",
          description:
            "Social account has been removed from the team successfully.",
        });
      },
      onError: () => {
        toast.error({
          title: "Removal Failed",
          description:
            "Failed to remove social account from team. Please try again.",
        });
      },
    });

  // Filter out users who are already team members
  // const availableUsers = useMemo(
  //   () =>
  //     users.filter(
  //       (user: any) =>
  //         !teamMembers.some(
  //           (member: any) => member.userId?.toString() !== user._id?.toString()
  //         )
  //     ),
  //   [users, teamMembers]
  // );

  // console.log({ availableUsers });

  const teamForm = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const memberForm = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userId: "",
      role: "member",
    },
  });

  function onTeamSubmit(data: TeamFormData) {
    createTeam(data);
  }

  function onMemberSubmit(data: MemberFormData) {
    if (selectedTeam) {
      addTeamMember({
        teamId: selectedTeam._id,
        member: {
          userId: data.userId,
          role: data.role,
        },
      });
    }
  }

  function openAddMemberDialog(team: any) {
    setSelectedTeam(team);
    setIsAddingMember(true);
  }

  function viewTeamMembers(team: any) {
    setSelectedTeam(team);
    setActiveTab("members");
  }

  function handleRemoveMember(userId: number) {
    if (selectedTeam) {
      removeTeamMember({
        teamId: selectedTeam._id,
        userId,
      });
    }
  }

  function getUserById(userId: number) {
    return users.find((user: any) => user._id === userId || user.id === userId);
  }

  function openDeleteDialog(team: any) {
    setTeamToDelete(team);
    setIsDeleteDialogOpen(true);
  }

  function handleDeleteTeam() {
    if (teamToDelete) {
      deleteTeam(teamToDelete._id);
    }
  }

  function viewTeamSocialAccounts(team: any) {
    setSelectedTeam(team);
    setActiveTab("social-accounts");
  }

  function handleAssignSocialAccount(accountId: string) {
    assignSocialAccount({ accountId });
  }

  function handleRemoveSocialAccount(accountId: string) {
    removeSocialAccount({ accountId });
  }

  // Get available social accounts (not assigned to this team)
  const availableSocialAccounts = useMemo(() => {
    const assignedAccountIds = teamSocialAccounts.map(
      (account: any) => account._id
    );
    return organizationSocialAccounts.filter(
      (account: any) => !assignedAccountIds.includes(account._id)
    );
  }, [organizationSocialAccounts, teamSocialAccounts]);

  // Get platform icon/color for display
  function getPlatformDetails(platform: string) {
    const platforms: Record<string, { color: string; name: string }> = {
      twitter: { color: "bg-blue-500", name: "Twitter" },
      linkedin: { color: "bg-blue-700", name: "LinkedIn" },
      facebook: { color: "bg-blue-600", name: "Facebook" },
      instagram: {
        color: "bg-gradient-to-r from-purple-500 to-pink-500",
        name: "Instagram",
      },
      tiktok: { color: "bg-black", name: "TikTok" },
      youtube: { color: "bg-red-600", name: "YouTube" },
      threads: { color: "bg-gray-800", name: "Threads" },
    };
    return platforms[platform] || { color: "bg-gray-500", name: platform };
  }

  // Show message if no organization is selected
  if (!activeOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No Organization Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please select an organization to manage teams
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            {canCreateTeams
              ? `Create and manage teams in ${activeOrganization.name}`
              : `View teams in ${activeOrganization.name}`}
          </p>
        </div>
        {canCreateTeams && (
          <Button onClick={() => setIsCreatingTeam(true)}>
            <Plus size={16} className="mr-2" />
            Create Team
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="members" disabled={!selectedTeam}>
            Members
          </TabsTrigger>
          <TabsTrigger value="social-accounts" disabled={!selectedTeam}>
            Social Accounts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          {teams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team: any) => {
                return (
                  <Card key={team._id} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle>{team.name}</CardTitle>
                      <CardDescription>
                        {activeOrganization.name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {team.description ? (
                        <p className="text-sm text-muted-foreground">
                          {team.description}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No description
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2 border-t pt-4 bg-muted/40">
                      {canCreateTeams && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => openAddMemberDialog(team)}
                        >
                          <UserPlus size={16} className="mr-2" />
                          Add Member
                        </Button>
                      )}
                      <Button
                        variant="default"
                        className="w-full"
                        onClick={() => viewTeamMembers(team)}
                      >
                        View Members
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => viewTeamSocialAccounts(team)}
                      >
                        <Link2 size={16} className="mr-2" />
                        Social Accounts
                      </Button>
                      {canCreateTeams && (
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={() => openDeleteDialog(team)}
                        >
                          <X size={16} className="mr-2" />
                          Delete Team
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>No teams yet</CardTitle>
                <CardDescription>
                  {canCreateTeams
                    ? "Create a team to collaborate with others on your social media content"
                    : "No teams have been created in this organization yet. Organization owners and admins can create teams for collaboration."}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                {canCreateTeams && (
                  <Button onClick={() => setIsCreatingTeam(true)}>
                    <Plus size={16} className="mr-2" />
                    Create Your First Team
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members">
          {selectedTeam && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <CardDescription>Team Members</CardDescription>
                    </div>
                    {canCreateTeams && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAddMemberDialog(selectedTeam)}
                      >
                        <UserPlus size={16} className="mr-2" />
                        Add Member
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingMembers ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : teamMembers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.map((member: any) => {
                          const user = getUserById(member.userId);
                          return (
                            <TableRow key={member.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {user?.firstName
                                        ? getInitials(
                                            user.firstName + " " + user.lastName
                                          )
                                        : user?.email
                                            ?.substring(0, 2)
                                            .toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium">
                                      {user?.firstName + " " + user?.lastName ||
                                        "Unknown"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {user?.email || ""}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    member.role === "admin"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {member.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {canCreateTeams && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleRemoveMember(member.userId)
                                    }
                                    disabled={isRemovingMemberPending}
                                  >
                                    {isRemovingMemberPending ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <X size={16} />
                                    )}
                                    <span className="sr-only">Remove</span>
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        This team doesn't have any members yet. Add members to
                        collaborate.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="social-accounts">
          {selectedTeam && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{selectedTeam.name}</CardTitle>
                      <CardDescription>
                        Assigned Social Accounts
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingTeamSocialAccounts ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : teamSocialAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {teamSocialAccounts.map((account: any) => {
                        const platformDetails = getPlatformDetails(
                          account.platform
                        );
                        return (
                          <Card key={account._id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-full ${platformDetails.color} flex items-center justify-center text-white font-bold text-sm`}
                                  >
                                    {platformDetails.name.charAt(0)}
                                  </div>
                                  <div>
                                    <CardTitle className="text-sm">
                                      {account.accountName || account.username}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {platformDetails.name}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    account.isActive ? "default" : "secondary"
                                  }
                                >
                                  {account.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardFooter className="pt-0">
                              {canCreateTeams && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full text-destructive hover:text-destructive"
                                  onClick={() =>
                                    handleRemoveSocialAccount(account._id)
                                  }
                                  disabled={isRemovingSocialAccount}
                                >
                                  {isRemovingSocialAccount ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                  ) : (
                                    <Unlink size={16} className="mr-2" />
                                  )}
                                  Remove
                                </Button>
                              )}
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No social accounts assigned to this team yet.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Available Social Accounts to Assign */}
              {canCreateTeams && availableSocialAccounts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Available Social Accounts</CardTitle>
                    <CardDescription>
                      Click to assign these accounts to the team
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {availableSocialAccounts.map((account: any) => {
                        const platformDetails = getPlatformDetails(
                          account.platform
                        );
                        return (
                          <Card
                            key={account._id}
                            className="overflow-hidden border-dashed hover:border-solid transition-colors cursor-pointer"
                            onClick={() =>
                              handleAssignSocialAccount(account._id)
                            }
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div
                                    className={`w-10 h-10 rounded-full ${platformDetails.color} flex items-center justify-center text-white font-bold text-sm`}
                                  >
                                    {platformDetails.name.charAt(0)}
                                  </div>
                                  <div>
                                    <CardTitle className="text-sm">
                                      {account.accountName || account.username}
                                    </CardTitle>
                                    <CardDescription className="text-xs">
                                      {platformDetails.name}
                                    </CardDescription>
                                  </div>
                                </div>
                                <Badge
                                  variant={
                                    account.isActive ? "default" : "secondary"
                                  }
                                >
                                  {account.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardFooter className="pt-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAssignSocialAccount(account._id);
                                }}
                                disabled={isAssigningSocialAccount}
                              >
                                {isAssigningSocialAccount ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                  <Link2 size={16} className="mr-2" />
                                )}
                                Assign
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No available accounts message */}
              {canCreateTeams &&
                availableSocialAccounts.length === 0 &&
                teamSocialAccounts.length === 0 && (
                  <Alert>
                    <AlertDescription>
                      No social accounts available in this organization. Connect
                      social accounts first to assign them to teams.
                    </AlertDescription>
                  </Alert>
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Team Dialog */}
      <Dialog open={isCreatingTeam} onOpenChange={setIsCreatingTeam}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Team</DialogTitle>
            <DialogDescription>
              Create a new team to collaborate on social media content
            </DialogDescription>
          </DialogHeader>

          <Form {...teamForm}>
            <form
              onSubmit={teamForm.handleSubmit(onTeamSubmit)}
              className="space-y-4"
            >
              <FormField
                control={teamForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Marketing Team" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={teamForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Team's purpose and goals"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsCreatingTeam(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreatingTeamPending}>
                  {isCreatingTeamPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Create Team
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={isAddingMember} onOpenChange={setIsAddingMember}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>
              Add a user to the "{selectedTeam?.name}" team
            </DialogDescription>
          </DialogHeader>

          <Form {...memberForm}>
            <form
              onSubmit={memberForm.handleSubmit(onMemberSubmit)}
              className="space-y-4"
            >
              <FormField
                control={memberForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : users.length > 0 ? (
                          users.map((user: any) => (
                            <SelectItem
                              key={user._id}
                              value={user._id.toString()}
                            >
                              {user.firstName + " " + user.lastName} (
                              {user.email})
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="none" disabled>
                            No users available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={memberForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Defines what permissions the user will have in this team
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddingMember(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isAddingMemberPending}>
                  {isAddingMemberPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Member
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{teamToDelete?.name}"? This
              action cannot be undone. All team members will be removed from the
              team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeletingTeam}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteTeam}
              disabled={isDeletingTeam}
            >
              {isDeletingTeam && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Team
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
