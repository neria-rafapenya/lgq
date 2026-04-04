package com.lgq.budget.ai;

import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import java.util.List;

public record WizardAiResponse(
  long conversationId,
  String assistantMessage,
  ProjectScopeRequest scope,
  ProjectSpaceStateRequest spaceState,
  ProjectInstallationsRequest installations,
  List<String> missing,
  String nextFocus
) {
}
