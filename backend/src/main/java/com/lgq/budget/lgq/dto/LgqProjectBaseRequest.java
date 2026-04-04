package com.lgq.budget.lgq.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record LgqProjectBaseRequest(
  Long actionId,
  String city,
  String province,
  JsonNode answers
) {}
