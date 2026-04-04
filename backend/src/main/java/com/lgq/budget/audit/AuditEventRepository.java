package com.lgq.budget.audit;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AuditEventRepository {
  private final JdbcTemplate jdbcTemplate;

  public AuditEventRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void insert(Long userId, Long projectId, String eventType, String payloadJson) {
    jdbcTemplate.update(
      "INSERT INTO audit_events (user_id, project_id, event_type, payload) VALUES (?, ?, ?, ?)",
      userId,
      projectId,
      eventType,
      payloadJson
    );
  }
}
