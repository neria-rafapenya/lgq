package com.lgq.budget.lgq.repository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lgq.budget.lgq.dto.LgqCatalogLine;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionRequest;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionResponse;
import com.lgq.budget.lgq.dto.LgqLaborLine;
import com.lgq.budget.lgq.dto.LgqProjectBaseRequest;
import com.lgq.budget.lgq.dto.LgqProjectBaseResponse;
import com.lgq.budget.lgq.dto.LgqTaskLine;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LgqProjectRepository {
  private final JdbcTemplate jdbcTemplate;
  private final ObjectMapper objectMapper;

  public LgqProjectRepository(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
    this.jdbcTemplate = jdbcTemplate;
    this.objectMapper = objectMapper;
  }

  public void upsertBase(long projectId, LgqProjectBaseRequest request) {
    String sql = """
      INSERT INTO lgq_project_base (project_id, action_id, city, province, answers_json)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        action_id = VALUES(action_id),
        city = VALUES(city),
        province = VALUES(province),
        answers_json = VALUES(answers_json)
      """;
    jdbcTemplate.update(sql,
      projectId,
      request.actionId(),
      request.city(),
      request.province(),
      toJson(request.answers())
    );
  }

  public LgqProjectBaseResponse findBase(long projectId) {
    String sql = """
      SELECT project_id, action_id, city, province, answers_json
      FROM lgq_project_base
      WHERE project_id = ?
      """;
    List<LgqProjectBaseResponse> rows = jdbcTemplate.query(sql, (rs, rowNum) -> new LgqProjectBaseResponse(
      rs.getLong("project_id"),
      rs.getObject("action_id") == null ? null : rs.getLong("action_id"),
      rs.getString("city"),
      rs.getString("province"),
      parseJson(rs.getString("answers_json"))
    ), projectId);
    return rows.isEmpty() ? null : rows.get(0);
  }

  public void replaceActionSelections(long projectId, List<Long> actionIds) {
    jdbcTemplate.update("DELETE FROM lgq_project_action_selections WHERE project_id = ?", projectId);
    if (actionIds == null || actionIds.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO lgq_project_action_selections (project_id, action_id)
      VALUES (?, ?)
      """;
    for (Long actionId : actionIds) {
      jdbcTemplate.update(sql, projectId, actionId);
    }
  }

  public List<Long> findActionSelections(long projectId) {
    String sql = """
      SELECT action_id
      FROM lgq_project_action_selections
      WHERE project_id = ?
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("action_id"), projectId);
  }

  public void replaceCatalogSelections(long projectId, List<LgqCatalogSelectionRequest> selections) {
    jdbcTemplate.update("DELETE FROM lgq_project_catalog_selections WHERE project_id = ?", projectId);
    if (selections == null || selections.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO lgq_project_catalog_selections
        (project_id, catalog_item_id, variant_id, quantity, unit_price, color_hex, is_selected)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """;
    for (LgqCatalogSelectionRequest selection : selections) {
      BigDecimal quantity = selection.quantity() == null ? BigDecimal.ONE : selection.quantity();
      BigDecimal unitPrice = selection.unitPrice();
      jdbcTemplate.update(sql,
        projectId,
        selection.catalogItemId(),
        selection.variantId(),
        quantity,
        unitPrice,
        selection.colorHex(),
        toTinyInt(selection.isSelected(), true)
      );
    }
  }

  public List<LgqCatalogLine> findCatalogLines(long projectId) {
    String sql = """
      SELECT
        s.catalog_item_id,
        i.name AS item_name,
        i.unit AS item_unit,
        v.name AS variant_name,
        s.color_hex AS color_hex,
        COALESCE(s.quantity, 1) AS quantity,
        COALESCE(s.unit_price, v.price) AS unit_price
      FROM lgq_project_catalog_selections s
      JOIN lgq_catalog_items i ON i.id = s.catalog_item_id
      JOIN lgq_catalog_variants v ON v.id = s.variant_id
      WHERE s.project_id = ? AND s.is_selected = 1
      ORDER BY s.id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> {
      BigDecimal qty = rs.getBigDecimal("quantity");
      BigDecimal unitPrice = rs.getBigDecimal("unit_price");
      BigDecimal amount = qty.multiply(unitPrice);
      return new LgqCatalogLine(
        rs.getLong("catalog_item_id"),
        rs.getString("item_name"),
        rs.getString("variant_name"),
        rs.getString("color_hex"),
        rs.getString("item_unit"),
        qty,
        unitPrice,
        amount
      );
    }, projectId);
  }

  public List<LgqCatalogSelectionResponse> findCatalogSelections(long projectId) {
    String sql = """
      SELECT
        s.catalog_item_id,
        i.name AS item_name,
        v.id AS variant_id,
        v.name AS variant_name,
        s.color_hex AS color_hex,
        COALESCE(s.quantity, 1) AS quantity,
        COALESCE(s.unit_price, v.price) AS unit_price,
        c.code AS catalog_code
      FROM lgq_project_catalog_selections s
      JOIN lgq_catalog_items i ON i.id = s.catalog_item_id
      JOIN lgq_catalog_variants v ON v.id = s.variant_id
      JOIN lgq_catalogs c ON c.id = i.catalog_id
      WHERE s.project_id = ? AND s.is_selected = 1
      ORDER BY s.id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqCatalogSelectionResponse(
      rs.getLong("catalog_item_id"),
      rs.getString("item_name"),
      rs.getLong("variant_id"),
      rs.getString("variant_name"),
      rs.getBigDecimal("quantity"),
      rs.getBigDecimal("unit_price"),
      rs.getString("catalog_code"),
      rs.getString("color_hex")
    ), projectId);
  }

  public void replaceTaskLines(long projectId, List<LgqTaskLine> tasks) {
    jdbcTemplate.update("DELETE FROM lgq_project_task_hours WHERE project_id = ?", projectId);
    if (tasks == null || tasks.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO lgq_project_task_hours (project_id, task_id, quantity, hours)
      VALUES (?, ?, ?, ?)
      """;
    for (LgqTaskLine task : tasks) {
      jdbcTemplate.update(sql,
        projectId,
        task.taskId(),
        task.quantity(),
        task.hours()
      );
    }
  }

  public void replaceLaborLines(long projectId, List<LgqLaborLine> laborLines) {
    jdbcTemplate.update("DELETE FROM lgq_project_labor WHERE project_id = ?", projectId);
    if (laborLines == null || laborLines.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO lgq_project_labor (project_id, role, hours, hourly_rate, amount)
      VALUES (?, ?, ?, ?, ?)
      """;
    for (LgqLaborLine line : laborLines) {
      jdbcTemplate.update(sql,
        projectId,
        line.role(),
        line.hours(),
        line.hourlyRate(),
        line.amount()
      );
    }
  }

  public void upsertBudget(long projectId, BigDecimal subtotal, BigDecimal ivaRate, BigDecimal ivaAmount, BigDecimal total) {
    String sql = """
      INSERT INTO lgq_project_budget (project_id, subtotal, iva_rate, iva_amount, total)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        subtotal = VALUES(subtotal),
        iva_rate = VALUES(iva_rate),
        iva_amount = VALUES(iva_amount),
        total = VALUES(total)
      """;
    jdbcTemplate.update(sql, projectId, subtotal, ivaRate, ivaAmount, total);
  }

  public List<LgqRateRow> findRates() {
    String sql = """
      SELECT role, hourly_rate
      FROM lgq_professional_rates
      WHERE is_active = 1
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqRateRow(
      rs.getString("role"),
      rs.getBigDecimal("hourly_rate")
    ));
  }

  public record LgqRateRow(String role, BigDecimal hourlyRate) {}

  private String toJson(JsonNode node) {
    if (node == null) {
      return null;
    }
    try {
      return objectMapper.writeValueAsString(node);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("No se pudo serializar answers_json", ex);
    }
  }

  private JsonNode parseJson(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    try {
      return objectMapper.readTree(value);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("No se pudo leer answers_json", ex);
    }
  }

  private int toTinyInt(Boolean value, boolean defaultValue) {
    boolean actual = value != null ? value : defaultValue;
    return actual ? 1 : 0;
  }
}
