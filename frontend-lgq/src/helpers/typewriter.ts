type TypewriterOptions = {
  speed?: number;
  startDelay?: number;
  chunkSize?: number;
  onDone?: () => void;
};

export const typewriter = (
  text: string,
  onTick: (value: string) => void,
  options: TypewriterOptions = {},
) => {
  const speed = options.speed ?? 18;
  const startDelay = options.startDelay ?? 0;
  const chunkSize = options.chunkSize ?? 1;
  let index = 0;
  let cancelled = false;
  let timeoutId: number | null = null;

  const step = () => {
    if (cancelled) return;
    index = Math.min(text.length, index + chunkSize);
    onTick(text.slice(0, index));
    if (index >= text.length) {
      options.onDone?.();
      return;
    }
    timeoutId = window.setTimeout(step, speed);
  };

  timeoutId = window.setTimeout(step, startDelay);

  return () => {
    cancelled = true;
    if (timeoutId != null) {
      window.clearTimeout(timeoutId);
    }
  };
};
