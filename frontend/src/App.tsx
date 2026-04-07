import HostPage from "./layout/HostPage";
import WidgetShell from "./layout/WidgetShell";
import { BUILD_TARGET } from "./config/env";
import BackofficeApp from "./backoffice/BackofficeApp";

function App() {
  const isBackoffice =
    BUILD_TARGET === "backoffice" || window.location.pathname.startsWith("/backoffice");

  if (isBackoffice) {
    return <BackofficeApp />;
  }

  if (BUILD_TARGET === "widget") {
    return <WidgetShell />;
  }

  return (
    <div className="app-shell">
      <HostPage />
      <WidgetShell />
    </div>
  );
}

export default App;
