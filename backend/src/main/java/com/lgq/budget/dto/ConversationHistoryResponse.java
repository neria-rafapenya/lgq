package com.lgq.budget.dto;

import java.util.List;

public record ConversationHistoryResponse(
  Long conversationId,
  List<ConversationMessageResponse> messages,
  List<String> missing
) {}
