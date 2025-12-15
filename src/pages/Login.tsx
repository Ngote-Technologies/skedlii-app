import { Link } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";

export default function LoginPage() {
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
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Log in to Skedlii</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to access your account
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
