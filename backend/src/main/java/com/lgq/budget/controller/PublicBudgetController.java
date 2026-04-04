package com.lgq.budget.controller;

import com.lgq.budget.dto.BudgetResponse;
import com.lgq.budget.dto.PublicBudgetResponse;
import com.lgq.budget.repository.BudgetRepository;
import com.lgq.budget.service.BudgetService;
import com.lgq.budget.service.ProjectNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/budgets")
public class PublicBudgetController {
  private final BudgetRepository budgetRepository;
  private final BudgetService budgetService;

  public PublicBudgetController(BudgetRepository budgetRepository, BudgetService budgetService) {
    this.budgetRepository = budgetRepository;
    this.budgetService = budgetService;
  }

  @GetMapping("/{projectId}")
  public PublicBudgetResponse getPublicBudget(@PathVariable long projectId) {
    if (!budgetRepository.existsProject(projectId)) {
      throw new ProjectNotFoundException(projectId);
    }
    BudgetResponse budget = budgetService.calculateBudgetPublic(projectId);
    String projectName = budgetRepository.findProjectName(projectId);
    return new PublicBudgetResponse(
      projectId,
      projectName,
      budget.materials(),
      budget.equipment(),
      budget.labor(),
      budget.extras(),
      budget.base(),
      budget.marginPercentage(),
      budget.contingencyPercentage(),
      budget.total(),
      budget.categories()
    );
  }
}
