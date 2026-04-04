package com.lgq.budget.lgq.dto;

import java.util.List;

public record LgqCatalogResponse(
  long id,
  String code,
  String name,
  List<LgqCatalogItemResponse> items
) {}
