import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import {
  BarChart3,
  CalendarCheck,
  Folder,
  Home,
  Link2,
  Users,
  Settings,
  CalendarSync,
  Plus,
  HelpCircle,
  CreditCard,
  X,
} from "lucide-react";
import { useAuth } from "../store/hooks";
import { useMemo } from "react";
import { ScrollArea } from "../components/ui/scroll-area";
import { hasValidSubscription } from "../lib/access";

export default function DashboardSidebar({
  closeMenu,
  isMobile = false,
}: {
  readonly closeMenu?: () => void;
  readonly isMobile?: boolean;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const { billing } = user;

  const menuItems = useMemo(
    () => [
      {
        icon: <Home size={18} />,
        label: "Dashboard",
        href: "/dashboard",
      },
      {
        icon: <Link2 size={18} />,
        label: "Social Accounts",
        href: "/dashboard/accounts",
      },
      {
        icon: <CalendarCheck size={18} />,
        label: "Scheduled",
        href: "/dashboard/scheduled",
      },
      {
        icon: <CalendarSync size={18} />,
        label: "Posts",
        href: "/dashboard/posts",
      },
      {
        icon: <CalendarSync size={18} />,
        label: "Post Flow",
        href: "/dashboard/post-flow",
        disabled: !hasValidSubscription(billing?.paymentStatus),
      },
      {
        icon: <Folder size={18} />,
        label: "Collections",
        href: "/dashboard/collections",
        disabled: !hasValidSubscription(billing?.paymentStatus),
      },
      {
        icon: <Users size={18} />,
        label: "Teams",
        href: "/dashboard/teams",
        disabled: user?.userType === "individual",
      },
      {
        icon: <BarChart3 size={18} />,
        label: "Analytics",
        href: "/dashboard/analytics",
        disabled: !hasValidSubscription(billing?.paymentStatus),
      },
    ],
    [isAdmin, billing]
  );

  const bottomNavItems = [
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      label: "Billing",
      href: "/dashboard/billing",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      label: "Help & Support",
      href: "/dashboard/help",
      icon: <HelpCircle className="h-5 w-5" />,
    },
  ];

  const handleNavigation = () => {
    if (closeMenu && isMobile) {
      closeMenu();
    }
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full w-64 border-r bg-background px-3 py-4 z-40 overflow-y-auto",
        isMobile && "relative w-full"
      )}
      style={{ top: "auto" }}
    >
      <ScrollArea className="flex-1">
        {isMobile && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => closeMenu?.()}
              className="relative"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-2 p-4">
          <Button
            variant="premium"
            onClick={() => navigate("/dashboard/post-flow")}
            className="w-full sm:w-auto mb-8 font-semibold"
            disabled={!hasValidSubscription(billing?.paymentStatus)}
            icon={<Plus size={16} />}
            iconPosition="left"
          >
            Create Post
          </Button>
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className={cn(
                  "w-full justify-start font-normal",
                  location.pathname === item.href &&
                    "bg-accent text-accent-foreground",
                  item.disabled && "hidden"
                )}
                asChild
                onClick={() => handleNavigation()}
              >
                <Link to={item.href}>
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
      <div className="flex flex-col gap-2 border-t p-4">
        <nav className="space-y-1">
          {bottomNavItems.map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start font-normal",
                location.pathname === item.href &&
                  "bg-accent text-accent-foreground"
              )}
              asChild
              onClick={() => handleNavigation()}
            >
              <Link to={item.href}>
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
