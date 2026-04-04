package com.lgq.budget.ai;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WizardAiPayload(
  @JsonProperty("assistant_message") String assistantMessage,
  WizardAiUpdates updates,
  @JsonProperty("next_focus") String nextFocus
) {
}
