import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fade-in');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage('fade-out');
    }
  }, [location, displayLocation]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-in-out',
        {
          'fade-in': transitionStage === 'fade-in',
          'fade-out': transitionStage === 'fade-out',
        },
        className
      )}
      onAnimationEnd={() => {
        if (transitionStage === 'fade-out') {
          setDisplayLocation(location);
          setTransitionStage('fade-in');
        }
      }}
    >
      <div
        className={cn(
          'transform transition-all duration-300 ease-out',
          transitionStage === 'fade-in' && 'opacity-100 translate-y-0 scale-100',
          transitionStage === 'fade-out' && 'opacity-0 translate-y-2 scale-[0.98]'
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Enhanced page container with smooth transitions
interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
  animation?: 'slide' | 'fade' | 'scale' | 'slide-up';
}

export function AnimatedPage({ 
  children, 
  className,
  animation = 'fade'
}: AnimatedPageProps) {
  const location = useLocation();
  
  const animationClasses = {
    fade: 'animate-in fade-in slide-in-from-bottom-4 duration-500',
    slide: 'animate-in slide-in-from-right-6 duration-400',
    scale: 'animate-in zoom-in-95 duration-300',
    'slide-up': 'animate-in slide-in-from-bottom-6 duration-400'
  };

  return (
    <div
      key={location.pathname}
      className={cn(
        'w-full',
        animationClasses[animation],
        className
      )}
    >
      {children}
    </div>
  );
}

// Loading skeleton for page transitions
export function PageLoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
      
      {/* Content skeleton */}
      <div className="space-y-4">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      
      {/* Action buttons skeleton */}
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
      </div>
    </div>
  );
}