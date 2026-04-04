import { useMemo } from "react";

export const useWelcomeMessage = (
  messageCount: number,
  selectedProjectId: number | null,
) =>
  useMemo(() => {
    if (messageCount !== 0) return null;
    return selectedProjectId
      ? null
      : "Crea un proyecto nuevo para empezar la historia.";
  }, [messageCount, selectedProjectId]);
