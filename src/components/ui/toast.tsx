import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

import { cn } from "../../lib/utils"
import { ToastProgress } from "./toast-progress"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px] gap-2",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start space-x-3 overflow-hidden rounded-xl border-0 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  {
    variants: {
      variant: {
        default: "bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 border border-gray-200/50 dark:border-gray-700/50",
        destructive: "bg-red-50/95 dark:bg-red-950/95 text-red-900 dark:text-red-100 border border-red-200/50 dark:border-red-800/50",
        success: "bg-green-50/95 dark:bg-green-950/95 text-green-900 dark:text-green-100 border border-green-200/50 dark:border-green-800/50",
        warning: "bg-amber-50/95 dark:bg-amber-950/95 text-amber-900 dark:text-amber-100 border border-amber-200/50 dark:border-amber-800/50",
        loading: "bg-blue-50/95 dark:bg-blue-950/95 text-blue-900 dark:text-blue-100 border border-blue-200/50 dark:border-blue-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Toast icon mapping
const getToastIcon = (variant: string) => {
  switch (variant) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />;
    case "destructive":
      return <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />;
    case "loading":
      return <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 animate-spin" />;
    default:
      return <Info className="h-5 w-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
  }
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants> & {
      showIcon?: boolean;
      showProgress?: boolean;
      duration?: number;
    }
>(({ className, variant = "default", showIcon = true, showProgress = false, duration = 0, children, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), "relative overflow-hidden", className)}
      {...props}
    >
      {showIcon && getToastIcon(variant || "default")}
      <div className="flex-1 space-y-1">
        {children}
      </div>
      {showProgress && duration > 0 && (
        <ToastProgress duration={duration} />
      )}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border-0 bg-black/10 dark:bg-white/10 px-3 text-sm font-medium transition-all duration-200 hover:bg-black/20 dark:hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 opacity-0 transition-all duration-200 hover:bg-black/10 dark:hover:bg-white/10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50 group-hover:opacity-100 backdrop-blur-sm",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-3.5 w-3.5" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-80 leading-relaxed", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
