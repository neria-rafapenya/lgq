package com.lgq.budget.dto;

import java.math.BigDecimal;

public record ProjectLaborRequest(
  BigDecimal masonryHours,
  BigDecimal plumbingHours,
  BigDecimal electricalHours,
  BigDecimal carpentryHours,
  BigDecimal installationHours,
  BigDecimal projectManagementHours
) {
}
