type WidgetLauncherProps = {
  onOpen: () => void;
};

const WidgetLauncher = ({ onOpen }: WidgetLauncherProps) => {
  return (
    <button className="widget-launcher" type="button" onClick={onOpen}>
      LGQ
    </button>
  );
};

export default WidgetLauncher;
