import { Moon, Sun, Monitor, Palette, Check } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../components/ui/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../../components/ui/dropdown-menu";
import { cn } from "../../lib/utils";

interface ThemeToggleProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export function ThemeToggle({
  className,
  variant = "outline",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      description: "Clean and bright interface",
      icon: Sun,
    },
    {
      value: "dark",
      label: "Dark",
      description: "Easy on the eyes",
      icon: Moon,
    },
    {
      value: "system",
      label: "System",
      description: "Match your device preference",
      icon: Monitor,
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className={cn(
            "relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg",
            "border-2 hover:border-primary/20 backdrop-blur-sm",
            className
          )}
        >
          <div className="relative">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all duration-500 ease-in-out dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute inset-0 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all duration-500 ease-in-out dark:rotate-0 dark:scale-100" />
          </div>
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className={cn(
          "min-w-[220px] p-2 backdrop-blur-md bg-background/95 border shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-200"
        )}
      >
        <DropdownMenuLabel className="flex items-center gap-2 font-medium text-sm pb-2">
          <Palette className="h-4 w-4 text-primary" />
          Choose Theme
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mb-2" />

        {themeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value as any)}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200",
                "hover:bg-accent/50 hover:shadow-sm focus:bg-accent/50",
                isSelected && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={cn(
                    "p-2 rounded-md transition-colors duration-200",
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div
                    className={cn(
                      "font-medium text-sm",
                      isSelected && "text-primary"
                    )}
                  >
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {option.description}
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 text-primary animate-in zoom-in-50 duration-200" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
