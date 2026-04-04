package com.lgq.budget.controller;

import com.lgq.budget.ai.WizardAiService;
import com.lgq.budget.dto.ConversationHistoryResponse;
import com.lgq.budget.dto.EquipmentSelectionResponse;
import com.lgq.budget.dto.MaterialSelectionResponse;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import com.lgq.budget.service.ProjectReadService;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects")
public class ProjectWizardReadController {
  private final ProjectReadService projectReadService;
  private final WizardAiService wizardAiService;

  public ProjectWizardReadController(ProjectReadService projectReadService, WizardAiService wizardAiService) {
    this.projectReadService = projectReadService;
    this.wizardAiService = wizardAiService;
  }

  @GetMapping("/{projectId}/scope")
  public ProjectScopeRequest getScope(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getScope(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/space-state")
  public ProjectSpaceStateRequest getSpaceState(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getSpaceState(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/installations")
  public ProjectInstallationsRequest getInstallations(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getInstallations(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/labor")
  public ProjectLaborRequest getLabor(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getLabor(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/extras")
  public ProjectExtrasRequest getExtras(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getExtras(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/financials")
  public ProjectFinancialsRequest getFinancials(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getFinancials(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/materials")
  public List<MaterialSelectionResponse> getMaterials(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getMaterialSelections(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/equipment")
  public List<EquipmentSelectionResponse> getEquipment(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectReadService.getEquipmentSelections(principal.getId(), principal.getRole() == Role.ADMIN, projectId);
  }

  @GetMapping("/{projectId}/conversation")
  public ConversationHistoryResponse getConversation(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return wizardAiService.getConversationHistory(principal.getId(), principal.getRole(), projectId);
  }
}
