import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
import { UserPlus } from "lucide-react";
import { OrganizationMember } from "../../api/organizations";
import { invitationsApi, type InvitationListItem } from "../../api/invitations";
import { useAuth } from "../../store/hooks";
import { useAccessControl } from "../../hooks/useAccessControl";

const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  role: z.enum(["admin", "editor", "viewer"]),
});

type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;

export default function OrganizationMembers() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] =
    useState<OrganizationMember | null>(null);
  const [pendingInvites, setPendingInvites] = useState<InvitationListItem[]>(
    []
  );
  const [loadingInvites, setLoadingInvites] = useState(false);
  const { userContext } = useAccessControl();
  const { organization } = useAuth();

  // Function to check if current user can manage a specific role
  const canManageRole = (targetRole: string) => {
    const currentRole = userContext.userRole;

    // Role hierarchy levels
    const roleHierarchy = {
      owner: 5,
      org_owner: 5, // Same as owner
      admin: 4,
      member: 3, // legacy alias for UI; maps to editor
      editor: 3,
      viewer: 2,
    };

    const currentLevel =
      roleHierarchy[currentRole as keyof typeof roleHierarchy] || 0;
    const targetLevel =
      roleHierarchy[targetRole as keyof typeof roleHierarchy] || 0;

    return currentLevel > targetLevel;
  };

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      role: "editor",
    },
  });

  const onInviteSubmit = async (data: InviteMemberFormData) => {
    if (!organization?._id) {
      console.warn("No active organization for invitation");
      return;
    }
    try {
      await invitationsApi.sendInvitation({
        email: data.email,
        orgId: organization._id,
        role: data.role,
      });
      setIsInviteDialogOpen(false);
      form.reset();
      await loadPendingInvites();
    } catch (e) {
      console.error("Failed to send invitation", e);
    }
  };

  // Determine which roles the current user can assign
  const getAssignableRoles = () => {
    const allRoles = [
      { value: "viewer", label: "Viewer - Can view content", level: 1 },
      {
        value: "editor",
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

  async function loadPendingInvites() {
    if (!organization?._id) return;
    try {
      setLoadingInvites(true);
      const items = await invitationsApi.listInvitations(
        organization._id,
        "pending"
      );
      setPendingInvites(items);
    } catch (e) {
      console.error("Failed to load pending invitations", e);
    } finally {
      setLoadingInvites(false);
    }
  }

  useEffect(() => {
    loadPendingInvites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization?._id]);

  const handleResendInvite = async (invitationId: string) => {
    try {
      await invitationsApi.resendInvitation(invitationId);
    } catch (e) {
      console.error("Failed to resend invitation", e);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      await invitationsApi.revokeInvitation(invitationId);
      await loadPendingInvites();
    } catch (e) {
      console.error("Failed to revoke invitation", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organization Members
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage members and their roles in {organization?.name}
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
                {/* Send an invitation to join {activeOrganization.name} */}
                Invite a new team member to join your organization
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
                  <Button type="submit">Send Invitation</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>
            People who have access to this organization
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Pending Invitations */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>Invitations waiting to be accepted</CardDescription>
        </CardHeader>
        <div className="p-4">
          {loadingInvites ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : pendingInvites.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No pending invitations
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvites.map((inv) => (
                <div
                  key={inv._id}
                  className="flex items-center justify-between border rounded p-3"
                >
                  <div>
                    <div className="text-sm font-medium">{inv.email}</div>
                    <div className="text-xs text-muted-foreground">
                      Role: {inv.role === "editor" ? "member" : inv.role}
                      {inv.expiresAt
                        ? ` · Expires: ${new Date(
                            inv.expiresAt
                          ).toLocaleString()}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResendInvite(inv._id)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRevokeInvite(inv._id)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              onClick={() => console.log("Remove member")}
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
