import { useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from "../../hooks/use-toast";

type Props = {
  canManageBilling?: boolean;
  onPreview: (code: string) => Promise<any> | void;
  onApply: (code: string) => Promise<any> | void;
};

const PromotionCodeForm = ({ canManageBilling, onPreview, onApply }: Props) => {
  const [code, setCode] = useState("");
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handlePreview = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setPreview(null);
    try {
      const result = await (onPreview(code.trim()) as any);
      setPreview(result);
    } catch (e: any) {
      toast.error({
        title: "Invalid Code",
        description:
          e?.response?.data?.message || e?.message || "Could not preview code.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      await onApply(code.trim());
      setPreview(null);
      setCode("");
    } catch (e: any) {
      toast.error({
        title: "Failed to Apply",
        description:
          e?.response?.data?.message || e?.message || "Unable to apply code.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter promotion code"
          disabled={!canManageBilling || loading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handlePreview}
          disabled={!canManageBilling || loading || !code.trim()}
        >
          Preview
        </Button>
        <Button
          type="button"
          onClick={handleApply}
          disabled={!canManageBilling || loading || !code.trim()}
        >
          Apply
        </Button>
      </div>

      {preview && (
        <div className="text-xs text-muted-foreground">
          {preview.kind === "trial_extension" ? (
            <div>
              Extends trial by <b>{preview.days}</b> day(s). New trial end:
              {" "}
              <b>{new Date(preview.newTrialEnd).toLocaleString()}</b>.
              {!preview.allowed && (
                <span className="ml-1 text-amber-600">
                  Available only while trialing.
                </span>
              )}
            </div>
          ) : preview.kind === "promotion_code" ? (
            <div>
              Code applies {" "}
              {preview.effect?.percent_off
                ? `${preview.effect.percent_off}% off`
                : preview.effect?.amount_off
                ? `${(preview.effect.amount_off / 100).toFixed(2)} ${
                    (preview.effect.currency || "usd").toUpperCase()
                  } off`
                : "a discount"}
              {preview.effect?.duration
                ? ` (${preview.effect.duration}$${
                    preview.effect.duration_in_months
                      ? ` for ${preview.effect.duration_in_months} months`
                      : ""
                  })`
                : ""}
              . {" "}
              {preview.appliesTo === "subscription"
                ? "Will be applied to your active subscription."
                : "Use at checkout to start a new subscription."}
              {preview.warning && (
                <span className="ml-1 text-amber-600">{preview.warning}</span>
              )}
            </div>
          ) : (
            <div>Code preview available.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromotionCodeForm;
