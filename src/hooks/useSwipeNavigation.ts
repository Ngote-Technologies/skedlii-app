import { useEffect, useRef, useState } from 'react';

interface UseSwipeNavigationOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minSwipeDistance?: number;
  maxVerticalDistance?: number;
}

export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  minSwipeDistance = 100,
  maxVerticalDistance = 150,
}: UseSwipeNavigationOptions = {}) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLElement>(null);

  // Handle touch start
  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  // Handle touch move
  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);
    
    // Check if the vertical distance is within acceptable range
    if (distanceY > maxVerticalDistance) return;
    
    // Check if the horizontal distance meets minimum threshold
    if (Math.abs(distanceX) < minSwipeDistance) return;
    
    if (distanceX > 0) {
      // Swiped left
      onSwipeLeft?.();
    } else {
      // Swiped right
      onSwipeRight?.();
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add touch event listeners
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchStart, touchEnd, onSwipeLeft, onSwipeRight, minSwipeDistance, maxVerticalDistance]);

  return elementRef;
}