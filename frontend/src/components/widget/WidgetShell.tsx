import type { ReactNode } from "react";
import WidgetFrame from "./WidgetFrame";
import WidgetLauncher from "./WidgetLauncher";

type WidgetShellProps = {
  children: ReactNode;
};

function WidgetShell({ children }: WidgetShellProps) {
  return (
    <>
      <WidgetLauncher />
      <WidgetFrame>{children}</WidgetFrame>
    </>
  );
}

export default WidgetShell;
