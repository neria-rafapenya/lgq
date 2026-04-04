import type { ProjectScope, ProjectSpaceState } from "../lib/api";
import type { SummaryItem } from "../types/summary";
import { formatValue, humanize } from "./formatters";
import { STATUS_MAP, WALL_MAP } from "./constants";

export const buildScopeSummary = (scope: ProjectScope): SummaryItem[] => [
  {
    key: "scope.reformType",
    label: "Tipo de reforma",
    value: scope.reformType === "integral" ? "Integral" : "Parcial",
  },
  {
    key: "scope.hasLayoutChanges",
    label: "Cambios de distribución",
    value: formatValue(scope.hasLayoutChanges),
  },
  {
    key: "scope.moveKitchen",
    label: "Mover cocina",
    value: formatValue(scope.moveKitchen),
  },
  {
    key: "scope.moveBathroom",
    label: "Mover baño",
    value: formatValue(scope.moveBathroom),
  },
  {
    key: "scope.demolishWalls",
    label: "Demoler tabiques",
    value: formatValue(scope.demolishWalls),
  },
  {
    key: "scope.openSpaces",
    label: "Abrir espacios",
    value: formatValue(scope.openSpaces),
  },
];

export const buildSpaceSummary = (
  spaceState: ProjectSpaceState,
): SummaryItem[] => [
  {
    key: "space_state.areaM2",
    label: "Área (m²)",
    value: spaceState.areaM2 !== null ? `${spaceState.areaM2}` : "Pendiente",
  },
  {
    key: "space_state.heightM",
    label: "Altura (m)",
    value: spaceState.heightM !== null ? `${spaceState.heightM}` : "Pendiente",
  },
  {
    key: "space_state.hasDistributionPlan",
    label: "Plano de distribución",
    value: formatValue(spaceState.hasDistributionPlan),
  },
  {
    key: "space_state.plumbingStatus",
    label: "Estado fontanería",
    value: humanize(spaceState.plumbingStatus, STATUS_MAP),
  },
  {
    key: "space_state.electricalStatus",
    label: "Estado electricidad",
    value: humanize(spaceState.electricalStatus, STATUS_MAP),
  },
  {
    key: "space_state.drainageStatus",
    label: "Estado saneamiento",
    value: humanize(spaceState.drainageStatus, STATUS_MAP),
  },
  {
    key: "space_state.wallType",
    label: "Tipo de pared",
    value: humanize(spaceState.wallType, WALL_MAP),
  },
  {
    key: "space_state.demolitionRequired",
    label: "Demolición necesaria",
    value: formatValue(spaceState.demolitionRequired),
  },
];
