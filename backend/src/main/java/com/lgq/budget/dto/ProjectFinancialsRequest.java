package com.lgq.budget.dto;

import java.math.BigDecimal;

public record ProjectFinancialsRequest(
  BigDecimal marginPercentage,
  BigDecimal contingencyPercentage
) {
}
