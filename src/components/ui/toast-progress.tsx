import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface ToastProgressProps {
  duration: number;
  className?: string;
}

export function ToastProgress({ duration, className }: ToastProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (duration <= 0) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  if (duration <= 0) return null;

  return (
    <div className={cn("absolute bottom-0 left-0 h-1 bg-primary/20 w-full", className)}>
      <div
        className="h-full bg-primary transition-all duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}