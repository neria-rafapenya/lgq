package com.lgq.budget.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private final AuditEventRepository auditEventRepository;
  private final ObjectMapper objectMapper;

  public AuditService(AuditEventRepository auditEventRepository, ObjectMapper objectMapper) {
    this.auditEventRepository = auditEventRepository;
    this.objectMapper = objectMapper;
  }

  public void logEvent(Long userId, Long projectId, String eventType, Object payload) {
    String jsonPayload = null;
    if (payload != null) {
      jsonPayload = toJson(payload);
    }
    auditEventRepository.insert(userId, projectId, eventType, jsonPayload);
  }

  private String toJson(Object payload) {
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize payload", ex);
    }
  }
}
