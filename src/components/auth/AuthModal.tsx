import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import {
  LogIn,
  UserPlus,
  KeyRound,
  ArrowLeft,
  Sparkles,
  Shield,
  Users,
} from "lucide-react";

interface AuthModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly type: "login" | "register";
}

export default function AuthModal({ isOpen, onClose, type }: AuthModalProps) {
  const [activeView, setActiveView] = useState<
    "login" | "register" | "forgot-password"
  >(type);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset view when modal opens with different type
  useEffect(() => {
    if (isOpen) {
      setActiveView(type);
    }
  }, [isOpen, type]);

  const handleViewChange = (newView: "login" | "register" | "forgot-password") => {
    if (newView === activeView) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setActiveView(newView);
      setIsAnimating(false);
    }, 150);
  };

  const goToLogin = () => handleViewChange("login");
  const goToRegister = () => handleViewChange("register");
  const goToForgotPassword = () => handleViewChange("forgot-password");

  const getViewConfig = () => {
    switch (activeView) {
      case "login":
        return {
          icon: <LogIn className="w-6 h-6" />,
          title: "Welcome Back",
          description: "Sign in to your Skedlii account",
          color: "from-blue-500 to-blue-600",
        };
      case "register":
        return {
          icon: <UserPlus className="w-6 h-6" />,
          title: "Join Skedlii",
          description: "Create your account and start managing social media",
          color: "from-purple-500 to-purple-600",
        };
      case "forgot-password":
        return {
          icon: <KeyRound className="w-6 h-6" />,
          title: "Reset Password",
          description: "We'll send you a secure reset link",
          color: "from-emerald-500 to-emerald-600",
        };
    }
  };

  const viewConfig = getViewConfig();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="sm:max-w-md overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary-200/20 dark:bg-primary-900/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-secondary-200/20 dark:bg-secondary-900/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <DialogHeader className="relative">
          {/* Enhanced Header with Icon */}
          <div className="flex flex-col items-center mb-2">
            <div 
              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${viewConfig.color} text-white flex items-center justify-center mb-4 shadow-lg transform transition-all duration-300 ${isAnimating ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}
            >
              {viewConfig.icon}
            </div>
            
            <DialogTitle className={`text-center text-2xl font-bold font-heading transition-all duration-300 ${isAnimating ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              {viewConfig.title}
            </DialogTitle>
            
            <DialogDescription className={`text-center text-gray-600 dark:text-gray-400 mt-2 transition-all duration-300 ${isAnimating ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              {viewConfig.description}
            </DialogDescription>
          </div>

          {/* Back button for forgot password */}
          {activeView === "forgot-password" && (
            <button
              onClick={goToLogin}
              className="absolute left-0 top-0 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 group"
              type="button"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-colors duration-200" />
            </button>
          )}
        </DialogHeader>

        {activeView === "forgot-password" ? (
          <div className={`transition-all duration-300 ${isAnimating ? 'opacity-50 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <ForgotPasswordForm onBack={goToLogin} />
          </div>
        ) : (
          <div className="relative">
            <Tabs
              value={activeView}
              onValueChange={(value) => handleViewChange(value as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 relative overflow-hidden bg-gray-100 dark:bg-gray-800">
                {/* Enhanced tab triggers with icons */}
                <TabsTrigger 
                  value="login" 
                  className="relative flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="font-medium">Login</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="register"
                  className="relative flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-white/50 dark:hover:bg-gray-700/50"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="font-medium">Register</span>
                </TabsTrigger>
              </TabsList>

              <div className="relative overflow-hidden">
                <TabsContent 
                  value="login" 
                  className={`transition-all duration-300 ${isAnimating ? 'opacity-50 translate-x-4' : 'opacity-100 translate-x-0'}`}
                >
                  <LoginForm
                    onForgotPassword={goToForgotPassword}
                    onRegister={goToRegister}
                  />
                </TabsContent>
                
                <TabsContent 
                  value="register" 
                  className={`transition-all duration-300 ${isAnimating ? 'opacity-50 translate-x-4' : 'opacity-100 translate-x-0'}`}
                >
                  <RegisterForm onLogin={goToLogin} />
                </TabsContent>
              </div>
            </Tabs>

            {/* Social proof indicators */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>50K+ Creators</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Free Trial</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
