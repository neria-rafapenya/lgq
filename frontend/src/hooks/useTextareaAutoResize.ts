import { useEffect } from "react";
import type { RefObject } from "react";

export const useTextareaAutoResize = (
  inputRef: RefObject<HTMLTextAreaElement | null>,
  value: string,
  maxHeight = 200,
  containerRef?: RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const minHeightValue = Number.parseFloat(
      getComputedStyle(el).minHeight || "0",
    );
    el.style.height = "auto";
    const nextHeight = Math.min(el.scrollHeight, maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";

    if (containerRef?.current) {
      const threshold = minHeightValue ? minHeightValue + 4 : 48;
      const isMultiline = nextHeight > threshold;
      containerRef.current.classList.toggle("is-multiline", isMultiline);
    }
  }, [inputRef, maxHeight, value]);
};
