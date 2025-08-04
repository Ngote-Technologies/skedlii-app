import { FormItem, FormLabel, FormMessage } from "../ui/form";
import { cn } from "../../lib/utils";
import { platformConfigs } from "../../constants/platformConfigs";
import { FaCheckCircle, FaExternalLinkAlt } from "react-icons/fa";

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
      <FormLabel>Platform</FormLabel>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 overflow-y-auto max-h-[260px] pr-1">
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
                "relative flex flex-col items-center justify-center p-2 rounded-md border text-center transition-all",
                isSelected
                  ? `${platform.theme.bg} ${platform.theme.border} ring-2`
                  : "hover:border-muted-foreground",
                platform.comingSoon && "opacity-50 cursor-not-allowed"
              )}
            >
              <platform.logo className={cn("text-xl", platform.theme.text)} />
              <span
                className={cn("text-xs font-medium mt-1", platform.theme.text)}
              >
                {platform.name}
              </span>
              {platform.comingSoon && (
                <span className="absolute top-0 text-[10px] text-red-600 bg-red-200 px-1 py-0.5 rounded w-full">
                  Coming Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedConfig && (
        <div className="mt-5 space-y-3 border rounded-md p-4 bg-muted">
          <p className="text-sm text-muted-foreground">
            <span className={cn("font-bold", selectedConfig.theme.text)}>
              {selectedConfig.name}
            </span>
            : {selectedConfig.description}
          </p>

          {selectedConfig.permissions.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-1">Permissions:</p>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {selectedConfig.permissions.map((perm) => (
                  <li key={perm} className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    {perm}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedConfig.constraints && (
            <div>
              <p className="text-sm font-semibold text-red-600">Constraints:</p>
              <p
                className="text-sm text-red-500"
                dangerouslySetInnerHTML={{ __html: selectedConfig.constraints }}
              />
            </div>
          )}

          {selectedConfig.platformDocsUrl && (
            <a
              href={selectedConfig.platformDocsUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1 mt-2"
            >
              Learn more <FaExternalLinkAlt className="text-xs" />
            </a>
          )}
        </div>
      )}

      <FormMessage>{error}</FormMessage>
    </FormItem>
  );
}
