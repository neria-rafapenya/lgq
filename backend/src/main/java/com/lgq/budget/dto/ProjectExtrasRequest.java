package com.lgq.budget.dto;

public record ProjectExtrasRequest(
  Boolean debrisRemoval,
  Boolean municipalPermits,
  Boolean dumpsterRequired,
  Boolean protectionRequired,
  Boolean finalCleaning
) {
}
