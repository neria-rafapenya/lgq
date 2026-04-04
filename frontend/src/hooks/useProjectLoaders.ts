import { useCallback } from "react";
import {
  fetchProjects,
  fetchScope,
  fetchSpaceState,
} from "../lib/api";
import type {
  ProjectScope,
  ProjectSpaceState,
  ProjectSummary,
} from "../lib/api";
import type { StatusState } from "../types/status";

type UseProjectLoadersOptions = {
  setProjects: (value: ProjectSummary[]) => void;
  setScope: (value: ProjectScope) => void;
  setSpaceState: (value: ProjectSpaceState) => void;
  setStatus: (value: StatusState | null) => void;
  setLoading: (value: boolean) => void;
  handleAuthError: (error: unknown) => boolean;
};

export const useProjectLoaders = ({
  setProjects,
  setScope,
  setSpaceState,
  setStatus,
  setLoading,
  handleAuthError,
}: UseProjectLoadersOptions) => {
  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      if (handleAuthError(error)) return;
      setStatus({ type: "error", message: "No pude cargar los proyectos." });
    }
  }, [handleAuthError, setProjects, setStatus]);

  const loadProjectData = useCallback(
    async (projectId: number) => {
      setLoading(true);
      setStatus(null);
      try {
        const [scopeData, spaceData] = await Promise.all([
          fetchScope(projectId),
          fetchSpaceState(projectId),
        ]);
        setScope(scopeData);
        setSpaceState(spaceData);
      } catch (error) {
        if (handleAuthError(error)) return;
        setStatus({
          type: "error",
          message: "No pude cargar los datos del proyecto.",
        });
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError, setLoading, setScope, setSpaceState, setStatus],
  );

  return { loadProjects, loadProjectData };
};
