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
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { apiRequest } from "../../lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  readonly onSuccess?: () => void;
  readonly onBack?: () => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onBack,
}: ForgotPasswordFormProps) {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate: forgotPassword, isPending: isForgotPasswordPending } =
    useMutation({
      mutationFn: async (data: ForgotPasswordFormData) => {
        return await apiRequest("POST", "/auth/forgot-password", data);
      },
      onSuccess: () => {
        setIsSubmitted(true);
      },
      onError: () => {
        toast.error({
          title: "Reset Link Failed",
          description: "Failed to send password reset link. Please try again.",
        });
      },
    });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      forgotPassword(data);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error({
        title: "Reset Link Failed",
        description: "Failed to send password reset link. Please try again.",
      });
    }
  };

  const isLoading = isForgotPasswordPending;

  if (isSubmitted) {
    return (
      <div className="text-center py-8 space-y-6 animate-in fade-in duration-500">
        {/* Enhanced success icon with animation */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full opacity-20 animate-pulse"></div>
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full">
            <CheckCircle className="w-10 h-10 text-white animate-bounce" />
          </div>
        </div>

        {/* Enhanced success message */}
        <div className="space-y-3">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Check your email
          </h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
            We've sent a password reset link to{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {form.getValues("email")}
            </span>
            . The link will expire in 24 hours.
          </p>
        </div>

        {/* Enhanced action buttons */}
        <div className="space-y-3">
          <Button
            variant="gradient"
            onClick={onBack}
            className="w-full h-11 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <span className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </span>
          </Button>

          <p className="text-xs text-gray-500 dark:text-gray-500">
            Didn't receive the email? Check your spam folder or try again in a
            few minutes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced header section */}
      <div className="text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Reset Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto leading-relaxed">
          Enter your email address and we'll send you a secure link to reset
          your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Enhanced email field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    autoComplete="email"
                    error={fieldState.error?.message}
                    prefixIcon={<Mail className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
                {fieldState.error && (
                  <FormMessage className="flex items-center gap-2 mt-2">
                    <AlertCircle className="w-4 h-4" />
                    {fieldState.error.message}
                  </FormMessage>
                )}
              </FormItem>
            )}
          />

          {/* Enhanced action buttons */}
          <div className="space-y-4 pt-2">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full font-semibold h-12 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
              loading={isLoading}
              loadingText="Sending reset link..."
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                {isLoading ? "Sending..." : "Send Reset Link"}
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
                Back to login
              </span>
            </Button>
          </div>
        </form>
      </Form>

      {/* Enhanced help text */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-500 max-w-xs mx-auto leading-relaxed">
          Remember your password?{" "}
          <button
            type="button"
            onClick={onBack}
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4 transition-colors duration-200"
          >
            Sign in instead
          </button>
        </p>
      </div>
    </div>
  );
}
