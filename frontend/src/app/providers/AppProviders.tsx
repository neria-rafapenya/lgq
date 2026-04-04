import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import WidgetShell from "../../components/widget/WidgetShell";

type AppProvidersProps = {
  mode: "app" | "widget";
  children: ReactNode;
};

function AppProviders({ mode, children }: AppProvidersProps) {
  if (mode === "widget") {
    return (
      <WidgetShell>
        <MemoryRouter>{children}</MemoryRouter>
      </WidgetShell>
    );
  }

  return <>{children}</>;
}

export default AppProviders;
