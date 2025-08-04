import { create } from "zustand";

interface ProgressState {
  isLoading: boolean;
  progress: number;
  
  // Actions
  startProgress: () => void;
  updateProgress: (progress: number) => void;
  finishProgress: () => void;
  resetProgress: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  isLoading: false,
  progress: 0,

  startProgress: () => {
    set({ isLoading: true, progress: 0 });
    
    // Auto-increment progress simulation
    const increment = () => {
      const { progress, isLoading } = get();
      if (!isLoading) return;
      
      if (progress < 90) {
        const nextProgress = Math.min(progress + Math.random() * 10, 90);
        set({ progress: nextProgress });
        setTimeout(increment, 200 + Math.random() * 300);
      }
    };
    
    setTimeout(increment, 100);
  },

  updateProgress: (progress: number) => {
    set({ progress: Math.max(0, Math.min(100, progress)) });
  },

  finishProgress: () => {
    set({ progress: 100 });
    setTimeout(() => {
      set({ isLoading: false, progress: 0 });
    }, 200);
  },

  resetProgress: () => {
    set({ isLoading: false, progress: 0 });
  },
}));