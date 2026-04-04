import type { ReactNode } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { useWidgetStore } from "../../modules/widget/widget.store";
import logo from "../../assets/lgq-logo.png.webp";
import IconMinus from "../IconMinus";
import IconClose from "../IconClose";
import IconExpand from "../IconExpand";

type WidgetFrameProps = {
  children: ReactNode;
};

function WidgetFrame({ children }: WidgetFrameProps) {
  const isOpen = useWidgetStore((state) => state.isOpen);
  const isMinimized = useWidgetStore((state) => state.isMinimized);
  const isExpanded = useWidgetStore((state) => state.isExpanded);
  const width = useWidgetStore((state) => state.width);
  const height = useWidgetStore((state) => state.height);
  const launcherPoint = useWidgetStore((state) => state.launcherPoint);
  const close = useWidgetStore((state) => state.close);
  const toggleExpanded = useWidgetStore((state) => state.toggleExpanded);
  const toggleMinimized = useWidgetStore((state) => state.toggleMinimized);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    const originX = launcherPoint.x - rect.left;
    const originY = launcherPoint.y - rect.top;
    setOrigin({
      x: Math.max(0, originX),
      y: Math.max(0, originY),
    });
  }, [launcherPoint, width, height, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {!isMinimized && <div className="widget-overlay" onClick={close} />}
      <div
        ref={frameRef}
        className={`widget-frame ${isExpanded ? "is-expanded" : ""} ${
          isMinimized ? "is-minimized" : ""
        }`}
        style={
          {
            "--widget-width": `${width}px`,
            "--widget-height": `${height}px`,
            "--widget-origin-x": `${origin.x}px`,
            "--widget-origin-y": `${origin.y}px`,
          } as React.CSSProperties
        }
      >
        <div className="widget-frame__header">
          <div className="widget-frame__title">
            <img className="widget-logo" src={logo} alt="LGQ" />
          </div>
          <div className="widget-frame__actions">
            <div className="widget-frame__user" />
            <button
              className="widget-frame__minimize icon-btn"
              type="button"
              onClick={toggleMinimized}
              aria-label={isMinimized ? "Restaurar" : "Minimizar"}
            >
              <IconMinus size={14} />
            </button>
            <button
              className="widget-frame__expand icon-btn"
              type="button"
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Reducir" : "Expandir"}
            >
              <IconExpand size={14} />
            </button>
            <button
              className="widget-frame__close icon-btn"
              type="button"
              onClick={close}
              aria-label="Cerrar"
            >
              <IconClose size={12} />
            </button>
          </div>
        </div>
        <div className="widget-frame__body">{children}</div>
      </div>
    </>
  );
}

export default WidgetFrame;
