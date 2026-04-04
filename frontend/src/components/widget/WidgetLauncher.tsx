import type { MouseEvent } from "react";
import { useWidgetStore } from "../../modules/widget/widget.store";

function WidgetLauncher() {
  const isOpen = useWidgetStore((state) => state.isOpen);
  const open = useWidgetStore((state) => state.open);
  const setLauncherPoint = useWidgetStore((state) => state.setLauncherPoint);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const point = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setLauncherPoint(point);
    open(point);
  };

  return (
    <button
      className={`widget-launcher ${isOpen ? "hidden" : ""}`}
      type="button"
      onClick={handleClick}
    >
      LGQ
    </button>
  );
}

export default WidgetLauncher;
