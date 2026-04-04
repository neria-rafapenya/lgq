package com.lgq.budget.lgq.dto;

public record LgqCatalogItemUpsertRequest(
  String code,
  String name,
  String unit,
  String description,
  String imageUrl,
  Boolean isActive
) {}
