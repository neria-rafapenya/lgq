package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqCatalogSelectionRequest(
  long catalogItemId,
  long variantId,
  BigDecimal quantity,
  BigDecimal unitPrice,
  Boolean isSelected,
  String colorHex
) {}
