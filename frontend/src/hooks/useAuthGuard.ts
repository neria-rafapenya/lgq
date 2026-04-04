import { useCallback } from "react";
import type { StatusState } from "../types/status";

type UseAuthGuardOptions = {
  onUnauthenticated: () => void;
  setStatus: (value: StatusState | null) => void;
  message?: string;
};

export const useAuthGuard = ({
  onUnauthenticated,
  setStatus,
  message = "Tu sesión ha expirado. Vuelve a entrar.",
}: UseAuthGuardOptions) => {
  const handleAuthError = useCallback(
    (error: unknown) => {
      const status = (error as { status?: number }).status;
      if (status === 401) {
        onUnauthenticated();
        setStatus({ type: "info", message });
        return true;
      }
      return false;
    },
    [message, onUnauthenticated, setStatus],
  );

  return { handleAuthError };
};
