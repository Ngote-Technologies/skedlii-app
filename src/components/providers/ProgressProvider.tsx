import React, { Suspense } from "react";
import TopProgressBar from "../ui/top-progress-bar";
import { useProgressStore } from "../../store/progressStore";

interface ProgressProviderProps {
  children: React.ReactNode;
}

const ProgressFallback: React.FC = () => {
  const { startProgress, finishProgress } = useProgressStore();
  
  React.useEffect(() => {
    startProgress();
    return () => finishProgress();
  }, [startProgress, finishProgress]);

  return null;
};

export const ProgressProvider: React.FC<ProgressProviderProps> = ({ children }) => {
  return (
    <>
      <TopProgressBar />
      <Suspense fallback={<ProgressFallback />}>
        {children}
      </Suspense>
    </>
  );
};

export default ProgressProvider;