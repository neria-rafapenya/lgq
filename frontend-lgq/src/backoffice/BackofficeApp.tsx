import { useEffect, useState } from "react";
import AuthPanel from "../components/AuthPanel";
import type { AuthUser } from "../lib/api";
import { fetchMe, logout } from "../lib/api";
import BackofficeCatalog from "./BackofficeCatalog";

const BackofficeApp = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchMe()
      .then((current) => {
        if (!isMounted) return;
        setUser(current);
      })
      .catch(() => {
        // Ignore if not authenticated yet.
      })
      .finally(() => {
        if (!isMounted) return;
        setAuthChecked(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setUser(null);
      setAuthChecked(true);
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="backoffice-shell">
        <section className="backoffice-card">
          <h2>Comprobando sesión…</h2>
          <p>Estamos validando tu acceso al backoffice.</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="backoffice-shell">
        <AuthPanel onAuthenticated={(next) => setUser(next)} />
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="backoffice-shell">
        <section className="backoffice-card">
          <h2>Acceso restringido</h2>
          <p>Esta sección solo está disponible para usuarios administradores.</p>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleLogout}
            disabled={loading}
          >
            Cerrar sesión
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="backoffice-shell">
      <header className="backoffice-header">
        <div>
          <h1>Backoffice LGQ</h1>
          <p>Gestión de catálogos y variantes.</p>
        </div>
        <div className="backoffice-header__actions">
          <span>{user.email}</span>
          <button
            className="btn btn-tertiary btn-tertiary-dark btn-small"
            type="button"
            onClick={handleLogout}
            disabled={loading}
          >
            Cerrar sesión
          </button>
        </div>
      </header>
      <BackofficeCatalog />
    </div>
  );
};

export default BackofficeApp;
