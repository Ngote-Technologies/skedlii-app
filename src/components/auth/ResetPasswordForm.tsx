import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "../../hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { Lock, ArrowLeft, Shield, Sparkles } from "lucide-react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

// Validation schema
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  readonly token: string;
  readonly email: string;
  readonly onBack?: () => void;
}

export default function ResetPasswordForm({
  onBack,
  token,
  email,
}: ResetPasswordFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const currentPassword = form.watch("password") || "";

  const { mutate: resetPassword, isPending: isMutating } = useMutation({
    mutationFn: async (data: any) => {
      const body = {
        token,
        email,
        newPassword: data.password,
      };
      const result = await apiRequest("POST", "/auth/reset-password", body);
      return result;
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setIsLoading(false);
      toast.success({
        title: "Password Reset Successful",
        description: "Your password has been successfully updated.",
      });
    },
    onError: (err: any) => {
      // Parse error message from API response
      let errorMessage = "Failed to reset password. Please try again.";

      // The apiRequest function now throws the response data directly
      if (err?.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      toast.error({
        title: "Password Reset Failed",
        description: errorMessage,
      });

      setIsLoading(false);
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isLoading || isMutating) {
      return;
    }

    setIsLoading(true);
    const { confirmPassword, ...rest } = data;

    resetPassword({ ...rest, token });
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-6 animate-in fade-in duration-500">
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full">
            <Shield className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Password Updated Successfully
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            Your password has been securely updated. You can now sign in with
            your new password.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onBack}
            variant="gradient"
            className="w-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" />
              Continue to Login
            </span>
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            Keep your password secure and don't share it with others.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <Lock className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Set New Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          Create a strong password to secure your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter your new password"
                    autoComplete="new-password"
                    error={fieldState.error?.message}
                    prefixIcon={<Lock className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>

                {currentPassword && (
                  <PasswordStrengthIndicator password={currentPassword} />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your new password"
                    autoComplete="new-password"
                    error={fieldState.error?.message}
                    prefixIcon={<Lock className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="space-y-4 pt-2">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full font-semibold h-12 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
              loading={isLoading}
              loadingText="Updating password..."
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                {isLoading ? "Updating..." : "Update Password"}
              </span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              onClick={onBack}
            >
              <span className="flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </span>
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          Make sure your password is unique and not used on other websites.
        </p>
      </div>
    </div>
  );
}
