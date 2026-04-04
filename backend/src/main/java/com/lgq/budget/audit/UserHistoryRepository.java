package com.lgq.budget.audit;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserHistoryRepository {
  private final JdbcTemplate jdbcTemplate;

  public UserHistoryRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public void recordSnapshot(long userId, String snapshotJson) {
    jdbcTemplate.update(
      "INSERT INTO user_profile_history (user_id, snapshot) VALUES (?, ?)",
      userId,
      snapshotJson
    );
  }
}
