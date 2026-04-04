package com.lgq.budget.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;

public record WizardAiUpdates(
  ProjectScopeRequest scope,
  @JsonProperty("space_state") ProjectSpaceStateRequest spaceState,
  ProjectInstallationsRequest installations,
  WizardMaterialSelections materials,
  WizardEquipmentSelections equipment,
  ProjectLaborRequest labor,
  ProjectExtrasRequest extras,
  ProjectFinancialsRequest financials
) {
}
