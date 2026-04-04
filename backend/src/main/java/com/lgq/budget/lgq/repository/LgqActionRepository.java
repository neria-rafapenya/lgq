package com.lgq.budget.lgq.repository;

import com.lgq.budget.lgq.dto.LgqActionResponse;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LgqActionRepository {
  private final JdbcTemplate jdbcTemplate;

  public LgqActionRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<LgqActionResponse> findActiveActions() {
    String sql = """
      SELECT id, code, name, description
      FROM lgq_actions
      WHERE is_active = 1
      ORDER BY id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqActionResponse(
      rs.getLong("id"),
      rs.getString("code"),
      rs.getString("name"),
      rs.getString("description")
    ));
  }

  public List<Long> findActiveActionIds() {
    String sql = """
      SELECT id
      FROM lgq_actions
      WHERE is_active = 1
      ORDER BY id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("id"));
  }

  public String findActionCode(long actionId) {
    String sql = """
      SELECT code
      FROM lgq_actions
      WHERE id = ?
      """;
    List<String> rows = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("code"), actionId);
    return rows.isEmpty() ? null : rows.get(0);
  }

  public List<LgqActionTaskRow> findTasksByActionIds(List<Long> actionIds) {
    if (actionIds == null || actionIds.isEmpty()) {
      return List.of();
    }
    String inSql = actionIds.stream().map(id -> "?").reduce((a, b) -> a + "," + b).orElse("?");
    String sql = """
      SELECT id, action_id, code, name, unit, base_rate_hours, role, quantity_key, subact_key
      FROM lgq_action_tasks
      WHERE action_id IN (%s)
      ORDER BY action_id, id
      """.formatted(inSql);
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqActionTaskRow(
      rs.getLong("id"),
      rs.getLong("action_id"),
      rs.getString("code"),
      rs.getString("name"),
      rs.getString("unit"),
      rs.getBigDecimal("base_rate_hours"),
      rs.getString("role"),
      rs.getString("quantity_key"),
      rs.getString("subact_key")
    ), actionIds.toArray());
  }

  public List<LgqTaskRuleRow> findTaskRules(List<Long> taskIds) {
    if (taskIds == null || taskIds.isEmpty()) {
      return List.of();
    }
    String inSql = taskIds.stream().map(id -> "?").reduce((a, b) -> a + "," + b).orElse("?");
    String sql = """
      SELECT task_id, factor_key, factor_value, multiplier
      FROM lgq_task_rules
      WHERE task_id IN (%s)
      """.formatted(inSql);
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqTaskRuleRow(
      rs.getLong("task_id"),
      rs.getString("factor_key"),
      rs.getString("factor_value"),
      rs.getBigDecimal("multiplier")
    ), taskIds.toArray());
  }

  public record LgqActionTaskRow(
    long id,
    long actionId,
    String code,
    String name,
    String unit,
    BigDecimal baseRateHours,
    String role,
    String quantityKey,
    String subactKey
  ) {}

  public record LgqTaskRuleRow(
    long taskId,
    String factorKey,
    String factorValue,
    BigDecimal multiplier
  ) {}
}
