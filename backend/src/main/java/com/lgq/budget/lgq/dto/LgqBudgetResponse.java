package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;
import java.util.List;

public record LgqBudgetResponse(
  long projectId,
  BigDecimal subtotal,
  BigDecimal ivaRate,
  BigDecimal ivaAmount,
  BigDecimal total,
  List<LgqCatalogLine> catalog,
  List<LgqTaskLine> tasks,
  List<LgqLaborLine> labor
) {}
