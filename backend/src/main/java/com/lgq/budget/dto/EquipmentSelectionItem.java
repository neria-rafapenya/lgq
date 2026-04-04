package com.lgq.budget.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record EquipmentSelectionItem(
  @NotNull Long lineitemId,
  @NotNull Long variantId,
  @NotNull Integer quantity,
  BigDecimal unitPrice,
  @NotBlank String room,
  Boolean isSelected
) {
}
