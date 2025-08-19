import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  useActiveOrganization,
  useOrganizationPermissions,
  useOrganizationStore,
} from "../../store/organizationStore";
import { organizationsApi, OrganizationMember } from "../../api/organizations";
import { useToast } from "../../hooks/use-toast";
import { getInitials } from "../../lib/utils";
import { invitationsApi } from "../../api/invitations";
import { useAccessControl } from "../../hooks/useAccessControl";

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "member", "viewer"]),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export default function OrganizationMembers() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);

  const activeOrganization = useActiveOrganization();
  const permissions = useOrganizationPermissions();
  const { removeMember } = useOrganizationStore();
  const { canManageRole } = useAccessControl();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "member",
    },
  });

  // Fetch organization details with members
  const { data: organizationDetails, isLoading } = useQuery({
    queryKey: ["organization", activeOrganization?._id],
    queryFn: () =>
      activeOrganization
        ? organizationsApi.getOrganization(activeOrganization._id)
        : null,
    enabled: !!activeOrganization,
  });

  const inviteMutation = useMutation({
    mutationFn: async (data: InviteMemberFormData) => {
      if (!activeOrganization) throw new Error("No active organization");

      // Use the real invitation API
      return await invitationsApi.sendInvitation({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        organizationId: activeOrganization._id,
      });
    },
    onSuccess: (result) => {
      const userExists = result.userExists;
      toast({
        title: "Invitation sent",
        description: userExists
          ? "Invitation sent to existing user. They can join this organization through their email."
          : "Invitation sent to new user. They will receive an email to create their account and join the organization.",
      });
      setIsInviteDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({
        queryKey: ["organization", activeOrganization?._id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Invitation failed",
        description:
          error.response?.data?.error ||
          error.message ||
          "Failed to send invitation.",
        variant: "destructive",
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      if (!activeOrganization) throw new Error("No active organization");
      await removeMember(activeOrganization._id, memberId);
    },
    onSuccess: () => {
      toast({
        title: "Member removed",
        description: "Member has been removed from the organization.",
      });
      setMemberToRemove(null);
      queryClient.invalidateQueries({
        queryKey: ["organization", activeOrganization?._id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal failed",
        description: error.message || "Failed to remove member.",
        variant: "destructive",
      });
    },
  });

  const onInviteSubmit = async (data: InviteMemberFormData) => {
    console.log({ data });
    await inviteMutation.mutateAsync(data);
  };

  const handleRemoveMember = async () => {
    if (memberToRemove) {
      await removeMutation.mutateAsync(memberToRemove._id);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default"; // Blue badge - highest authority
      case "admin":
        return "success"; // Green badge - management role  
      case "member":
        return "warning"; // Yellow badge - active contributor
      case "viewer":
        return "outline"; // Subtle badge - read-only access
      default:
        return "outline";
    }
  };

  const getRoleDisplayName = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Determine which roles the current user can assign
  const getAssignableRoles = () => {
    const allRoles = [
      { value: "viewer", label: "Viewer - Can view content", level: 1 },
      {
        value: "member",
        label: "Member - Can create and manage content",
        level: 2,
      },
      {
        value: "admin",
        label: "Admin - Can manage teams and members",
        level: 3,
      },
    ];

    // Only show roles that are lower in hierarchy than current user
    return allRoles.filter((role) => canManageRole(role.value as any));
  };

  if (!activeOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No Organization Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please select an organization to manage members
          </p>
        </div>
      </div>
    );
  }

  if (!permissions.canManageMembers) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Access Restricted
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You don't have permission to manage organization members
          </p>
        </div>
      </div>
    );
  }

  const members = organizationDetails?.members || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organization Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage members and their roles in {activeOrganization.name}
          </p>
        </div>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Send an invitation to join {activeOrganization.name}
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onInviteSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="colleague@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
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
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {getAssignableRoles().map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Send Invitation
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members ({members.length})</CardTitle>
          <CardDescription>
            People who have access to this organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(
                              `${member.firstName} ${member.lastName}`
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(member.role)}>
                        {getRoleDisplayName(member.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {member.joinedAt
                          ? new Date(member.joinedAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Message
                          </DropdownMenuItem>
                          {canManageRole(member.role as any) && (
                            <DropdownMenuItem>
                              <Shield className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 dark:text-red-400"
                            onClick={() => setMemberToRemove(member)}
                            disabled={
                              member.role === "owner" ||
                              !canManageRole(member.role as any)
                            }
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No members yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Start building your team by inviting members to your
                organization
              </p>
              <Button onClick={() => setIsInviteDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite First Member
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.firstName}{" "}
              {memberToRemove?.lastName} from this organization? They will lose
              access to all teams and content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
