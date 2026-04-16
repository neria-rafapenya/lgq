package com.lgq.budget.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
  private static final Logger LOGGER = LoggerFactory.getLogger(AuditService.class);

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
    try {
      auditEventRepository.insert(userId, projectId, eventType, jsonPayload);
    } catch (RuntimeException ex) {
      LOGGER.warn("Failed to persist audit event {} for project {}", eventType, projectId, ex);
    }
  }

  private String toJson(Object payload) {
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize payload", ex);
    }
  }
}
