import { useEffect, useMemo, useState } from "react";
import { Building, Globe2, Lightbulb, Save, Sparkles } from "lucide-react";
import { getApiClient, useV2Api } from "../../api/axios";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "../../store/hooks";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  getDetectedTimeZone,
  getTimeZoneOptions,
  isValidTimeZone,
} from "../../lib/timezones";

type BrandProfileForm = {
  industryOrNiche: string;
  targetAudience: string;
  contentGoals: string;
  brandTone: string;
  contentPillars: string;
  keywords: string;
  topicsToAvoid: string;
  primaryLocation: string;
};

const EMPTY_BRAND_PROFILE: BrandProfileForm = {
  industryOrNiche: "",
  targetAudience: "",
  contentGoals: "",
  brandTone: "",
  contentPillars: "",
  keywords: "",
  topicsToAvoid: "",
  primaryLocation: "",
};

const BRAND_TONES = [
  "Professional",
  "Friendly",
  "Casual",
  "Informative",
  "Persuasive",
  "Humorous",
  "Bold",
];

export default function OrganizationSettings() {
  const {
    organization,
    userRole,
    userType,
    subscriptionInfo,
    canManageOrganization,
  } = useAuth();
  const { toast } = useToast();
  const useV2 = useV2Api("organizations");
  const api = useMemo(() => getApiClient(useV2 ? "v2" : undefined), [useV2]);
  const detectedTimezone = useMemo(() => getDetectedTimeZone(), []);
  const timezoneOptions = useMemo(
    () => getTimeZoneOptions(organization?.timezone || detectedTimezone),
    [organization?.timezone, detectedTimezone]
  );

  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState(detectedTimezone);
  const [saving, setSaving] = useState(false);
  const [brandProfile, setBrandProfile] =
    useState<BrandProfileForm>(EMPTY_BRAND_PROFILE);
  const [savingBrandProfile, setSavingBrandProfile] = useState(false);

  useEffect(() => {
    setName(organization?.name || "");
    setTimezone(
      isValidTimeZone(organization?.timezone)
        ? organization!.timezone!
        : detectedTimezone
    );
    setBrandProfile(formatBrandProfileForForm(organization?.recommendationProfile));
  }, [detectedTimezone, organization]);

  const canEdit =
    canManageOrganization || userRole === "owner" || userRole === "admin";
  const isCreatorWorkspace =
    userType === "individual" ||
    subscriptionInfo?.subscriptionTier === "creator" ||
    subscriptionInfo?.selectedTier === "creator";
  const workspaceLabel = isCreatorWorkspace ? "workspace" : "organization";
  const pageTitle = isCreatorWorkspace
    ? "Brand Settings"
    : "Organization Settings";
  const nameLabel = isCreatorWorkspace ? "Workspace name" : "Organization name";

  const handleSave = async () => {
    if (!organization?._id || !canEdit) return;
    if (!isValidTimeZone(timezone)) {
      toast.error({
        title: "Invalid timezone",
        description: "Select a valid IANA timezone.",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await api.patch(`/organizations/${organization._id}/profile`, {
        name: name.trim() || undefined,
        timezone,
      });
      const updated = response.data?.organization || response.data;
      useAuthStore.setState({
        organization: {
          ...organization,
          ...updated,
          role: organization.role || userRole || updated.role,
        } as any,
      });
      toast.success({
        title: "Settings saved",
        description: `Your ${workspaceLabel} defaults have been updated.`,
      });
    } catch (error: any) {
      toast.error({
        title: "Settings update failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          `Failed to update ${workspaceLabel} settings.`,
      });
    } finally {
      setSaving(false);
    }
  };

  const updateBrandProfileField = (
    field: keyof BrandProfileForm,
    value: string
  ) => {
    setBrandProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSaveBrandProfile = async () => {
    if (!organization?._id || !canEdit) return;

    setSavingBrandProfile(true);
    try {
      const response = await api.patch(
        `/organizations/${organization._id}/recommendation-profile`,
        buildBrandProfilePayload(brandProfile)
      );
      const updated = response.data?.organization || response.data;
      useAuthStore.setState({
        organization: {
          ...organization,
          ...updated,
          role: organization.role || userRole || updated.role,
        } as any,
      });
      toast.success({
        title: "Brand profile saved",
        description: "Personalized suggestion context has been updated.",
      });
    } catch (error: any) {
      toast.error({
        title: "Brand profile update failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update brand profile.",
      });
    } finally {
      setSavingBrandProfile(false);
    }
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No workspace selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select a workspace to manage its settings.
          </p>
        </div>
      </div>
    );
  }

  const hasBrandProfile = hasMeaningfulBrandProfile(
    organization.recommendationProfile
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {pageTitle}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage the timezone and brand profile used by scheduling and
            personalized suggestions.
          </p>
        </div>
        {userRole && <Badge variant="outline">{userRole}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isCreatorWorkspace ? "Workspace Defaults" : "Scheduling Defaults"}
          </CardTitle>
          <CardDescription>
            This timezone is used for scheduled posts and future best-time
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization-name">{nameLabel}</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!canEdit || saving}
                placeholder={nameLabel}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="timezone">
                <Globe2 className="h-4 w-4" />
                {isCreatorWorkspace
                  ? "Workspace timezone"
                  : "Organization timezone"}
              </Label>
              <Select
                value={timezone}
                onValueChange={setTimezone}
                disabled={!canEdit || saving}
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {timezoneOptions.map((value) => (
                    <SelectItem key={value} value={value}>
                      {value.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {!canEdit && (
            <p className="text-sm text-muted-foreground">
              {isCreatorWorkspace
                ? "Only the workspace owner can change scheduling defaults."
                : "Only organization owners and admins can change scheduling defaults."}
            </p>
          )}

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={!canEdit || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-md border border-primary/20 bg-primary/10 p-2">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <CardTitle>Brand Profile</CardTitle>
              <CardDescription>
                Optional context used to personalize content suggestions. This
                is not shown publicly.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {!hasBrandProfile && (
            <div className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 px-3 py-3 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Personalize suggestions by adding your brand profile. You can
                skip this and still create or schedule posts.
              </p>
            </div>
          )}

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="industry-or-niche">Industry or niche</Label>
              <Input
                id="industry-or-niche"
                value={brandProfile.industryOrNiche}
                onChange={(event) =>
                  updateBrandProfileField("industryOrNiche", event.target.value)
                }
                disabled={!canEdit || savingBrandProfile}
                placeholder="Fitness coaching, SaaS, real estate..."
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand-tone">Brand tone</Label>
              <Select
                value={brandProfile.brandTone || "none"}
                onValueChange={(value) =>
                  updateBrandProfileField(
                    "brandTone",
                    value === "none" ? "" : value
                  )
                }
                disabled={!canEdit || savingBrandProfile}
              >
                <SelectTrigger id="brand-tone">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No preference</SelectItem>
                  {BRAND_TONES.map((tone) => (
                    <SelectItem key={tone} value={tone}>
                      {tone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="target-audience">Target audience</Label>
              <Textarea
                id="target-audience"
                value={brandProfile.targetAudience}
                onChange={(event) =>
                  updateBrandProfileField("targetAudience", event.target.value)
                }
                disabled={!canEdit || savingBrandProfile}
                placeholder="Who you want to reach and what they care about"
                maxLength={240}
                size="sm"
              />
            </div>

            <BrandProfileListField
              id="content-goals"
              label="Content goals"
              value={brandProfile.contentGoals}
              disabled={!canEdit || savingBrandProfile}
              placeholder="Awareness, leads, education"
              onChange={(value) => updateBrandProfileField("contentGoals", value)}
            />

            <BrandProfileListField
              id="content-pillars"
              label="Content pillars"
              value={brandProfile.contentPillars}
              disabled={!canEdit || savingBrandProfile}
              placeholder="Tips, customer stories, product updates"
              onChange={(value) =>
                updateBrandProfileField("contentPillars", value)
              }
            />

            <BrandProfileListField
              id="brand-keywords"
              label="Keywords"
              value={brandProfile.keywords}
              disabled={!canEdit || savingBrandProfile}
              placeholder="Scheduling, productivity, creator tools"
              onChange={(value) => updateBrandProfileField("keywords", value)}
            />

            <BrandProfileListField
              id="topics-to-avoid"
              label="Topics to avoid"
              value={brandProfile.topicsToAvoid}
              disabled={!canEdit || savingBrandProfile}
              placeholder="Discount claims, politics, competitor mentions"
              onChange={(value) =>
                updateBrandProfileField("topicsToAvoid", value)
              }
            />

            <div className="space-y-2">
              <Label htmlFor="primary-location">Primary location</Label>
              <Input
                id="primary-location"
                value={brandProfile.primaryLocation}
                onChange={(event) =>
                  updateBrandProfileField("primaryLocation", event.target.value)
                }
                disabled={!canEdit || savingBrandProfile}
                placeholder="Lagos, London, North America..."
                maxLength={120}
              />
            </div>
          </div>

          {!canEdit && (
            <p className="text-sm text-muted-foreground">
              {isCreatorWorkspace
                ? "Only the workspace owner can change brand profile details."
                : "Only organization owners and admins can change brand profile details."}
            </p>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleSaveBrandProfile}
              disabled={!canEdit || savingBrandProfile}
            >
              <Save className="mr-2 h-4 w-4" />
              {savingBrandProfile ? "Saving..." : "Save brand profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BrandProfileListField({
  id,
  label,
  value,
  disabled,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  disabled: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        helperText="Separate items with commas or new lines."
        size="sm"
      />
    </div>
  );
}

function formatBrandProfileForForm(profile: any): BrandProfileForm {
  if (!profile) return EMPTY_BRAND_PROFILE;
  return {
    industryOrNiche: profile.industryOrNiche ?? "",
    targetAudience: profile.targetAudience ?? "",
    contentGoals: formatList(profile.contentGoals),
    brandTone: profile.brandTone ?? "",
    contentPillars: formatList(profile.contentPillars),
    keywords: formatList(profile.keywords),
    topicsToAvoid: formatList(profile.topicsToAvoid),
    primaryLocation: profile.primaryLocation ?? "",
  };
}

function buildBrandProfilePayload(profile: BrandProfileForm) {
  return {
    industryOrNiche: nullableTrim(profile.industryOrNiche),
    targetAudience: nullableTrim(profile.targetAudience),
    contentGoals: parseList(profile.contentGoals),
    brandTone: nullableTrim(profile.brandTone),
    contentPillars: parseList(profile.contentPillars),
    keywords: parseList(profile.keywords),
    topicsToAvoid: parseList(profile.topicsToAvoid),
    primaryLocation: nullableTrim(profile.primaryLocation),
  };
}

function nullableTrim(value: string) {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function parseList(value: string) {
  return Array.from(
    new Set(
      value
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  ).slice(0, 12);
}

function formatList(value: unknown) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function hasMeaningfulBrandProfile(profile: any) {
  if (!profile || typeof profile !== "object") return false;
  return Object.values(profile).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );
}
