import { useCallback, useMemo } from "react";

/**
 * Parse common OAuth/connect redirect params in a reusable way.
 * Handles patterns like:
 * - ?success=true|false&code=...&message=...
 * - ?status=success|failed&message=...
 * - ?error=someType&message=...
 */
export function useConnectResultParams() {
  const searchParams = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  const success = searchParams.get("success");
  const status = searchParams.get("status");
  const error = searchParams.get("error");
  const code = searchParams.get("code") || error || undefined;
  const message = searchParams.get("message") || undefined;

  const isSuccess = success === "true" || status === "success";
  const isError = success === "false" || status === "failed" || !!error;
  const hasResult = Boolean(success || status || error);

  const clearParams = useCallback((path?: string) => {
    const target = path || window.location.pathname;
    window.history.replaceState({}, "", target);
  }, []);

  return {
    hasResult,
    isSuccess,
    isError,
    code,
    message,
    clearParams,
  } as const;
}

