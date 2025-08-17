import { FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "../../lib/utils";
import { platformConfigs } from "../../constants/platformConfigs";
import { FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";
import { Sparkles, Clock, Shield, Zap, Users, TrendingUp } from "lucide-react";

interface PlatformSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export default function PlatformSelector({
  value,
  onChange,
  error,
  disabled,
}: Readonly<PlatformSelectorProps>) {
  const selectedConfig = platformConfigs.find((p) => p.label === value);

  return (
    <FormItem>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FormLabel className="text-base font-semibold">Choose Platform</FormLabel>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">Connect & Grow</span>
          </div>
        </div>

        {/* Enhanced Platform Grid */}
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted/30 to-muted/20 p-4 border border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
          <div className="relative grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto pr-2">
            {platformConfigs.map((platform) => {
              const isSelected = value === platform.label;
              return (
                <button
                  key={platform.label}
                  type="button"
                  aria-label={`Select ${platform.name}`}
                  disabled={disabled || platform.comingSoon}
                  onClick={() => onChange(platform.label)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all duration-300",
                    isSelected
                      ? `${platform.theme.bg} ${platform.theme.border} ring-2 ring-offset-2 ring-offset-background shadow-lg transform scale-105`
                      : "bg-background border-border hover:border-primary/30 hover:shadow-md hover:bg-primary/5",
                    platform.comingSoon && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {/* Background gradient for selected */}
                  {isSelected && (
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                  )}
                  
                  {/* Platform Icon */}
                  <div className="relative mb-2">
                    <platform.logo 
                      className={cn(
                        "text-2xl transition-all duration-200",
                        isSelected ? platform.theme.text : platform.theme.text,
                        !platform.comingSoon && "group-hover:scale-110"
                      )} 
                    />
                    
                    {/* Active indicator */}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
                    )}
                  </div>
                  
                  {/* Platform Name */}
                  <span className={cn(
                    "text-sm font-semibold transition-colors",
                    isSelected ? platform.theme.text : "text-foreground"
                  )}>
                    {platform.name}
                  </span>
                  
                  {/* Feature indicators for available platforms */}
                  {!platform.comingSoon && (
                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <TrendingUp className="h-3 w-3 text-muted-foreground" />
                      <Zap className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Coming Soon Badge */}
                  {platform.comingSoon && (
                    <div className="absolute -top-1 -right-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-bold rounded-full transform rotate-12 shadow-md">
                      <Clock className="h-2 w-2 inline mr-1" />
                      Soon
                    </div>
                  )}
                  
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute bottom-2 right-2">
                      <FaCheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedConfig && (
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-background to-muted/50 border border-border/50 p-6 shadow-sm">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5" />
          
          <div className="relative space-y-4">
            {/* Platform Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-border/50">
              <div className={`p-2 rounded-lg ${selectedConfig.theme.bg} border ${selectedConfig.theme.border}`}>
                <selectedConfig.logo className={cn("text-xl", selectedConfig.theme.text)} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground">
                  {selectedConfig.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedConfig.description}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <Shield className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-green-600">Secure</span>
              </div>
            </div>

            {/* Permissions Section */}
            {selectedConfig.permissions.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-green-500/10">
                    <FaCheckCircle className="h-3 w-3 text-green-500" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">What we'll access:</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedConfig.permissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10">
                      <FaCheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Constraints Section */}
            {selectedConfig.constraints && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-orange-500/10">
                    <Shield className="h-3 w-3 text-orange-500" />
                  </div>
                  <p className="text-sm font-semibold text-orange-600">Requirements:</p>
                </div>
                <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <div
                    className="text-sm text-orange-700 [&_strong]:font-semibold [&_em]:italic"
                    dangerouslySetInnerHTML={{ __html: selectedConfig.constraints }}
                  />
                </div>
              </div>
            )}

            {/* Documentation Link */}
            {selectedConfig.platformDocsUrl && (
              <div className="pt-2 border-t border-border/50">
                <a
                  href={selectedConfig.platformDocsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="text-sm font-medium">Learn more about {selectedConfig.name} API</span>
                  <FaExternalLinkAlt className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <FormMessage>{error}</FormMessage>
    </FormItem>
  );
}
