import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../store/hooks";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

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
        <ForgotPasswordForm onBack={() => navigate("/login")} />
      </div>
    </div>
  );
}
