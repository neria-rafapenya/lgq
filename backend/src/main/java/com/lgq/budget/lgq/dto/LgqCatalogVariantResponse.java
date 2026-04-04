package com.lgq.budget.lgq.dto;

import java.math.BigDecimal;

public record LgqCatalogVariantResponse(
  long id,
  String name,
  String material,
  String quality,
  String imageUrl,
  BigDecimal sizeXcm,
  BigDecimal sizeYcm,
  BigDecimal sizeZcm,
  BigDecimal price,
  boolean isDefault
) {}
