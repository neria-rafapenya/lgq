package com.lgq.budget.audit;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AccessLogRepository {
  private final JdbcTemplate jdbcTemplate;

  public AccessLogRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void insert(Long userId, String method, String path, String ipAddress, String userAgent) {
    jdbcTemplate.update(
      "INSERT INTO access_logs (user_id, method, path, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)",
      userId,
      method,
      path,
      ipAddress,
      userAgent
    );
  }
}
