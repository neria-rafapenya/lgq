package com.lgq.budget.controller;

import com.lgq.budget.dto.BudgetResponse;
import com.lgq.budget.dto.ProjectSummary;
import com.lgq.budget.repository.BudgetRepository;
import com.lgq.budget.service.BudgetService;
import com.lgq.budget.service.BudgetPdfService;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {
  private final BudgetRepository budgetRepository;
  private final BudgetService budgetService;
  private final BudgetPdfService budgetPdfService;

  public ProjectController(
    BudgetRepository budgetRepository,
    BudgetService budgetService,
    BudgetPdfService budgetPdfService
  ) {
    this.budgetRepository = budgetRepository;
    this.budgetService = budgetService;
    this.budgetPdfService = budgetPdfService;
  }

  @GetMapping
  public List<ProjectSummary> listProjects(@AuthenticationPrincipal UserPrincipal principal) {
    boolean isAdmin = principal.getRole() == Role.ADMIN;
    return budgetRepository.findProjects(principal.getId(), isAdmin);
  }

  @GetMapping("/{projectId}/budget")
  public BudgetResponse getBudget(@PathVariable long projectId, @AuthenticationPrincipal UserPrincipal principal) {
    boolean isAdmin = principal.getRole() == Role.ADMIN;
    if (!budgetRepository.existsProject(projectId, principal.getId(), isAdmin)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
    }
    return budgetService.calculateBudget(projectId, principal.getId());
  }

  @GetMapping(value = "/{projectId}/budget/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
  public ResponseEntity<byte[]> getBudgetPdf(
    @PathVariable long projectId,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    boolean isAdmin = principal.getRole() == Role.ADMIN;
    if (!budgetRepository.existsProject(projectId, principal.getId(), isAdmin)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
    }
    byte[] pdf = budgetPdfService.generateBudgetPdf(projectId, principal.getId());
    String filename = "presupuesto-" + projectId + ".pdf";
    return ResponseEntity.ok()
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
      .contentType(MediaType.APPLICATION_PDF)
      .body(pdf);
  }

  @DeleteMapping("/{projectId}")
  public void deleteProject(@PathVariable long projectId, @AuthenticationPrincipal UserPrincipal principal) {
    boolean isAdmin = principal.getRole() == Role.ADMIN;
    int rows = budgetRepository.deleteProject(projectId, principal.getId(), isAdmin);
    if (rows == 0) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found");
    }
  }
}
