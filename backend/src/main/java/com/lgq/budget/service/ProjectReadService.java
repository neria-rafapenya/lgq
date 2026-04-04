package com.lgq.budget.service;

import com.lgq.budget.dto.EquipmentSelectionResponse;
import com.lgq.budget.dto.MaterialSelectionResponse;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import com.lgq.budget.repository.BudgetRepository;
import com.lgq.budget.repository.ProjectReadRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProjectReadService {
  private final ProjectReadRepository projectReadRepository;
  private final BudgetRepository budgetRepository;

  public ProjectReadService(ProjectReadRepository projectReadRepository, BudgetRepository budgetRepository) {
    this.projectReadRepository = projectReadRepository;
    this.budgetRepository = budgetRepository;
  }

  public ProjectScopeRequest getScope(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectScopeRequest scope = projectReadRepository.findScope(projectId);
    return scope != null ? scope : defaultScope();
  }

  public ProjectSpaceStateRequest getSpaceState(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectSpaceStateRequest state = projectReadRepository.findSpaceState(projectId);
    return state != null ? state : defaultSpaceState();
  }

  public ProjectInstallationsRequest getInstallations(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectInstallationsRequest installations = projectReadRepository.findInstallations(projectId);
    return installations != null ? installations : defaultInstallations();
  }

  public ProjectLaborRequest getLabor(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectLaborRequest labor = projectReadRepository.findLabor(projectId);
    return labor != null ? labor : defaultLabor();
  }

  public ProjectExtrasRequest getExtras(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectExtrasRequest extras = projectReadRepository.findExtras(projectId);
    return extras != null ? extras : defaultExtras();
  }

  public ProjectFinancialsRequest getFinancials(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    ProjectFinancialsRequest financials = projectReadRepository.findFinancials(projectId);
    return financials != null ? financials : defaultFinancials();
  }

  public List<MaterialSelectionResponse> getMaterialSelections(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    return projectReadRepository.findMaterialSelections(projectId);
  }

  public List<EquipmentSelectionResponse> getEquipmentSelections(long userId, boolean isAdmin, long projectId) {
    ensureProjectExists(projectId, userId, isAdmin);
    return projectReadRepository.findEquipmentSelections(projectId);
  }

  private void ensureProjectExists(long projectId, long userId, boolean isAdmin) {
    if (!budgetRepository.existsProject(projectId, userId, isAdmin)) {
      throw new ProjectNotFoundException(projectId);
    }
  }

  private ProjectScopeRequest defaultScope() {
    return new ProjectScopeRequest("partial", false, false, false, false, false);
  }

  private ProjectSpaceStateRequest defaultSpaceState() {
    return new ProjectSpaceStateRequest(null, null, false, null, null, null, null, false);
  }

  private ProjectInstallationsRequest defaultInstallations() {
    return new ProjectInstallationsRequest("none", "none", "none", 0, 0, 0, "none", false);
  }

  private ProjectLaborRequest defaultLabor() {
    return new ProjectLaborRequest(BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
  }

  private ProjectExtrasRequest defaultExtras() {
    return new ProjectExtrasRequest(false, false, false, false, false);
  }

  private ProjectFinancialsRequest defaultFinancials() {
    return new ProjectFinancialsRequest(BigDecimal.ZERO, BigDecimal.ZERO);
  }
}
