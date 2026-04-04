package com.lgq.budget.dto;

import java.math.BigDecimal;

public record MaterialSelectionResponse(
  long id,
  long lineitemId,
  long variantId,
  BigDecimal quantity,
  BigDecimal unitPrice,
  boolean isSelected,
  boolean isCustom
) {
}
