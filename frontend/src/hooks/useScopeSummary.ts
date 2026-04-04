import { useMemo } from "react";
import type { ProjectScope } from "../lib/api";
import type { SummaryItem } from "../types/summary";
import { buildScopeSummary } from "../helpers/summaries";

export const useScopeSummary = (scope: ProjectScope): SummaryItem[] =>
  useMemo(() => buildScopeSummary(scope), [scope]);
