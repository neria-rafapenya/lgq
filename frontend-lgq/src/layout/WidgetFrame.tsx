import { useEffect, useState } from "react";
import AuthPanel from "../components/AuthPanel";
import WizardShell from "../components/WizardShell";
import { fetchMe } from "../lib/api";

type WidgetFrameProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WidgetFrame = ({ isOpen, onClose }: WidgetFrameProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then(() => {
        if (!mounted) return;
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Ignore if not authenticated yet.
      })
      .finally(() => {
        if (!mounted) return;
        setAuthChecked(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  if (!isOpen) return null;
  return (
    <div className="widget-overlay" role="dialog" aria-modal="true">
      <button className="widget-backdrop" type="button" onClick={onClose} />
      <div className="widget-frame">
        <header className="widget-frame__header">
          <div>
            <strong>LGQ Widget</strong>
            <span>Presupuestos con IA</span>
          </div>
          <button className="widget-frame__close" type="button" onClick={onClose}>
            ✕
          </button>
        </header>
        <div className="widget-frame__body">
          {!authChecked ? (
            <div className="loading">Comprobando sesión…</div>
          ) : isAuthenticated ? (
            <WizardShell />
          ) : (
            <AuthPanel onAuthenticated={() => setIsAuthenticated(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetFrame;
