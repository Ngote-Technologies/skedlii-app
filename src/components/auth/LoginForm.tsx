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
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Sparkles, Mail, Lock } from "lucide-react";
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
        toast.error({
          title: "Login Failed",
          description:
            response.message ?? "Please check your credentials and try again.",
        });
        return;
      }

      toast.success({
        title: "Welcome Back!",
        description: `Successfully signed in as ${
          response.data.user?.firstName ?? response.data.user?.email
        }`,
      });
    } catch (error: any) {
      console.error("[Unhandled Login Exception]", error);
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    error={fieldState.error?.message}
                    prefixIcon={<Lock className="w-4 h-4" />}
                    className="transition-all duration-200 hover:border-primary-300 focus:border-primary-500 focus:ring-primary-500/20"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
