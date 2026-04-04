package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqCatalogLine(
  long catalogItemId,
  String itemName,
  String variantName,
  String colorHex,
  String unit,
  BigDecimal quantity,
  BigDecimal unitPrice,
  BigDecimal amount
) {}
