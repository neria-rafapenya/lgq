package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqLaborLine(
  String role,
  BigDecimal hours,
  BigDecimal hourlyRate,
  BigDecimal amount
) {}
