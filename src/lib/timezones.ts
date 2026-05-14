export const DEFAULT_TIMEZONE = "UTC";

const FALLBACK_TIMEZONES = [
  "UTC",
  "Africa/Lagos",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function isValidTimeZone(value?: string | null) {
  if (!value) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value }).format(new Date(0));
    return true;
  } catch {
    return false;
  }
}

export function getDetectedTimeZone() {
  const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return isValidTimeZone(detected) ? detected : DEFAULT_TIMEZONE;
}

export function getTimeZoneOptions(preferred?: string | null) {
  const supported =
    typeof (Intl as any).supportedValuesOf === "function"
      ? ((Intl as any).supportedValuesOf("timeZone") as string[])
      : FALLBACK_TIMEZONES;
  const values = new Set([DEFAULT_TIMEZONE, ...supported]);
  if (preferred && isValidTimeZone(preferred)) values.add(preferred);
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}
