package com.lgq.budget.dto;

import java.math.BigDecimal;

public record EquipmentSelectionResponse(
  long id,
  long lineitemId,
  long variantId,
  int quantity,
  BigDecimal unitPrice,
  String room,
  boolean isSelected
) {
}
