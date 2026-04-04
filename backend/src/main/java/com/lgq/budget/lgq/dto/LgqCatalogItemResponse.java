package com.lgq.budget.lgq.dto;

import java.util.List;

public record LgqCatalogItemResponse(
  long id,
  String code,
  String name,
  String unit,
  String description,
  String imageUrl,
  List<LgqCatalogVariantResponse> variants
) {}
