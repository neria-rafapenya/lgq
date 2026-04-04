package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqTaskLine(
  long taskId,
  String taskName,
  String unit,
  BigDecimal quantity,
  BigDecimal hours,
  String role,
  BigDecimal hourlyRate,
  BigDecimal amount
) {}
