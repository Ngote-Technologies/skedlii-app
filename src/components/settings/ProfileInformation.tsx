import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Loader2,
  User,
  Mail,
  Camera,
  Upload,
  Shield,
  Sparkles,
  Edit3,
  Save,
  UserCheck,
} from "lucide-react";

const ProfileInformation = ({
  profileForm,
  onProfileSubmit,
  isUpdatingProfile,
}: {
  profileForm: any;
  onProfileSubmit: any;
  isUpdatingProfile: boolean;
}) => {
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-border/50">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />

      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
            <UserCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">
                Profile Information
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs">Verified</span>
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Update your personal information and how others see you on the
              platform
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <Form {...profileForm}>
          <form
            onSubmit={profileForm.handleSubmit(onProfileSubmit)}
            className="space-y-6"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4 lg:w-1/3">
                <div className="relative group">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary to-purple-500 p-1">
                    <div className="h-full w-full rounded-full bg-background flex items-center justify-center">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </Button>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-medium">Profile Picture</p>
                  <p className="text-xs text-muted-foreground">
                    Upload a photo to personalize your account
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    type="button"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload Image
                  </Button>
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-4">
                <FormField
                  control={profileForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-primary" />
                        First Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Your first name"
                            className="pl-4 pr-10 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                            {...field}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        This is how your name will appear to other users
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <User className="h-4 w-4 text-primary" />
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Your last name"
                            className="pl-4 pr-10 border-border/50 focus:border-primary/50 focus:ring-primary/20 transition-all duration-200"
                            {...field}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Edit3 className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground">
                        Your last name helps complete your professional profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-sm font-medium">
                        <Mail className="h-4 w-4 text-primary" />
                        Email Address
                        <Badge variant="outline" className="ml-auto text-xs">
                          <Shield className="h-2 w-2 mr-1" />
                          Protected
                        </Badge>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="your.email@example.com"
                            type="email"
                            disabled
                            className="pl-4 pr-10 bg-muted/30 border-border/50 cursor-not-allowed"
                            {...field}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription className="text-xs text-muted-foreground flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Email cannot be changed for security reasons. Contact
                        support if needed.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Enhanced Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Changes are saved automatically</span>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="border-border/50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
