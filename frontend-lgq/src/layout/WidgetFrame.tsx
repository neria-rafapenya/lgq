import { useCallback, useEffect, useMemo, useState } from "react";
import AuthPanel from "../components/AuthPanel";
import WizardShell from "../components/WizardShell";
import IconClose from "../components/IconClose";
import IconMinus from "../components/IconMinus";
import IconExit from "../components/IconExit";
import logo from "../assets/lgq-logo.png.webp";
import {
  deleteProject,
  downloadLgqBudgetPdf,
  fetchMe,
  fetchProjects,
  logout,
  updateProfile,
  type AuthUser,
  type ProjectSummary,
} from "../lib/api";

type WidgetFrameProps = {
  isOpen: boolean;
  onClose: () => void;
};

const WidgetFrame = ({ isOpen, onClose }: WidgetFrameProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [activeUserMenu, setActiveUserMenu] = useState<
    "projects" | "profile" | "budgets" | null
  >(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectDeletingId, setProjectDeletingId] = useState<number | null>(null);
  const [budgetLoadingId, setBudgetLoadingId] = useState<number | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [menuStatus, setMenuStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  useEffect(() => {
    let mounted = true;
    fetchMe()
      .then((user) => {
        if (!mounted) return;
        setIsAuthenticated(true);
        setCurrentUser(user);
      })
      .catch(() => {
        // Ignore if not authenticated yet.
        if (!mounted) return;
        setIsAuthenticated(false);
        setCurrentUser(null);
      })
      .finally(() => {
        if (!mounted) return;
        setAuthChecked(true);
      });
    return () => {
      mounted = false;
    };
  }, []);
  const displayName = useMemo(() => {
    if (!currentUser) return "";
    const name = currentUser.name?.trim();
    return name && name.length > 0 ? name : currentUser.email;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) {
      setProfileName("");
      return;
    }
    setProfileName(currentUser.name?.trim() || "");
  }, [currentUser]);

  const syncSelectedProject = useCallback(
    (list?: ProjectSummary[], preferredId?: number | null) => {
      const stored = Number(
        window.localStorage.getItem("lgq_active_project_id") || "",
      );
      const preferred =
        typeof preferredId === "number" && Number.isFinite(preferredId)
          ? preferredId
          : null;
      const candidate = preferred ?? stored;
      if (!Number.isFinite(candidate) || candidate <= 0) {
        setSelectedProjectId(null);
        return;
      }
      if (list && !list.some((project) => project.id === candidate)) {
        setSelectedProjectId(null);
        return;
      }
      setSelectedProjectId(candidate);
    },
    [],
  );

  const loadProjects = useCallback(
    async (
      preferredId?: number | null,
      options?: { reportError?: boolean },
    ) => {
    setProjectsLoading(true);
    try {
      const data = await fetchProjects();
      setProjects(data);
      const preferred =
        preferredId !== undefined ? preferredId : selectedProjectId;
      syncSelectedProject(data, preferred ?? null);
      return data;
    } catch (error) {
      setProjects([]);
      syncSelectedProject([]);
      if (options?.reportError) {
        setMenuStatus({
          type: "error",
          message: "No pude cargar los proyectos.",
        });
      }
      return [];
    } finally {
      setProjectsLoading(false);
    }
    },
    [selectedProjectId, syncSelectedProject],
  );

  const handleOpenUserDrawer = useCallback(() => {
    setIsUserDrawerOpen(true);
    setActiveUserMenu(null);
    setMenuStatus(null);
    syncSelectedProject();
  }, [syncSelectedProject]);

  useEffect(() => {
    if (!currentUser) return;
    void loadProjects();
  }, [currentUser, loadProjects]);

  useEffect(() => {
    const handleRefresh = () => {
      void loadProjects();
    };
    const handleProjectsList = (event: Event) => {
      const detail = (event as CustomEvent<ProjectSummary[]>).detail;
      if (!Array.isArray(detail)) return;
      setProjects(detail);
      syncSelectedProject(detail);
    };
    window.addEventListener("lgq:refresh-projects", handleRefresh);
    window.addEventListener(
      "lgq:projects-list",
      handleProjectsList as EventListener,
    );
    return () => {
      window.removeEventListener("lgq:refresh-projects", handleRefresh);
      window.removeEventListener(
        "lgq:projects-list",
        handleProjectsList as EventListener,
      );
    };
  }, [loadProjects, syncSelectedProject]);

  const handleCloseUserDrawer = useCallback(() => {
    setIsUserDrawerOpen(false);
    setActiveUserMenu(null);
    setMenuStatus(null);
  }, []);

  const handleOpenUserMenu = useCallback(
    (menu: "projects" | "profile" | "budgets") => {
      setActiveUserMenu(menu);
      setMenuStatus(null);
      syncSelectedProject();
      if (menu === "projects" || menu === "budgets") {
        void loadProjects(undefined, { reportError: true });
      }
    },
    [loadProjects, syncSelectedProject],
  );

  const handleProfileSave = useCallback(async () => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      setMenuStatus({
        type: "info",
        message: "Escribe un nombre para continuar.",
      });
      return;
    }
    setProfileSaving(true);
    setMenuStatus(null);
    try {
      const updated = await updateProfile(trimmed);
      setCurrentUser(updated);
      setMenuStatus({ type: "success", message: "Perfil actualizado." });
    } catch (error) {
      setMenuStatus({ type: "error", message: "No pude guardar el perfil." });
    } finally {
      setProfileSaving(false);
    }
  }, [profileName]);

  const handleDeleteProject = useCallback(
    async (projectId: number) => {
      const confirmed = window.confirm(
        "¿Eliminar este proyecto? Esta acción no se puede deshacer.",
      );
      if (!confirmed) return;
      setProjectDeletingId(projectId);
      setMenuStatus(null);
      try {
        await deleteProject(projectId);
        setProjects((prev) => prev.filter((project) => project.id !== projectId));
        const stored = Number(
          window.localStorage.getItem("lgq_active_project_id") || "",
        );
        if (stored === projectId) {
          window.localStorage.removeItem("lgq_active_project_id");
          setSelectedProjectId(null);
          window.dispatchEvent(new CustomEvent("lgq:refresh-projects"));
        }
      } catch (error) {
        setMenuStatus({
          type: "error",
          message: "No pude eliminar el proyecto.",
        });
      } finally {
        setProjectDeletingId(null);
      }
    },
    [],
  );

  const handleOpenProjectFromMenu = useCallback(
    (projectId: number) => {
      window.localStorage.setItem(
        "lgq_active_project_id",
        String(projectId),
      );
      setSelectedProjectId(projectId);
      window.dispatchEvent(
        new CustomEvent("lgq:open-project", { detail: projectId }),
      );
      handleCloseUserDrawer();
    },
    [handleCloseUserDrawer],
  );

  const handleOpenBudgetFromMenu = useCallback(async (projectId: number) => {
    setBudgetLoadingId(projectId);
    setMenuStatus(null);
    try {
      await downloadLgqBudgetPdf(projectId);
    } catch (error) {
      setMenuStatus({
        type: "error",
        message: "No pude descargar el presupuesto.",
      });
    } finally {
      setBudgetLoadingId(null);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setIsUserDrawerOpen(false);
    setActiveUserMenu(null);
    setMenuStatus(null);
    setProjects([]);
    setSelectedProjectId(null);
  }, []);

  const handleDrawerLogout = useCallback(async () => {
    await handleLogout();
  }, [handleLogout]);

  const handleClose = () => {
    setIsUserDrawerOpen(false);
    setActiveUserMenu(null);
    setIsMinimized(false);
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div
      className={`widget-overlay ${isMinimized ? "is-minimized" : ""}`}
      role="dialog"
      aria-modal="true"
    >
      {!isMinimized && (
        <button className="widget-backdrop" type="button" onClick={handleClose} />
      )}
      <div className={`widget-frame ${isMinimized ? "is-minimized" : ""}`}>
        <header className="widget-frame__header">
          <div className="widget-frame__title">
            <img className="widget-logo" src={logo} alt="LGQ" />
          </div>
          <div className="widget-frame__actions">
            {currentUser && (
              <div className="widget-user-bar">
                <button
                  className="widget-user-label"
                  type="button"
                  onClick={handleOpenUserDrawer}
                >
                  {displayName} · {currentUser.role}
                </button>
              </div>
            )}
            <button
              className="widget-frame__minimize icon-btn"
              type="button"
              onClick={() =>
                setIsMinimized((prev) => {
                  const next = !prev;
                  if (next) {
                    handleCloseUserDrawer();
                  }
                  return next;
                })
              }
              aria-label={isMinimized ? "Restaurar" : "Minimizar"}
            >
              <IconMinus size={14} />
            </button>
            <button
              className="widget-frame__close icon-btn"
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
            >
              <IconClose size={12} />
            </button>
          </div>
        </header>
        <div className="widget-frame__body">
          {!authChecked ? (
            <div className="loading">Comprobando sesión…</div>
          ) : isAuthenticated ? (
            <WizardShell />
          ) : (
            <AuthPanel
              onAuthenticated={(user) => {
                setIsAuthenticated(true);
                setCurrentUser(user);
              }}
            />
          )}
          {currentUser && isUserDrawerOpen && (
            <button
              className="user-drawer__backdrop"
              type="button"
              aria-label="Cerrar menú de usuario"
              onClick={handleCloseUserDrawer}
            />
          )}
          {currentUser && (
            <div className={`user-drawer ${isUserDrawerOpen ? "open" : ""}`}>
              <div className="user-drawer__panel">
                <div className="user-drawer__header">
                  <div>
                    <div className="user-drawer__name">{displayName}</div>
                    <div className="user-drawer__meta">{currentUser.email}</div>
                  </div>
                  <button
                    className="icon-btn user-drawer__close"
                    type="button"
                    onClick={handleCloseUserDrawer}
                    aria-label="Cerrar"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
                <nav className="user-drawer__nav">
                  <button
                    className="user-drawer__item"
                    type="button"
                    onClick={() => handleOpenUserMenu("projects")}
                  >
                    Proyectos
                  </button>
                  <button
                    className="user-drawer__item"
                    type="button"
                    onClick={() => handleOpenUserMenu("profile")}
                  >
                    Configuración de perfil
                  </button>
                  <button
                    className="user-drawer__item"
                    type="button"
                    onClick={() => handleOpenUserMenu("budgets")}
                  >
                    Presupuestos
                  </button>
                </nav>
                <div className="user-drawer__footer">
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={handleDrawerLogout}
                  >
                    <IconExit size={16} /> Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeUserMenu && (
            <div className="user-modal" role="dialog" aria-modal="true">
              <button
                className="user-modal__backdrop"
                type="button"
                aria-label="Cerrar ventana"
                onClick={() => setActiveUserMenu(null)}
              />
              <div className="user-modal__panel">
                <div className="user-modal__header">
                  <h3>
                    {activeUserMenu === "projects"
                      ? "Proyectos"
                      : activeUserMenu === "profile"
                        ? "Configuración de perfil"
                        : "Presupuestos"}
                  </h3>
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => setActiveUserMenu(null)}
                    aria-label="Cerrar"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
                <div className="user-modal__body">
                  {menuStatus && (
                    <div className={`user-modal__status ${menuStatus.type}`}>
                      {menuStatus.message}
                    </div>
                  )}
                  {activeUserMenu === "projects" && (
                    <>
                      {projectsLoading ? (
                        <p>Cargando proyectos…</p>
                      ) : projects.length === 0 ? (
                        <p>No hay proyectos todavía.</p>
                      ) : (
                        <ul className="user-list">
                          {projects.map((project) => {
                            const isActive =
                              project.id === selectedProjectId;
                            return (
                              <li key={project.id}>
                                <div className="user-list__info">
                                  <span className="user-list__name">
                                    {project.name || `Proyecto ${project.id}`}
                                  </span>
                                  {isActive && (
                                    <span className="user-list__tag">
                                      Activo
                                    </span>
                                  )}
                                </div>
                                <div className="user-list__actions">
                                  <button
                                    className="btn ghost"
                                    type="button"
                                    onClick={() =>
                                      handleOpenProjectFromMenu(project.id)
                                    }
                                  >
                                    Abrir
                                  </button>
                                  <button
                                    className="btn ghost danger"
                                    type="button"
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    disabled={
                                      projectDeletingId === project.id
                                    }
                                  >
                                    {projectDeletingId === project.id
                                      ? "Eliminando…"
                                      : "Eliminar"}
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  )}
                  {activeUserMenu === "profile" && (
                    <div className="user-form">
                      <label htmlFor="profile-name">Nombre</label>
                      <input
                        id="profile-name"
                        type="text"
                        className="form-control"
                        value={profileName}
                        onChange={(event) =>
                          setProfileName(event.target.value)
                        }
                        placeholder="Tu nombre"
                      />
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={handleProfileSave}
                        disabled={profileSaving}
                      >
                        {profileSaving ? "Guardando…" : "Guardar cambios"}
                      </button>
                    </div>
                  )}
                  {activeUserMenu === "budgets" && (
                    <>
                      {projectsLoading ? (
                        <p>Cargando presupuestos…</p>
                      ) : projects.length === 0 ? (
                        <p>Aún no tienes presupuestos guardados.</p>
                      ) : (
                        <ul className="user-list">
                          {projects.map((project) => (
                            <li key={`budget-${project.id}`}>
                              <div className="user-list__info">
                                <span className="user-list__name">
                                  {project.name || `Proyecto ${project.id}`}
                                </span>
                              </div>
                              <div className="user-list__actions">
                                <button
                                  className="btn ghost"
                                  type="button"
                                  onClick={() =>
                                    handleOpenBudgetFromMenu(project.id)
                                  }
                                  disabled={budgetLoadingId === project.id}
                                >
                                  {budgetLoadingId === project.id
                                    ? "Abriendo…"
                                    : "Ver presupuesto"}
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetFrame;
