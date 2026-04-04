import { useMemo } from "react";
import type { SummaryItem } from "../types/summary";
import { TOTAL_FIELDS } from "../helpers/constants";

export const useProgress = (
  missing: string[],
  selectedProjectId: number | null,
  scopeSummary: SummaryItem[],
  spaceSummary: SummaryItem[],
) =>
  useMemo(() => {
    if (!selectedProjectId) return 0;
    const displayKeys = new Set([
      ...scopeSummary.map((item) => item.key),
      ...spaceSummary.map((item) => item.key),
    ]);
    const displayMissing = missing.filter((key) => displayKeys.has(key));
    if (!displayMissing.length) return 100;
    const completed = Math.max(0, TOTAL_FIELDS - displayMissing.length);
    return Math.min(100, Math.round((completed / TOTAL_FIELDS) * 100));
  }, [missing, selectedProjectId, scopeSummary, spaceSummary]);
