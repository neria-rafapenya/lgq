import { useMemo } from "react";
import type { ChatMessage, StoryStep } from "../types/chat";
import { buildStorySteps } from "../helpers/chat";

export const useStorySteps = (messages: ChatMessage[]): StoryStep[] =>
  useMemo(() => buildStorySteps(messages), [messages]);
