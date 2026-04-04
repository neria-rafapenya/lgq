package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqCatalogVariantUpsertRequest(
  String name,
  String material,
  String quality,
  String imageUrl,
  BigDecimal sizeXcm,
  BigDecimal sizeYcm,
  BigDecimal sizeZcm,
  BigDecimal price,
  Boolean isDefault,
  Boolean isActive
) {}
