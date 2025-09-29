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
import { Progress } from "../ui/progress";
import {
  EyeIcon,
  EyeOffIcon,
  Loader2,
  Shield,
  Lock,
  CheckCircle2,
  AlertCircle,
  Key,
  Save,
  Zap,
} from "lucide-react";

const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password),
  };

  strength = Object.values(checks).filter(Boolean).length;

  const getStrengthInfo = () => {
    if (strength === 0)
      return { label: "Very Weak", color: "bg-red-500", percentage: 0 };
    if (strength <= 2)
      return { label: "Weak", color: "bg-red-400", percentage: 25 };
    if (strength === 3)
      return { label: "Fair", color: "bg-orange-400", percentage: 50 };
    if (strength === 4)
      return { label: "Good", color: "bg-yellow-400", percentage: 75 };
    return { label: "Strong", color: "bg-green-500", percentage: 100 };
  };

  return { strength, checks, ...getStrengthInfo() };
};

const PasswordChange = ({
  passwordForm,
  onPasswordSubmit,
  isChangingPassword,
  showCurrentPassword,
  setShowCurrentPassword,
  showNewPassword,
  setShowNewPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: {
  passwordForm: any;
  onPasswordSubmit: any;
  isChangingPassword: boolean;
  showCurrentPassword: boolean;
  setShowCurrentPassword: (value: boolean) => void;
  showNewPassword: boolean;
  setShowNewPassword: (value: boolean) => void;
  showConfirmPassword: boolean;
  setShowConfirmPassword: (value: boolean) => void;
}) => {
  const newPassword = passwordForm.watch("newPassword") || "";
  const passwordStrength = calculatePasswordStrength(newPassword);
  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />

      <CardHeader className="relative">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <Key className="h-5 w-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-xl font-bold">
                Password Security
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="text-xs">Protected</span>
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Change your password to keep your account secure and protected
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative">
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
            className="space-y-4"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4 text-orange-600" />
                    Current Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-4 pr-12 border-border/50 focus:border-orange-500/50 focus:ring-orange-500/20 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-orange-500/10"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                    >
                      {showCurrentPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-orange-600" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-orange-600" />
                      )}
                      <span className="sr-only">
                        {showCurrentPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormDescription className="text-xs text-muted-foreground">
                    Enter your current password to verify your identity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <Shield className="h-4 w-4 text-green-600" />
                    New Password
                    {newPassword && (
                      <Badge
                        variant={
                          passwordStrength.strength >= 4
                            ? "default"
                            : "secondary"
                        }
                        className={`ml-auto text-xs ${
                          passwordStrength.strength >= 4
                            ? "bg-green-500 text-white"
                            : passwordStrength.strength >= 3
                            ? "bg-yellow-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {passwordStrength.label}
                      </Badge>
                    )}
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-4 pr-12 border-border/50 focus:border-green-500/50 focus:ring-green-500/20 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-green-500/10"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-green-600" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-green-600" />
                      )}
                      <span className="sr-only">
                        {showNewPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>

                  {newPassword && (
                    <div className="space-y-3 mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Password Strength
                          </span>
                          <span
                            className={`font-medium ${
                              passwordStrength.strength >= 4
                                ? "text-green-600"
                                : passwordStrength.strength >= 3
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {passwordStrength.label}
                          </span>
                        </div>
                        <Progress
                          value={passwordStrength.percentage}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div
                          className={`flex items-center gap-1 ${
                            passwordStrength.checks.length
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passwordStrength.checks.length ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          8+ characters
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            passwordStrength.checks.uppercase
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passwordStrength.checks.uppercase ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Uppercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            passwordStrength.checks.lowercase
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passwordStrength.checks.lowercase ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Lowercase
                        </div>
                        <div
                          className={`flex items-center gap-1 ${
                            passwordStrength.checks.numbers
                              ? "text-green-600"
                              : "text-muted-foreground"
                          }`}
                        >
                          {passwordStrength.checks.numbers ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          Numbers
                        </div>
                      </div>
                    </div>
                  )}

                  <FormDescription className="text-xs text-muted-foreground">
                    Use a strong password with a mix of letters, numbers, and
                    symbols
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-sm font-medium">
                    <CheckCircle2 className="h-4 w-4 text-blue-600" />
                    Confirm New Password
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-4 pr-12 border-border/50 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-blue-500/10"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOffIcon className="h-4 w-4 text-blue-600" />
                      ) : (
                        <EyeIcon className="h-4 w-4 text-blue-600" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword
                          ? "Hide password"
                          : "Show password"}
                      </span>
                    </Button>
                  </div>
                  <FormDescription className="text-xs text-muted-foreground">
                    Re-enter your new password to confirm it matches
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-border/50">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-orange-500" />
                <span>Password will be encrypted and secured</span>
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
                  disabled={isChangingPassword || passwordStrength.strength < 3}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
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

export default PasswordChange;
