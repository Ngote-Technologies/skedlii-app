import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { ThemeToggle } from "../../components/ui/theme-toggle";
import { useAuth } from "../../store/hooks";
import { HashLink } from "react-router-hash-link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "../../components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { getInitials } from "../../lib/utils";
import {
  Menu,
  Calendar,
  LayoutGrid,
  Users,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  InfoIcon,
} from "lucide-react";
import { useMobileMenuStore } from "../../store/layout";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  const handleLogin = () => {
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    navigate("/login");
  };

  const mobileMenuOpen = useMobileMenuStore(
    (state: any) => state.mobileMenuOpen
  );
  const setMobileMenuOpen = useMobileMenuStore(
    (state: any) => state.setMobileMenuOpen
  );

  const isDashboard = location.pathname.startsWith("/dashboard");

  // Detect scroll for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-md dark:bg-gray-900/90"
          : "bg-transparent dark:bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
        <Link
          to="/"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center space-x-2 relative z-10"
        >
          <div
            className={`font-bold flex items-center transition-all duration-300 ${
              scrolled
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-900 dark:text-white"
            }`}
          >
            <div className="flex items-center justify-center bg-primary-600 text-white rounded-xl p-1.5 mr-2 shadow-md">
              <Calendar className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-2xl text-gray-900 dark:text-white">
              Skedlii
            </span>
          </div>
        </Link>

        {!isDashboard && (
          <nav className="hidden lg:flex items-center">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-full px-1 py-1 shadow-sm border border-gray-100 dark:border-gray-700 mr-4">
              <div className="flex space-x-1">
                <HashLink
                  smooth
                  to="/"
                  elementId="features"
                  className={`px-4 rounded-full text-sm font-medium transition-colors ${
                    location.pathname.includes("/#features")
                      ? "bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Features
                </HashLink>
                <HashLink
                  smooth
                  to="/"
                  elementId="pricing"
                  className={`px-4 rounded-full text-sm font-medium transition-colors ${
                    location.pathname.includes("/pricing")
                      ? "bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Pricing
                </HashLink>
                {/* <HashLink
                  smooth
                  to="/"
                  elementId="testimonials"
                  className={`px-4 rounded-full text-sm font-medium transition-colors ${
                    location.pathname.includes("/testimonials")
                      ? "bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Testimonials
                </HashLink> */}
                <Link
                  to="/help"
                  className={`px-4 rounded-full text-sm font-medium transition-colors ${
                    location.pathname.includes("/help")
                      ? "bg-primary-100 text-primary-900 dark:bg-primary-900/20 dark:text-primary-300"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  }`}
                >
                  Help
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {isAuthenticated ? (
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex items-center space-x-2 h-10 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Avatar className="h-8 w-8 border-2 border-primary-100 dark:border-gray-700">
                          <AvatarImage
                            src={user?.avatar}
                            alt={user?.firstName ?? ""}
                          />
                          <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-primary-400 font-medium text-sm">
                            {getInitials(user?.firstName ?? "")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm hidden md:inline-block">
                          {user?.firstName}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-2">
                      <div className="flex flex-col space-y-1 p-2 mb-2">
                        <p className="text-sm font-medium">
                          {user?.firstName ?? ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuItem className="cursor-pointer flex items-center py-2">
                        <LayoutGrid className="mr-2 h-4 w-4" />
                        <Link to="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer flex items-center py-2">
                        <Settings className="mr-2 h-4 w-4" />
                        <Link to="/dashboard/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer flex items-center py-2 text-red-600 dark:text-red-400"
                        onClick={() => logout()}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={handleLogin}
                    className="font-medium text-gray-700 hover:text-primary-600 dark:text-gray-200 dark:hover:text-primary-400"
                  >
                    Sign In
                  </Button>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium shadow-lg shadow-primary-500/20 dark:shadow-none rounded-full px-6 p-1.5"
                  >
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </nav>
        )}

        {isDashboard && (
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Bell className="h-5 w-5" />
            </Button>

            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 h-10 px-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Avatar className="h-8 w-8 border-2 border-primary-100 dark:border-gray-700">
                    <AvatarImage
                      src={user?.avatar}
                      alt={user?.firstName ?? ""}
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700 dark:bg-gray-800 dark:text-primary-400 font-medium text-sm">
                      {getInitials(user?.firstName ?? "")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm hidden md:inline-block">
                    {user?.firstName ?? ""}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <div className="flex flex-col space-y-1 p-2 mb-2">
                  <p className="text-sm font-medium">{user?.firstName ?? ""}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuItem className="cursor-pointer flex items-center py-2">
                  <Settings className="mr-2 h-4 w-4" />
                  <Link to="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer flex items-center py-2 text-red-600 dark:text-red-400"
                  onClick={() => logout()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="border-l border-gray-200 dark:border-gray-700"
          >
            <div className="px-2">
              <Link to="/" className="flex items-center space-x-2 mb-10">
                <div className="text-primary-600 dark:text-primary-400 font-bold flex items-center">
                  <div className="flex items-center justify-center bg-primary-600 text-white rounded-xl p-1.5 mr-2">
                    <Calendar className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className="font-heading text-2xl">Skedlii</span>
                </div>
              </Link>

              <div className="flex flex-col space-y-1">
                {!isDashboard ? (
                  <>
                    <HashLink
                      smooth
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      elementId="features"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <LayoutGrid className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">Features</span>
                    </HashLink>
                    <HashLink
                      smooth
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      elementId="pricing"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">Pricing</span>
                    </HashLink>
                    {/* <HashLink
                      smooth
                      to="/"
                      onClick={() => setMobileMenuOpen(false)}
                      elementId="testimonials"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">Testimonials</span>
                    </HashLink> */}
                    <Link
                      to="/help"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <InfoIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      <span className="font-medium">Help</span>
                    </Link>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    {isAuthenticated ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <LayoutGrid className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium">Dashboard</span>
                          </div>
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="font-medium">Settings</span>
                          </div>
                        </Link>
                        <button
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer"
                          onClick={() => {
                            logout();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-3 pt-2">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={handleLogin}
                        >
                          Sign In
                        </Button>
                        <Button
                          className="w-full justify-start bg-gradient-to-r from-primary-500 to-primary-600"
                          onClick={() => {
                            navigate("/register");
                            setMobileMenuOpen(false);
                          }}
                        >
                          Start Free Trial
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  // Dashboard mobile menu
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <LayoutGrid className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Dashboard</span>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/post-flow"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Create Post</span>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/scheduled"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Schedule</span>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/accounts"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Social Accounts</span>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/collections"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Collections</span>
                      </div>
                    </Link>
                    <Link
                      to="/dashboard/organizations/teams"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Users className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Teams</span>
                      </div>
                    </Link>

                    <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                    <Link
                      to="/dashboard/settings"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                        <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium">Settings</span>
                      </div>
                    </Link>
                    <button
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 cursor-pointer"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-5 w-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-6 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Switch theme
                  </span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
