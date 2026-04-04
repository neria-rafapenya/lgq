import { useCallback } from "react";
import { createProject } from "../lib/api";
import type { ConversationHistoryResponse, ProjectScope, ProjectSpaceState } from "../lib/api";
import type { StatusState } from "../types/status";

type UseProjectActionsOptions = {
  newProjectName: string;
  setNewProjectName: (value: string) => void;
  setSelectedProjectId: (value: number | null) => void;
  setScope: (value: ProjectScope) => void;
  setSpaceState: (value: ProjectSpaceState) => void;
  setStatus: (value: StatusState | null) => void;
  setLoading: (value: boolean) => void;
  loadProjects: () => Promise<void>;
  loadProjectData: (projectId: number) => Promise<void>;
  loadConversation: (projectId: number) => Promise<ConversationHistoryResponse | null>;
  resetConversation: () => void;
  persistLastProject: (projectId: number) => void;
  handleWizardTurn: (payload: {
    message: string | null;
    appendUser: boolean;
    projectId?: number;
  }) => Promise<void>;
  scrollToStory: () => void;
  handleAuthError: (error: unknown) => boolean;
  defaultScope: ProjectScope;
  defaultSpaceState: ProjectSpaceState;
};

export const useProjectActions = ({
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
  defaultScope,
  defaultSpaceState,
}: UseProjectActionsOptions) => {
  const handleProjectSelect = useCallback(
    async (value: string) => {
      if (!value) {
        setSelectedProjectId(null);
        setScope(defaultScope);
        setSpaceState(defaultSpaceState);
        resetConversation();
        return;
      }
      const projectId = Number(value);
      setSelectedProjectId(projectId);
      persistLastProject(projectId);
      await loadProjectData(projectId);
      const history = await loadConversation(projectId);
      if (!history) return;
      if (history.messages.length === 0) {
        await handleWizardTurn({ message: null, appendUser: false, projectId });
        scrollToStory();
        return;
      }
      scrollToStory();
      if (typeof window !== "undefined") {
        window.setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
        }, 0);
      }
    },
    [
      defaultScope,
      defaultSpaceState,
      handleWizardTurn,
      loadProjectData,
      loadConversation,
      persistLastProject,
      resetConversation,
      scrollToStory,
      setScope,
      setSelectedProjectId,
      setSpaceState,
    ],
  );

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) {
      setStatus({
        type: "info",
        message: "Escribe un nombre para el proyecto.",
      });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const result = await createProject(newProjectName.trim());
      setNewProjectName("");
      await loadProjects();
      setSelectedProjectId(result.id);
      persistLastProject(result.id);
      await loadProjectData(result.id);
      resetConversation();
      setStatus({ type: "success", message: "Proyecto creado." });
      await handleWizardTurn({
        message: null,
        appendUser: false,
        projectId: result.id,
      });
      scrollToStory();
    } catch (error) {
      if (handleAuthError(error)) return;
      setStatus({ type: "error", message: "No pude crear el proyecto." });
    } finally {
      setLoading(false);
    }
  }, [
    handleAuthError,
    handleWizardTurn,
    loadProjectData,
    loadProjects,
    newProjectName,
    persistLastProject,
    resetConversation,
    scrollToStory,
    setLoading,
    setNewProjectName,
    setSelectedProjectId,
    setStatus,
  ]);

  return { handleCreateProject, handleProjectSelect };
};
