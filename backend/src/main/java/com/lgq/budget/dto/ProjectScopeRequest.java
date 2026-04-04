package com.lgq.budget.dto;

public record ProjectScopeRequest(
  String reformType,
  Boolean hasLayoutChanges,
  Boolean moveKitchen,
  Boolean moveBathroom,
  Boolean demolishWalls,
  Boolean openSpaces
) {
}
