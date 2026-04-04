import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import { login, logout, register } from "../lib/api";
import type {
  AuthUser,
  ProjectScope,
  ProjectSpaceState,
  ProjectSummary,
} from "../lib/api";
import type { ChatMessage } from "../types/chat";
import type { StatusState } from "../types/status";

type UseAuthActionsOptions = {
  authEmail: string;
  authPassword: string;
  authMode: "login" | "register";
  setStatus: (value: StatusState | null) => void;
  setLoading: (value: boolean) => void;
  setCurrentUser: (value: AuthUser | null) => void;
  setAuthPassword: (value: string) => void;
  setProjects: (value: ProjectSummary[]) => void;
  setSelectedProjectId: (value: number | null) => void;
  setScope: (value: ProjectScope) => void;
  setSpaceState: (value: ProjectSpaceState) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setConversationId: (value: number | null) => void;
  loadProjects: () => Promise<void>;
  defaultScope: ProjectScope;
  defaultSpaceState: ProjectSpaceState;
  onLogout?: () => void;
};

export const useAuthActions = ({
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
  defaultScope,
  defaultSpaceState,
  onLogout,
}: UseAuthActionsOptions) => {
  const handleAuthSubmit = useCallback(async () => {
    if (!authEmail.trim() || !authPassword) {
      setStatus({
        type: "info",
        message: "Email y password son obligatorios.",
      });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const user =
        authMode === "register"
          ? await register(authEmail.trim(), authPassword)
          : await login(authEmail.trim(), authPassword);
      setCurrentUser(user);
      setAuthPassword("");
      await loadProjects();
    } catch {
      setStatus({ type: "error", message: "No pude autenticarte." });
    } finally {
      setLoading(false);
    }
  }, [
    authEmail,
    authMode,
    authPassword,
    loadProjects,
    setAuthPassword,
    setCurrentUser,
    setLoading,
    setStatus,
  ]);

  const handleLogout = useCallback(async () => {
    setLoading(true);
    try {
      await logout();
    } finally {
      onLogout?.();
      setCurrentUser(null);
      setProjects([]);
      setSelectedProjectId(null);
      setScope(defaultScope);
      setSpaceState(defaultSpaceState);
      setMessages([]);
      setConversationId(null);
      setLoading(false);
    }
  }, [
    defaultScope,
    defaultSpaceState,
    onLogout,
    setConversationId,
    setCurrentUser,
    setLoading,
    setMessages,
    setProjects,
    setScope,
    setSelectedProjectId,
    setSpaceState,
  ]);

  return { handleAuthSubmit, handleLogout };
};
