import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

// Enhanced Card variants
const cardVariants = cva(
  "rounded-xl bg-card text-card-foreground transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border shadow-sm hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg border-0",
        outlined:
          "border-2 border-primary/20 hover:border-primary/40 shadow-none",
        ghost: "border-0 shadow-none hover:bg-accent/50",
        gradient:
          "bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-primary/10 shadow-sm hover:shadow-md",
        premium:
          "bg-gradient-to-br from-amber-50/50 via-background to-orange-50/50 dark:from-amber-950/20 dark:via-background dark:to-orange-950/20 border border-amber-200/50 dark:border-amber-800/50 shadow-sm hover:shadow-md",
        success:
          "bg-gradient-to-br from-green-50/50 via-background to-emerald-50/50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20 border border-green-200/50 dark:border-green-800/50",
        warning:
          "bg-gradient-to-br from-yellow-50/50 via-background to-amber-50/50 dark:from-yellow-950/20 dark:via-background dark:to-amber-950/20 border border-yellow-200/50 dark:border-yellow-800/50",
        danger:
          "bg-gradient-to-br from-red-50/50 via-background to-rose-50/50 dark:from-red-950/20 dark:via-background dark:to-rose-950/20 border border-red-200/50 dark:border-red-800/50",
      },
      size: {
        default: "",
        sm: "p-3",
        lg: "p-8",
      },
      interactive: {
        true: "cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
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

interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      size,
      interactive,
      loading,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const isInteractive = interactive || Boolean(onClick);

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive: isInteractive }),
          loading && "opacity-60 animate-pulse",
          className
        )}
        onClick={onClick}
        {...props}
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin h-6 w-6 border-2 border-muted-foreground border-t-transparent rounded-full" />
          </div>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean;
    withBorder?: boolean;
  }
>(({ className, compact = false, withBorder = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      compact ? "p-4 pb-2" : "p-6 pb-3",
      withBorder && "border-b border-border/50",
      className
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    level?: 1 | 2 | 3 | 4;
    gradient?: boolean;
  }
>(({ className, level = 2, gradient = false, ...props }, ref) => {
  const headingClasses = cn(
    "font-semibold leading-tight tracking-tight",
    level === 1 && "text-3xl",
    level === 2 && "text-xl",
    level === 3 && "text-lg",
    level === 4 && "text-base",
    gradient &&
      "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
    className
  );

  switch (level) {
    case 1:
      return <h1 ref={ref} className={headingClasses} {...props} />;
    case 3:
      return <h3 ref={ref} className={headingClasses} {...props} />;
    case 4:
      return <h4 ref={ref} className={headingClasses} {...props} />;
    default:
      return <h2 ref={ref} className={headingClasses} {...props} />;
  }
});
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    muted?: boolean;
  }
>(({ className, muted = true, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      muted ? "text-muted-foreground" : "text-foreground/80",
      className
    )}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean;
    noPadding?: boolean;
  }
>(({ className, compact = false, noPadding = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(!noPadding && (compact ? "p-4 pt-2" : "p-6 pt-3"), className)}
    {...props}
  />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    compact?: boolean;
    withBorder?: boolean;
    justify?: "start" | "center" | "end" | "between";
  }
>(
  (
    {
      className,
      compact = false,
      withBorder = false,
      justify = "start",
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        compact ? "p-4 pt-2" : "p-6 pt-3",
        withBorder && "border-t border-border/50 mt-4",
        justify === "start" && "justify-start",
        justify === "center" && "justify-center",
        justify === "end" && "justify-end",
        justify === "between" && "justify-between",
        className
      )}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

// Enhanced Card Badge component for status indicators
const CardBadge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "success" | "warning" | "danger" | "info";
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
      variant === "default" && "bg-secondary text-secondary-foreground",
      variant === "success" &&
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      variant === "warning" &&
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      variant === "danger" &&
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      variant === "info" &&
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      className
    )}
    {...props}
  />
));
CardBadge.displayName = "CardBadge";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardBadge,
  cardVariants,
  type CardProps,
};
