import { useEffect, useMemo, useRef } from "react";
import lottie from "lottie-web";
import baseAnimation from "../assets/soundWaves.json";

type IconSoundProps = {
  className?: string;
  size?: number;
  color?: string;
  strokeColor?: string;
};

type LottieColor = [number, number, number, number];

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const hexToLottieColor = (hex: string): LottieColor => {
  const normalized = hex.replace("#", "").trim();
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  const number = Number.parseInt(expanded, 16);
  const r = clamp01(((number >> 16) & 255) / 255);
  const g = clamp01(((number >> 8) & 255) / 255);
  const b = clamp01((number & 255) / 255);
  return [r, g, b, 1];
};

const tintAnimation = (animation: unknown, fill?: string, stroke?: string) => {
  if (!fill && !stroke) return animation;
  const cloned = structuredClone(animation) as Record<string, unknown>;
  const fillColor = fill ? hexToLottieColor(fill) : undefined;
  const strokeColor = stroke
    ? hexToLottieColor(stroke)
    : fillColor
      ? fillColor
      : undefined;

  const walk = (node: unknown) => {
    if (!node) return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    if (typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (record.ty === "fl" && fillColor && record.c) {
      const color = record.c as { k?: LottieColor };
      color.k = fillColor;
    }
    if (record.ty === "st" && strokeColor && record.c) {
      const color = record.c as { k?: LottieColor };
      color.k = strokeColor;
    }
    Object.values(record).forEach(walk);
  };

  walk(cloned);
  return cloned;
};

const IconSound = ({
  className,
  size = 18,
  color,
  strokeColor,
}: IconSoundProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationData = useMemo(
    () => tintAnimation(baseAnimation, color, strokeColor),
    [color, strokeColor],
  );

  useEffect(() => {
    if (!containerRef.current) return undefined;
    containerRef.current.innerHTML = "";
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      animationData,
    });
    return () => animation.destroy();
  }, [animationData]);

  return (
    <div
      ref={containerRef}
      className={className ? `icon-sound ${className}` : "icon-sound"}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
};

export default IconSound;
