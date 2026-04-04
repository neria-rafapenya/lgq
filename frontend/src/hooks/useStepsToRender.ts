import { useMemo } from "react";
import type { StoryStep } from "../types/chat";

export const useStepsToRender = (
  displaySteps: StoryStep[],
  wizardBusy: boolean,
): StoryStep[] =>
  useMemo(() => {
    if (displaySteps.length) {
      const last = displaySteps[displaySteps.length - 1];
      if (!last.user && displaySteps.length > 1) {
        return [displaySteps[displaySteps.length - 2], last];
      }
      return [last];
    }
    if (wizardBusy) {
      return [{ id: "loading" }];
    }
    return [];
  }, [displaySteps, wizardBusy]);
