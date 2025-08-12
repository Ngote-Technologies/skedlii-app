import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

// Enhanced Textarea with variants
const textareaVariants = cva(
  "flex w-full rounded-lg border bg-background px-4 py-3 text-base transition-all duration-200 resize-vertical placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 touch-manipulation text-base md:text-sm",
  {
    variants: {
      variant: {
        default:
          "border-input hover:border-input/80 focus:border-primary focus:ring-primary/20",
        outline:
          "border-2 border-primary/20 hover:border-primary/40 focus:border-primary focus:ring-primary/20",
        ghost:
          "border-transparent bg-muted/50 hover:bg-muted/80 focus:bg-background focus:border-input focus:ring-primary/20",
        minimal:
          "border-0 border-b-2 border-input rounded-none px-0 focus:border-primary focus:ring-0",
      },
      size: {
        sm: "min-h-[60px] px-3 py-2 text-sm",
        default: "min-h-[80px] px-4 py-3 text-base",
        lg: "min-h-[120px] px-4 py-4 text-lg",
        xl: "min-h-[160px] px-5 py-4 text-lg",
      },
      state: {
        default: "",
        error:
          "border-red-500 bg-red-50/50 dark:bg-red-950/20 focus:border-red-500 focus:ring-red-500/20",
        success:
          "border-green-500 bg-green-50/50 dark:bg-green-950/20 focus:border-green-500 focus:ring-green-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      state: "default",
    },
  }
);

interface TextareaProps
  extends React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {
  // Enhanced features
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  characterCount?: boolean;
  helperText?: string;
  autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      variant,
      size,
      state,
      label,
      error,
      success,
      loading,
      clearable,
      onClear,
      characterCount,
      helperText,
      autoResize = false,
      value,
      placeholder,
      disabled,
      maxLength,
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(Boolean(value));
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    React.useEffect(() => {
      setHasValue(Boolean(value));
    }, [value]);

    // Auto-resize functionality
    const handleAutoResize = React.useCallback(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }, [autoResize]);

    React.useEffect(() => {
      if (autoResize) {
        handleAutoResize();
      }
    }, [value, handleAutoResize, autoResize]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setHasValue(Boolean(e.target.value));
      if (autoResize) {
        handleAutoResize();
      }
      onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setFocused(false);
      onBlur?.(e);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      setHasValue(false);
    };

    const currentState = error ? "error" : success ? "success" : state;

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <label
            className={cn(
              "absolute left-4 pointer-events-none transition-all duration-200 text-muted-foreground z-10",
              focused || hasValue
                ? [
                    "-top-2 left-3 bg-background px-1 text-xs font-medium",
                    error
                      ? "text-red-500"
                      : success
                      ? "text-green-500"
                      : "text-primary",
                  ]
                : "top-3 text-base"
            )}
          >
            {label}
          </label>
        )}

        <textarea
          ref={textareaRef}
          className={cn(
            textareaVariants({ variant, size, state: currentState }),
            // Adjust padding when there are action buttons
            clearable && hasValue && !loading && "pr-10",
            className
          )}
          value={value}
          placeholder={label ? undefined : placeholder}
          disabled={disabled || loading}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          style={{
            ...(autoResize && { resize: "none", overflow: "hidden" }),
            ...props.style,
          }}
          {...props}
        />

        {/* Action Buttons */}
        {(clearable || loading) && (
          <div className="absolute top-3 right-3 flex items-center gap-1">
            {/* Loading Spinner */}
            {loading && (
              <div className="animate-spin h-4 w-4 border-2 border-muted-foreground border-t-transparent rounded-full" />
            )}

            {/* Clear Button */}
            {clearable && hasValue && !loading && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-accent flex items-center justify-center"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Helper Text, Error, Success, or Character Count */}
        {(error || success || helperText || (characterCount && maxLength)) && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <div className="flex-1">
              {error && (
                <span className="text-red-500 font-medium">{error}</span>
              )}
              {success && !error && (
                <span className="text-green-500 font-medium">Looks good!</span>
              )}
              {helperText && !error && !success && (
                <span className="text-muted-foreground">{helperText}</span>
              )}
            </div>
            {characterCount && maxLength && (
              <span
                className={cn(
                  "text-muted-foreground tabular-nums ml-2",
                  String(value || "").length > maxLength * 0.8 &&
                    "text-orange-500",
                  String(value || "").length >= maxLength && "text-red-500"
                )}
              >
                {String(value || "").length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
export type { TextareaProps };
