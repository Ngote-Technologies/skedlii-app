import { cn } from "../../lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Specialized skeleton components for different content types
function CardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4 bg-card", className)} {...props}>
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="h-32 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );
}

function TableSkeleton({ rows = 5, className, ...props }: SkeletonProps & { rows?: number }) {
  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Table header */}
      <div className="grid grid-cols-4 gap-4 p-4 border-b">
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
        <Skeleton className="h-4" />
      </div>
      
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="grid grid-cols-4 gap-4 p-4 border-b border-border">
          <Skeleton className="h-4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostCardSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-4 bg-card", className)} {...props}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-1 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      
      {/* Media placeholder */}
      <Skeleton className="h-48 w-full rounded-lg" />
      
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
        <Skeleton className="h-8 w-20 rounded" />
      </div>
    </div>
  );
}

function DashboardStatsSkeleton({ className, ...props }: SkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", className)} {...props}>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-lg border p-6 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ items = 5, className, ...props }: SkeletonProps & { items?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-1 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Enhanced loading spinner
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'dots';
  className?: string;
}

function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  if (variant === 'dots') {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-primary animate-bounce",
              size === 'sm' ? 'h-1 w-1' : 'h-2 w-2'
            )}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'gradient') {
    return (
      <div 
        className={cn(
          "rounded-full animate-spin",
          sizes[size],
          className
        )}
      >
        <div className="h-full w-full rounded-full border-2 border-transparent bg-gradient-to-r from-primary to-purple-500 animate-spin" style={{
          background: 'conic-gradient(from 0deg, transparent, transparent, transparent, hsl(var(--primary)))'
        }} />
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-2 border-primary border-t-transparent",
        sizes[size],
        className
      )} 
    />
  );
}

export { 
  Skeleton, 
  CardSkeleton, 
  TableSkeleton, 
  PostCardSkeleton, 
  DashboardStatsSkeleton,
  ListSkeleton,
  LoadingSpinner
}
