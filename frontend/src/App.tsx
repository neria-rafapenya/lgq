import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import IconExit from "./components/IconExit";
import IconClose from "./components/IconClose";
import IconEye from "./components/IconEye";
import IconMic from "./components/IconMic";
import IconSound from "./components/IconSound";
import IconSend from "./components/IconSend";
import IconSummary from "./components/IconSummary";
import IconHearts from "./components/IconHearts";
import {
  deleteProject,
  downloadBudgetPdf,
  fetchCatalogItems,
  fetchEquipment,
  fetchMaterials,
  saveEquipment,
  saveMaterials,
  updateProfile,
} from "./lib/api";
import type {
  CatalogItem,
  EquipmentSelectionItem,
  MaterialSelectionItem,
} from "./lib/api";
import { splitChapter } from "./helpers/chat";
import {
  formatCatalogSelectionMessage,
  inferCatalogFilter,
  isEquipmentItem,
} from "./helpers/catalog";
import {
  DEFAULT_SCOPE,
  DEFAULT_SPACE_STATE,
  STEP_FALLBACKS,
  STEP_LABELS,
} from "./helpers/constants";
import { formatAssistantBody } from "./helpers/formatters";
import type {
  AuthUser,
  ProjectScope,
  ProjectSpaceState,
  ProjectSummary,
} from "./lib/api";
import {
  useAuthActions,
  useAuthGuard,
  useBootSequence,
  useConversationLoader,
  useCurrentStep,
  useDisplaySteps,
  useFocusInput,
  useProgress,
  useProjectActions,
  useProjectLoaders,
  useScopeSummary,
  useScrollToStory,
  useSpaceSummary,
  useStepsToRender,
  useStorySteps,
  useTextareaAutoResize,
  useUiReady,
  useWelcomeMessage,
  useWizardActions,
  useWidgetTargets,
} from "./hooks";
import { useWidgetStore } from "./modules/widget/widget.store";
import type { ChatMessage } from "./types/chat";
import type { StatusState } from "./types/status";

const LAST_PROJECT_KEY = "lgq.lastProjectId";

function App() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null,
  );
  const [newProjectName, setNewProjectName] = useState("");
  const [scope, setScope] = useState<ProjectScope>(DEFAULT_SCOPE);
  const [spaceState, setSpaceState] =
    useState<ProjectSpaceState>(DEFAULT_SPACE_STATE);
  const [missing, setMissing] = useState<string[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [wizardBusy, setWizardBusy] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [nextFocus, setNextFocus] = useState<string | null>(null);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogDraft, setCatalogDraft] = useState<CatalogItem[]>([]);
  const [catalogDetail, setCatalogDetail] = useState<CatalogItem | null>(null);
  const [materialSelections, setMaterialSelections] = useState<
    MaterialSelectionItem[]
  >([]);
  const [equipmentSelections, setEquipmentSelections] = useState<
    EquipmentSelectionItem[]
  >([]);

  const [status, setStatus] = useState<StatusState | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [calculatingBudget, setCalculatingBudget] = useState(false);

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false);
  const [activeUserMenu, setActiveUserMenu] = useState<
    "projects" | "profile" | "budgets" | null
  >(null);
  const [profileName, setProfileName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [projectDeletingId, setProjectDeletingId] = useState<number | null>(
    null,
  );
  const [budgetLoadingId, setBudgetLoadingId] = useState<number | null>(null);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const floatingInputRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const appContentRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const dictationBaseRef = useRef("");

  const startBoot = useCallback(() => setBooting(true), []);
  const endBoot = useCallback(() => setBooting(false), []);

  const persistLastProject = useCallback((projectId: number) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LAST_PROJECT_KEY, String(projectId));
  }, []);

  const clearLastProject = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LAST_PROJECT_KEY);
  }, []);

  const getLastProject = useCallback(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(LAST_PROJECT_KEY);
    const parsed = stored ? Number(stored) : null;
    return parsed && !Number.isNaN(parsed) ? parsed : null;
  }, []);

  const resetProjectState = useCallback(() => {
    setSelectedProjectId(null);
    setScope(DEFAULT_SCOPE);
    setSpaceState(DEFAULT_SPACE_STATE);
    setMessages([]);
    setConversationId(null);
    setMissing([]);
    setNextFocus(null);
  }, []);

  const handleUnauthenticated = useCallback(() => {
    clearLastProject();
    resetProjectState();
    setCurrentUser(null);
  }, [clearLastProject, resetProjectState]);

  const { handleAuthError } = useAuthGuard({
    onUnauthenticated: handleUnauthenticated,
    setStatus,
  });

  const { loadProjects, loadProjectData } = useProjectLoaders({
    setProjects,
    setScope,
    setSpaceState,
    setStatus,
    setLoading,
    handleAuthError,
  });

  const { loadConversation, resetConversation } = useConversationLoader({
    setConversationId,
    setMessages,
    setMissing,
    setNextFocus,
    setStatus,
    setShowSummary,
    handleAuthError,
  });

  const scrollToStory = useScrollToStory(storyRef, selectedProjectId);

  const canCalculateBudget = Boolean(selectedProjectId && missing.length === 0);

  const handleCalculateBudget = useCallback(async () => {
    if (!selectedProjectId) return;
    setCalculatingBudget(true);
    setStatus(null);
    try {
      await downloadBudgetPdf(selectedProjectId);
    } catch (error) {
      if (handleAuthError(error)) return;
      setStatus({
        type: "error",
        message: "No pude descargar el presupuesto.",
      });
    } finally {
      setCalculatingBudget(false);
    }
  }, [handleAuthError, selectedProjectId]);

  const { handleWizardTurn, handleSendMessage, handleResetStory } =
    useWizardActions({
      selectedProjectId,
      conversationId,
      messageInput,
      inputRef,
      setMessageInput,
      setMessages,
      setConversationId,
      setScope,
      setSpaceState,
      setMissing,
      setWizardBusy,
      setStatus,
      setSelectedProjectId,
      setNextFocus,
      handleAuthError,
    });

  const { handleCreateProject, handleProjectSelect } = useProjectActions({
    newProjectName,
    setNewProjectName,
    setSelectedProjectId,
    setScope,
    setSpaceState,
    setStatus,
    setLoading,
    loadProjects,
    loadProjectData,
    loadConversation,
    resetConversation,
    persistLastProject,
    handleWizardTurn,
    scrollToStory,
    handleAuthError,
    defaultScope: DEFAULT_SCOPE,
    defaultSpaceState: DEFAULT_SPACE_STATE,
  });

  const { handleAuthSubmit, handleLogout } = useAuthActions({
    authEmail,
    authPassword,
    authMode,
    setStatus,
    setLoading,
    setCurrentUser,
    setAuthPassword,
    setProjects,
    setSelectedProjectId,
    setScope,
    setSpaceState,
    setMessages,
    setConversationId,
    loadProjects,
    defaultScope: DEFAULT_SCOPE,
    defaultSpaceState: DEFAULT_SPACE_STATE,
    onLogout: clearLastProject,
  });

  const { widgetHeaderTarget, isWidgetMode } = useWidgetTargets();
  const isWidgetOpen = useWidgetStore((state) => state.isOpen);
  const wasWidgetOpenRef = useRef(isWidgetOpen);

  useEffect(() => {
    if (wasWidgetOpenRef.current && !isWidgetOpen) {
      clearLastProject();
      resetProjectState();
    }
    wasWidgetOpenRef.current = isWidgetOpen;
  }, [clearLastProject, isWidgetOpen, resetProjectState]);

  useBootSequence({
    onBootStart: startBoot,
    onBootEnd: endBoot,
    onUser: setCurrentUser,
    loadProjects,
  });

  useEffect(() => {
    if (!currentUser) return;
    if (selectedProjectId) return;
    if (!projects.length) return;
    const stored = getLastProject();
    if (!stored) return;
    if (!projects.some((project) => project.id === stored)) return;
    handleProjectSelect(String(stored));
  }, [
    currentUser,
    getLastProject,
    handleProjectSelect,
    projects,
    selectedProjectId,
  ]);

  useEffect(() => {
    if (!currentUser) return;
    setProfileName(currentUser.name ?? "");
  }, [currentUser]);

  useFocusInput(inputRef, selectedProjectId, wizardBusy, messages.length);
  useTextareaAutoResize(inputRef, messageInput, 200, floatingInputRef);

  const catalogSelections = useMemo(() => {
    const selectedIds = new Set([
      ...materialSelections.map((item) => item.lineitemId),
      ...equipmentSelections.map((item) => item.lineitemId),
    ]);
    return catalogItems.filter((item) => selectedIds.has(item.lineitemId));
  }, [catalogItems, equipmentSelections, materialSelections]);

  const catalogDraftIds = useMemo(
    () => new Set(catalogDraft.map((item) => item.lineitemId)),
    [catalogDraft],
  );

  const catalogSelectionIds = useMemo(
    () => new Set(catalogSelections.map((item) => item.lineitemId)),
    [catalogSelections],
  );

  useEffect(() => {
    if (!selectedProjectId) {
      setCatalogDraft([]);
      return;
    }
    if (nextFocus !== "catalog") {
      setCatalogDraft([]);
    }
  }, [nextFocus, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    if (nextFocus === "catalog") {
      setCatalogVisible(catalogSelections.length === 0);
      return;
    }
    setCatalogVisible(false);
  }, [catalogSelections.length, nextFocus, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    setCatalogLoading(true);
    fetchCatalogItems()
      .then((items) => {
        setCatalogItems(items);
        return Promise.all([
          fetchMaterials(selectedProjectId),
          fetchEquipment(selectedProjectId),
        ]).then(([materials, equipment]) => {
          setMaterialSelections(materials);
          setEquipmentSelections(equipment);
        });
      })
      .catch(() => {
        setCatalogItems([]);
        setMaterialSelections([]);
        setEquipmentSelections([]);
      })
      .finally(() => setCatalogLoading(false));
  }, [selectedProjectId]);

  const lastAssistantMessage =
    [...messages].reverse().find((message) => message.role === "assistant")
      ?.content ?? "";
  const shouldShowBudgetCta = useMemo(() => {
    if (!selectedProjectId) return false;
    const text = lastAssistantMessage.toLowerCase();
    const trigger =
      text.includes("pasamos al cierre del presupuesto") ||
      text.includes("cierre del presupuesto") ||
      text.includes("¿quieres revisar algún detalle") ||
      text.includes("quieres revisar algún detalle");
    return trigger && canCalculateBudget;
  }, [canCalculateBudget, lastAssistantMessage, selectedProjectId]);

  const { items: filteredCatalogItems, room: inferredRoom } =
    inferCatalogFilter(catalogItems, lastAssistantMessage);

  const handleCatalogToggle = useCallback(
    (item: CatalogItem) => {
      if (catalogSelectionIds.has(item.lineitemId)) {
        return;
      }
      setCatalogDraft((prev) => {
        const exists = prev.some(
          (entry) => entry.lineitemId === item.lineitemId,
        );
        if (exists) {
          return prev.filter((entry) => entry.lineitemId !== item.lineitemId);
        }
        return [...prev, item];
      });
    },
    [catalogSelectionIds],
  );

  const handleCatalogConfirm = useCallback(async () => {
    if (!selectedProjectId || catalogDraft.length === 0) return;
    const materialDraft = catalogDraft.filter((item) => !isEquipmentItem(item));
    const equipmentDraft = catalogDraft.filter((item) => isEquipmentItem(item));

    const nextMaterials = [...materialSelections];
    const quantity =
      typeof spaceState.areaM2 === "number" && spaceState.areaM2 > 0
        ? spaceState.areaM2
        : 1;
    materialDraft.forEach((item) => {
      if (nextMaterials.some((entry) => entry.lineitemId === item.lineitemId)) {
        return;
      }
      nextMaterials.push({
        lineitemId: item.lineitemId,
        variantId: item.variantId,
        quantity,
        isSelected: true,
        isCustom: false,
      });
    });

    const nextEquipment = [...equipmentSelections];
    equipmentDraft.forEach((item) => {
      if (nextEquipment.some((entry) => entry.lineitemId === item.lineitemId)) {
        return;
      }
      nextEquipment.push({
        lineitemId: item.lineitemId,
        variantId: item.variantId,
        quantity: 1,
        room: inferredRoom,
        isSelected: true,
      });
    });

    if (materialDraft.length > 0) {
      setMaterialSelections(nextMaterials);
      await saveMaterials(selectedProjectId, nextMaterials);
    }
    if (equipmentDraft.length > 0) {
      setEquipmentSelections(nextEquipment);
      await saveEquipment(selectedProjectId, nextEquipment);
    }

    const selectionPayload = catalogDraft.map((item) => ({
      lineitemId: item.lineitemId,
      variantId: item.variantId,
      name: item.name,
    }));
    setCatalogDraft([]);
    setCatalogVisible(false);
    const selectionMessage = formatCatalogSelectionMessage(catalogDraft);
    await handleWizardTurn({
      message:
        selectionMessage ||
        `He elegido del catálogo: ${JSON.stringify(selectionPayload)}.`,
      appendUser: true,
    });
  }, [
    catalogDraft,
    equipmentSelections,
    handleWizardTurn,
    inferredRoom,
    materialSelections,
    saveEquipment,
    saveMaterials,
    selectedProjectId,
    spaceState.areaM2,
  ]);

  const handleCatalogRemove = useCallback(
    async (item: CatalogItem) => {
      if (!selectedProjectId) return;
      const nextMaterials = materialSelections.filter(
        (entry) => entry.lineitemId !== item.lineitemId,
      );
      const nextEquipment = equipmentSelections.filter(
        (entry) => entry.lineitemId !== item.lineitemId,
      );
      setMaterialSelections(nextMaterials);
      setEquipmentSelections(nextEquipment);
      setCatalogDraft((prev) =>
        prev.filter((entry) => entry.lineitemId !== item.lineitemId),
      );
      try {
        await Promise.all([
          saveMaterials(selectedProjectId, nextMaterials),
          saveEquipment(selectedProjectId, nextEquipment),
        ]);
      } catch (error) {
        if (handleAuthError(error)) return;
        setStatus({
          type: "error",
          message: "No pude eliminar el artículo del catálogo.",
        });
      }
    },
    [
      equipmentSelections,
      handleAuthError,
      materialSelections,
      saveEquipment,
      saveMaterials,
      selectedProjectId,
      setStatus,
    ],
  );

  const handleCatalogSkip = useCallback(async () => {
    setCatalogVisible(false);
    setCatalogDraft([]);
    await handleWizardTurn({
      message: "Lo compraré por mi cuenta.",
      appendUser: true,
    });
  }, [handleWizardTurn]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const recognitionCtor =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!recognitionCtor) return;
    setSpeechSupported(true);
    const recognition = new recognitionCtor();
    recognition.lang = "es-ES";
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.onresult = (event: any) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        transcript += event.results[i][0].transcript;
      }
      const base = dictationBaseRef.current;
      setMessageInput(`${base} ${transcript}`.trim());
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognitionRef.current = recognition;
    return () => {
      recognition.stop();
    };
  }, []);

  const toggleDictation = useCallback(() => {
    if (!speechSupported || wizardBusy) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }
    dictationBaseRef.current = messageInput.trim();
    setIsListening(true);
    recognition.start();
  }, [isListening, messageInput, speechSupported, wizardBusy]);

  const handleSendWithDictation = useCallback(async () => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    await handleSendMessage();
  }, [handleSendMessage, isListening]);

  const displayName = useMemo(() => {
    if (!currentUser) return "";
    const name = currentUser.name?.trim();
    return name ? name : currentUser.email;
  }, [currentUser]);

  const handleOpenUserDrawer = useCallback(() => {
    setIsUserDrawerOpen(true);
  }, []);

  const handleCloseUserDrawer = useCallback(() => {
    setIsUserDrawerOpen(false);
    setActiveUserMenu(null);
  }, []);

  const handleOpenUserMenu = useCallback(
    (menu: "projects" | "profile" | "budgets") => {
      setActiveUserMenu(menu);
    },
    [],
  );

  const handleProfileSave = useCallback(async () => {
    const trimmed = profileName.trim();
    if (!trimmed) {
      setStatus({ type: "info", message: "Escribe un nombre para continuar." });
      return;
    }
    setProfileSaving(true);
    setStatus(null);
    try {
      const updated = await updateProfile(trimmed);
      setCurrentUser(updated);
      setStatus({ type: "success", message: "Perfil actualizado." });
    } catch (error) {
      if (handleAuthError(error)) return;
      setStatus({ type: "error", message: "No pude guardar el perfil." });
    } finally {
      setProfileSaving(false);
    }
  }, [handleAuthError, profileName, setCurrentUser, setStatus]);

  const handleDeleteProject = useCallback(
    async (projectId: number) => {
      const result = await Swal.fire({
        title: "¿Eliminar este proyecto?",
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
        confirmButtonColor: "#d8342f",
      });
      if (!result.isConfirmed) return;
      setProjectDeletingId(projectId);
      setStatus(null);
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      try {
        await deleteProject(projectId);
        if (selectedProjectId === projectId) {
          clearLastProject();
          resetProjectState();
        }
      } catch (error) {
        if (handleAuthError(error)) return;
        setStatus({ type: "error", message: "No pude eliminar el proyecto." });
      } finally {
        setProjectDeletingId(null);
      }
    },
    [
      clearLastProject,
      handleAuthError,
      resetProjectState,
      selectedProjectId,
      setProjects,
      setStatus,
    ],
  );

  const handleOpenProjectFromMenu = useCallback(
    async (projectId: number) => {
      await handleProjectSelect(String(projectId));
      handleCloseUserDrawer();
    },
    [handleCloseUserDrawer, handleProjectSelect],
  );

  const handleOpenBudgetFromMenu = useCallback(
    async (projectId: number) => {
      setBudgetLoadingId(projectId);
      setStatus(null);
    try {
      await downloadBudgetPdf(projectId);
    } catch (error) {
      if (handleAuthError(error)) return;
      setStatus({
        type: "error",
        message: "No pude descargar el presupuesto.",
      });
      } finally {
        setBudgetLoadingId(null);
      }
    },
    [handleAuthError, setStatus],
  );

  const handleDrawerLogout = useCallback(async () => {
    await handleLogout();
    setIsUserDrawerOpen(false);
    setActiveUserMenu(null);
  }, [handleLogout]);
  const uiReady = useUiReady(booting, {
    minDelayMs: 900,
    stableRef: appContentRef,
    stableMs: 260,
  });

  const scopeSummary = useScopeSummary(scope);
  const spaceSummary = useSpaceSummary(spaceState);
  const progress = useProgress(
    missing,
    selectedProjectId,
    scopeSummary,
    spaceSummary,
  );
  const currentStep = useCurrentStep(missing, selectedProjectId);
  const welcomeMessage = useWelcomeMessage(messages.length, selectedProjectId);
  const storySteps = useStorySteps(messages);
  const displaySteps = useDisplaySteps(storySteps, welcomeMessage);
  const stepsToRender = useStepsToRender(displaySteps, wizardBusy);

  const steps = STEP_LABELS;

  const isMissing = (key: string) => missing.includes(key);

  const showBootOverlay = booting || !uiReady;

  const widgetUserPortal =
    widgetHeaderTarget && currentUser
      ? createPortal(
          <div className="widget-user-bar">
            <button
              className="widget-user-label"
              type="button"
              onClick={handleOpenUserDrawer}
            >
              {displayName} · {currentUser.role}
            </button>
          </div>,
          widgetHeaderTarget,
        )
      : null;

  return (
    <div
      className={`app ${showBootOverlay ? "is-loading" : ""} ${
        currentUser ? "" : "is-auth"
      }`}
    >
      {showBootOverlay && (
        <div className="boot-overlay">
          <div className="boot-screen">
            <IconHearts size={208} />
            <p>Preparando tu historia…</p>
          </div>
        </div>
      )}
      <div className="app-content" ref={appContentRef}>
        {widgetUserPortal}
        {!currentUser ? (
          <main className="single auth-screen">
            <section className="card project-card">
              {status && (
                <div className={`status ${status.type}`}>{status.message}</div>
              )}
              {loading && <div className="loading">Procesando…</div>}
              <div className={`panel auth-panel ${authMode}`} key={authMode}>
                <h2>
                  {authMode === "register" ? "Crear cuenta" : "Iniciar sesión"}
                </h2>
                <p>
                  El presupuesto inteligente requiere un usuario autenticado.
                </p>
                <div className="grid two">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={authEmail}
                    onChange={(event) => setAuthEmail(event.target.value)}
                  />

                  <input
                    type="password"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(event) => setAuthPassword(event.target.value)}
                  />
                </div>
                <div className="actions">
                  <button
                    className="btn light"
                    type="button"
                    onClick={() =>
                      setAuthMode((prev) =>
                        prev === "register" ? "login" : "register",
                      )
                    }
                  >
                    {authMode === "register"
                      ? "Ya tengo cuenta"
                      : "Crear cuenta"}
                  </button>
                  <button
                    className="btn light"
                    type="button"
                    onClick={handleAuthSubmit}
                  >
                    {authMode === "register" ? "Registrar" : "Entrar"}
                  </button>
                </div>
              </div>
            </section>
          </main>
        ) : !selectedProjectId ? (
          <main className="single">
            <section className="card login-card">
              {status && (
                <div className={`status ${status.type}`}>{status.message}</div>
              )}
              {loading && <div className="loading">Actualizando datos…</div>}
              <div className="panel">
                <h2>Crear o seleccionar proyecto</h2>
                <p>
                  Vamos a crear un proyecto nuevo para tu presupuesto o bien
                  elige uno existente.
                </p>
                <div className="project-primary">
                  <input
                    type="text"
                    placeholder="Escribe por ejemplo Reforma cocina completa"
                    value={newProjectName}
                    onChange={(event) => setNewProjectName(event.target.value)}
                  />

                  <div className="project-row">
                    {projects.length > 0 && (
                      <div className="project-existing">
                        <select
                          value={selectedProjectId ?? ""}
                          onChange={(event) =>
                            handleProjectSelect(event.target.value)
                          }
                        >
                          <option value="">Proyecto existente…</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name ?? `Proyecto ${project.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="project-actions">
                      <button
                        className="btn light"
                        type="button"
                        onClick={handleCreateProject}
                        disabled={!newProjectName.trim()}
                      >
                        Crear proyecto
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </main>
        ) : (
          <main className="wizard-layout">
            {currentStep && (
              <div className="floating-stepper container">
                <div className="stepper-title">Pasos</div>
                <ol>
                  {steps.map((step) => (
                    <li
                      key={step}
                      className={step === currentStep ? "active" : ""}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button
              className={`btn primary floating-summary-toggle ${showSummary ? "open" : ""}`}
              type="button"
              onClick={() => setShowSummary((prev) => !prev)}
            >
              <IconSummary size={38} />
              <span>Resumen</span>
            </button>

            {showSummary && (
              <button
                className="summary-backdrop"
                type="button"
                aria-label="Cerrar resumen"
                onClick={() => setShowSummary(false)}
              />
            )}

            <div ref={storyRef} />

            <section className="chat-shell container">
              {status && (
                <div className={`story-steps status ${status.type}`}>
                  {status.message}
                </div>
              )}
              {loading && (
                <div className="story-steps loading">Actualizando datos…</div>
              )}

              <div>
                {stepsToRender.map((step, index) => {
                  const isCurrent = index === stepsToRender.length - 1;
                  const assistantContent = step.assistant
                    ? splitChapter(step.assistant.content)
                    : null;
                  const normalizedAssistant = assistantContent ?? null;
                  const stepFallback = currentStep
                    ? STEP_FALLBACKS[currentStep]
                    : null;
                  const shouldOverrideStepTitle =
                    isCurrent &&
                    stepFallback &&
                    (!normalizedAssistant?.title ||
                      /tu\s+reforma|cap[ií]tulo|cierre/i.test(
                        normalizedAssistant.title,
                      ));
                  const effectiveTitle = shouldOverrideStepTitle
                    ? stepFallback.title
                    : normalizedAssistant?.title;
                  const effectiveSubtitle = shouldOverrideStepTitle
                    ? stepFallback.subtitle
                    : normalizedAssistant?.subtitle;
                  const isLoadingOnly = !step.assistant && !step.user;
                  const projectTitle =
                    selectedProjectId
                      ? projects.find(
                          (project) => project.id === selectedProjectId,
                        )?.name ?? `Proyecto ${selectedProjectId}`
                      : null;
                  const shouldReplaceTitle =
                    projectTitle &&
                    !!effectiveTitle &&
                    /cap[ií]tulo\s+\d+/i.test(effectiveTitle);
                  const displayTitle = shouldReplaceTitle
                    ? projectTitle
                    : effectiveTitle;
                  const displaySubtitle = shouldReplaceTitle
                    ? effectiveSubtitle
                    : effectiveSubtitle;
                  return (
                    <div
                      key={step.id}
                      className={`step-card ${isCurrent ? "current" : "past"} ${
                        isLoadingOnly ? "loading-only" : ""
                      }`}
                    >
                      {isLoadingOnly && (
                        <div className="loading-center">
                          <IconHearts size={64} />
                        </div>
                      )}
                      {normalizedAssistant && (
                        <>
                          {displayTitle && (
                            <div className="chapter-title">
                              {displaySubtitle ? (
                                <>
                                  <h3>{displayTitle}</h3>
                                  {displaySubtitle}
                                </>
                              ) : (
                                displayTitle
                              )}
                            </div>
                          )}
                          <div className="message assistant">
                            <ReactMarkdown>
                              {formatAssistantBody(normalizedAssistant.body)}
                            </ReactMarkdown>
                          </div>
                        </>
                      )}
                      {step.user && (
                        <div className="message user">{step.user.content}</div>
                      )}
                      {!isLoadingOnly && isCurrent && wizardBusy && (
                        <div className="assistant-loader">
                          <IconHearts size={72} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {shouldShowBudgetCta && (
                <div className="calculate-cta">
                  <button
                    className="btn primary"
                    type="button"
                    onClick={handleCalculateBudget}
                    disabled={wizardBusy || calculatingBudget}
                  >
                    {calculatingBudget ? "Descargando..." : "Ver el presupuesto"}
                  </button>
                </div>
              )}
              {catalogVisible && selectedProjectId && (
                <div className="catalog-panel">
                  <div className="catalog-panel__header">
                    <div className="catalog-panel__title">
                      <span>Catálogo sugerido</span>
                      <span className="catalog-panel__sep">|</span>
                      <span>
                        Selecciona uno o varios artículos.
                      </span>
                    </div>
                    <div className="catalog-panel__actions">
                      <button
                        className="btn primary"
                        type="button"
                        onClick={handleCatalogConfirm}
                        disabled={catalogDraft.length === 0}
                      >
                        Lo tengo, continuemos
                      </button>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={handleCatalogSkip}
                      >
                        Lo compro por mi cuenta
                      </button>
                      <button
                        className="btn ghost"
                        type="button"
                        onClick={() => setCatalogVisible(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                  </div>
                  <div className="catalog-panel__content">
                    {catalogLoading ? (
                      <div className="catalog-panel__loading">
                        <IconHearts size={64} />
                      </div>
                    ) : filteredCatalogItems.length ? (
                      <div className="catalog-grid">
                        {filteredCatalogItems.slice(0, 12).map((item) => {
                          const isActive = catalogSelectionIds.has(
                            item.lineitemId,
                          );
                          const isPending = catalogDraftIds.has(
                            item.lineitemId,
                          );
                          return (
                            <div
                              key={`${item.lineitemId}-${item.variantId}`}
                              className={`catalog-card ${
                                isActive
                                  ? "is-active"
                                  : isPending
                                    ? "is-pending"
                                    : ""
                              }`}
                            >
                              <button
                                className="catalog-card__select"
                                type="button"
                                onClick={() => handleCatalogToggle(item)}
                              >
                                <div className="catalog-card__title">
                                  {item.name}
                                </div>
                                <div className="catalog-card__meta">
                                  {item.category} · {item.subcategory}
                                </div>
                                {item.quality && (
                                  <div className="catalog-card__tag">
                                    {item.quality}
                                  </div>
                                )}
                              </button>
                              <button
                                className="catalog-card__view"
                                type="button"
                                onClick={() => setCatalogDetail(item)}
                                aria-label="Ver detalle"
                              >
                                <IconEye size={16} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="catalog-panel__empty">
                        No tengo artículos disponibles para este apartado
                        todavía.
                      </div>
                    )}
                  </div>
                </div>
              )}
              {catalogSelections.length > 0 && (
                <div className="catalog-preview">
                  <div className="catalog-preview__header">
                    <h5>Seleccionados</h5>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => setCatalogVisible(true)}
                    >
                      Cambiar artículos
                    </button>
                  </div>
                  <div className="catalog-preview__items">
                    {catalogSelections.map((item) => (
                      <div
                        key={`${item.lineitemId}-${item.variantId}-preview`}
                        className="catalog-preview__item"
                      >
                        <button
                          className="catalog-preview__label"
                          type="button"
                          onClick={() => setCatalogVisible(true)}
                        >
                          {item.name}
                        </button>
                        <button
                          className="catalog-preview__remove"
                          type="button"
                          onClick={() => handleCatalogRemove(item)}
                          aria-label={`Eliminar ${item.name}`}
                        >
                          <IconClose size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            <div className="floating-input" ref={floatingInputRef}>
              {selectedProjectId ? (
                <div className="chat-input">
                  <textarea
                    ref={inputRef}
                    placeholder="Cuéntame aquí…"
                    value={messageInput}
                    onChange={(event) => setMessageInput(event.target.value)}
                    onKeyDown={(event) => {
                      const composing = (
                        event.nativeEvent as { isComposing?: boolean }
                      ).isComposing;
                      if (composing) return;
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        handleSendWithDictation();
                      }
                    }}
                    rows={1}
                    disabled={wizardBusy}
                  />
                  <div className="chat-buttons">
                    <button
                      className={`btn ghost mic-btn ${
                        isListening ? "is-listening" : ""
                      }`}
                      type="button"
                      onClick={toggleDictation}
                      disabled={!speechSupported || wizardBusy}
                      title={
                        speechSupported
                          ? "Dictado por voz"
                          : "Dictado no disponible en este navegador"
                      }
                      aria-pressed={isListening}
                    >
                      {isListening ? (
                        <IconSound size={18} />
                      ) : (
                        <IconMic size={18} />
                      )}
                    </button>
                    <button
                      className="btn primary send-btn"
                      type="button"
                      onClick={handleSendWithDictation}
                      disabled={wizardBusy || !messageInput.trim()}
                    >
                      <IconSend size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="chat-disabled">
                  Crea o selecciona un proyecto para empezar la historia.
                </div>
              )}
            </div>

            <aside className={`summary-shell ${showSummary ? "open" : ""}`}>
              <div className="summary-header">
                <div>
                  <h3>Resumen en vivo</h3>
                  <p>{progress}% completo</p>
                </div>
                {selectedProjectId && (
                  <button
                    className="btn ghost"
                    type="button"
                    onClick={handleResetStory}
                    disabled={wizardBusy}
                  >
                    Reiniciar historia
                  </button>
                )}
                <div className="progress">
                  <span style={{ width: `${progress}%` }} />
                </div>
              </div>

              {!selectedProjectId ? (
                <div className="summary-empty">
                  Selecciona un proyecto para ver el resumen y el progreso.
                </div>
              ) : (
                <>
                  <div className="summary-section">
                    <h4>Proyecto</h4>
                    <div className="summary-row">
                      <span>Activo</span>
                      <strong>
                        {projects.find((p) => p.id === selectedProjectId)
                          ?.name ?? `Proyecto ${selectedProjectId}`}
                      </strong>
                    </div>
                    <button
                      className="btn ghost"
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(null);
                        setShowSummary(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Cambiar proyecto
                    </button>
                  </div>
                  <div className="summary-section">
                    <h4>Alcance</h4>
                    {scopeSummary.map((item) => (
                      <div key={item.key} className="summary-row">
                        <span>{item.label}</span>
                        <strong
                          className={isMissing(item.key) ? "missing" : ""}
                        >
                          {isMissing(item.key) ? "Pendiente" : item.value}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="summary-section">
                    <h4>Estado actual</h4>
                    {spaceSummary.map((item) => (
                      <div key={item.key} className="summary-row">
                        <span>{item.label}</span>
                        <strong
                          className={isMissing(item.key) ? "missing" : ""}
                        >
                          {isMissing(item.key) ? "Pendiente" : item.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                  {canCalculateBudget && (
                    <div className="summary-section">
                      <button
                        className="btn primary"
                        type="button"
                        onClick={handleCalculateBudget}
                        disabled={calculatingBudget || wizardBusy}
                      >
                        {calculatingBudget
                          ? "Descargando..."
                          : "Ver el presupuesto"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </aside>
          </main>
        )}

        {currentUser && !isWidgetMode && (
          <button
            className="floating-user"
            type="button"
            onClick={handleOpenUserDrawer}
          >
            <span>
              {displayName} · {currentUser.role}
            </span>
          </button>
        )}
      </div>
      {currentUser && (
        <>
          {catalogDetail && (
            <div className="catalog-detail-overlay" role="dialog" aria-modal="true">
              <button
                className="catalog-detail-backdrop"
                type="button"
                aria-label="Cerrar detalle"
                onClick={() => setCatalogDetail(null)}
              />
              <div className="catalog-detail-panel">
                <div className="catalog-detail__header">
                  <div>
                    <h3>{catalogDetail.name}</h3>
                    <p>
                      {catalogDetail.category} · {catalogDetail.subcategory}
                    </p>
                  </div>
                  <button
                    className="icon-btn"
                    type="button"
                    onClick={() => setCatalogDetail(null)}
                    aria-label="Cerrar"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
                <div className="catalog-detail__body">
                  <div className="catalog-detail__row">
                    <span>Calidad</span>
                    <strong>{catalogDetail.quality || "Estándar"}</strong>
                  </div>
                  <div className="catalog-detail__row">
                    <span>Unidad</span>
                    <strong>{catalogDetail.unit}</strong>
                  </div>
                  <div className="catalog-detail__row">
                    <span>Código</span>
                    <strong>
                      {catalogDetail.lineitemId} · {catalogDetail.variantId}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}
          {isUserDrawerOpen && (
            <button
              className="user-drawer__backdrop"
              type="button"
              aria-label="Cerrar menú de usuario"
              onClick={handleCloseUserDrawer}
            />
          )}
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
                  {activeUserMenu === "projects" && (
                    <>
                      {projects.length === 0 ? (
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
                                    {project.name ??
                                      `Proyecto ${project.id}`}
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
                                    disabled={projectDeletingId === project.id}
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
                        value={profileName}
                        onChange={(event) =>
                          setProfileName(event.target.value)
                        }
                        placeholder="Tu nombre"
                      />
                      <button
                        className="btn primary"
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
                      {projects.length === 0 ? (
                        <p>Aún no tienes presupuestos guardados.</p>
                      ) : (
                        <ul className="user-list">
                          {projects.map((project) => (
                            <li key={`budget-${project.id}`}>
                              <div className="user-list__info">
                                <span className="user-list__name">
                                  {project.name ??
                                    `Proyecto ${project.id}`}
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
        </>
      )}
    </div>
  );
}

export default App;
