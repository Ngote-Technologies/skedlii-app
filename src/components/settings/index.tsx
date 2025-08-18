import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { usersApi } from "../../api/users";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../store/hooks";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  CreditCard,
  Loader2,
  Settings,
  User,
  Lock,
  Bell,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProfileInformation from "./ProfileInformation";
import PasswordChange from "./PasswordChange";
import NotificationSettings from "./NotificationSettings";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function UserSettings() {
  const { user, fetchUserData, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // Delete account mutation
  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: async () => {
      if (deleteConfirmation !== "DELETE MY ACCOUNT") {
        throw new Error("Invalid confirmation");
      }
      return await apiRequest("DELETE", `/auth/me`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      toast({
        title: "Account deleted",
        description: "Your account has been deleted successfully",
      });
      logout();
    },
    onError: () => {
      toast({
        title: "Deletion failed",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { mutate: updateProfile, isPending: isUpdatingProfile } = useMutation({
    mutationFn: async (data: FormData | ProfileFormData) => {
      return await usersApi.updateUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/users/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
      fetchUserData();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Change password mutation
  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: async (data: PasswordFormData) => {
        const { confirmPassword, ...passwordData } = data;
        return await apiRequest("POST", "/users/change-password", passwordData);
      },
      onSuccess: () => {
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully",
        });
        passwordForm.reset();
      },
      onError: () => {
        toast({
          title: "Password change failed",
          description:
            "Failed to change your password. Current password may be incorrect.",
          variant: "destructive",
        });
      },
    }
  );

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      email: user?.email ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onProfileSubmit(data: FormData | ProfileFormData) {
    if (data instanceof FormData) {
      // Remove email from FormData if present
      if (data.has("email")) {
        data.delete("email");
      }
      updateProfile(data);
    } else {
      // Handle regular form data (fallback)
      if (data.email) delete data.email;
      updateProfile(data);
    }
  }

  function onPasswordSubmit(data: PasswordFormData) {
    changePassword(data);
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 p-6 backdrop-blur-sm border border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Account Settings
              </h2>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <Settings className="h-3 w-3 text-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-600">
                  Active
                </span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Manage your account preferences, security, and notification
              settings
            </p>
          </div>
          <Link to="/dashboard/billing">
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-gradient-to-r from-background to-muted/50 border-border/50 hover:bg-primary/5 transition-all duration-200"
            >
              <CreditCard className="h-4 w-4" />
              Billing & Subscription
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        {/* Enhanced Tab Navigation */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 p-1 border border-border/50">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5" />
          <TabsList className="relative grid w-full grid-cols-4 bg-transparent">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Lock className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="security"
              className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile">
          <ProfileInformation
            profileForm={profileForm}
            onProfileSubmit={onProfileSubmit}
            isUpdatingProfile={isUpdatingProfile}
            user={user}
          />
        </TabsContent>

        <TabsContent value="password">
          <PasswordChange
            passwordForm={passwordForm}
            onPasswordSubmit={onPasswordSubmit}
            isChangingPassword={isChangingPassword}
            showCurrentPassword={showCurrentPassword}
            setShowCurrentPassword={setShowCurrentPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="security">
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/30 border border-border/50">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5" />

            <div className="relative p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold">Danger Zone</h3>
                    <Badge
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <AlertTriangle className="h-3 w-3" />
                      <span className="text-xs">Irreversible</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>

              {/* Warning Content */}
              <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-800 dark:text-red-400">
                      This action cannot be undone
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Deleting your account will permanently remove:
                    </p>
                    <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 ml-4">
                      <li>• All your social media accounts and connections</li>
                      <li>• Scheduled and published posts</li>
                      <li>• Teams and collaboration data</li>
                      <li>• Billing history and subscription information</li>
                      <li>• All uploaded media and content</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-border/50">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Delete Account Permanently
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-red-600">
              Delete Account Permanently
            </DialogTitle>
            <DialogDescription className="text-center space-y-2">
              <span className="block">This action cannot be undone.</span>
              <span className="block text-sm">
                All your data, posts, and connections will be permanently lost.
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                To confirm deletion, type exactly:
              </p>
              <code className="block p-2 bg-red-500/10 rounded text-red-800 dark:text-red-200 font-mono text-sm">
                DELETE MY ACCOUNT
              </code>
            </div>

            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type the confirmation text here..."
              className="border-red-200 focus:border-red-500 focus:ring-red-500/20"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmation("");
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteAccount()}
              disabled={
                isDeletingAccount || deleteConfirmation !== "DELETE MY ACCOUNT"
              }
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0"
            >
              {isDeletingAccount ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Delete Forever
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
