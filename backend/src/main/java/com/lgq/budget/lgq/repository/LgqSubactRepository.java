package com.lgq.budget.lgq.repository;

import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LgqSubactRepository {
  private final JdbcTemplate jdbcTemplate;

  public LgqSubactRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<SubactRow> findByActionCode(String actionCode) {
    String sql = """
      SELECT
        s.id,
        s.subact_key,
        s.label,
        s.helper,
        s.type,
        s.catalog_code,
        s.options_json,
        s.sort_order
      FROM lgq_subacts s
      JOIN lgq_actions a ON a.id = s.action_id
      WHERE a.code = ? AND s.is_active = 1
      ORDER BY s.sort_order, s.id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new SubactRow(
      rs.getLong("id"),
      rs.getString("subact_key"),
      rs.getString("label"),
      rs.getString("helper"),
      rs.getString("type"),
      rs.getString("catalog_code"),
      rs.getString("options_json"),
      rs.getInt("sort_order")
    ), actionCode);
  }

  public record SubactRow(
    long id,
    String key,
    String label,
    String helper,
    String type,
    String catalogCode,
    String optionsJson,
    int sortOrder
  ) {}
}
