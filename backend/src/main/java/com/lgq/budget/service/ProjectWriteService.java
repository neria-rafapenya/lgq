package com.lgq.budget.service;

import com.lgq.budget.audit.AuditService;
import com.lgq.budget.dto.CreateProjectRequest;
import com.lgq.budget.dto.CreateProjectResponse;
import com.lgq.budget.dto.EquipmentSelectionsRequest;
import com.lgq.budget.dto.MaterialSelectionsRequest;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import com.lgq.budget.repository.BudgetRepository;
import com.lgq.budget.repository.ProjectWriteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectWriteService {
  private final ProjectWriteRepository projectWriteRepository;
  private final BudgetRepository budgetRepository;
  private final AuditService auditService;

  public ProjectWriteService(
    ProjectWriteRepository projectWriteRepository,
    BudgetRepository budgetRepository,
    AuditService auditService
  ) {
    this.projectWriteRepository = projectWriteRepository;
    this.budgetRepository = budgetRepository;
    this.auditService = auditService;
  }

  @Transactional
  public CreateProjectResponse createProject(long userId, CreateProjectRequest request) {
    long projectId = projectWriteRepository.createProject(userId, request.name());
    auditService.logEvent(userId, projectId, "PROJECT_CREATED", request);
    return new CreateProjectResponse(projectId);
  }

  @Transactional
  public void replaceMaterials(long userId, boolean isAdmin, long projectId, MaterialSelectionsRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.replaceMaterialSelections(projectId, request.items());
    auditService.logEvent(userId, projectId, "MATERIALS_REPLACED", request);
  }

  @Transactional
  public void replaceEquipment(long userId, boolean isAdmin, long projectId, EquipmentSelectionsRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.replaceEquipmentSelections(projectId, request.items());
    auditService.logEvent(userId, projectId, "EQUIPMENT_REPLACED", request);
  }

  @Transactional
  public void upsertLabor(long userId, boolean isAdmin, long projectId, ProjectLaborRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertLabor(projectId, request);
    auditService.logEvent(userId, projectId, "LABOR_UPDATED", request);
  }

  @Transactional
  public void upsertExtras(long userId, boolean isAdmin, long projectId, ProjectExtrasRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertExtras(projectId, request);
    auditService.logEvent(userId, projectId, "EXTRAS_UPDATED", request);
  }

  @Transactional
  public void upsertFinancials(long userId, boolean isAdmin, long projectId, ProjectFinancialsRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertFinancials(projectId, request);
    auditService.logEvent(userId, projectId, "FINANCIALS_UPDATED", request);
  }

  @Transactional
  public void upsertScope(long userId, boolean isAdmin, long projectId, ProjectScopeRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertScope(projectId, request);
    auditService.logEvent(userId, projectId, "SCOPE_UPDATED", request);
  }

  @Transactional
  public void upsertSpaceState(long userId, boolean isAdmin, long projectId, ProjectSpaceStateRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertSpaceState(projectId, request);
    auditService.logEvent(userId, projectId, "SPACE_STATE_UPDATED", request);
  }

  @Transactional
  public void upsertInstallations(long userId, boolean isAdmin, long projectId, ProjectInstallationsRequest request) {
    ensureProjectExists(projectId, userId, isAdmin);
    projectWriteRepository.upsertInstallations(projectId, request);
    auditService.logEvent(userId, projectId, "INSTALLATIONS_UPDATED", request);
  }

  private void ensureProjectExists(long projectId, long userId, boolean isAdmin) {
    if (!budgetRepository.existsProject(projectId, userId, isAdmin)) {
      throw new ProjectNotFoundException(projectId);
    }
  }
}
