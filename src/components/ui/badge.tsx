import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-sm",
        outline:
          "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600 shadow-sm",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 shadow-sm",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600 shadow-sm",
        ghost:
          "border-transparent bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm",
        premium:
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm",
        glow: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-lg shadow-primary/25 hover:shadow-primary/40",
      },
      size: {
        sm: "h-5 px-2 py-0 text-xs rounded-md",
        default: "h-6 px-2.5 py-0.5 text-xs rounded-full",
        lg: "h-7 px-3 py-1 text-sm rounded-full",
        xl: "h-8 px-4 py-1.5 text-sm rounded-full",
      },
      interactive: {
        true: "cursor-pointer hover:scale-105 active:scale-95",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  pulse?: boolean;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      dismissible,
      onDismiss,
      icon,
      pulse,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || Boolean(onClick) || dismissible;

    return (
      <div
        ref={ref}
        className={cn(
          badgeVariants({ variant, size, interactive: isInteractive }),
          pulse && "animate-pulse",
          dismissible && "pr-1",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {icon && <span className="mr-1 flex items-center">{icon}</span>}
        <span className="truncate">{children}</span>
        {dismissible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
            }}
            className="ml-1 flex items-center justify-center h-3 w-3 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        )}
      </div>
    );
  }
);
Badge.displayName = "Badge";

// Badge Group component for multiple badges
const BadgeGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: "tight" | "normal" | "loose";
    wrap?: boolean;
  }
>(({ className, spacing = "normal", wrap = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center",
      spacing === "tight" && "gap-1",
      spacing === "normal" && "gap-2",
      spacing === "loose" && "gap-3",
      wrap && "flex-wrap",
      className
    )}
    {...props}
  />
));
BadgeGroup.displayName = "BadgeGroup";

// Status Badge component for common status indicators
interface StatusBadgeProps extends Omit<BadgeProps, "variant"> {
  status:
    | "online"
    | "offline"
    | "away"
    | "busy"
    | "active"
    | "inactive"
    | "pending"
    | "approved"
    | "rejected"
    | "draft"
    | "published"
    | "archived"
    | "expired"
    | "paid"
    | "pending"
    | "failed";
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, ...props }, ref) => {
    const getVariantFromStatus = (status: StatusBadgeProps["status"]) => {
      switch (status) {
        case "online":
        case "active":
        case "approved":
        case "published":
        case "paid":
          return "success";
        case "offline":
        case "inactive":
        case "rejected":
        case "archived":
        case "expired":
          return "destructive";
        case "away":
        case "pending":
        case "draft":
          return "warning";
        case "busy":
        case "failed":
          return "info";
        default:
          return "default";
      }
    };

    const getStatusIcon = (status: StatusBadgeProps["status"]) => {
      const iconClass = "h-2 w-2 rounded-full";
      switch (status) {
        case "online":
        case "active":
          return (
            <div className={cn(iconClass, "bg-green-400 animate-pulse")} />
          );
        case "offline":
        case "inactive":
          return <div className={cn(iconClass, "bg-gray-400")} />;
        case "away":
          return <div className={cn(iconClass, "bg-yellow-400")} />;
        case "busy":
        case "expired":
        case "failed":
          return <div className={cn(iconClass, "bg-red-400")} />;
        default:
          return null;
      }
    };

    return (
      <Badge
        ref={ref}
        variant={getVariantFromStatus(status)}
        icon={getStatusIcon(status)}
        {...props}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  }
);
StatusBadge.displayName = "StatusBadge";

// Notification Badge component
const NotificationBadge = React.forwardRef<
  HTMLDivElement,
  BadgeProps & {
    count?: number;
    showZero?: boolean;
    max?: number;
  }
>(
  (
    { count = 0, showZero = false, max = 99, className, children, ...props },
    ref
  ) => {
    const displayCount = count > max ? `${max}+` : count.toString();
    const shouldShow = count > 0 || showZero;

    if (!shouldShow && !children) return null;

    return (
      <Badge
        ref={ref}
        variant="destructive"
        size="sm"
        className={cn(
          "h-5 min-w-5 px-1 text-xs font-bold",
          count > 99 && "px-1.5",
          className
        )}
        {...props}
      >
        {children || displayCount}
      </Badge>
    );
  }
);
NotificationBadge.displayName = "NotificationBadge";

export {
  Badge,
  BadgeGroup,
  StatusBadge,
  NotificationBadge,
  badgeVariants,
  type StatusBadgeProps,
};
