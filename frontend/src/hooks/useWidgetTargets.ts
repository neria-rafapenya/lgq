import { useEffect, useState } from "react";

export const useWidgetTargets = () => {
  const [widgetHeaderTarget, setWidgetHeaderTarget] =
    useState<HTMLElement | null>(null);
  const [isWidgetMode, setIsWidgetMode] = useState(false);

  useEffect(() => {
    const updateTargets = () => {
      const nextTarget = document.querySelector(
        ".widget-frame__user",
      ) as HTMLElement | null;
      setWidgetHeaderTarget((prev) =>
        prev !== nextTarget ? nextTarget : prev,
      );
      const nextWidgetMode = Boolean(document.querySelector(".lgq-widget"));
      setIsWidgetMode((prev) =>
        prev !== nextWidgetMode ? nextWidgetMode : prev,
      );
    };

    updateTargets();

    const observer = new MutationObserver(updateTargets);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return { widgetHeaderTarget, isWidgetMode };
};
