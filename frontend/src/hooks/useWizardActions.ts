import { useCallback } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { wizardTurn } from "../lib/api";
import type { ProjectScope, ProjectSpaceState } from "../lib/api";
import type { ChatMessage } from "../types/chat";
import type { StatusState } from "../types/status";

type WizardPayload = {
  message: string | null;
  appendUser: boolean;
  projectId?: number;
};

type UseWizardActionsOptions = {
  selectedProjectId: number | null;
  conversationId: number | null;
  messageInput: string;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  setMessageInput: (value: string) => void;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  setConversationId: (value: number | null) => void;
  setScope: (value: ProjectScope) => void;
  setSpaceState: (value: ProjectSpaceState) => void;
  setMissing: (value: string[]) => void;
  setWizardBusy: (value: boolean) => void;
  setStatus: (value: StatusState | null) => void;
  setSelectedProjectId: (value: number | null) => void;
  setNextFocus: (value: string | null) => void;
  handleAuthError: (error: unknown) => boolean;
};

export const useWizardActions = ({
  selectedProjectId,
  conversationId,
  messageInput,
  inputRef,
  setMessageInput,
  setMessages,
  setConversationId,
  setScope,
  setSpaceState,
  setMissing,
  setWizardBusy,
  setStatus,
  setSelectedProjectId,
  setNextFocus,
  handleAuthError,
}: UseWizardActionsOptions) => {
  const appendMessage = useCallback(
    (role: "assistant" | "user", content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-${Math.random()}`, role, content },
      ]);
    },
    [setMessages],
  );

  const handleWizardTurn = useCallback(
    async (payload: WizardPayload) => {
      const targetProjectId = payload.projectId ?? selectedProjectId;
      if (!targetProjectId) {
        setStatus({
          type: "info",
          message: "Selecciona un proyecto primero.",
        });
        return;
      }
      if (payload.appendUser && payload.message) {
        appendMessage("user", payload.message);
      }

      setWizardBusy(true);
      setStatus(null);
      try {
        if (payload.projectId && payload.projectId !== selectedProjectId) {
          setSelectedProjectId(payload.projectId);
        }
        const response = await wizardTurn(
          targetProjectId,
          payload.message,
          payload.projectId && payload.projectId !== selectedProjectId
            ? null
            : conversationId,
        );
        setConversationId(response.conversationId);
        setScope(response.scope);
        setSpaceState(response.spaceState);
        setMissing(response.missing ?? []);
        setNextFocus(response.nextFocus ?? null);
        if (response.assistantMessage) {
          appendMessage("assistant", response.assistantMessage);
        }
      } catch (error) {
        if (handleAuthError(error)) return;
        setStatus({
          type: "error",
          message: "No pude consultar al asistente IA.",
        });
      } finally {
        setWizardBusy(false);
      }
    },
    [
      appendMessage,
      conversationId,
      handleAuthError,
      selectedProjectId,
      setConversationId,
      setMissing,
      setScope,
      setSelectedProjectId,
      setSpaceState,
      setStatus,
      setWizardBusy,
      setNextFocus,
    ],
  );

  const handleSendMessage = useCallback(async () => {
    const text = messageInput.trim();
    if (!text) return;
    setMessageInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.overflowY = "hidden";
    }
    await handleWizardTurn({ message: text, appendUser: true });
  }, [handleWizardTurn, inputRef, messageInput, setMessageInput]);

  const handleResetStory = useCallback(async () => {
    setMessages([]);
    setConversationId(null);
    if (selectedProjectId) {
      await handleWizardTurn({
        message: null,
        appendUser: false,
        projectId: selectedProjectId,
      });
    }
  }, [handleWizardTurn, selectedProjectId, setConversationId, setMessages]);

  return { handleWizardTurn, handleSendMessage, handleResetStory };
};
