package com.lgq.budget.ai;

import java.math.BigDecimal;

public record CatalogItem(
  Long lineitemId,
  Long variantId,
  String name,
  String category,
  String subcategory,
  String unit,
  String quality,
  BigDecimal price
) {
}
