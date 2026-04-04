package com.lgq.budget.lgq.dto;

import java.util.List;

public record LgqSubactResponse(
  long id,
  String key,
  String label,
  String helper,
  String type,
  String catalogCode,
  List<LgqSubactOption> options,
  Integer sortOrder
) {}
