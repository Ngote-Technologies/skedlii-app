import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        // Existing variants (preserved with subtle enhancements)
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground hover:shadow-sm hover:border-accent-foreground/20",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",

        // NEW: Subtle variant for navigation/sidebar use
        subtle:
          "hover:bg-accent/50 hover:text-accent-foreground transition-colors duration-150",

        // NEW: Enhanced gradient variants
        gradient:
          "bg-gradient-to-r from-primary via-primary to-primary-foreground text-white hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.05] active:scale-[0.95] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        premium:
          "bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-purple/25 hover:scale-[1.05] active:scale-[0.95] before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/10 before:to-white/0 before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700",
        success:
          "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green/25 hover:scale-[1.05] active:scale-[0.95]",
        warning:
          "bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-orange/25 hover:scale-[1.05] active:scale-[0.95]",
      },
      size: {
        // Existing sizes (preserved)
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",

        // NEW: Additional sizes
        xs: "h-8 rounded-md px-2 text-xs",
        xl: "h-12 rounded-lg px-10 text-base font-semibold",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  // NEW: Enhanced features (all optional for backward compatibility)
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  ripple?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      ripple = true,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const [ripples, setRipples] = React.useState<
      Array<{ id: number; x: number; y: number }>
    >([]);

    // Ripple effect handler
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (ripple && !loading && !disabled) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const newRipple = { id: Date.now(), x, y };

          setRipples((prev) => [...prev, newRipple]);

          // Remove ripple after animation
          setTimeout(() => {
            setRipples((prev) =>
              prev.filter((ripple) => ripple.id !== newRipple.id)
            );
          }, 600);
        }

        if (onClick && !loading && !disabled) {
          onClick(e);
        }
      },
      [ripple, loading, disabled, onClick]
    );

    const buttonContent = (
      <>
        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ping pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
            }}
          />
        ))}

        {/* Loading spinner */}
        {loading && (
          <Loader2
            className={cn(
              "animate-spin",
              size === "xs"
                ? "h-3 w-3"
                : size === "sm"
                ? "h-3 w-3"
                : size === "lg"
                ? "h-5 w-5"
                : size === "xl"
                ? "h-6 w-6"
                : "h-4 w-4"
            )}
          />
        )}

        {/* Left icon */}
        {!loading && icon && iconPosition === "left" && (
          <span className={cn("flex items-center", children && "mr-1")}>
            {icon}
          </span>
        )}

        {/* Button text */}
        {loading && loadingText ? loadingText : children}

        {/* Right icon */}
        {!loading && icon && iconPosition === "right" && (
          <span className={cn("flex items-center", children && "ml-1")}>
            {icon}
          </span>
        )}
      </>
    );

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
