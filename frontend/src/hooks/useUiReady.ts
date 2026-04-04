import { useEffect, useState } from "react";
import type { RefObject } from "react";

type UiReadyOptions = {
  minDelayMs?: number;
  stableRef?: RefObject<HTMLElement | null>;
  stableMs?: number;
};

export const useUiReady = (
  booting: boolean,
  { minDelayMs = 600, stableRef, stableMs = 240 }: UiReadyOptions = {},
) => {
  const [uiReady, setUiReady] = useState(false);

  useEffect(() => {
    if (booting) {
      setUiReady(false);
      return;
    }
    let cancelled = false;
    let timeoutId: number | null = null;
    let stableTimer: number | null = null;
    let minDelayDone = false;
    let sizeStable = !stableRef?.current;
    let observer: ResizeObserver | null = null;

    const tryFinalize = () => {
      if (cancelled) return;
      if (minDelayDone && sizeStable) {
        requestAnimationFrame(() => {
          if (!cancelled) setUiReady(true);
        });
      }
    };

    const armStableTimer = () => {
      if (!stableRef?.current) return;
      sizeStable = false;
      if (stableTimer !== null) window.clearTimeout(stableTimer);
      stableTimer = window.setTimeout(() => {
        sizeStable = true;
        tryFinalize();
      }, stableMs);
    };

    if (stableRef?.current && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        armStableTimer();
      });
      observer.observe(stableRef.current);
      armStableTimer();
    }

    const finalize = async () => {
      if (typeof document !== "undefined" && "fonts" in document) {
        try {
          await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
        } catch {
          // ignore font readiness errors
        }
      }
      if (minDelayMs > 0) {
        await new Promise<void>((resolve) => {
          timeoutId = window.setTimeout(() => resolve(), minDelayMs);
        });
      }
      if (cancelled) return;
      minDelayDone = true;
      tryFinalize();
    };
    finalize();
    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      if (stableTimer !== null) window.clearTimeout(stableTimer);
      if (observer && stableRef?.current) {
        observer.unobserve(stableRef.current);
      }
    };
  }, [booting, minDelayMs, stableMs, stableRef]);

  return uiReady;
};
