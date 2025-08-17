"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X, AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

import { cn } from "../../lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Enhanced Dialog Content with variants
const dialogContentVariants = cva(
  "fixed left-1/2 top-1/2 z-50 w-full translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
  {
    variants: {
      variant: {
        default: "rounded-xl border-border",
        elevated: "rounded-xl border-0 shadow-2xl",
        blur: "rounded-xl border-border/50 backdrop-blur-md bg-background/95",
        gradient: "rounded-xl border-primary/20 bg-gradient-to-br from-background via-background to-primary/5",
      },
      size: {
        sm: "max-w-sm",
        default: "max-w-lg",
        lg: "max-w-2xl", 
        xl: "max-w-4xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  isLoading?: boolean;
  onClose?: () => void;
  hideCloseButton?: boolean;
  preventOutsideClick?: boolean;
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, variant, size, children, isLoading, onClose, hideCloseButton = false, preventOutsideClick = false, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      onPointerDownOutside={(e) => {
        if (preventOutsideClick) {
          e.preventDefault();
        }
      }}
      onEscapeKeyDown={(e) => {
        if (preventOutsideClick) {
          e.preventDefault();
        }
      }}
      className={cn(dialogContentVariants({ variant, size }), className)}
      {...props}
    >
      <div className="relative max-h-[90vh]">
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close
            disabled={isLoading}
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </div>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    centered?: boolean;
  }
>(({ className, centered = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5",
      centered ? "text-center" : "text-left",
      className
    )}
    {...props}
  />
));
DialogHeader.displayName = "DialogHeader";

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    justify?: "start" | "center" | "end" | "between";
    stacked?: boolean;
  }
>(({ className, justify = "end", stacked = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex gap-2 pt-4",
      stacked ? "flex-col" : "flex-row",
      !stacked && justify === "start" && "justify-start",
      !stacked && justify === "center" && "justify-center", 
      !stacked && justify === "end" && "justify-end",
      !stacked && justify === "between" && "justify-between",
      className
    )}
    {...props}
  />
));
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    level?: 1 | 2 | 3;
    gradient?: boolean;
  }
>(({ className, level = 2, gradient = false, ...props }, ref) => {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <DialogPrimitive.Title
      ref={ref}
      asChild
      className={className}
      {...props}
    >
      <Component
        className={cn(
          "font-semibold leading-tight tracking-tight",
          level === 1 && "text-2xl",
          level === 2 && "text-xl",
          level === 3 && "text-lg",
          gradient && "bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent",
          className
        )}
      >
        {props.children}
      </Component>
    </DialogPrimitive.Title>
  );
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description> & {
    muted?: boolean;
  }
>(({ className, muted = true, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      muted ? "text-muted-foreground" : "text-foreground/80",
      className
    )}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// Enhanced Dialog Types for common use cases
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  variant?: "default" | "destructive" | "warning";
  isLoading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Info className="h-6 w-6 text-blue-500" />;
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent preventOutsideClick={isLoading}>
        <DialogHeader centered>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter justify="center">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                onCancel?.();
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variant === "destructive" && "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                variant === "warning" && "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
                variant === "default" && "bg-primary hover:bg-primary/90 focus:ring-primary",
                isLoading && "cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Loading...
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Success Dialog Component  
interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  actionText = "Continue",
  onAction,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="elevated">
        <DialogHeader centered>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter justify="center">
          <button
            type="button"
            onClick={() => {
              onAction?.();
              onOpenChange(false);
            }}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {actionText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  ConfirmDialog,
  SuccessDialog,
  dialogContentVariants,
  type DialogContentProps,
  type ConfirmDialogProps,
  type SuccessDialogProps,
};