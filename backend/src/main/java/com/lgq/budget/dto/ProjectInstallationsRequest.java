package com.lgq.budget.dto;

public record ProjectInstallationsRequest(
  String plumbingRenovation,
  String electricalRenovation,
  String gasRenovation,
  Integer newWaterPoints,
  Integer newLightPoints,
  Integer newSocketPoints,
  String heatingType,
  Boolean hasHeatingSystem
) {
}
