import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { invitationsApi, VerifyInvitationResponse } from "../api/invitations";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../store/hooks";
import { useQueryClient } from '@tanstack/react-query';
import { useOrganizationStore } from '../store/organizationStore';

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authLoading, fetchUserData } = useAuth();
  const queryClient = useQueryClient();
  const { fetchUserOrganizations } = useOrganizationStore();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const token = searchParams.get("token");
  const isLoggedIn = !!user;

  // Verify invitation query
  const {
    data: invitation,
    isLoading: isVerifying,
    error: verifyError,
  } = useQuery<VerifyInvitationResponse>({
    queryKey: ["invitation", token],
    queryFn: () => invitationsApi.verifyInvitation(token!),
    enabled: !!token,
    retry: false,
  });

  // Accept invitation mutation
  const acceptMutation = useMutation({
    mutationFn: (data: { token: string; password?: string }) =>
      invitationsApi.acceptInvitation(data.token, data.password),
    onSuccess: async () => {
      // Different handling based on whether user is logged in and if they already exist
      if (isLoggedIn) {
        // User is already logged in - they're joining a new organization
        try {
          // Refresh user data and organizations to get updated lists
          await Promise.all([
            fetchUserData(),
            fetchUserOrganizations()
          ]);
          
          // Invalidate React Query caches that might depend on user organizations
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
          queryClient.invalidateQueries({ queryKey: ['/organizations'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          
          toast.success({
            title: "Successfully Joined Organization!",
            description: `You've been added to ${invitation?.organizationName}. You can now switch to this organization from your dashboard.`,
          });

          // Redirect to dashboard with a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } catch (error) {
          // Still show success but with a note about refreshing
          toast.success({
            title: "Successfully Joined Organization!",
            description: `You've been added to ${invitation?.organizationName}. Please refresh the page to see the new organization.`,
          });
          
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } else {
        // User is not logged in
        toast.success({
          title: "Invitation Accepted!",
          description: invitation?.userExists
            ? `You've been added to ${invitation.organizationName}. Please log in to access this organization.`
            : "Your account has been created successfully. You can now log in.",
        });

        // Redirect to login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    },
    onError: (error: any) => {
      toast.error({
        title: "Failed to Accept Invitation",
        description: error.response?.data?.error || error.message || "Something went wrong.",
      });
    },
  });

  // Validate password
  const validatePassword = (pwd: string): string[] => {
    const errors: string[] = [];
    if (pwd.length < 8)
      errors.push("Password must be at least 8 characters long");
    if (!/[A-Z]/.test(pwd))
      errors.push("Password must contain at least one uppercase letter");
    if (!/[a-z]/.test(pwd))
      errors.push("Password must contain at least one lowercase letter");
    if (!/[0-9]/.test(pwd))
      errors.push("Password must contain at least one number");
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd))
      errors.push("Password must contain at least one special character");
    return errors;
  };

  // Handle password change
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordErrors(validatePassword(value));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Prevent submission if there's an email mismatch
    if (invitation?.emailMismatch) {
      toast.warning({
        title: "Email Mismatch",
        description: "Please log out and use the correct account for this invitation.",
      });
      return;
    }

    // Determine if password is needed:
    // - If user is logged in, no password needed (they're joining a new org)
    // - If user is not logged in and invitation is for existing user, no password needed
    // - If user is not logged in and invitation is for new user, password is required
    const needsPassword = !isLoggedIn && !invitation?.userExists;

    // For new users (not logged in), validate password
    if (needsPassword) {
      if (passwordErrors.length > 0) {
        toast.error({
          title: "Invalid Password",
          description: "Please fix the password requirements.",
        });
        return;
      }

      if (password !== confirmPassword) {
        toast.error({
          title: "Passwords Do Not Match",
          description: "Please make sure both passwords are identical.",
        });
        return;
      }
    }

    acceptMutation.mutate({
      token,
      password: needsPassword ? password : undefined,
    });
  };

  // Loading state (auth or invitation verification)
  if (authLoading || isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">
              {authLoading ? "Loading..." : "Verifying invitation..."}
            </span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (verifyError || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation is invalid, expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state (after acceptance)
  if (acceptMutation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              {isLoggedIn
                ? `You've been added to ${invitation.organizationName}`
                : invitation.userExists
                ? `You've been added to ${invitation.organizationName}`
                : "Your account has been created successfully"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-600">
              Redirecting you to {isLoggedIn ? "your dashboard" : "login"}...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main invitation acceptance form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Join {invitation.organizationName}</CardTitle>
          <CardDescription>
            You've been invited to join{" "}
            <strong>{invitation.organizationName}</strong> as a{" "}
            <strong>{invitation.role}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input value={invitation.email} disabled className="mt-1" />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Name</Label>
              <Input
                value={`${invitation.firstName} ${invitation.lastName}`}
                disabled
                className="mt-1"
              />
            </div>
          </div>

          {isLoggedIn ? (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently logged in as {user?.email}. Accepting this
                invitation will add you to {invitation.organizationName}.
              </AlertDescription>
            </Alert>
          ) : invitation.emailMismatch ? (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This invitation is for a different account. Please log out and try again with the correct account.
              </AlertDescription>
            </Alert>
          ) : invitation.userExists ? (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You already have an account. Accepting this invitation will add
                you to {invitation.organizationName}. You'll need to log in
                afterwards.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4 mb-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will create a new account for you. Please set a secure
                  password.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="mt-1"
                  placeholder="Enter a secure password"
                />
                {passwordErrors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">
                        {error}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Confirm your password"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              className="w-full"
              disabled={
                acceptMutation.isPending ||
                invitation.emailMismatch ||
                (!isLoggedIn &&
                  !invitation.userExists &&
                  passwordErrors.length > 0)
              }
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isLoggedIn
                    ? "Joining organization..."
                    : invitation.userExists
                    ? "Joining organization..."
                    : "Creating account..."}
                </>
              ) : isLoggedIn ? (
                "Join Organization"
              ) : (
                "Accept Invitation"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-sm"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
