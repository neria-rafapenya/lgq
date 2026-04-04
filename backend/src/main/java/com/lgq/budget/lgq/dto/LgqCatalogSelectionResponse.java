package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqCatalogSelectionResponse(
  long catalogItemId,
  String itemName,
  long variantId,
  String variantLabel,
  BigDecimal quantity,
  BigDecimal unitPrice,
  String catalogCode,
  String colorHex
) {}
