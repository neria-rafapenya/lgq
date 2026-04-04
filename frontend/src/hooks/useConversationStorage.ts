import { useEffect } from "react";
import type { ChatMessage } from "../types/chat";

type ConversationStorageOptions = {
  selectedProjectId: number | null;
  conversationId: number | null;
  setConversationId: (value: number | null) => void;
  setMessages: (value: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setMissing: (value: string[] | ((prev: string[]) => string[])) => void;
  setShowSummary: (value: boolean | ((prev: boolean) => boolean)) => void;
};

export const useConversationStorage = ({
  selectedProjectId,
  conversationId,
  setConversationId,
  setMessages,
  setMissing,
  setShowSummary,
}: ConversationStorageOptions) => {
  useEffect(() => {
    if (!selectedProjectId) {
      setConversationId(null);
      setMessages([]);
      setMissing([]);
      setShowSummary(false);
      return;
    }
    const key = `lgq.conversation.${selectedProjectId}`;
    const stored = localStorage.getItem(key);
    setConversationId(stored ? Number(stored) : null);
    setMessages([]);
    setMissing([]);
  }, [selectedProjectId, setConversationId, setMessages, setMissing, setShowSummary]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const key = `lgq.conversation.${selectedProjectId}`;
    if (conversationId) {
      localStorage.setItem(key, String(conversationId));
    } else {
      localStorage.removeItem(key);
    }
  }, [conversationId, selectedProjectId]);
};
