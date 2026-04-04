package com.lgq.budget.service;

import com.lgq.budget.audit.AuditService;
import com.lgq.budget.dto.BudgetResponse;
import com.lgq.budget.dto.CategoryTotal;
import com.lgq.budget.repository.BudgetRepository;
import com.lgq.budget.repository.BudgetRepository.Financials;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class BudgetService {
  private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");

  private final BudgetRepository budgetRepository;
  private final AuditService auditService;

  public BudgetService(BudgetRepository budgetRepository, AuditService auditService) {
    this.budgetRepository = budgetRepository;
    this.auditService = auditService;
  }

  public BudgetResponse calculateBudget(long projectId, long userId) {
    BudgetResponse response = calculateBudgetInternal(projectId);
    auditService.logEvent(userId, projectId, "BUDGET_CALCULATED", response);
    return response;
  }

  public BudgetResponse calculateBudgetPublic(long projectId) {
    BudgetResponse response = calculateBudgetInternal(projectId);
    auditService.logEvent(null, projectId, "BUDGET_PUBLIC_VIEW", response);
    return response;
  }

  private BudgetResponse calculateBudgetInternal(long projectId) {
    BigDecimal materials = budgetRepository.getMaterialsTotal(projectId);
    BigDecimal equipment = budgetRepository.getEquipmentTotal(projectId);
    BigDecimal labor = budgetRepository.getLaborTotal(projectId);
    BigDecimal extras = budgetRepository.getExtrasTotal(projectId);
    List<CategoryTotal> categories = budgetRepository.getCategoryTotals(projectId);
    Financials financials = budgetRepository.getFinancials(projectId);

    BigDecimal base = materials.add(equipment).add(labor).add(extras);
    BigDecimal marginFactor = BigDecimal.ONE.add(
      financials.marginPercentage().divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP)
    );
    BigDecimal contingencyFactor = BigDecimal.ONE.add(
      financials.contingencyPercentage().divide(ONE_HUNDRED, 6, RoundingMode.HALF_UP)
    );
    BigDecimal total = base.multiply(marginFactor).multiply(contingencyFactor);

    return new BudgetResponse(
      projectId,
      scale(materials),
      scale(equipment),
      scale(labor),
      scale(extras),
      scale(base),
      scale(financials.marginPercentage()),
      scale(financials.contingencyPercentage()),
      scale(total),
      categories
    );
  }

  private BigDecimal scale(BigDecimal value) {
    if (value == null) {
      return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }
    return value.setScale(2, RoundingMode.HALF_UP);
  }
}
