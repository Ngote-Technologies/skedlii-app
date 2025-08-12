import * as React from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  // Enhanced features
  label?: string;
  error?: string;
  success?: boolean;
  loading?: boolean;
  clearable?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  onClear?: () => void;
  characterCount?: boolean;
  maxLength?: number;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = "text", 
    label,
    error,
    success,
    loading,
    clearable,
    prefixIcon,
    suffixIcon,
    onClear,
    characterCount,
    maxLength,
    helperText,
    value,
    placeholder,
    disabled,
    onChange,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(Boolean(value));

    React.useEffect(() => {
      setHasValue(Boolean(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      onChange?.(e);
    };

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      setHasValue(false);
    };

    const currentType = type === "password" && showPassword ? "text" : type;
    const isPassword = type === "password";
    const isSearch = type === "search";

    // Enhanced styling with states
    const inputClasses = cn(
      // Base styles
      "flex h-12 w-full rounded-lg border bg-background px-4 py-3 text-base transition-all duration-200",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
      "placeholder:text-muted-foreground/60",
      "focus:outline-none focus:ring-2 focus:ring-offset-1",
      "disabled:cursor-not-allowed disabled:opacity-50",
      // Mobile optimizations
      "touch-manipulation text-base md:text-sm", // Prevent iOS zoom, base size on mobile
      
      // Enhanced focus and state styles
      !error && !success && [
        "border-input hover:border-input/80",
        "focus:border-primary focus:ring-primary/20",
        focused && "shadow-sm"
      ],
      
      // Success state
      success && [
        "border-green-500 focus:border-green-500 focus:ring-green-500/20",
        "bg-green-50/50 dark:bg-green-950/20"
      ],
      
      // Error state  
      error && [
        "border-red-500 focus:border-red-500 focus:ring-red-500/20",
        "bg-red-50/50 dark:bg-red-950/20"
      ],
      
      // Icon padding adjustments
      prefixIcon && "pl-11",
      (suffixIcon || isPassword || (clearable && hasValue) || isSearch) && "pr-11",
      
      className
    );

    return (
      <div className="relative w-full">
        {/* Floating Label */}
        {label && (
          <label className={cn(
            "absolute left-4 pointer-events-none transition-all duration-200 text-muted-foreground",
            (focused || hasValue) ? [
              "-top-2 left-3 bg-background px-1 text-xs font-medium z-10",
              error ? "text-red-500" : success ? "text-green-500" : "text-primary"
            ] : "top-3.5 text-base"
          )}>
            {label}
          </label>
        )}
        
        {/* Prefix Icon */}
        {prefixIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {prefixIcon}
          </div>
        )}

        <input
          type={currentType}
          className={inputClasses}
          ref={ref}
          value={value}
          placeholder={label ? undefined : placeholder}
          disabled={disabled || loading}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={handleChange}
          // Mobile optimizations
          autoCapitalize={type === "email" ? "none" : props.autoCapitalize}
          autoCorrect={type === "email" ? "off" : props.autoCorrect}
          inputMode={
            type === "email" ? "email" : 
            type === "tel" ? "tel" : 
            type === "number" ? "numeric" : 
            type === "url" ? "url" :
            props.inputMode
          }
          {...props}
        />

        {/* Suffix Icons */}
        <div className="absolute right-3 flex items-center" style={{ top: '24px', transform: 'translateY(-50%)' }}>
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
          
          {/* Password Toggle */}
          {isPassword && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded-sm hover:bg-accent flex items-center justify-center"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {/* Search Icon */}
          {isSearch && !loading && !clearable && (
            <Search className="h-4 w-4 text-muted-foreground" />
          )}
          
          {/* Custom Suffix Icon */}
          {suffixIcon && !isPassword && !isSearch && !loading && !(clearable && hasValue) && (
            <div className="text-muted-foreground">
              {suffixIcon}
            </div>
          )}
        </div>

        {/* Helper Text, Error, or Character Count */}
        {(error || success || helperText || (characterCount && maxLength)) && (
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <div>
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
              <span className={cn(
                "text-muted-foreground tabular-nums",
                String(value || '').length > maxLength * 0.8 && "text-orange-500",
                String(value || '').length >= maxLength && "text-red-500"
              )}>
                {String(value || '').length}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
