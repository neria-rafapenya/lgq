package com.lgq.budget.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record MaterialSelectionItem(
  @NotNull Long lineitemId,
  @NotNull Long variantId,
  @NotNull BigDecimal quantity,
  BigDecimal unitPrice,
  Boolean isSelected,
  Boolean isCustom
) {
}
