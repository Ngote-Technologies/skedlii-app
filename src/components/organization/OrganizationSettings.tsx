import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
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
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Building, Save, Trash2, Upload, AlertTriangle } from "lucide-react";
import {
  useActiveOrganization,
  useOrganizationPermissions,
  useOrganizationStore,
} from "../../store/organizationStore";
import { UpdateOrganizationData } from "../../api/organizations";
import { useToast } from "../../hooks/use-toast";
import { getInitials } from "../../lib/utils";
import { useAccessControl } from "../../hooks/useAccessControl";

const organizationSettingsSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-500", "500+"]).optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  settings: z
    .object({
      allowMemberInvitations: z.boolean().optional(),
      requireEmailVerification: z.boolean().optional(),
      defaultUserRole: z.enum(["admin", "member", "viewer"]).optional(),
      brandColors: z
        .object({
          primary: z.string().optional(),
          secondary: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

type OrganizationSettingsFormData = z.infer<typeof organizationSettingsSchema>;

export default function OrganizationSettings() {
  const [isLoading, setIsLoading] = useState(false);
  const activeOrganization = useActiveOrganization();
  const permissions = useOrganizationPermissions();
  const { updateOrganization, deleteOrganization } = useOrganizationStore();
  const { userContext } = useAccessControl();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OrganizationSettingsFormData>({
    resolver: zodResolver(organizationSettingsSchema),
    defaultValues: {
      name: activeOrganization?.name || "",
      description: activeOrganization?.description || "",
      website: (activeOrganization as any)?.website || "",
      industry: (activeOrganization as any)?.industry || "",
      size: (activeOrganization as any)?.size || undefined,
      country: (activeOrganization as any)?.country || "",
      timezone: (activeOrganization as any)?.timezone || "",
      settings: {
        allowMemberInvitations:
          activeOrganization?.settings?.allowMemberInvitations ?? true,
        requireEmailVerification:
          activeOrganization?.settings?.requireEmailVerification ?? false,
        defaultUserRole:
          (activeOrganization?.settings?.defaultUserRole as any) || "member",
        brandColors: {
          primary: activeOrganization?.settings?.brandColors?.primary || "",
          secondary: activeOrganization?.settings?.brandColors?.secondary || "",
        },
      },
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateOrganizationData) => {
      if (!activeOrganization) throw new Error("No active organization");
      return await updateOrganization(activeOrganization._id, data);
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Organization settings have been saved successfully.",
      });
      queryClient.invalidateQueries({
        queryKey: ["organization", activeOrganization?._id],
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update organization settings.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!activeOrganization) throw new Error("No active organization");
      return await deleteOrganization(activeOrganization._id);
    },
    onSuccess: () => {
      toast({
        title: "Organization deleted",
        description: "Organization has been permanently deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error.message || "Failed to delete organization.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: OrganizationSettingsFormData) => {
    setIsLoading(true);
    try {
      await updateMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrganization = async () => {
    await deleteMutation.mutateAsync();
  };

  if (!activeOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            No Organization Selected
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Please select an organization to manage settings
          </p>
        </div>
      </div>
    );
  }

  if (!permissions.canManageOrganization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Access Restricted
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            You don't have permission to manage organization settings
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organization Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your organization's profile and preferences
          </p>
        </div>
        <Badge variant="outline">
          {activeOrganization.userRole.charAt(0).toUpperCase() +
            activeOrganization.userRole.slice(1)}
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update your organization's basic details and branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={activeOrganization.logo}
                    alt={activeOrganization.name}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(activeOrganization.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label>Organization Logo</Label>
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Logo
                  </Button>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG up to 2MB
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corporation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your organization"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="Technology" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">
                            51-200 employees
                          </SelectItem>
                          <SelectItem value="201-500">
                            201-500 employees
                          </SelectItem>
                          <SelectItem value="500+">500+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input placeholder="United States" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Preferences</CardTitle>
              <CardDescription>
                Configure how your organization operates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="settings.allowMemberInvitations"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Member Invitations
                      </FormLabel>
                      <FormDescription>
                        Allow members to invite new users to the organization
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.requireEmailVerification"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Email Verification
                      </FormLabel>
                      <FormDescription>
                        Require email verification for new members
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="settings.defaultUserRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Member Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select default role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default role assigned to new organization members
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Brand Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>
                Customize your organization's brand colors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="settings.brandColors.primary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input placeholder="#3B82F6" {...field} />
                          <div
                            className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700"
                            style={{
                              backgroundColor: field.value || "#3B82F6",
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="settings.brandColors.secondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Input placeholder="#10B981" {...field} />
                          <div
                            className="w-10 h-10 rounded border border-gray-200 dark:border-gray-700"
                            style={{
                              backgroundColor: field.value || "#10B981",
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{isLoading ? "Saving..." : "Save Changes"}</span>
            </Button>
          </div>
        </form>
      </Form>

      {/* Danger Zone - Only for org owners */}
      {userContext.userRole === "org_owner" && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Organization
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the
                    organization "{activeOrganization.name}" and remove all
                    associated data including teams, members, and content.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteOrganization}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Organization
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
