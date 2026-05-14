import { useEffect, useMemo, useState } from "react";
import { Building, Globe2, Save } from "lucide-react";
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

export default function OrganizationSettings() {
  const { organization, userRole, canManageOrganization } = useAuth();
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

  useEffect(() => {
    setName(organization?.name || "");
    setTimezone(
      isValidTimeZone(organization?.timezone)
        ? organization!.timezone!
        : detectedTimezone
    );
  }, [detectedTimezone, organization]);

  const canEdit =
    canManageOrganization || userRole === "owner" || userRole === "admin";

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
        description: "Organization timezone has been updated.",
      });
    } catch (error: any) {
      toast.error({
        title: "Settings update failed",
        description:
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update organization settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!organization) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No organization selected</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Select an organization to manage its settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Organization Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage timezone and profile details used by scheduling.
          </p>
        </div>
        {userRole && <Badge variant="outline">{userRole}</Badge>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Scheduling Defaults</CardTitle>
          <CardDescription>
            This timezone is used for scheduled posts and future best-time
            recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization-name">Organization name</Label>
              <Input
                id="organization-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={!canEdit || saving}
                placeholder="Organization name"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2" htmlFor="timezone">
                <Globe2 className="h-4 w-4" />
                Organization timezone
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
              Only organization owners and admins can change scheduling
              defaults.
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
    </div>
  );
}
