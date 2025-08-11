import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../store/hooks";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../ui/checkbox";

const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z
      .boolean()
      .default(false)
      .refine((value) => value, {
        message: "You must agree to the terms and conditions",
      }),
    userType: z.enum(["individual", "organization"], {
      required_error: "Please select a user type",
      invalid_type_error: "Invalid user type",
    }),
    organizationName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => (data.userType === "organization" ? data.organizationName : true),
    {
      message: "Organization name is required",
      path: ["organizationName"],
    }
  );

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onLogin?: () => void;
}

export default function RegisterForm({ onLogin }: Readonly<RegisterFormProps>) {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
      userType: "individual",
      organizationName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, organizationName, ...rest } = data;

      const registerData = {
        ...rest,
        ...(organizationName !== "" && { organizationName }),
      };

      await register(registerData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input 
                  label="First Name"
                  placeholder="Enter your first name"
                  autoComplete="given-name"
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
          name="lastName"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input 
                  label="Last Name"
                  placeholder="Enter your last name"
                  autoComplete="family-name"
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
          name="userType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Type</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="organization" disabled>
                      Organization (coming soon)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("userType") === "organization" && (
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormControl>
                  <Input 
                    label="Organization Name"
                    placeholder="Enter your organization name"
                    error={fieldState.error?.message}
                    clearable
                    onClear={() => field.onChange("")}
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a secure password"
                  autoComplete="new-password"
                  error={fieldState.error?.message}
                  helperText="At least 8 characters"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormControl>
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  error={fieldState.error?.message}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel style={{ marginTop: 0 }}>
                I agree to the{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  <Link to="/terms"> Terms of Service </Link>
                </span>
                and{" "}
                <span className="text-primary-600 dark:text-primary-400">
                  <Link to="/privacy"> Privacy Policy</Link>
                </span>
              </FormLabel>
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          size="lg"
          className="w-full font-medium" 
          loading={isLoading}
          loadingText="Creating account..."
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Button
            type="button"
            variant="link"
            className="p-0 h-auto"
            onClick={() => onLogin?.() ?? navigate("/login")}
          >
            Log in
          </Button>
        </p>
      </div>
    </Form>
  );
}
