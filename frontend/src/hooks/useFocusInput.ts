import { useEffect } from "react";
import type { RefObject } from "react";

export const useFocusInput = (
  inputRef: RefObject<HTMLTextAreaElement | null>,
  selectedProjectId: number | null,
  wizardBusy: boolean,
  messageCount: number,
) => {
  useEffect(() => {
    if (selectedProjectId && !wizardBusy) {
      inputRef.current?.focus();
    }
  }, [inputRef, selectedProjectId, wizardBusy, messageCount]);
};
