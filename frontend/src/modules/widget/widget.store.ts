import { create } from "zustand";
import { persist } from "zustand/middleware";

type LauncherPoint = {
  x: number;
  y: number;
};

type WidgetState = {
  isOpen: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  width: number;
  height: number;
  launcherPoint: LauncherPoint;
  open: (point?: LauncherPoint) => void;
  close: () => void;
  toggleExpanded: () => void;
  toggleMinimized: () => void;
  setLauncherPoint: (point: LauncherPoint) => void;
};

const defaultLauncherPoint: LauncherPoint = { x: 0, y: 0 };

export const useWidgetStore = create<WidgetState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      isMinimized: false,
      isExpanded: false,
      width: 1280,
      height: 820,
      launcherPoint: defaultLauncherPoint,
      open: (point) =>
        set({
          isOpen: true,
          isMinimized: false,
          launcherPoint: point ?? get().launcherPoint,
        }),
      close: () =>
        set({
          isOpen: false,
          isMinimized: false,
        }),
      toggleExpanded: () =>
        set((state) => ({
          isExpanded: !state.isExpanded,
          width: state.isExpanded ? 1280 : 1440,
          height: state.isExpanded ? 820 : 900,
        })),
      toggleMinimized: () =>
        set((state) => ({
          isMinimized: !state.isMinimized,
        })),
      setLauncherPoint: (point) => set({ launcherPoint: point }),
    }),
    {
      name: "lgq-widget",
      partialize: (state) => ({
        isExpanded: state.isExpanded,
        width: state.width,
        height: state.height,
      }),
    },
  ),
);
