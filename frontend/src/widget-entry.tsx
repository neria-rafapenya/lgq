import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import App from "./App";
import AppProviders from "./app/providers/AppProviders";
import widgetCss from "./widget.scss?inline";
import appCss from "./App.scss?inline";

type MountOptions = {
  container?: string;
  apiBase?: string;
};

let root: Root | null = null;
let mountContainer: HTMLElement | null = null;

const injectStyles = () => {
  if (document.getElementById("lgq-widget-styles")) return;
  const styleTag = document.createElement("style");
  styleTag.id = "lgq-widget-styles";
  styleTag.textContent = `${widgetCss}\n${appCss}`;
  document.head.appendChild(styleTag);
};

const mount = ({ container, apiBase }: MountOptions = {}) => {
  if (root) return;

  if (apiBase) {
    window.LGQ_API_BASE = apiBase;
  }

  if (container) {
    mountContainer = document.querySelector(container);
  }

  if (!mountContainer) {
    mountContainer = document.createElement("div");
    mountContainer.id = "lgq-widget-root";
    document.body.appendChild(mountContainer);
  }

  mountContainer.classList.add("lgq-widget");
  injectStyles();

  root = createRoot(mountContainer);
  root.render(
    <StrictMode>
      <AppProviders mode="widget">
        <App />
      </AppProviders>
    </StrictMode>,
  );
};

const unmount = () => {
  if (!root) return;
  root.unmount();
  root = null;
  if (mountContainer?.id === "lgq-widget-root") {
    mountContainer.remove();
  }
  mountContainer = null;
};

window.LGQWidget = { mount, unmount };
