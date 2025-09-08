import * as React from "react";

import type { ToastActionElement, ToastProps } from "../components/ui/toast";

const TOAST_LIMIT = 3; // Allow multiple toasts
const TOAST_REMOVE_DELAY = 5000; // 5 seconds - much more reasonable!

// Enhanced toast configuration
const TOAST_DURATIONS = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
  loading: 0, // Persist until manually dismissed
} as const;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  icon?: React.ReactNode;
  showProgress?: boolean;
  persistent?: boolean;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType["ADD_TOAST"];
      toast: ToasterToast;
    }
  | {
      type: ActionType["UPDATE_TOAST"];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType["DISMISS_TOAST"];
      toastId?: ToasterToast["id"];
    }
  | {
      type: ActionType["REMOVE_TOAST"];
      toastId?: ToasterToast["id"];
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string, duration?: number) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  // Use custom duration or default
  const delay = duration ?? TOAST_REMOVE_DELAY;
  
  // Don't auto-remove persistent toasts or loading toasts
  if (delay === 0) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, delay);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // Enhanced dismiss logic with custom durations
      if (toastId) {
        const toast = state.toasts.find(t => t.id === toastId);
        addToRemoveQueue(toastId, toast?.duration);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id, toast.duration);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, "id">;

function toast({ ...props }: Toast) {
  const id = genId();

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  // Enhanced toast with smart duration based on variant
  const variant = props.variant || "default";
  const defaultDuration = TOAST_DURATIONS[variant as keyof typeof TOAST_DURATIONS] || TOAST_REMOVE_DELAY;
  const duration = props.persistent ? 0 : (props.duration ?? defaultDuration);

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      duration,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  // Auto-dismiss non-persistent toasts
  if (!props.persistent && duration > 0) {
    addToRemoveQueue(id, duration);
  }

  return {
    id: id,
    dismiss,
    update,
  };
}

// Enhanced toast variants for better UX
toast.success = (props: Omit<Toast, 'variant'>) => 
  toast({ ...props, variant: "success" });

toast.error = (props: Omit<Toast, 'variant'>) => 
  toast({ ...props, variant: "destructive" });

toast.warning = (props: Omit<Toast, 'variant'>) => 
  toast({ ...props, variant: "warning" });

toast.info = (props: Omit<Toast, 'variant'>) => 
  toast({ ...props, variant: "default" });

toast.loading = (props: Omit<Toast, 'variant'>) => 
  toast({ ...props, variant: "loading", persistent: true });

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  // Add keyboard shortcuts for dismissing toasts
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape key dismisses all toasts
      if (event.key === 'Escape') {
        dispatch({ type: "DISMISS_TOAST" });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    dismissAll: () => dispatch({ type: "DISMISS_TOAST" }),
  };
}

export { useToast, toast };
