import { useMemo } from "react";
import type { ProjectSpaceState } from "../lib/api";
import type { SummaryItem } from "../types/summary";
import { buildSpaceSummary } from "../helpers/summaries";

export const useSpaceSummary = (
  spaceState: ProjectSpaceState,
): SummaryItem[] => useMemo(() => buildSpaceSummary(spaceState), [spaceState]);
