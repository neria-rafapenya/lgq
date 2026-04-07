import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isCataloniaPostalCode } from "../helpers/postalCode";
import { typewriter } from "../helpers/typewriter";
import type {
  LgqBudgetResponse,
  LgqCatalogItem,
  LgqCatalogResponse,
  LgqCatalogSelectionRequest,
  LgqCatalogSelectionResponse,
  LgqAction,
  LgqSubact,
  LgqSubactOption,
  LgqProjectBaseResponse,
  ProjectSummary,
} from "../lib/api";
import {
  calculateLgqBudget,
  createProject,
  fetchCatalogSelections,
  fetchCatalogByCode,
  fetchLgqActions,
  fetchLgqBase,
  fetchProjects,
  fetchSubacts,
  saveCatalogSelections,
  saveLgqBase,
  saveProjectActions,
  downloadLgqBudgetPdf,
  fetchAiCopy,
} from "../lib/api";
import ColorPicker from "./ColorPicker";
import IconBot from "./IconBot";

const COLOR_CATALOGS = new Set(["N1"]);
const AI_ICON_SIZE = 36;
const CHAT_FADE_MS = 280;
const CHAT_POST_FADE_DELAY_MS = 499;
const CHAT_TRANSITION_DELAY_MS = CHAT_FADE_MS + CHAT_POST_FADE_DELAY_MS;
const ACTIONS_SUMMARY_DELAY_MS = 2000;

type SubactUi =
  | { type: "catalog"; title: string; catalog: string | null }
  | { type: "options"; title: string; options: LgqSubactOption[] };

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  status?: "active" | "fading";
};

type BaseQuestion =
  | { key: "projectName"; prompt: string }
  | { key: "postalCode"; prompt: string }
  | { key: "province"; prompt: string }
  | { key: "action"; prompt: string }
  | { key: "ceilingHeight"; prompt: string }
  | { key: "windowsCount"; prompt: string }
  | { key: "ownership"; prompt: string }
  | { key: "roomsCount"; prompt: string }
  | { key: "roomName"; prompt: string; roomIndex: number }
  | { key: "roomLength"; prompt: string; roomIndex: number }
  | { key: "roomWidth"; prompt: string; roomIndex: number }
  | { key: "spaceLength"; prompt: string }
  | { key: "spaceWidth"; prompt: string };

const WizardShell = () => {
  const steps = useMemo(
    () => [
      {
        key: "base",
        title: "Preguntas base",
        helper:
          "Necesitamos hacerte algunas preguntas, por favor dinos las caracteristicas de la vivienda.",
      },
      {
        key: "actions",
        title: "Tipo de reforma",
        helper: "Selecciona el tipo de reforma principal para el presupuesto.",
      },
      {
        key: "labor",
        title: "Mano de obra",
        helper: "Veremos la estimación de tiempos y oficios.",
      },
      {
        key: "budget",
        title: "Calcular presupuesto",
        helper: "Generaremos el presupuesto final y el PDF.",
      },
    ],
    [],
  );
  const [activeStep, setActiveStep] = useState(0);
  const current = steps[activeStep];
  const [projectName, setProjectName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [baseProvince, setBaseProvince] = useState("");
  const [baseAction, setBaseAction] = useState("");
  const [ownership, setOwnership] = useState("");
  const [ceilingHeight, setCeilingHeight] = useState("");
  const [windowsCount, setWindowsCount] = useState("");
  const [spaceLength, setSpaceLength] = useState("");
  const [spaceWidth, setSpaceWidth] = useState("");
  const [rooms, setRooms] = useState<
    { id: string; name: string; length: string; width: string }[]
  >([{ id: "room-1", name: "", length: "", width: "" }]);
  const [roomsTargetCount, setRoomsTargetCount] = useState<number | null>(null);
  const [selectedSubacts, setSelectedSubacts] = useState<string[]>([]);
  const [valuationStarted, setValuationStarted] = useState(false);
  const [subactSelections, setSubactSelections] = useState<
    Record<string, string[]>
  >({});
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [catalogCache, setCatalogCache] = useState<
    Record<string, LgqCatalogResponse>
  >({});
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [actions, setActions] = useState<LgqAction[]>([]);
  const [baseSyncing, setBaseSyncing] = useState(false);
  const [baseSynced, setBaseSynced] = useState(false);
  const [baseSyncError, setBaseSyncError] = useState<string | null>(null);
  const [baseAdvancePending, setBaseAdvancePending] = useState(false);
  const [catalogSyncing, setCatalogSyncing] = useState(false);
  const [catalogSynced, setCatalogSynced] = useState(false);
  const [catalogSyncError, setCatalogSyncError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [projectLoading, setProjectLoading] = useState(false);
  const [projectLoadError, setProjectLoadError] = useState<string | null>(null);
  const [hydratingProject, setHydratingProject] = useState(false);
  const [baseChatMessages, setBaseChatMessages] = useState<ChatMessage[]>([]);
  const [baseChatInput, setBaseChatInput] = useState("");
  const baseLastQuestionKey = useRef<string | null>(null);
  const [budgetData, setBudgetData] = useState<LgqBudgetResponse | null>(null);
  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [actionsSuggestTyped, setActionsSuggestTyped] = useState("");
  const [actionsNarrativeTyped, setActionsNarrativeTyped] = useState("");
  const [actionsSummaryTyped, setActionsSummaryTyped] = useState("");
  const [laborIntroTyped, setLaborIntroTyped] = useState("");
  const [laborSummaryTyped, setLaborSummaryTyped] = useState("");
  const [aiCopyMap, setAiCopyMap] = useState<Record<string, string>>({});
  const aiCopyCache = useRef<Map<string, string>>(new Map());
  const aiCopyInFlight = useRef<Set<string>>(new Set());
  const typewriterTimers = useRef<Map<string, () => void>>(new Map());
  const pendingAiCopy = useRef<Map<string, string>>(new Map());
  const baseChatIds = useRef<Set<string>>(new Set());
  const baseChatCount = useRef(0);
  const pendingUserMessage = useRef<ChatMessage | null>(null);
  const actionsSuggestCancel = useRef<(() => void) | null>(null);
  const actionsSuggestLast = useRef<string>("");
  const actionsNarrativeCancel = useRef<(() => void) | null>(null);
  const actionsSummaryCancel = useRef<(() => void) | null>(null);
  const actionsNarrativeLast = useRef<string>("");
  const actionsSummaryLast = useRef<string>("");
  const laborIntroCancel = useRef<(() => void) | null>(null);
  const laborSummaryCancel = useRef<(() => void) | null>(null);
  const laborIntroLast = useRef<string>("");
  const laborSummaryLast = useRef<string>("");
  const chatTransitionTimers = useRef<{
    key: string | null;
    fadeTimer: number | null;
    delayTimer: number | null;
  }>({ key: null, fadeTimer: null, delayTimer: null });
  const [laborAdjust, setLaborAdjust] = useState<"down" | "base" | "up">(
    "base",
  );
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [subacts, setSubacts] = useState<LgqSubact[]>([]);
  const [catalogSelections, setCatalogSelections] = useState<
    Record<
      number,
      {
        itemId: number;
        itemName: string;
        variantId: number;
        variantLabel: string;
        quantity: number;
        catalogCode: string;
        unitPrice?: number;
        colorHex?: string;
      }
    >
  >({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<LgqCatalogItem | null>(null);
  const [detailVariantId, setDetailVariantId] = useState<number | null>(null);
  const [detailQty, setDetailQty] = useState(1);
  const [detailColor, setDetailColor] = useState("#F5F0E6");
  const actionLabel = useMemo(() => {
    const map: Record<string, string> = {
      integral: "Reforma integral completa",
      kitchen: "Cocina",
      bathroom: "Baño",
      redistribution: "Redistribuir espacios",
      paint: "Pintar",
    };
    return map[baseAction] ?? "Sin tipo de reforma seleccionado";
  }, [baseAction]);

  const projectMap = useMemo(
    () => new Map(projects.map((project) => [project.id, project])),
    [projects],
  );

  const loadProjects = useCallback((preferredId?: number | null) => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        window.dispatchEvent(
          new CustomEvent("lgq:projects-list", { detail: data }),
        );
        if (data.length === 0) {
          setActiveProjectId(null);
          return;
        }
        const stored = Number(
          window.localStorage.getItem("lgq_active_project_id") || "",
        );
        const storedMatch = data.find((project) => project.id === stored)?.id;
        const preferredMatch =
          preferredId && data.find((project) => project.id === preferredId)?.id;
        const selected = preferredMatch ?? storedMatch ?? data[0].id;
        setActiveProjectId(selected);
      })
      .catch(() => {
        setProjects([]);
      });
  }, []);

  const [activeSubactIndex, setActiveSubactIndex] = useState(0);
  const activeSubactKey = selectedSubacts[activeSubactIndex];
  const activeSubact = useMemo(
    () => subacts.find((item) => item.key === activeSubactKey) ?? null,
    [subacts, activeSubactKey],
  );
  const activeSubactLabel = activeSubact?.label ?? "Selecciona una partida";
  const totalSubacts = selectedSubacts.length;
  const nextSubactKey = selectedSubacts[activeSubactIndex + 1];
  const nextSubactLabel =
    subacts.find((item) => item.key === nextSubactKey)?.label ?? "";
  const subactUi = useMemo<SubactUi | null>(() => {
    if (!activeSubact) return null;
    if (activeSubact.type === "catalog") {
      return {
        type: "catalog",
        title: activeSubact.label,
        catalog: activeSubact.catalogCode ?? null,
      };
    }
    if (activeSubact.type === "options") {
      return {
        type: "options",
        title: activeSubact.label,
        options: activeSubact.options ?? [],
      };
    }
    return null;
  }, [activeSubact]);
  const showSubpanelTitle =
    subactUi?.title &&
    subactUi.title.toLowerCase() !== activeSubactLabel.toLowerCase();

  const suggestedSubactKeys = useMemo(() => {
    const map: Record<string, string[]> = {
      bathroom: [
        "bathroom-tiling",
        "bathroom-plumbing",
        "sanitary",
        "bathroom-faucets",
        "bathroom-floors",
        "bathroom-electric",
        "bathroom-accessories",
      ],
      kitchen: [
        "kitchen-tiling",
        "kitchen-plumbing",
        "kitchen-electric",
        "kitchen-floors",
        "kitchen-furniture",
        "countertop",
        "appliances",
        "sink",
        "faucets",
      ],
      integral: [
        "paint",
        "floors",
        "doors",
        "windows",
        "electric",
        "ventilation",
      ],
      paint: ["walls", "ceilings"],
      redistribution: ["demolition", "bearing", "build"],
    };
    return map[baseAction] ?? [];
  }, [baseAction]);

  const suggestedSubacts = useMemo(
    () => subacts.filter((subact) => suggestedSubactKeys.includes(subact.key)),
    [subacts, suggestedSubactKeys],
  );

  useEffect(() => {
    if (!baseAction) return;
    if (suggestedSubacts.length === 0) return;
    if (hydratingProject) return;
    setSelectedSubacts((prev) =>
      prev.length === 0 ? suggestedSubacts.map((subact) => subact.key) : prev,
    );
  }, [baseAction, suggestedSubacts, hydratingProject]);
  const activeCatalogCode =
    subactUi && subactUi.type === "catalog" ? subactUi.catalog : null;
  const activeCatalog =
    activeCatalogCode && catalogCache[activeCatalogCode]
      ? catalogCache[activeCatalogCode]
      : null;

  const subactQuestion = useMemo(() => {
    if (!activeSubact) return "Selecciona una partida para continuar.";
    if (activeSubact.helper) return activeSubact.helper;
    return `Indica los detalles necesarios para ${activeSubactLabel.toLowerCase()}.`;
  }, [activeSubact, activeSubactLabel]);

  const aiNarrative = useMemo(() => {
    if (!activeSubactKey) return "Estoy preparando la siguiente pregunta.";
    if (subactUi?.type === "catalog") {
      return `Estoy interpretando tu reforma de ${actionLabel.toLowerCase()} y afinando elementos. Escoge los materiales o accesorios del catálogo.`;
    }
    return `Estoy interpretando tu reforma de ${actionLabel.toLowerCase()} y afinando ${activeSubactLabel.toLowerCase()}.`;
  }, [activeSubactKey, actionLabel, activeSubactLabel]);

  const activeCatalogSelections = useMemo(() => {
    if (!activeCatalogCode) return [];
    return Object.values(catalogSelections).filter(
      (selection) => selection.catalogCode === activeCatalogCode,
    );
  }, [catalogSelections, activeCatalogCode]);

  const selectedSubactLabels = useMemo(
    () =>
      selectedSubacts.map(
        (key) => subacts.find((item) => item.key === key)?.label ?? key,
      ),
    [selectedSubacts, subacts],
  );

  const selectedCatalogItems = useMemo(() => {
    const names = Object.values(catalogSelections)
      .map((selection) => selection.itemName)
      .filter((name) => name && name.trim().length > 0);
    return Array.from(new Set(names));
  }, [catalogSelections]);

  const aiSummaryText = useMemo(() => {
    const subactsText =
      selectedSubactLabels.length > 0
        ? selectedSubactLabels.join(", ")
        : "ninguna";
    if (selectedCatalogItems.length > 0) {
      return `He resumido tu reforma de ${actionLabel.toLowerCase()}: ${subactsText}. Ahora mismo llevas seleccionados:`;
    }
    return `He resumido tu reforma de ${actionLabel.toLowerCase()}: ${subactsText}. Ahora mismo no llevas artículos seleccionados. Debes seleccionar alguna opción o artículo para continuar.`;
  }, [selectedSubactLabels, selectedCatalogItems.length, actionLabel]);

  const aiActionsSuggestText =
    "He seleccionado las partidas que podrían encajar con tu reforma. Puedes deseleccionarlas si no te interesan.";
  const aiActionsSuggestCopy = aiCopyMap["actions-suggest"];
  const aiActionsNarrativeCopy = aiCopyMap["actions-narrative"];
  const aiActionsSummaryCopy = aiCopyMap["actions-summary"];
  const laborIntroCopy = aiCopyMap["labor-intro"];

  const resolveAiCopy = useCallback(
    (key: string, text: string) => {
      if (!text) return;
      const cached = aiCopyCache.current.get(text);
      if (cached) {
        setAiCopyMap((prev) =>
          prev[key] === cached ? prev : { ...prev, [key]: cached },
        );
        return;
      }
      if (aiCopyInFlight.current.has(text)) return;
      aiCopyInFlight.current.add(text);
      fetchAiCopy(text)
        .then((copy) => {
          const finalText = copy && copy.trim().length > 0 ? copy.trim() : text;
          aiCopyCache.current.set(text, finalText);
          setAiCopyMap((prev) => ({ ...prev, [key]: finalText }));
        })
        .catch(() => {
          setAiCopyMap((prev) => (prev[key] ? prev : { ...prev, [key]: text }));
        })
        .finally(() => {
          aiCopyInFlight.current.delete(text);
        });
    },
    [fetchAiCopy],
  );

  useEffect(() => {
    if (activeStep !== 1) return;
    if (suggestedSubacts.length === 0) return;
    resolveAiCopy("actions-suggest", aiActionsSuggestText);
  }, [
    activeStep,
    suggestedSubacts.length,
    aiActionsSuggestText,
    resolveAiCopy,
  ]);

  useEffect(() => {
    if (activeStep !== 1 || suggestedSubacts.length === 0) {
      setActionsSuggestTyped("");
      actionsSuggestLast.current = "";
      return;
    }
    const text = aiActionsSuggestCopy ?? aiActionsSuggestText;
    if (!text) return;
    if (actionsSuggestLast.current === text && actionsSuggestTyped.length > 0) {
      return;
    }
    actionsSuggestLast.current = text;
    setActionsSuggestTyped("");
    if (actionsSuggestCancel.current) {
      actionsSuggestCancel.current();
    }
    actionsSuggestCancel.current = typewriter(
      text,
      (value) => {
        setActionsSuggestTyped(value);
      },
      { speed: 16 },
    );
  }, [
    activeStep,
    suggestedSubacts.length,
    aiActionsSuggestCopy,
    aiActionsSuggestText,
    actionsSuggestTyped.length,
  ]);

  useEffect(() => {
    if (activeStep !== 1 || !valuationStarted) {
      setActionsNarrativeTyped("");
      setActionsSummaryTyped("");
      actionsNarrativeLast.current = "";
      actionsSummaryLast.current = "";
      return;
    }
    const narrativeText = aiActionsNarrativeCopy ?? aiNarrative;
    const summaryText = aiActionsSummaryCopy ?? aiSummaryText;
    if (!narrativeText) return;
    const narrativeChanged = actionsNarrativeLast.current !== narrativeText;
    const summaryChanged = actionsSummaryLast.current !== summaryText;
    if (!narrativeChanged && !summaryChanged) {
      return;
    }
    actionsNarrativeLast.current = narrativeText;
    actionsSummaryLast.current = summaryText;
    setActionsNarrativeTyped("");
    setActionsSummaryTyped("");
    if (actionsNarrativeCancel.current) {
      actionsNarrativeCancel.current();
    }
    if (actionsSummaryCancel.current) {
      actionsSummaryCancel.current();
    }
    actionsNarrativeCancel.current = typewriter(
      narrativeText,
      (value) => {
        setActionsNarrativeTyped(value);
      },
      {
        speed: 16,
        onDone: () => {
          if (!summaryText) return;
          window.setTimeout(() => {
            if (actionsSummaryCancel.current) {
              actionsSummaryCancel.current();
            }
            actionsSummaryCancel.current = typewriter(
              summaryText,
              (value) => {
                setActionsSummaryTyped(value);
              },
              { speed: 16 },
            );
          }, ACTIONS_SUMMARY_DELAY_MS);
        },
      },
    );
  }, [
    activeStep,
    valuationStarted,
    aiActionsNarrativeCopy,
    aiActionsSummaryCopy,
    aiNarrative,
    aiSummaryText,
  ]);

  useEffect(() => {
    if (activeStep !== 1) return;
    resolveAiCopy("actions-narrative", aiNarrative);
  }, [activeStep, aiNarrative, resolveAiCopy]);

  useEffect(() => {
    if (activeStep !== 1) return;
    resolveAiCopy("actions-summary", aiSummaryText);
  }, [activeStep, aiSummaryText, resolveAiCopy]);

  useEffect(() => {
    if (activeStep !== 2) return;
    resolveAiCopy(
      "labor-intro",
      "Estoy calculando tiempos y oficios según tus actuaciones.",
    );
  }, [activeStep, resolveAiCopy]);

  useEffect(() => {
    if (activeStep !== 3) return;
    const budgetLine = budgetData
      ? "Ya tienes disponible resumen final con partidas, IVA y total."
      : "Estoy preparando el resumen final con partidas, IVA y total.";
    resolveAiCopy("budget-intro", budgetLine);
  }, [activeStep, budgetData, resolveAiCopy]);

  const canContinueSubact = useMemo(() => {
    if (!subactUi) return true;
    if (subactUi.type === "catalog") {
      return activeCatalogSelections.length > 0;
    }
    if (subactUi.type === "options") {
      return (subactSelections[activeSubactKey] || []).length > 0;
    }
    return true;
  }, [
    subactUi,
    activeCatalogSelections.length,
    subactSelections,
    activeSubactKey,
  ]);

  const backendActionCode = baseAction === "paint" ? "painting" : baseAction;
  const resolvedActionId = useMemo(() => {
    return actions.find((item) => item.code === backendActionCode)?.id ?? null;
  }, [actions, backendActionCode]);

  const toNumber = (value: string) => {
    const normalized = value.replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseSizePair = (text?: string | null) => {
    if (!text) return null;
    const match = text.match(/(\d+(?:[.,]\d+)?)\s*[x×]\s*(\d+(?:[.,]\d+)?)/i);
    if (!match) return null;
    const sizeX = toNumber(match[1]);
    const sizeY = toNumber(match[2]);
    if (!sizeX || !sizeY) return null;
    return { sizeX, sizeY };
  };

  const parseActionInput = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("integral")) return "integral";
    if (normalized.includes("cocina")) return "kitchen";
    if (normalized.includes("baño") || normalized.includes("bano"))
      return "bathroom";
    if (normalized.includes("redistrib")) return "redistribution";
    if (normalized.includes("pint")) return "paint";
    return null;
  };

  const parseOwnershipInput = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("propiedad") || normalized.includes("propio")) {
      return "owned";
    }
    if (normalized.includes("alquiler") || normalized.includes("rent")) {
      return "rented";
    }
    return null;
  };

  const parseProvinceInput = (value: string) => {
    const normalized = value.toLowerCase();
    if (normalized.includes("barcelona")) return "Barcelona";
    if (normalized.includes("girona")) return "Girona";
    if (normalized.includes("lleida")) return "Lleida";
    if (normalized.includes("tarragona")) return "Tarragona";
    return null;
  };

  const resolveProvinceFromPostal = (code: string) => {
    if (code.length < 2) return null;
    const prefix = code.substring(0, 2);
    const provinceByPrefix: Record<string, string> = {
      "08": "Barcelona",
      "17": "Girona",
      "25": "Lleida",
      "43": "Tarragona",
    };
    return provinceByPrefix[prefix] ?? null;
  };

  const spaceArea = useMemo(() => {
    const length = toNumber(spaceLength);
    const width = toNumber(spaceWidth);
    if (!length || !width) return null;
    return length * width;
  }, [spaceLength, spaceWidth]);

  const roomsWithArea = useMemo(
    () =>
      rooms.map((room) => {
        const length = toNumber(room.length);
        const width = toNumber(room.width);
        const area = length && width ? length * width : null;
        return { ...room, area };
      }),
    [rooms],
  );

  const roomsTotalArea = useMemo(() => {
    return roomsWithArea.reduce((acc, room) => acc + (room.area ?? 0), 0);
  }, [roomsWithArea]);

  const isIntegral = baseAction === "integral";

  const baseMeasurementsComplete = useMemo(() => {
    if (isIntegral) {
      return (
        roomsWithArea.length > 0 &&
        roomsWithArea.every(
          (room) => room.name.trim().length > 0 && room.area && room.area > 0,
        )
      );
    }
    return spaceArea !== null && spaceArea > 0;
  }, [isIntegral, roomsWithArea, spaceArea]);

  const ceilingHeightValue = toNumber(ceilingHeight);
  const windowsValue = toNumber(windowsCount);

  const baseInfoComplete =
    ownership.length > 0 &&
    ceilingHeightValue &&
    ceilingHeightValue > 0 &&
    windowsValue !== null;

  const baseAnswers = useMemo(() => {
    const hasKitchenCount =
      baseAction === "kitchen" &&
      selectedSubacts.some((key) =>
        ["kitchen-plumbing", "kitchen-electric", "kitchen-furniture"].includes(
          key,
        ),
      );
    const hasBathroomCount =
      baseAction === "bathroom" &&
      selectedSubacts.some((key) =>
        ["bathroom-plumbing", "bathroom-electric", "sanitary"].includes(key),
      );
    const hasKitchenTiling =
      baseAction === "kitchen" && selectedSubacts.includes("kitchen-tiling");
    const hasBathroomTiling =
      baseAction === "bathroom" && selectedSubacts.includes("bathroom-tiling");
    const quantities = {
      area_m2: isIntegral ? roomsTotalArea : (spaceArea ?? 0),
      kitchen_m2: hasKitchenTiling ? (spaceArea ?? 0) : 0,
      bathroom_m2: hasBathroomTiling ? (spaceArea ?? 0) : 0,
      kitchens_count: hasKitchenCount ? 1 : 0,
      bathrooms_count: hasBathroomCount ? 1 : 0,
    };
    const roomsPayload = isIntegral
      ? roomsWithArea.map((room) => ({
          name: room.name.trim(),
          length_m: toNumber(room.length) ?? 0,
          width_m: toNumber(room.width) ?? 0,
          area_m2: room.area ?? 0,
        }))
      : [];
    const spacePayload = !isIntegral
      ? {
          length_m: toNumber(spaceLength) ?? 0,
          width_m: toNumber(spaceWidth) ?? 0,
          area_m2: spaceArea ?? 0,
        }
      : null;
    return {
      postalCode,
      wizard_step: activeStep,
      valuation_started: valuationStarted,
      active_subact_index: activeSubactIndex,
      base: {
        ownership,
        ceiling_height_m: ceilingHeightValue ?? 0,
        windows_count: windowsValue ?? 0,
      },
      quantities,
      rooms: roomsPayload,
      space: spacePayload,
    };
  }, [
    postalCode,
    ownership,
    ceilingHeightValue,
    windowsValue,
    isIntegral,
    roomsWithArea,
    roomsTotalArea,
    spaceLength,
    spaceWidth,
    spaceArea,
    baseAction,
    selectedSubacts,
    activeStep,
    valuationStarted,
    activeSubactIndex,
  ]);

  const floorArea = useMemo(() => {
    if (isIntegral) {
      return roomsTotalArea > 0 ? roomsTotalArea : null;
    }
    return spaceArea && spaceArea > 0 ? spaceArea : null;
  }, [isIntegral, roomsTotalArea, spaceArea]);

  const wallArea = useMemo(() => {
    if (!ceilingHeightValue || ceilingHeightValue <= 0) return null;
    let area = 0;
    if (isIntegral) {
      rooms.forEach((room) => {
        const length = toNumber(room.length);
        const width = toNumber(room.width);
        if (!length || !width) return;
        area += 2 * (length + width) * ceilingHeightValue;
      });
    } else {
      const length = toNumber(spaceLength);
      const width = toNumber(spaceWidth);
      if (!length || !width) return null;
      area = 2 * (length + width) * ceilingHeightValue;
    }
    if (area <= 0) return null;
    const windows = windowsValue ?? 0;
    const adjusted = area - windows * 1.2;
    return adjusted > 0 ? adjusted : null;
  }, [
    ceilingHeightValue,
    isIntegral,
    rooms,
    spaceLength,
    spaceWidth,
    windowsValue,
  ]);

  const detailVariant = useMemo(() => {
    if (!detailItem) return null;
    return (
      detailItem.variants.find((variant) => variant.id === detailVariantId) ??
      detailItem.variants[0] ??
      null
    );
  }, [detailItem, detailVariantId]);

  const detailImage = detailVariant?.imageUrl || detailItem?.imageUrl || null;

  const createChatMessage = useCallback(
    (role: ChatMessage["role"], text: string) => ({
      id: `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      role,
      text,
      status: "active" as const,
    }),
    [],
  );

  const runTypewriter = useCallback((messageId: string, fullText: string) => {
    const existing = typewriterTimers.current.get(messageId);
    if (existing) {
      existing();
    }
    if (!fullText) return;
    const cancel = typewriter(
      fullText,
      (value) => {
        setBaseChatMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, text: value } : msg,
          ),
        );
      },
      { speed: 16 },
    );
    typewriterTimers.current.set(messageId, cancel);
  }, []);

  useEffect(() => {
    baseChatIds.current = new Set(baseChatMessages.map((msg) => msg.id));
    baseChatCount.current = baseChatMessages.length;
  }, [baseChatMessages]);

  useEffect(() => {
    return () => {
      typewriterTimers.current.forEach((cancel) => cancel());
      typewriterTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (actionsSuggestCancel.current) {
        actionsSuggestCancel.current();
        actionsSuggestCancel.current = null;
      }
      if (actionsNarrativeCancel.current) {
        actionsNarrativeCancel.current();
        actionsNarrativeCancel.current = null;
      }
      if (actionsSummaryCancel.current) {
        actionsSummaryCancel.current();
        actionsSummaryCancel.current = null;
      }
      if (laborIntroCancel.current) {
        laborIntroCancel.current();
        laborIntroCancel.current = null;
      }
      if (laborSummaryCancel.current) {
        laborSummaryCancel.current();
        laborSummaryCancel.current = null;
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      const timers = chatTransitionTimers.current;
      if (timers.fadeTimer) {
        window.clearTimeout(timers.fadeTimer);
      }
      if (timers.delayTimer) {
        window.clearTimeout(timers.delayTimer);
      }
    };
  }, []);

  const pushChatMessage = useCallback(
    (message: ChatMessage, options?: { clearPrevious?: boolean }) => {
      if (options?.clearPrevious) {
        setBaseChatMessages((prev) => [
          ...prev.map((item) => ({ ...item, status: "fading" as const })),
          message,
        ]);
        window.setTimeout(() => {
          setBaseChatMessages((prev) =>
            prev.filter((item) => item.status !== "fading"),
          );
        }, 320);
        return;
      }
      setBaseChatMessages((prev) => [...prev, message]);
    },
    [],
  );

  const tileSuggestion = useMemo(() => {
    if (!detailVariant) return null;
    let sizeX = detailVariant.sizeXcm ? Number(detailVariant.sizeXcm) : null;
    let sizeY = detailVariant.sizeYcm ? Number(detailVariant.sizeYcm) : null;
    if (!sizeX || !sizeY) {
      const fallback =
        parseSizePair(detailVariant.name) ||
        parseSizePair(detailVariant.material) ||
        parseSizePair(detailVariant.quality);
      sizeX = fallback?.sizeX ?? null;
      sizeY = fallback?.sizeY ?? null;
    }
    if (!sizeX || !sizeY) return null;
    const areaPiece = (sizeX * sizeY) / 10000;
    if (!areaPiece) return null;
    const label = activeSubactLabel.toLowerCase();
    const prefersWall = /alicat|pared|revest|muro|azulej/.test(label);
    const prefersFloor = /suelo|paviment|piso|solera/.test(label);
    let surface = prefersWall ? wallArea : prefersFloor ? floorArea : floorArea;
    let usedWall = prefersWall;
    if (!surface && prefersWall && floorArea) {
      surface = floorArea;
      usedWall = false;
    }
    if (!surface || surface <= 0) return null;
    const pieces = Math.ceil((surface / areaPiece) * 1.1);
    return {
      pieces,
      sizeX,
      sizeY,
      surface,
      usedWall,
    };
  }, [detailVariant, activeSubactLabel, floorArea, wallArea, parseSizePair]);

  const canAdvanceBase =
    projectName.trim().length > 0 &&
    isCataloniaPostalCode(postalCode) &&
    baseProvince.length > 0 &&
    baseAction.length > 0 &&
    baseInfoComplete &&
    baseMeasurementsComplete;

  const laborMultiplier =
    laborAdjust === "down" ? 0.9 : laborAdjust === "up" ? 1.1 : 1;

  const laborLines = useMemo(() => {
    if (!budgetData) return [];
    return budgetData.labor.map((line) => ({
      ...line,
      hours: line.hours * laborMultiplier,
      amount: line.amount * laborMultiplier,
    }));
  }, [budgetData, laborMultiplier]);

  const laborSummaryText = useMemo(() => {
    if (laborLines.length === 0) return "";
    const totalHours = laborLines.reduce((acc, line) => acc + line.hours, 0);
    return `He estimado ${laborLines.length} oficios y ${totalHours.toFixed(
      1,
    )} horas totales en base a tus partidas y medidas.`;
  }, [laborLines]);

  useEffect(() => {
    if (activeStep !== 2) {
      setLaborIntroTyped("");
      setLaborSummaryTyped("");
      laborIntroLast.current = "";
      laborSummaryLast.current = "";
      return;
    }
    const introText =
      laborIntroCopy ??
      "Estoy calculando tiempos y oficios según tus actuaciones.";
    const summaryText = laborSummaryText;
    const introChanged = laborIntroLast.current !== introText;
    const summaryChanged = laborSummaryLast.current !== summaryText;
    if (!introChanged && !summaryChanged) {
      return;
    }
    laborIntroLast.current = introText;
    laborSummaryLast.current = summaryText;
    setLaborIntroTyped("");
    setLaborSummaryTyped("");
    if (laborIntroCancel.current) {
      laborIntroCancel.current();
    }
    if (laborSummaryCancel.current) {
      laborSummaryCancel.current();
    }
    laborIntroCancel.current = typewriter(
      introText,
      (value) => {
        setLaborIntroTyped(value);
      },
      {
        speed: 16,
        onDone: () => {
          if (!summaryText) return;
          if (laborSummaryCancel.current) {
            laborSummaryCancel.current();
          }
          laborSummaryCancel.current = typewriter(
            summaryText,
            (value) => {
              setLaborSummaryTyped(value);
            },
            { speed: 16 },
          );
        },
      },
    );
  }, [activeStep, laborIntroCopy, laborSummaryText]);

  const taskLines = useMemo(() => {
    if (!budgetData) return [];
    return budgetData.tasks.map((line) => ({
      ...line,
      hours: line.hours * laborMultiplier,
      amount: line.amount * laborMultiplier,
    }));
  }, [budgetData, laborMultiplier]);

  const visibleTaskLines = useMemo(
    () => taskLines.filter((task) => task.hours > 0 || Number(task.amount) > 0),
    [taskLines],
  );

  useEffect(() => {
    if (hydratingProject) return;
    setSelectedSubacts([]);
  }, [baseAction, hydratingProject]);

  useEffect(() => {
    if (hydratingProject) return;
    setSpaceLength("");
    setSpaceWidth("");
    setRooms([{ id: "room-1", name: "", length: "", width: "" }]);
  }, [baseAction, hydratingProject]);

  useEffect(() => {
    if (hydratingProject) return;
    setActiveSubactIndex(0);
  }, [selectedSubacts.length, hydratingProject]);

  useEffect(() => {
    setCatalogOpen(false);
    setDetailOpen(false);
    setDetailItem(null);
  }, [activeSubactKey]);

  useEffect(() => {
    if (!catalogOpen || !activeCatalogCode) return;
    if (catalogCache[activeCatalogCode]) return;
    let mounted = true;
    setCatalogLoading(true);
    setCatalogError(null);
    fetchCatalogByCode(activeCatalogCode)
      .then((data) => {
        if (!mounted) return;
        setCatalogCache((prev) => ({ ...prev, [activeCatalogCode]: data }));
      })
      .catch(() => {
        if (!mounted) return;
        setCatalogError("No pude cargar el catálogo.");
      })
      .finally(() => {
        if (!mounted) return;
        setCatalogLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [catalogOpen, activeCatalogCode, catalogCache]);

  useEffect(() => {
    if (selectedSubacts.length === 0) {
      setValuationStarted(false);
    }
  }, [selectedSubacts.length]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const handleOpenProject = (event: Event) => {
      const detail = (event as CustomEvent<number>).detail;
      if (typeof detail !== "number" || !Number.isFinite(detail)) return;
      setActiveProjectId(detail);
      loadProjects(detail);
    };
    const handleRefresh = () => {
      loadProjects();
    };
    window.addEventListener(
      "lgq:open-project",
      handleOpenProject as EventListener,
    );
    window.addEventListener("lgq:refresh-projects", handleRefresh);
    return () => {
      window.removeEventListener(
        "lgq:open-project",
        handleOpenProject as EventListener,
      );
      window.removeEventListener("lgq:refresh-projects", handleRefresh);
    };
  }, [loadProjects]);

  useEffect(() => {
    fetchLgqActions()
      .then((data) => setActions(data))
      .catch(() => setActions([]));
  }, []);

  useEffect(() => {
    if (!baseAction) {
      setSubacts([]);
      return;
    }
    const actionCode = baseAction === "paint" ? "painting" : baseAction;
    fetchSubacts(actionCode)
      .then((data) => setSubacts(data))
      .catch(() => setSubacts([]));
  }, [baseAction]);

  useEffect(() => {
    if (!activeProjectId) return;
    if (actions.length === 0) return;
    window.localStorage.setItem(
      "lgq_active_project_id",
      String(activeProjectId),
    );
    loadProjectState(activeProjectId);
  }, [activeProjectId, actions.length]);

  useEffect(() => {
    if (activeStep !== 2 || !activeProjectId) return;
    setBudgetLoading(true);
    setBudgetError(null);
    calculateLgqBudget(activeProjectId)
      .then((data) => setBudgetData(data))
      .catch(() => setBudgetError("No pude calcular la mano de obra."))
      .finally(() => setBudgetLoading(false));
  }, [activeStep, activeProjectId]);

  useEffect(() => {
    if (activeStep !== 3 || !activeProjectId) return;
    if (budgetLoading) return;
    if (budgetData) return;
    setBudgetLoading(true);
    setBudgetError(null);
    calculateLgqBudget(activeProjectId)
      .then((data) => setBudgetData(data))
      .catch(() => setBudgetError("No pude calcular el presupuesto."))
      .finally(() => setBudgetLoading(false));
  }, [activeStep, activeProjectId, budgetLoading, budgetData]);

  useEffect(() => {
    if (!canAdvanceBase || baseSynced || baseSyncing) return;
    if (actions.length === 0) return;
    let mounted = true;
    const run = async () => {
      setBaseSyncing(true);
      setBaseSyncError(null);
      const actionId = resolvedActionId;
      let projectId = activeProjectId;
      if (!projectId) {
        const name =
          projectName.trim() ||
          `Proyecto ${new Date().toLocaleDateString("es-ES")}`;
        const created = await createProject(name);
        const createdId = created.id;
        projectId = createdId;
        setProjects((prev) =>
          prev.some((project) => project.id === createdId)
            ? prev
            : [{ id: createdId, name }, ...prev],
        );
      }
      if (!projectId) return;
      await saveLgqBase(projectId, {
        actionId,
        city: null,
        province: baseProvince,
        answers: {
          ...baseAnswers,
          selectedSubacts,
          subactSelections,
        },
      });
      if (actionId) {
        await saveProjectActions(projectId, [actionId]);
      }
      if (!mounted) return;
      if (!activeProjectId) {
        setActiveProjectId(projectId);
      }
      setBaseSynced(true);
    };
    run()
      .catch(() => {
        if (!mounted) return;
        setBaseSyncError("No pude guardar los datos base.");
        setBaseSynced(false);
      })
      .finally(() => {
        if (!mounted) return;
        setBaseSyncing(false);
      });
    return () => {
      mounted = false;
    };
  }, [
    canAdvanceBase,
    baseSynced,
    baseSyncing,
    actions,
    baseAction,
    baseProvince,
    baseAnswers,
    selectedSubacts,
    subactSelections,
    projectName,
    activeProjectId,
  ]);

  useEffect(() => {
    if (!activeProjectId) return;
    if (hydratingProject) return;
    const selections: LgqCatalogSelectionRequest[] = Object.values(
      catalogSelections,
    ).map((selection) => ({
      catalogItemId: selection.itemId,
      variantId: selection.variantId,
      quantity: selection.quantity,
      unitPrice: selection.unitPrice ?? null,
      isSelected: true,
      colorHex: selection.colorHex ?? null,
    }));
    if (selections.length === 0) {
      setCatalogSynced(false);
      return;
    }
    setCatalogSyncing(true);
    setCatalogSyncError(null);
    const timer = window.setTimeout(() => {
      saveCatalogSelections(activeProjectId, selections)
        .then(() => setCatalogSynced(true))
        .catch((error) => {
          const status =
            typeof error === "object" && error && "status" in error
              ? (error as { status?: number }).status
              : undefined;
          if (status === 401 || status === 403) {
            setCatalogSyncError("Tu sesión caducó. Vuelve a iniciar sesión.");
            return;
          }
          const message =
            typeof error === "object" && error && "message" in error
              ? String((error as { message?: string }).message)
              : "";
          setCatalogSyncError(
            message
              ? `No pude guardar el catálogo. ${message}`
              : "No pude guardar el catálogo.",
          );
        })
        .finally(() => setCatalogSyncing(false));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [catalogSelections, activeProjectId, hydratingProject]);

  useEffect(() => {
    if (!activeProjectId || !canAdvanceBase) return;
    if (hydratingProject) return;
    const timer = window.setTimeout(() => {
      saveLgqBase(activeProjectId, {
        actionId: resolvedActionId,
        city: null,
        province: baseProvince,
        answers: {
          ...baseAnswers,
          selectedSubacts,
          subactSelections,
        },
      }).catch(() => {
        setBaseSyncError("No pude guardar los datos base.");
      });
    }, 400);
    return () => window.clearTimeout(timer);
  }, [
    activeProjectId,
    canAdvanceBase,
    resolvedActionId,
    baseProvince,
    baseAnswers,
    selectedSubacts,
    subactSelections,
    hydratingProject,
  ]);

  const openCatalogDetail = (item: LgqCatalogItem) => {
    const existing = catalogSelections[item.id];
    const defaultVariant =
      item.variants.find((variant) => variant.isDefault) || item.variants[0];
    setDetailItem(item);
    setDetailVariantId(existing?.variantId ?? defaultVariant?.id ?? null);
    setDetailQty(existing?.quantity ?? 1);
    setDetailColor(existing?.colorHex ?? "#F5F0E6");
    setDetailOpen(true);
  };

  const removeCatalogSelection = (itemId: number) => {
    setCatalogSelections((prev) => {
      if (!prev[itemId]) return prev;
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const confirmCatalogSelection = () => {
    if (!detailItem || !detailVariantId) return;
    const variant = detailItem.variants.find(
      (itemVariant) => itemVariant.id === detailVariantId,
    );
    if (!variant || !activeCatalogCode) return;
    setCatalogSelections((prev) => ({
      ...prev,
      [detailItem.id]: {
        itemId: detailItem.id,
        itemName: detailItem.name,
        variantId: variant.id,
        variantLabel: variant.material || variant.name,
        quantity: Math.max(1, detailQty),
        catalogCode: activeCatalogCode,
        unitPrice: Number(variant.price),
        colorHex: detailColor,
      },
    }));
    setDetailOpen(false);
  };

  const toggleSubact = (key: string) => {
    setSelectedSubacts((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const toggleSubactOption = (subactKey: string, optionKey: string) => {
    setSubactSelections((prev) => {
      const current = prev[subactKey] ?? [];
      const next = current.includes(optionKey)
        ? current.filter((item) => item !== optionKey)
        : [...current, optionKey];
      return { ...prev, [subactKey]: next };
    });
  };

  const clampStep = (value: number) => Math.min(3, Math.max(0, value));

  const resetWizardState = (options?: { projectName?: string }) => {
    if (options?.projectName !== undefined) {
      setProjectName(options.projectName);
    } else {
      setProjectName("");
    }
    setPostalCode("");
    setBaseProvince("");
    setBaseAction("");
    setOwnership("");
    setCeilingHeight("");
    setWindowsCount("");
    setSpaceLength("");
    setSpaceWidth("");
    setRooms([{ id: "room-1", name: "", length: "", width: "" }]);
    setRoomsTargetCount(null);
    setSelectedSubacts([]);
    setValuationStarted(false);
    setSubactSelections({});
    setCatalogSelections({});
    setCatalogOpen(false);
    setDetailOpen(false);
    setDetailItem(null);
    setDetailVariantId(null);
    setDetailQty(1);
    setDetailColor("#F5F0E6");
    setBaseSynced(false);
    setBaseSyncError(null);
    setCatalogSynced(false);
    setCatalogSyncError(null);
    setActiveSubactIndex(0);
    setActiveStep(0);
    setBudgetData(null);
    setBudgetError(null);
    setBudgetLoading(false);
    setLaborAdjust("base");
    setShowTaskDetails(false);
    setBaseChatMessages([]);
    setBaseChatInput("");
    baseLastQuestionKey.current = null;
  };

  const hydrateFromBase = (base: LgqProjectBaseResponse | null) => {
    if (!base) return;
    const answers = (base.answers ?? {}) as Record<string, unknown>;
    const baseInfo = (answers["base"] ?? {}) as Record<string, unknown>;
    const answersRooms = Array.isArray(answers["rooms"])
      ? answers["rooms"]
      : [];
    const answersSpace =
      answers["space"] && typeof answers["space"] === "object"
        ? answers["space"]
        : null;

    setPostalCode(String(answers["postalCode"] ?? ""));
    setBaseProvince(base.province ?? "");
    setOwnership(String(baseInfo.ownership ?? ""));
    setCeilingHeight(
      baseInfo.ceiling_height_m != null
        ? String(baseInfo.ceiling_height_m)
        : "",
    );
    setWindowsCount(
      baseInfo.windows_count != null ? String(baseInfo.windows_count) : "",
    );

    if (answersRooms.length > 0) {
      setRooms(
        answersRooms.map((room, index) => ({
          id: `room-${Date.now()}-${index}`,
          name: String((room as Record<string, unknown>).name ?? ""),
          length: String((room as Record<string, unknown>).length_m ?? ""),
          width: String((room as Record<string, unknown>).width_m ?? ""),
        })),
      );
      setRoomsTargetCount(answersRooms.length);
    } else if (answersSpace && typeof answersSpace === "object") {
      const spaceObj = answersSpace as Record<string, unknown>;
      setSpaceLength(String(spaceObj.length_m ?? ""));
      setSpaceWidth(String(spaceObj.width_m ?? ""));
    }

    if (Array.isArray(answers["selectedSubacts"])) {
      setSelectedSubacts(
        (answers["selectedSubacts"] as unknown[]).filter(
          (item) => typeof item === "string",
        ) as string[],
      );
    } else {
      setSelectedSubacts([]);
    }

    if (
      answers["subactSelections"] &&
      typeof answers["subactSelections"] === "object"
    ) {
      setSubactSelections(
        answers["subactSelections"] as Record<string, string[]>,
      );
    } else {
      setSubactSelections({});
    }

    const stepValue =
      typeof answers["wizard_step"] === "number"
        ? (answers["wizard_step"] as number)
        : base.actionId != null
          ? 1
          : 0;
    setActiveStep(clampStep(stepValue));

    setValuationStarted(Boolean(answers["valuation_started"]));
    const storedIndex =
      typeof answers["active_subact_index"] === "number"
        ? (answers["active_subact_index"] as number)
        : 0;
    setActiveSubactIndex(Number.isFinite(storedIndex) ? storedIndex : 0);

    setBaseSynced(true);
    setBaseSyncError(null);
  };

  const hydrateCatalogSelections = (
    selections: LgqCatalogSelectionResponse[],
  ) => {
    const next: typeof catalogSelections = {};
    selections.forEach((selection) => {
      next[selection.catalogItemId] = {
        itemId: selection.catalogItemId,
        itemName: selection.itemName,
        variantId: selection.variantId,
        variantLabel: selection.variantLabel,
        quantity: Number(selection.quantity ?? 1),
        catalogCode: selection.catalogCode,
        unitPrice: selection.unitPrice ?? undefined,
        colorHex: selection.colorHex ?? undefined,
      };
    });
    setCatalogSelections(next);
  };

  const nextBaseQuestion = useMemo<BaseQuestion | null>(() => {
    if (!projectName.trim()) {
      return {
        key: "projectName",
        prompt: "¿Cómo quieres llamar a este proyecto?",
      };
    }
    if (!postalCode || !isCataloniaPostalCode(postalCode)) {
      return {
        key: "postalCode",
        prompt:
          "Indícame el código postal. Necesitamos saber si estás en nuestro radio de acción.",
      };
    }
    if (!baseProvince) {
      const autoProvince = resolveProvinceFromPostal(postalCode);
      if (autoProvince) {
        return null;
      }
      return {
        key: "province",
        prompt: "¿Provincia? (Barcelona, Girona, Lleida o Tarragona).",
      };
    }
    if (!baseAction) {
      return {
        key: "action",
        prompt:
          "¿Qué tipo de reforma quieres? (Reforma integral, cocina, baño, redistribuir o pintar).",
      };
    }
    if (!ceilingHeightValue || ceilingHeightValue <= 0) {
      return {
        key: "ceilingHeight",
        prompt: "¿Altura de techos aproximada en metros?",
      };
    }
    if (windowsValue === null || windowsValue < 0) {
      return {
        key: "windowsCount",
        prompt: "¿Cuántas ventanas tiene la vivienda?",
      };
    }
    if (!ownership) {
      return {
        key: "ownership",
        prompt: "¿La vivienda es en propiedad o alquiler?",
      };
    }
    if (isIntegral) {
      if (!roomsTargetCount || roomsTargetCount <= 0) {
        return {
          key: "roomsCount",
          prompt: "¿Cuántas estancias vas a reformar?",
        };
      }
      for (let index = 0; index < roomsTargetCount; index += 1) {
        const room = rooms[index];
        if (!room || room.name.trim().length === 0) {
          return {
            key: "roomName",
            roomIndex: index,
            prompt: `Nombre de la estancia ${index + 1}`,
          };
        }
        const length = toNumber(room.length);
        if (!length || length <= 0) {
          return {
            key: "roomLength",
            roomIndex: index,
            prompt: `Largo en metros de ${room.name || `estancia ${index + 1}`}`,
          };
        }
        const width = toNumber(room.width);
        if (!width || width <= 0) {
          return {
            key: "roomWidth",
            roomIndex: index,
            prompt: `Ancho en metros de ${room.name || `estancia ${index + 1}`}`,
          };
        }
      }
      return null;
    }
    if (!spaceLength || !toNumber(spaceLength)) {
      return {
        key: "spaceLength",
        prompt: "¿Largo del recinto en metros?",
      };
    }
    if (!spaceWidth || !toNumber(spaceWidth)) {
      return {
        key: "spaceWidth",
        prompt: "¿Ancho del recinto en metros?",
      };
    }
    return null;
  }, [
    projectName,
    postalCode,
    baseProvince,
    baseAction,
    ceilingHeightValue,
    windowsValue,
    ownership,
    isIntegral,
    roomsTargetCount,
    rooms,
    spaceLength,
    spaceWidth,
  ]);

  useEffect(() => {
    if (activeStep !== 0) return;
    if (!nextBaseQuestion) return;
    const shouldAsk =
      nextBaseQuestion.key !== baseLastQuestionKey.current ||
      baseChatCount.current === 0;
    if (!shouldAsk) return;
    if (
      chatTransitionTimers.current.key === nextBaseQuestion.key &&
      chatTransitionTimers.current.delayTimer
    ) {
      return;
    }
    if (chatTransitionTimers.current.fadeTimer) {
      window.clearTimeout(chatTransitionTimers.current.fadeTimer);
    }
    if (chatTransitionTimers.current.delayTimer) {
      window.clearTimeout(chatTransitionTimers.current.delayTimer);
    }
    let mounted = true;
    const prompt = nextBaseQuestion.prompt;
    const outgoing = createChatMessage("assistant", "");
    const pendingUser = pendingUserMessage.current;
    pendingAiCopy.current.delete(outgoing.id);
    baseLastQuestionKey.current = nextBaseQuestion.key;
    chatTransitionTimers.current.key = nextBaseQuestion.key;
    const hasPrevious = baseChatCount.current > 0;
    if (hasPrevious) {
      setBaseChatMessages((prev) =>
        prev.map((msg) => ({ ...msg, status: "fading" as const })),
      );
    }
    const fadeTimer = hasPrevious
      ? window.setTimeout(() => {
          setBaseChatMessages((prev) =>
            prev.filter((msg) => msg.status !== "fading"),
          );
          chatTransitionTimers.current.fadeTimer = null;
        }, CHAT_FADE_MS)
      : null;
    const delayTimer = window.setTimeout(
      () => {
        const finalText = pendingAiCopy.current.get(outgoing.id) ?? prompt;
        setBaseChatMessages((prev) => {
          const cleaned = prev.filter((msg) => msg.status !== "fading");
          const next = [...cleaned];
          if (pendingUser) {
            next.push(pendingUser);
          }
          next.push(outgoing);
          return next;
        });
        if (pendingUserMessage.current === pendingUser) {
          pendingUserMessage.current = null;
        }
        runTypewriter(outgoing.id, finalText);
        chatTransitionTimers.current.delayTimer = null;
      },
      hasPrevious ? CHAT_TRANSITION_DELAY_MS : 0,
    );
    chatTransitionTimers.current.fadeTimer = fadeTimer;
    chatTransitionTimers.current.delayTimer = delayTimer;
    fetchAiCopy(prompt)
      .then((copy) => {
        if (!mounted) return;
        const text = copy && copy.trim().length > 0 ? copy.trim() : prompt;
        pendingAiCopy.current.set(outgoing.id, text);
        if (baseChatIds.current.has(outgoing.id)) {
          runTypewriter(outgoing.id, text);
        }
      })
      .catch(() => {
        if (!mounted) return;
      });
    return () => {
      mounted = false;
    };
  }, [activeStep, nextBaseQuestion, createChatMessage, runTypewriter]);

  useEffect(() => {
    if (activeStep !== 0) return;
    if (nextBaseQuestion) return;
    const pendingUser = pendingUserMessage.current;
    if (!pendingUser) return;
    if (chatTransitionTimers.current.delayTimer) return;
    const hasPrevious = baseChatCount.current > 0;
    if (hasPrevious) {
      setBaseChatMessages((prev) =>
        prev.map((msg) => ({ ...msg, status: "fading" as const })),
      );
    }
    const fadeTimer = hasPrevious
      ? window.setTimeout(() => {
          setBaseChatMessages((prev) =>
            prev.filter((msg) => msg.status !== "fading"),
          );
          chatTransitionTimers.current.fadeTimer = null;
        }, CHAT_FADE_MS)
      : null;
    const delayTimer = window.setTimeout(
      () => {
        setBaseChatMessages((prev) => {
          const cleaned = prev.filter((msg) => msg.status !== "fading");
          return [...cleaned, pendingUser];
        });
        if (pendingUserMessage.current === pendingUser) {
          pendingUserMessage.current = null;
        }
        chatTransitionTimers.current.delayTimer = null;
      },
      hasPrevious ? CHAT_TRANSITION_DELAY_MS : 0,
    );
    chatTransitionTimers.current.fadeTimer = fadeTimer;
    chatTransitionTimers.current.delayTimer = delayTimer;
    return () => {};
  }, [activeStep, nextBaseQuestion]);

  const handleBaseChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!nextBaseQuestion) return;
    const value = baseChatInput.trim();
    if (!value) return;
    const userMessage = createChatMessage("user", value);
    pendingUserMessage.current = userMessage;
    setBaseChatInput("");

    const fail = (message: string) => {
      pendingUserMessage.current = null;
      pushChatMessage(userMessage);
      pushChatMessage(createChatMessage("assistant", message));
    };

    switch (nextBaseQuestion.key) {
      case "projectName":
        setProjectName(value);
        if (!activeProjectId) {
          setProjectLoading(true);
          setProjectLoadError(null);
          try {
            const created = await createProject(value.trim());
            setProjects((prev) => [
              { id: created.id, name: value.trim() },
              ...prev,
            ]);
            setActiveProjectId(created.id);
          } catch (error) {
            setProjectLoadError("No pude crear el proyecto.");
          } finally {
            setProjectLoading(false);
          }
        }
        break;
      case "postalCode": {
        const normalized = value.replace(/\s/g, "");
        if (!/^\d{5}$/.test(normalized)) {
          fail("Necesito un código postal de 5 dígitos.");
          return;
        }
        if (!isCataloniaPostalCode(normalized)) {
          fail("Lo siento, no podemos llegar hasta tu código postal.");
          return;
        }
        setPostalCode(normalized);
        const autoProvince = resolveProvinceFromPostal(normalized);
        if (autoProvince) {
          setBaseProvince(autoProvince);
        }
        break;
      }
      case "province": {
        const province = parseProvinceInput(value);
        if (!province) {
          fail(
            "Provincia no válida. Usa Barcelona, Girona, Lleida o Tarragona.",
          );
          return;
        }
        setBaseProvince(province);
        break;
      }
      case "action": {
        const action = parseActionInput(value);
        if (!action) {
          fail(
            "No te he entendido. Puedes decir: reforma integral, cocina, baño, redistribuir o pintar.",
          );
          return;
        }
        setBaseAction(action);
        break;
      }
      case "ceilingHeight": {
        const numeric = toNumber(value);
        if (!numeric || numeric <= 0) {
          fail("Indícame la altura en metros (ej. 2.6).");
          return;
        }
        setCeilingHeight(String(value));
        break;
      }
      case "windowsCount": {
        const numeric = toNumber(value);
        if (numeric === null || numeric < 0) {
          fail("Necesito un número válido de ventanas.");
          return;
        }
        setWindowsCount(String(Math.round(numeric)));
        break;
      }
      case "ownership": {
        const ownershipValue = parseOwnershipInput(value);
        if (!ownershipValue) {
          fail("Indica si es propiedad o alquiler.");
          return;
        }
        setOwnership(ownershipValue);
        break;
      }
      case "roomsCount": {
        const numeric = Math.round(Number(value));
        if (!Number.isFinite(numeric) || numeric <= 0) {
          fail("Necesito un número de estancias válido.");
          return;
        }
        setRoomsTargetCount(numeric);
        setRooms((prev) => {
          const next = [...prev];
          while (next.length < numeric) {
            next.push({
              id: `room-${Date.now()}-${next.length}`,
              name: "",
              length: "",
              width: "",
            });
          }
          return next.slice(0, numeric);
        });
        break;
      }
      case "roomName": {
        setRooms((prev) =>
          prev.map((room, index) =>
            index === nextBaseQuestion.roomIndex
              ? { ...room, name: value }
              : room,
          ),
        );
        break;
      }
      case "roomLength": {
        const numeric = toNumber(value);
        if (!numeric || numeric <= 0) {
          fail("Necesito un largo válido en metros.");
          return;
        }
        setRooms((prev) =>
          prev.map((room, index) =>
            index === nextBaseQuestion.roomIndex
              ? { ...room, length: String(value) }
              : room,
          ),
        );
        break;
      }
      case "roomWidth": {
        const numeric = toNumber(value);
        if (!numeric || numeric <= 0) {
          fail("Necesito un ancho válido en metros.");
          return;
        }
        setRooms((prev) =>
          prev.map((room, index) =>
            index === nextBaseQuestion.roomIndex
              ? { ...room, width: String(value) }
              : room,
          ),
        );
        break;
      }
      case "spaceLength": {
        const numeric = toNumber(value);
        if (!numeric || numeric <= 0) {
          fail("Necesito un largo válido en metros.");
          return;
        }
        setSpaceLength(String(value));
        break;
      }
      case "spaceWidth": {
        const numeric = toNumber(value);
        if (!numeric || numeric <= 0) {
          fail("Necesito un ancho válido en metros.");
          return;
        }
        setSpaceWidth(String(value));
        break;
      }
      default:
        pendingUserMessage.current = null;
        break;
    }
  };

  const loadProjectState = async (projectId: number) => {
    setProjectLoading(true);
    setProjectLoadError(null);
    setHydratingProject(true);
    try {
      const [base, selections] = await Promise.all([
        fetchLgqBase(projectId),
        fetchCatalogSelections(projectId),
      ]);
      const project = projectMap.get(projectId);
      const nextName = project?.name ?? projectName;
      resetWizardState({ projectName: nextName ?? "" });
      if (base?.actionId != null) {
        const actionCode =
          actions.find((item) => item.id === base.actionId)?.code ?? "";
        setBaseAction(actionCode === "painting" ? "paint" : actionCode);
      } else {
        setBaseAction("");
      }
      if (base) {
        hydrateFromBase(base);
      }
      setBudgetData(null);
      if (selections && selections.length > 0) {
        hydrateCatalogSelections(selections);
      }
    } catch (error) {
      setProjectLoadError("No pude cargar el proyecto.");
    } finally {
      setProjectLoading(false);
      setHydratingProject(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeProjectId) return;
    setPdfLoading(true);
    setPdfError(null);
    try {
      await downloadLgqBudgetPdf(activeProjectId);
    } catch (error) {
      setPdfError("No pude descargar el PDF.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleCreateProject = () => {
    setProjectLoadError(null);
    window.localStorage.removeItem("lgq_active_project_id");
    resetWizardState({ projectName: "" });
    setActiveProjectId(null);
  };

  useEffect(() => {
    if (activeStep === 0 && canAdvanceBase) {
      setBaseAdvancePending(true);
      const timer = window.setTimeout(() => {
        setActiveStep(1);
      }, 2000);
      return () => {
        window.clearTimeout(timer);
        setBaseAdvancePending(false);
      };
    }
    setBaseAdvancePending(false);
  }, [activeStep, canAdvanceBase]);

  useEffect(() => {
    if (activeStep !== 0) return;
    if (!baseAction) return;
    if (hydratingProject) return;
    setBaseSynced(false);
  }, [
    activeStep,
    baseAction,
    postalCode,
    baseProvince,
    projectName,
    ownership,
    ceilingHeight,
    windowsCount,
    spaceLength,
    spaceWidth,
    rooms,
    hydratingProject,
  ]);

  useEffect(() => {
    if (baseAction !== "integral") {
      setRoomsTargetCount(null);
    }
  }, [baseAction]);

  useEffect(() => {
    if (postalCode.length < 2) {
      if (baseProvince) setBaseProvince("");
      return;
    }
    const nextProvince = resolveProvinceFromPostal(postalCode) ?? "";
    if (nextProvince !== baseProvince) {
      setBaseProvince(nextProvince);
    }
  }, [postalCode, baseProvince]);

  return (
    <section
      className={`wizard-shell ${current.key === "base" ? "is-base" : ""}`}
    >
      <div className="row">
        <div className="col-7">
          <div className="wizard-stepper" role="tablist" aria-label="Pasos">
            {steps.map((step, index) => {
              const isActive = index === activeStep;
              const isDone = index < activeStep;
              return (
                <button
                  key={step.key}
                  type="button"
                  className={`wizard-step ${isActive ? "is-active" : ""} ${
                    isDone ? "is-done" : ""
                  }`}
                  disabled
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="wizard-step__dot" aria-hidden="true" />
                  <span className="wizard-step__label">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="col-5">
          <div className="wizard-project-bar">
            {projects.length > 0 ? (
              <select
                id="wizard-project"
                className="form-selector form-control-small"
                value={activeProjectId ?? ""}
                onChange={(event) =>
                  setActiveProjectId(Number(event.target.value))
                }
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="wizard-project-bar__empty">
                Aún no hay proyectos guardados.
              </span>
            )}
            <button
              className="btn btn-tertiary btn-tertiary-dark btn-small"
              type="button"
              onClick={handleCreateProject}
            >
              Nuevo proyecto
            </button>
          </div>
        </div>
      </div>

      <div className="wizard-panel">
        {projectLoading && (
          <div className="wizard-sync-status">Cargando proyecto…</div>
        )}
        {projectLoadError && !projectLoading && (
          <div className="wizard-sync-status is-error">{projectLoadError}</div>
        )}
        {current.key === "actions" ? (
          <div className="wizard-actions-header">
            <div className="wizard-actions-current">
              <h2>{current.title}</h2>
              {valuationStarted && <p>Valorando el proyecto seleccionado.</p>}
            </div>
          </div>
        ) : (
          <>
            <h2>{current.title}</h2>
            <p>{current.helper}</p>
          </>
        )}
        {current.key === "base" ? (
          <div className="wizard-base-scroll">
            <div className="wizard-chat">
              <div className="wizard-chat__messages">
                {baseChatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`wizard-chat__message ${
                      message.role === "assistant" ? "is-assistant" : "is-user"
                    } ${message.status === "fading" ? "is-fading" : ""}`}
                  >
                    <span>{message.text}</span>
                  </div>
                ))}
              </div>
              {baseAdvancePending && (
                <div className="wizard-sync-status">
                  preparando inteligencia artificial
                </div>
              )}
              {(baseSyncing || baseSynced || baseSyncError) && (
                <div
                  className={`wizard-sync-status ${
                    baseSyncError ? "is-error" : ""
                  }`}
                >
                  {baseSyncing && "Guardando datos base…"}
                  {baseSynced && !baseSyncing && "Datos base guardados."}
                  {baseSyncError && !baseSyncing && baseSyncError}
                </div>
              )}
              <form
                className="wizard-chat__input"
                onSubmit={handleBaseChatSubmit}
              >
                <input
                  type="text"
                  className="form-control"
                  placeholder={
                    nextBaseQuestion
                      ? "Escribe tu respuesta…"
                      : "Preguntas base completas"
                  }
                  value={baseChatInput}
                  onChange={(event) => setBaseChatInput(event.target.value)}
                  disabled={!nextBaseQuestion}
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={
                    !nextBaseQuestion || baseChatInput.trim().length === 0
                  }
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        ) : current.key === "actions" ? (
          <div className="wizard-actions-scroll">
            <div
              className={`wizard-actions-step ${
                valuationStarted ? "is-valuation" : ""
              }`}
            >
              {/* <div className="wizard-subflow">
              <div className="wizard-subflow__panel">
                <h3>Subpantalla activa</h3>
                <p>
                  Aquí mostraremos la pregunta actual y la interfaz específica del ecosistema
                  seleccionado (catálogo, checklists, opciones, etc.).
                </p>
              </div>
              <div className="wizard-subflow__panel">
                <h3>Contexto seleccionado</h3>
                <p>
                  Resumen temporal de lo elegido dentro del ecosistema antes de avanzar.
                </p>
              </div>
            </div> */}
              <div
                className={`wizard-subacts ${
                  valuationStarted ? "is-hidden" : ""
                }`}
              >
                <div className="wizard-subacts__header">
                  <h3>Partidas del proyecto de {actionLabel}</h3>
                </div>
                {suggestedSubacts.length > 0 && (
                  <div className="wizard-subacts-suggest">
                    <div className="wizard-subacts-suggest__header">
                      <IconBot
                        className="wizard-ai-badge"
                        size={AI_ICON_SIZE}
                      />
                      <div>
                        <h4>Sugerencias de partidas</h4>
                        <p>{actionsSuggestTyped}</p>
                      </div>
                    </div>
                  </div>
                )}
                {subacts.length === 0 ? (
                  <div className="wizard-placeholder">
                    <p>
                      Selecciona un tipo de reforma en el Paso 1 para ver sus
                      partidas.
                    </p>
                  </div>
                ) : (
                  <div className="wizard-subacts-grid">
                    {subacts.map((subact) => (
                      <button
                        key={subact.key}
                        type="button"
                        className={`wizard-subact-card ${
                          selectedSubacts.includes(subact.key)
                            ? "is-selected"
                            : ""
                        }`}
                        onClick={() => toggleSubact(subact.key)}
                      >
                        <h4>{subact.label}</h4>
                        <p>{subact.helper}</p>
                        <p className="wizard-subact-detail">
                          {subact.helper} Definiremos aquí el alcance, medidas,
                          acabados y opciones de catálogo para presupuestar con
                          precisión.
                        </p>
                      </button>
                    ))}
                  </div>
                )}
                {selectedSubacts.length > 0 && (
                  <div className="wizard-subacts__summary">
                    <div className="wizard-subacts__chips">
                      {selectedSubacts.map((key) => {
                        const label =
                          subacts.find((item) => item.key === key)?.label ??
                          key;
                        return (
                          <span key={key} className="wizard-subacts__chip">
                            {label}
                          </span>
                        );
                      })}
                    </div>
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setValuationStarted(true)}
                      disabled={selectedSubacts.length === 0}
                    >
                      Comenzar a valorar
                    </button>
                  </div>
                )}
              </div>
              {valuationStarted && (
                <div className="wizard-subflow-wrapper">
                  <div className="row g-3 align-items-start">
                    <div className="col-12 col-lg-8">
                      <div className="wizard-subflow is-centered">
                        <div className="wizard-subflow__panel">
                          <div className="wizard-subflow__header">
                            <h3>{activeSubactLabel}</h3>
                            {subactUi && subactUi.type === "catalog" && (
                              <button
                                className="btn btn-tertiary btn-tertiary-dark btn-small"
                                type="button"
                                onClick={() => setCatalogOpen(true)}
                              >
                                Abrir catálogo
                              </button>
                            )}
                          </div>
                          <div className="wizard-ai-header">
                            <IconBot
                              className="wizard-ai-badge"
                              size={AI_ICON_SIZE}
                            />
                            <span>{actionsNarrativeTyped}</span>
                          </div>
                          <p className="wizard-ai-question">{subactQuestion}</p>
                          {subactUi && subactUi.type === "options" && (
                            <div className="wizard-subpanel">
                              {showSubpanelTitle && <h4>{subactUi.title}</h4>}
                              <div className="wizard-option-grid">
                                {subactUi.options.map((option) => (
                                  <button
                                    key={option.key}
                                    type="button"
                                    className={`wizard-option-chip ${
                                      (
                                        subactSelections[activeSubactKey] || []
                                      ).includes(option.key)
                                        ? "is-selected"
                                        : ""
                                    }`}
                                    onClick={() =>
                                      toggleSubactOption(
                                        activeSubactKey,
                                        option.key,
                                      )
                                    }
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                          {subactUi && subactUi.type === "catalog" && (
                            <div className="wizard-subpanel">
                              {showSubpanelTitle && <h4>{subactUi.title}</h4>}
                              {(catalogSyncing ||
                                catalogSynced ||
                                catalogSyncError) && (
                                <div
                                  className={`wizard-sync-status ${
                                    catalogSyncError ? "is-error" : ""
                                  }`}
                                >
                                  {catalogSyncing && "Guardando catálogo…"}
                                  {catalogSynced && !catalogSyncing && ""}
                                  {catalogSyncError &&
                                    !catalogSyncing &&
                                    catalogSyncError}
                                </div>
                              )}
                              {activeCatalogSelections.length > 0 && (
                                <div className="wizard-catalog-chips">
                                  {activeCatalogSelections.map((selection) => (
                                    <button
                                      key={selection.itemId}
                                      type="button"
                                      className="wizard-catalog-chip"
                                      onClick={() =>
                                        removeCatalogSelection(selection.itemId)
                                      }
                                    >
                                      <span>
                                        {selection.itemName}
                                        {selection.variantLabel
                                          ? ` · ${selection.variantLabel}`
                                          : ""}
                                        {selection.quantity > 1
                                          ? ` · ${selection.quantity}u`
                                          : ""}
                                        {selection.colorHex
                                          ? ` · ${selection.colorHex}`
                                          : ""}
                                      </span>
                                      <span className="wizard-catalog-chip__close">
                                        ×
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-12 col-lg-4">
                      <div className="wizard-ai-summary">
                        <IconBot
                          className="wizard-ai-badge"
                          size={AI_ICON_SIZE}
                        />
                        <div className="wizard-ai-summary__content">
                          <p>{actionsSummaryTyped}</p>
                          {selectedCatalogItems.length > 0 && (
                            <div className="wizard-ai-summary__chips mt-3">
                              {selectedCatalogItems.map((item) => {
                                const selected = Object.values(
                                  catalogSelections,
                                ).find(
                                  (selection) => selection.itemName === item,
                                );
                                return (
                                  <button
                                    key={item}
                                    type="button"
                                    className="wizard-ai-summary__chip"
                                    onClick={() =>
                                      selected
                                        ? removeCatalogSelection(
                                            selected.itemId,
                                          )
                                        : null
                                    }
                                  >
                                    <span>{item}</span>
                                    <span className="wizard-ai-summary__chip-close">
                                      ×
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="thisfloating">
                    <button
                      className="btn btn-primary txt-light"
                      type="button"
                      onClick={() => {
                        if (activeSubactIndex < totalSubacts - 1) {
                          setActiveSubactIndex((prev) => prev + 1);
                        } else {
                          setActiveStep(2);
                        }
                      }}
                      disabled={totalSubacts === 0 || !canContinueSubact}
                    >
                      {activeSubactIndex < totalSubacts - 1
                        ? `Continuar al siguiente: ${nextSubactLabel}`
                        : "Continuar a mano de obra"}
                    </button>
                  </div>
                </div>
              )}
              {catalogOpen && (
                <div
                  className="wizard-catalog-overlay"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="wizard-catalog-panel">
                    <div className="wizard-catalog-header">
                      <div>
                        <h4>{subactUi?.title}</h4>
                        <span className="wizard-catalog-meta">
                          {activeCatalog?.name ||
                            `Catálogo ${activeCatalogCode}`}
                        </span>
                      </div>
                      <button
                        className="btn btn-tertiary btn-tertiary-dark btn-small"
                        type="button"
                        onClick={() => setCatalogOpen(false)}
                      >
                        Cerrar catálogo
                      </button>
                    </div>
                    {catalogLoading ? (
                      <div className="wizard-catalog-loading">
                        Cargando catálogo…
                      </div>
                    ) : catalogError ? (
                      <div className="wizard-catalog-loading">
                        {catalogError}
                      </div>
                    ) : (
                      <div className="wizard-catalog-grid">
                        {(activeCatalog?.items || []).map((item) => {
                          const defaultVariant =
                            item.variants.find(
                              (variant) => variant.isDefault,
                            ) || item.variants[0];
                          const selection = catalogSelections[item.id];
                          const selectedVariant = selection
                            ? item.variants.find(
                                (variant) => variant.id === selection.variantId,
                              )
                            : null;
                          const previewImage =
                            selectedVariant?.imageUrl ||
                            defaultVariant?.imageUrl ||
                            item.imageUrl;
                          return (
                            <div
                              key={item.id}
                              className={`wizard-catalog-card ${
                                selection ? "is-selected" : ""
                              }`}
                              role="button"
                              tabIndex={0}
                              onClick={() => openCatalogDetail(item)}
                              onKeyDown={(event) => {
                                if (
                                  event.key === "Enter" ||
                                  event.key === " "
                                ) {
                                  event.preventDefault();
                                  openCatalogDetail(item);
                                }
                              }}
                            >
                              <div
                                className="wizard-catalog-card__media"
                                style={{
                                  backgroundImage: previewImage
                                    ? `url(${previewImage})`
                                    : undefined,
                                }}
                              />
                              <div className="wizard-catalog-card__body">
                                <strong>{item.name}</strong>
                                {selection && (
                                  <span className="wizard-catalog-card__badge">
                                    Seleccionado
                                  </span>
                                )}
                                <span>
                                  {defaultVariant?.material ||
                                    defaultVariant?.name ||
                                    "Variante"}
                                  {defaultVariant?.price
                                    ? ` · ${Number(defaultVariant.price).toFixed(2)} €`
                                    : ""}
                                </span>
                                <div className="wizard-catalog-card__actions">
                                  <button
                                    className="btn btn-tertiary btn-tertiary-dark btn-small"
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openCatalogDetail(item);
                                    }}
                                  >
                                    {selection ? "Editar" : "Seleccionar"}
                                  </button>
                                  {selection && (
                                    <button
                                      className="btn btn-tertiary btn-tertiary-dark btn-small"
                                      type="button"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        removeCatalogSelection(item.id);
                                      }}
                                    >
                                      Quitar
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {detailOpen && detailItem && (
                <div
                  className="wizard-catalog-detail-overlay"
                  role="dialog"
                  aria-modal="true"
                >
                  <div className="wizard-catalog-detail">
                    <div className="wizard-catalog-detail__header">
                      <div>
                        <h4>{detailItem.name}</h4>
                        <span>Configura materiales, acabados y cantidad.</span>
                      </div>
                      <button
                        className="btn btn-tertiary btn-tertiary-dark btn-small"
                        type="button"
                        onClick={() => setDetailOpen(false)}
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="wizard-catalog-detail__body">
                      {detailImage && (
                        <div
                          className="wizard-catalog-detail__media"
                          style={{ backgroundImage: `url(${detailImage})` }}
                        />
                      )}
                      <div className="wizard-catalog-detail__options">
                        <p>Selecciona la variante:</p>
                        {detailItem.variants.length === 0 ? (
                          <span className="wizard-catalog-empty">
                            Este artículo no tiene variantes configuradas.
                          </span>
                        ) : (
                          detailItem.variants.map((variant) => (
                            <label
                              key={variant.id}
                              className={`wizard-variant-option ${
                                detailVariantId === variant.id
                                  ? "is-selected"
                                  : ""
                              }`}
                            >
                              <input
                                type="radio"
                                name="catalog-variant"
                                checked={detailVariantId === variant.id}
                                onChange={() => setDetailVariantId(variant.id)}
                              />
                              <div>
                                <strong>{variant.name}</strong>
                                <span>
                                  {variant.material
                                    ? `Material: ${variant.material}`
                                    : "Material: —"}
                                  {variant.quality
                                    ? ` · Calidad: ${variant.quality}`
                                    : ""}
                                  {variant.price
                                    ? ` · ${Number(variant.price).toFixed(2)} €`
                                    : ""}
                                </span>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                      {tileSuggestion && (
                        <div className="wizard-catalog-detail__hint">
                          <span className="wizard-catalog-detail__hint-label">
                            Consejo de la IA
                          </span>
                          <p>
                            Según las medidas que nos facilitaste, podrías
                            necesitar ~{tileSuggestion.pieces} piezas de{" "}
                            {tileSuggestion.sizeX % 1 === 0
                              ? tileSuggestion.sizeX.toFixed(0)
                              : tileSuggestion.sizeX.toFixed(1)}
                            x
                            {tileSuggestion.sizeY % 1 === 0
                              ? tileSuggestion.sizeY.toFixed(0)
                              : tileSuggestion.sizeY.toFixed(1)}{" "}
                            cm para{" "}
                            {tileSuggestion.usedWall ? "paredes" : "suelo"} (
                            {tileSuggestion.surface.toFixed(1)} m², incluye 10%
                            de merma).
                          </p>
                        </div>
                      )}
                      {activeCatalogCode &&
                        COLOR_CATALOGS.has(activeCatalogCode) && (
                          <ColorPicker
                            label="Color (hex)"
                            value={detailColor}
                            onChange={setDetailColor}
                          />
                        )}
                      <div className="wizard-catalog-detail__quantity">
                        <label htmlFor="catalog-qty">Cantidad</label>
                        <input
                          id="catalog-qty"
                          type="number"
                          min={1}
                          className="form-control"
                          value={detailQty}
                          onChange={(event) =>
                            setDetailQty(Number(event.target.value || 1))
                          }
                        />
                      </div>
                    </div>
                    <div className="wizard-catalog-detail__footer">
                      <button
                        className="btn btn-primary"
                        type="button"
                        onClick={confirmCatalogSelection}
                        disabled={!detailVariantId}
                      >
                        Añadir al presupuesto
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : current.key === "labor" ? (
          <div className="wizard-labor-scroll">
            <div className="wizard-labor">
              <div className="wizard-labor__header">
                <IconBot className="wizard-ai-badge" size={AI_ICON_SIZE} />
                <div>
                  <h3>Mano de obra</h3>
                  <p>{laborIntroTyped}</p>
                  {laborSummaryText && (
                    <p className="wizard-labor__summary">{laborSummaryTyped}</p>
                  )}
                </div>
              </div>
              {budgetLoading ? (
                <div className="wizard-placeholder">
                  <p>Calculando mano de obra…</p>
                </div>
              ) : budgetError ? (
                <div className="wizard-placeholder">
                  <p>{budgetError}</p>
                </div>
              ) : laborLines.length === 0 ? (
                <div className="wizard-placeholder">
                  <p>No hay datos de mano de obra para este proyecto.</p>
                </div>
              ) : (
                <>
                  <div className="wizard-labor-grid">
                    {laborLines.map((line) => (
                      <article key={line.role} className="wizard-labor-card">
                        <div className="wizard-labor-card__icon">
                          {line.role.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4>{line.role}</h4>
                          <p>
                            {line.hours.toFixed(1)} h ·{" "}
                            {Number(line.hourlyRate).toFixed(2)} €/h
                          </p>
                        </div>
                        <span className="wizard-labor-card__amount">
                          {Number(line.amount).toFixed(2)} €
                        </span>
                      </article>
                    ))}
                  </div>
                  <div className="wizard-labor-adjust">
                    <span>Ajuste global de tiempo</span>
                    <div className="wizard-labor-adjust__controls">
                      <button
                        className={`btn btn-tertiary btn-tertiary-dark btn-small ${
                          laborAdjust === "down" ? "is-active" : ""
                        }`}
                        type="button"
                        onClick={() => setLaborAdjust("down")}
                      >
                        -10%
                      </button>
                      <button
                        className={`btn btn-tertiary btn-tertiary-dark btn-small ${
                          laborAdjust === "base" ? "is-active" : ""
                        }`}
                        type="button"
                        onClick={() => setLaborAdjust("base")}
                      >
                        Base
                      </button>
                      <button
                        className={`btn btn-tertiary btn-tertiary-dark btn-small ${
                          laborAdjust === "up" ? "is-active" : ""
                        }`}
                        type="button"
                        onClick={() => setLaborAdjust("up")}
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                  <div className="wizard-labor-details">
                    <button
                      className="btn btn-tertiary btn-tertiary-dark btn-small"
                      type="button"
                      onClick={() => setShowTaskDetails((prev) => !prev)}
                    >
                      {showTaskDetails
                        ? "Ocultar detalle de tareas"
                        : "Ver detalle de tareas"}
                    </button>
                    {showTaskDetails && (
                      <div className="wizard-labor-tasks">
                        {visibleTaskLines.length === 0 ? (
                          <div className="wizard-labor-task">
                            <strong>
                              No hay tareas con estimación todavía.
                            </strong>
                          </div>
                        ) : (
                          visibleTaskLines.map((task) => (
                            <div
                              key={task.taskId}
                              className="wizard-labor-task"
                            >
                              <strong>{task.taskName}</strong>
                              <span>
                                {task.hours.toFixed(1)} h · {task.role} ·{" "}
                                {Number(task.amount).toFixed(2)} €
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="wizard-labor-cta">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setActiveStep(3)}
                    >
                      Calcular presupuesto
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="wizard-budget">
            <div className="wizard-budget__header">
              <IconBot className="wizard-ai-badge" size={AI_ICON_SIZE} />
              <div>
                <h3>Calcular presupuesto</h3>
                <p>
                  {aiCopyMap["budget-intro"] ??
                    (budgetData
                      ? "Ya tienes disponible resumen final con partidas, IVA y total."
                      : "Estoy preparando el resumen final con partidas, IVA y total.")}
                </p>
              </div>
            </div>
            {budgetLoading ? (
              <div className="wizard-placeholder">
                <p>Calculando presupuesto…</p>
              </div>
            ) : budgetError ? (
              <div className="wizard-placeholder">
                <p>{budgetError}</p>
              </div>
            ) : budgetData ? (
              <div className="wizard-budget__summary">
                <div className="wizard-budget__totals">
                  <div>
                    <span>Subtotal</span>
                    <strong>{Number(budgetData.subtotal).toFixed(2)} €</strong>
                  </div>
                  <div>
                    <span>IVA ({Number(budgetData.ivaRate).toFixed(0)}%)</span>
                    <strong>{Number(budgetData.ivaAmount).toFixed(2)} €</strong>
                  </div>
                  <div>
                    <span>Total</span>
                    <strong>{Number(budgetData.total).toFixed(2)} €</strong>
                  </div>
                </div>
                <div className="wizard-budget__meta">
                  <p>
                    {budgetData.catalog.length} artículos de catálogo ·{" "}
                    {budgetData.labor.length} oficios ·{" "}
                    {budgetData.tasks.length} partidas
                  </p>
                </div>
              </div>
            ) : (
              <div className="wizard-placeholder">
                <p>Listo para calcular el presupuesto final.</p>
              </div>
            )}
            <div className="wizard-budget__cta">
              <button
                className="btn btn-tertiary btn-tertiary-dark"
                type="button"
                onClick={handleDownloadPdf}
                disabled={!budgetData || pdfLoading || !activeProjectId}
              >
                {pdfLoading ? "Descargando PDF…" : "Ver presupuesto"}
              </button>
            </div>
            {pdfError && (
              <div className="wizard-sync-status is-error">{pdfError}</div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default WizardShell;
