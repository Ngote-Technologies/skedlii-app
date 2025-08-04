import { useMemo } from "react";

export const useUrlParams = () => {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  return {
    subscribed: searchParams.get("subscribed") === "true",
    canceled: searchParams.get("canceled") === "true",
    error: searchParams.get("error"),
    message: searchParams.get("message"),
    // New parameters for hosted checkout redirects
    upgrade: searchParams.get("upgrade"),
    downgrade: searchParams.get("downgrade"),
    subscriptionUpdated: searchParams.get("subscription_updated") === "true",
    plan: searchParams.get("plan"),
  };
};
