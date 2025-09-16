import React from "react";
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
// import { organizationsApi } from "../api/organizations"; // optional fetch for org name if needed later

const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, authLoading, fetchUserData } = useAuth();
  const queryClient = useQueryClient();

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
    mutationFn: (data: { token: string }) => invitationsApi.acceptInvitation(data.token),
    onSuccess: async () => {
      // Different handling based on whether user is logged in and if they already exist
      if (isLoggedIn) {
        // User is already logged in - they're joining a new organization
        try {
          // Refresh user data to get updated organization context
          await fetchUserData();
          
          // Invalidate React Query caches that might depend on user organizations
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
          queryClient.invalidateQueries({ queryKey: ['/organizations'] });
          queryClient.invalidateQueries({ queryKey: ['user'] });
          queryClient.invalidateQueries({ queryKey: ['teams'] });
          
          toast.success({
            title: "Successfully Joined Organization!",
            description: `You've been added to the organization. You can now access it from your dashboard.`,
          });

          // Redirect to dashboard with a short delay
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        } catch (error) {
          // Still show success but with a note about refreshing
          toast.success({
            title: "Successfully Joined Organization!",
            description: `You've been added to the organization. Please refresh if you don't see it yet.`,
          });
          
          setTimeout(() => {
            navigate("/dashboard");
          }, 2000);
        }
      } else {
        // Not logged in: direct user to login to accept
        toast.info({
          title: "Login Required",
          description: "Please log in with the invited email to accept the invitation.",
        });
        navigate("/login");
      }
    },
    onError: (error: any) => {
      toast.error({
        title: "Failed to Accept Invitation",
        description: error.response?.data?.error || error.message || "Something went wrong.",
      });
    },
  });

  const invitedEmail = invitation?.email?.toLowerCase();
  const loggedInEmail = user?.email?.toLowerCase();
  const emailMismatch = Boolean(isLoggedIn && invitedEmail && loggedInEmail && invitedEmail !== loggedInEmail);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Prevent submission if there's an email mismatch
    if (emailMismatch) {
      toast.warning({
        title: "Email Mismatch",
        description: "Please log out and use the correct account for this invitation.",
      });
      return;
    }
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    acceptMutation.mutate({ token });
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
                ? "You've been added to the organization"
                : "Login required to finish acceptance"}
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
          <CardTitle>Join Organization</CardTitle>
          <CardDescription>
            You've been invited to join as a <strong>{invitation.role}</strong>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input value={invitation.email} disabled className="mt-1" />
            </div>

            {/* No name data from verify; keep minimal details */}
          </div>

          {isLoggedIn ? (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You are currently logged in as {user?.email}. Accepting this
                invitation will add you to the organization.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please log in with the invited email to accept this invitation.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              className="w-full"
              disabled={acceptMutation.isPending || emailMismatch}
            >
              {acceptMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isLoggedIn ? "Joining organization..." : "Redirecting to login..."}
                </>
              ) : isLoggedIn ? (
                "Join Organization"
              ) : (
                "Log in to Accept"
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
