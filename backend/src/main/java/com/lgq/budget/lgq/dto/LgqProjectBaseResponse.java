package com.lgq.budget.lgq.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record LgqProjectBaseResponse(
  long projectId,
  Long actionId,
  String city,
  String province,
  JsonNode answers
) {}
