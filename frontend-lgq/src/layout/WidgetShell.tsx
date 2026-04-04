import { useState } from "react";
import WidgetFrame from "./WidgetFrame";
import WidgetLauncher from "./WidgetLauncher";

const WidgetShell = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <WidgetFrame isOpen={isOpen} onClose={() => setIsOpen(false)} />
      <WidgetLauncher onOpen={() => setIsOpen(true)} />
    </>
  );
};

export default WidgetShell;
