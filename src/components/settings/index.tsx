import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { usersApi, UpdateUserPayload } from "../../api/users";
import { uploadToCloudinary } from "../../api/upload";
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
import { Link, useNavigate } from "react-router-dom";
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
  name: z.string().optional(),
  bio: z.string().optional(),
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

const TAB_ITEMS = [
  { value: "profile" as const, label: "Profile", icon: User },
  { value: "password" as const, label: "Password", icon: Lock },
  // { value: "notifications" as const, label: "Notifications", icon: Bell },
  { value: "security" as const, label: "Security", icon: Shield },
];
type TabValue = "profile" | "password" | "notifications" | "security";

export default function UserSettings() {
  const { user, fetchUserData, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("profile");

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: async () => {
      if (deleteConfirmation !== "DELETE MY ACCOUNT") {
        throw new Error("Invalid confirmation");
      }
      return await apiRequest("DELETE", `/auth/me`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/me"] });
      toast.success({
        title: "Account Deleted",
        description: "Your account has been deleted successfully.",
      });
      logout();
    },
    onError: () => {
      toast.error({
        title: "Account Deletion Failed",
        description: "Failed to delete your account. Please try again.",
      });
    },
  });

  const { mutateAsync: updateProfile, isPending: isUpdatingProfile } =
    useMutation({
      mutationFn: async (data: UpdateUserPayload) => {
        return await usersApi.updateUser(data);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/users/me"] });
        toast.success({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
        fetchUserData();
      },
      onError: () => {
        toast.error({
          title: "Profile Update Failed",
          description: "Failed to update your profile. Please try again.",
        });
      },
    });

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation(
    {
      mutationFn: async (data: PasswordFormData) => {
        const { confirmPassword, ...passwordData } = data;
        return await apiRequest("POST", "/auth/change-password", passwordData);
      },
      onSuccess: () => {
        toast.success({
          title: "Password Changed",
          description: "Your password has been changed successfully.",
        });
        passwordForm.reset();
      },
      onError: () => {
        toast.error({
          title: "Password Change Failed",
          description:
            "Failed to change your password. Current password may be incorrect.",
        });
      },
    }
  );

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? "",
      bio: user?.bio ?? "",
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

  async function onProfileSubmit(data: FormData | ProfileFormData) {
    try {
      const payload: UpdateUserPayload = {};

      if (data instanceof FormData) {
        for (const [key, value] of data.entries()) {
          if (key === "email") continue;
          if (value instanceof File) {
            if (value.size === 0) continue;
            const uploaded = await uploadToCloudinary(value);
            if (uploaded) {
              payload.avatarUrl = uploaded.url;
              payload.avatarPublicId = uploaded.id;
            }
          } else if (typeof value === "string") {
            if (key === "name") {
              const trimmedName = value.trim();
              if (trimmedName.length > 0) {
                payload.name = trimmedName;
              }
            } else if (key === "bio") {
              const trimmed = value.trim();
              payload.bio = trimmed.length > 0 ? trimmed : null;
            }
          }
        }
      } else {
        if (data.name) {
          payload.name = data.name.trim();
        }
        if (data.bio !== undefined) {
          const trimmed = (data.bio ?? "").trim();
          payload.bio = trimmed.length > 0 ? trimmed : null;
        }
      }

      if (Object.keys(payload).length === 0) {
        return;
      }

      await updateProfile(payload);
    } catch (error: any) {
      toast.error({
        title: "Profile Update Failed",
        description:
          error?.message || "Unable to update your profile. Please try again.",
      });
    }
  }

  function onPasswordSubmit(data: PasswordFormData) {
    changePassword(data);
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-background via-background to-background/50 border border-border/50 p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/10" />
        <div className="relative flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
                  Account Settings
                </h2>
                <p className="text-muted-foreground">
                  Manage your account preferences, security, and notification
                  settings
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
            <Button
              variant="default"
              onClick={() => navigate("/dashboard/billing")}
              className="w-full sm:w-auto"
            >
              <CreditCard className="h-4 w-4" />
              Billing & Subscription
            </Button>
          </div>
        </div>
      </div>

      <Tabs
        defaultValue={activeTab}
        className="space-y-4"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabValue)}
      >
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1">
          {TAB_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

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
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-pink-500/5" />

            <div className="relative p-6 space-y-6">
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
                      icon={<AlertTriangle className="h-3 w-3" />}
                    >
                      <span className="text-xs">Irreversible</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
              </div>

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
