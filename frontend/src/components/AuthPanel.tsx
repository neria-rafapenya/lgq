import { useEffect, useState } from "react";
import type { AuthUser } from "../lib/api";
import { login, logout, register } from "../lib/api";

type AuthPanelProps = {
  onAuthenticated?: (user: AuthUser) => void;
};

const AuthPanel = ({ onAuthenticated }: AuthPanelProps) => {
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<{
    type: "error" | "info";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!status) return;
    const timeout = window.setTimeout(() => {
      setStatus(null);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [status]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setStatus({
        type: "info",
        message: "Email y contraseña son obligatorios.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const user =
        authMode === "register"
          ? await register(email.trim(), password)
          : await login(email.trim(), password);
      setCurrentUser(user);
      onAuthenticated?.(user);
      setPassword("");
    } catch (error) {
      setStatus({
        type: "error",
        message: "Ha habido un error de autenticación",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      setCurrentUser(null);
      setLoading(false);
    }
  };

  if (currentUser) {
    return (
      <div className="auth-screen">
        <section className="auth-card auth-card--success">
          <h2>Sesión iniciada</h2>
          <p>{currentUser.email}</p>
          <button
            className="btn btn-secondary"
            type="button"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <section className="auth-card">
        {status && (
          <div className={`status ${status.type}`}>{status.message}</div>
        )}
        {loading && <div className="loading">Procesando…</div>}
        <div className={`panel auth-panel ${authMode}`} key={authMode}>
          <h2>{authMode === "register" ? "Crear cuenta" : "Iniciar sesión"}</h2>
          <p>El presupuesto inteligente requiere un usuario autenticado.</p>
          <div className="grid two mt-5 mb-4">
            <input
              type="email"
              className="form-control"
              placeholder="tu@email.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <input
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="actions">
            <button
              className="btn btn-tertiary btn-tertiary-light"
              type="button"
              onClick={() =>
                setAuthMode((prev) =>
                  prev === "register" ? "login" : "register",
                )
              }
            >
              {authMode === "register" ? "Ya tengo cuenta" : "Crear cuenta"}
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={handleSubmit}
            >
              {authMode === "register" ? "Registrar" : "Entrar"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AuthPanel;
