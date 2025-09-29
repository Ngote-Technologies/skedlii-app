import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/hooks";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { AlertCircle, Sparkles, User, Mail, Lock } from "lucide-react";
import { useToast } from "../../hooks/use-toast";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z
      .boolean()
      .default(false)
      .refine((value) => value, {
        message: "You must agree to the terms and conditions",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onLogin?: () => void;
}

export default function RegisterForm({ onLogin }: Readonly<RegisterFormProps>) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const password = form.watch("password");

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...rest } = data;

      const registerData = {
        ...rest,
      };

      const response: any = await register(registerData);

      if (!response.success) {
        toast.error({
          title: "Registration Failed",
          description:
            response.message ?? "Please check your information and try again.",
        });
        return;
      }

      toast.success({
        title: "Welcome to Skedlii!",
        description: `Account created successfully for ${data.name}. You can now start managing your social media.`,
      });
    } catch (error: any) {
      console.error("[Unhandled Registration Exception]", error);
      toast.error({
        title: "Unexpected Error",
        description:
          error?.message ?? "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Name"
                    placeholder="Enter your first name"
                    autoComplete="given-name"
                    error={fieldState.error?.message}
                    clearable
                    onClear={() => field.onChange("")}
                    prefixIcon={<User className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    error={fieldState.error?.message}
                    clearable
                    onClear={() => field.onChange("")}
                    prefixIcon={<Mail className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    error={fieldState.error?.message}
                    helperText="At least 8 characters"
                    prefixIcon={<Lock className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {password && <PasswordStrengthIndicator password={password} />}

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <FormItem className="relative">
                <FormControl>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
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

          <FormField
            control={form.control}
            name="terms"
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <span className="text-sm font-normal text-gray-700 dark:text-gray-300">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4 transition-colors duration-200"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline underline-offset-4 transition-colors duration-200"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                  {fieldState.error && (
                    <FormMessage className="flex items-center gap-2">
                      <AlertCircle className="w-3 h-3" />
                      {fieldState.error.message}
                    </FormMessage>
                  )}
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            size="lg"
            variant="gradient"
            className="w-full font-semibold h-12 relative overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
            loading={isLoading}
            loadingText="Creating account..."
            disabled={isLoading}
          >
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              {isLoading ? "Creating account..." : "Create Account"}
            </span>
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
              Already have an account?
            </span>
          </div>
        </div>
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            className="font-medium hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 dark:hover:bg-primary-900/20 dark:hover:border-primary-700 dark:hover:text-primary-300 transition-all duration-200"
            onClick={() => onLogin?.() ?? navigate("/login")}
          >
            Sign in instead
          </Button>
        </div>
      </div>
    </div>
  );
}
