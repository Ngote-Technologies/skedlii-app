"use client"

import * as React from "react"
import { Progress } from "./progress"
import { useProgressStore } from "../../store/progressStore"
import { cn } from "../../lib/utils"

interface TopProgressBarProps {
  className?: string;
}

export const TopProgressBar: React.FC<TopProgressBarProps> = ({ className }) => {
  const { isLoading, progress } = useProgressStore();

  if (!isLoading) return null;

  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50", className)}>
      <Progress
        value={progress}
        className="h-1 w-full rounded-none bg-transparent"
      />
    </div>
  );
};

export default TopProgressBar;