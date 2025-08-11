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
import { EyeIcon, EyeOffIcon } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input 
                  label="Email"
                  type="email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  error={fieldState.error?.message}
                  clearable
                  onClear={() => field.onChange("")}
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
            <FormItem>
              <FormControl>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  error={fieldState.error?.message}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="font-normal text-sm cursor-pointer">
                  Remember me
                </FormLabel>
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto text-sm"
            onClick={() => onForgotPassword?.() ?? navigate("/forgot-password")}
          >
            Forgot password?
          </Button>
        </div>
        <Button 
          type="submit" 
          size="lg"
          className="w-full font-medium" 
          loading={isLoading}
          loadingText="Logging in..."
        >
          Log In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={() => onRegister?.() ?? navigate("/register")}
          >
            Sign up
          </Button>
        </p>
      </div>
    </Form>
  );
}
