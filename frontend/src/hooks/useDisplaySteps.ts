import { useMemo } from "react";
import type { StoryStep } from "../types/chat";

export const useDisplaySteps = (
  storySteps: StoryStep[],
  welcomeMessage: string | null,
): StoryStep[] =>
  useMemo(() => {
    if (storySteps.length) return storySteps;
    if (!welcomeMessage) return [];
    return [
      {
        id: "welcome",
        assistant: {
          id: "welcome",
          role: "assistant",
          content: welcomeMessage,
        },
      },
    ];
  }, [storySteps, welcomeMessage]);
