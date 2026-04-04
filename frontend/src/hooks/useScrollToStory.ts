import { useCallback, useEffect } from "react";
import type { RefObject } from "react";

export const useScrollToStory = (
  storyRef: RefObject<HTMLDivElement | null>,
  selectedProjectId: number | null,
) => {
  const scrollToStory = useCallback(() => {
    if (!storyRef.current) return;
    storyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [storyRef]);

  useEffect(() => {
    if (selectedProjectId) {
      scrollToStory();
    }
  }, [selectedProjectId, scrollToStory]);

  return scrollToStory;
};
