import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "../../store/hooks";
import { useToast } from "../../hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export default function LoginForm({
  onForgotPassword,
  onRegister,
}: Readonly<LoginFormProps>) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await login(data.email, data.password);

      if (!response.success) {
        toast({
          title: "Login failed",
          description: response.message ?? "Unknown error occurred",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Login successful",
        description: `Welcome back, ${
          response.data.user?.firstName ?? response.data.user?.email
        }!`,
        variant: "success",
      });
    } catch (error: any) {
      console.error("[Unhandled Login Exception]", error);
      toast({
        title: "Unexpected error",
        description: error?.message ?? "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced form with floating animations */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Email field with enhanced styling */}
          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <div className="relative group">
                    <div
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === "email"
                          ? "text-primary-500"
                          : fieldState.error
                          ? "text-destructive"
                          : "text-gray-400"
                      }`}
                    ></div>
                    <Input
                      label="Email Address"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      error={fieldState.error?.message}
                      clearable
                      onClear={() => field.onChange("")}
                      onFocus={() => setFocusedField("email")}
                      className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                      {...field}
                    />
                  </div>
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

          {/* Password field with enhanced styling */}
          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <div className="relative group">
                    <div
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-200 ${
                        focusedField === "password"
                          ? "text-primary-500"
                          : fieldState.error
                          ? "text-destructive"
                          : "text-gray-400"
                      }`}
                    ></div>
                    <Input
                      label="Password"
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      error={fieldState.error?.message}
                      onFocus={() => setFocusedField("password")}
                      className="pr-10 transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                      {...field}
                    />
                  </div>
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
          {/* Enhanced remember me and forgot password section */}
          <div className="flex items-center justify-between pt-2">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500"
                    />
                  </FormControl>
                  <FormLabel className="font-normal text-sm cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            <Button
              type="button"
              variant="link"
              className="p-0 h-auto text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
              onClick={() =>
                onForgotPassword?.() ?? navigate("/forgot-password")
              }
            >
              Forgot password?
            </Button>
          </div>

          {/* Enhanced submit button */}
          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full font-semibold h-12 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300"
            loading={isLoading}
            loadingText="Signing you in..."
            disabled={isLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              {isLoading ? "Signing you in..." : "Sign In"}
            </span>
          </Button>
        </form>
      </Form>

      {/* Enhanced footer with better styling */}
      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
              New to Skedlii?
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 dark:hover:text-primary-300 transition-all duration-200"
            onClick={() => onRegister?.() ?? navigate("/register")}
          >
            Create your account
          </Button>
        </div>
      </div>
    </div>
  );
}
