import { useCallback } from "react";
import { fetchConversation } from "../lib/api";
import type { ConversationHistoryResponse } from "../lib/api";
import type { ChatMessage } from "../types/chat";
import type { StatusState } from "../types/status";

type UseConversationLoaderOptions = {
  setConversationId: (value: number | null) => void;
  setMessages: (value: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setMissing: (value: string[]) => void;
  setNextFocus: (value: string | null) => void;
  setStatus: (value: StatusState | null) => void;
  setShowSummary: (value: boolean | ((prev: boolean) => boolean)) => void;
  handleAuthError: (error: unknown) => boolean;
};

const mapMessages = (messages: ConversationHistoryResponse["messages"]): ChatMessage[] =>
  messages.map((msg) => ({
    id: String(msg.id),
    role: msg.role,
    content: msg.content,
  }));

export const useConversationLoader = ({
  setConversationId,
  setMessages,
  setMissing,
  setNextFocus,
  setStatus,
  setShowSummary,
  handleAuthError,
}: UseConversationLoaderOptions) => {
  const resetConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setMissing([]);
    setNextFocus(null);
    setShowSummary(false);
  }, [setConversationId, setMessages, setMissing, setNextFocus, setShowSummary]);

  const loadConversation = useCallback(
    async (projectId: number) => {
      try {
        const data = await fetchConversation(projectId);
        setConversationId(data.conversationId ?? null);
        setMessages(mapMessages(data.messages));
        setMissing(data.missing ?? []);
        setNextFocus(null);
        setShowSummary(false);
        return data;
      } catch (error) {
        if (handleAuthError(error)) return null;
        setStatus({ type: "error", message: "No pude cargar la conversación." });
        resetConversation();
        return null;
      }
    },
    [handleAuthError, resetConversation, setConversationId, setMessages, setMissing, setNextFocus, setStatus],
  );

  return { loadConversation, resetConversation };
};
