import { useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../store/hooks";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import { Card, CardContent } from "../components/ui/card";
import { AlertCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  if (!token || !email) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">
                Invalid or missing token/email.
              </h1>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Please check the link in your email.
            </p>

            <p className="mt-4 text-sm text-gray-600">
              <Link to="/">Go back to home</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="text-center mb-6">
        <Link to="/" className="inline-block">
          <div className="text-primary-600 dark:text-primary-400 text-3xl font-bold flex items-center">
            <i className="ri-calendar-check-fill mr-1"></i>
            <span className="font-heading">Skedlii</span>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
        <ResetPasswordForm
          onBack={() => navigate("/login")}
          token={token}
          email={email}
        />
      </div>

      <p className="mt-6 text-center text-sm">
        Remember your password?{" "}
        <Link to="/login">
          <span className="text-primary-600 dark:text-primary-400 hover:underline">
            Log in
          </span>
        </Link>
      </p>
    </div>
  );
}
