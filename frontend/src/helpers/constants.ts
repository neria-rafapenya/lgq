import type { ProjectScope, ProjectSpaceState } from "../lib/api";

export const TOTAL_FIELDS = 14;

export const DEFAULT_SCOPE: ProjectScope = {
  reformType: "partial",
  hasLayoutChanges: false,
  moveKitchen: false,
  moveBathroom: false,
  demolishWalls: false,
  openSpaces: false,
};

export const DEFAULT_SPACE_STATE: ProjectSpaceState = {
  areaM2: null,
  heightM: null,
  hasDistributionPlan: false,
  plumbingStatus: null,
  electricalStatus: null,
  drainageStatus: null,
  wallType: null,
  demolitionRequired: false,
};

export const STATUS_MAP: Record<string, string> = {
  good: "Bueno",
  regular: "Regular",
  bad: "Malo",
};

export const WALL_MAP: Record<string, string> = {
  pladur: "Pladur",
  brick: "Ladrillo",
  load_bearing: "Muro de carga",
  mixed: "Mixto",
};

export const STEP_LABELS = [
  "Alcance",
  "Estado actual",
  "Instalaciones",
  "Catálogo",
  "Mano de obra",
  "Resumen",
] as const;

export type StepLabel = (typeof STEP_LABELS)[number];

export const STEP_FALLBACKS: Record<
  StepLabel,
  { title: string; subtitle?: string }
> = {
  Alcance: {
    title: "Tu reforma",
    subtitle: "Lo que quieres transformar",
  },
  "Estado actual": {
    title: "Tu reforma · El espacio actual",
  },
  Instalaciones: {
    title: "Tu reforma · Instalaciones y confort",
  },
  Catálogo: {
    title: "Tu reforma · Acabados y equipamiento",
  },
  "Mano de obra": {
    title: "Tu reforma · Mano de obra y extras",
  },
  Resumen: {
    title: "Tu reforma · Resumen final",
  },
};
