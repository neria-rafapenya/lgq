import { useMemo } from "react";
import type { StepLabel } from "../helpers/constants";

export const useCurrentStep = (
  missing: string[],
  selectedProjectId: number | null,
): StepLabel | null =>
  useMemo(() => {
    if (!selectedProjectId) return null;
    if (missing.some((key) => key.startsWith("scope."))) return "Alcance";
    if (missing.some((key) => key.startsWith("space_state.")))
      return "Estado actual";
    if (missing.some((key) => key.startsWith("installations.")))
      return "Instalaciones";
    if (
      missing.includes("budget.materials") ||
      missing.includes("budget.equipment")
    ) {
      return "Catálogo";
    }
    if (
      missing.includes("budget.labor") ||
      missing.includes("budget.extras") ||
      missing.includes("budget.financials")
    ) {
      return "Mano de obra";
    }
    return "Resumen";
  }, [missing, selectedProjectId]);
