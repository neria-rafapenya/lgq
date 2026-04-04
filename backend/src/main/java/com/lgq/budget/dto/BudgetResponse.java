package com.lgq.budget.dto;

import java.math.BigDecimal;
import java.util.List;

public record BudgetResponse(
  long projectId,
  BigDecimal materials,
  BigDecimal equipment,
  BigDecimal labor,
  BigDecimal extras,
  BigDecimal base,
  BigDecimal marginPercentage,
  BigDecimal contingencyPercentage,
  BigDecimal total,
  List<CategoryTotal> categories
) {
}
