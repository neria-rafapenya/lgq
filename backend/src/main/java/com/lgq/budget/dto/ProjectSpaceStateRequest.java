package com.lgq.budget.dto;

import java.math.BigDecimal;

public record ProjectSpaceStateRequest(
  BigDecimal areaM2,
  BigDecimal heightM,
  Boolean hasDistributionPlan,
  String plumbingStatus,
  String electricalStatus,
  String drainageStatus,
  String wallType,
  Boolean demolitionRequired
) {
}
