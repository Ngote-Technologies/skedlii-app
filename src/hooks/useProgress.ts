import { useProgressStore } from "../store/progressStore";

export const useProgress = () => {
  const { 
    isLoading, 
    progress, 
    startProgress, 
    updateProgress, 
    finishProgress, 
    resetProgress 
  } = useProgressStore();

  return {
    isLoading,
    progress,
    start: startProgress,
    update: updateProgress,
    finish: finishProgress,
    reset: resetProgress,
  };
};