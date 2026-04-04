package com.lgq.budget.repository;

import com.lgq.budget.dto.CategoryTotal;
import com.lgq.budget.dto.ProjectSummary;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class BudgetRepository {
  private final JdbcTemplate jdbcTemplate;

  public BudgetRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<ProjectSummary> findProjects(long userId, boolean isAdmin) {
    String sql = isAdmin
      ? """
        SELECT id, name
        FROM projects
        ORDER BY id
        """
      : """
        SELECT id, name
        FROM projects
        WHERE user_id = ?
        ORDER BY id
        """;
    return isAdmin
      ? jdbcTemplate.query(sql, (rs, rowNum) -> new ProjectSummary(rs.getLong("id"), rs.getString("name")))
      : jdbcTemplate.query(sql, (rs, rowNum) -> new ProjectSummary(rs.getLong("id"), rs.getString("name")), userId);
  }

  public boolean existsProject(long projectId, long userId, boolean isAdmin) {
    String sql = isAdmin
      ? """
        SELECT COUNT(*)
        FROM projects
        WHERE id = ?
        """
      : """
        SELECT COUNT(*)
        FROM projects
        WHERE id = ? AND user_id = ?
        """;
    Integer count = isAdmin
      ? jdbcTemplate.queryForObject(sql, Integer.class, projectId)
      : jdbcTemplate.queryForObject(sql, Integer.class, projectId, userId);
    return count != null && count > 0;
  }

  public int deleteProject(long projectId, long userId, boolean isAdmin) {
    String sql = isAdmin
      ? """
        DELETE FROM projects
        WHERE id = ?
        """
      : """
        DELETE FROM projects
        WHERE id = ? AND user_id = ?
        """;
    return isAdmin
      ? jdbcTemplate.update(sql, projectId)
      : jdbcTemplate.update(sql, projectId, userId);
  }

  public boolean existsProject(long projectId) {
    String sql = """
      SELECT COUNT(*)
      FROM projects
      WHERE id = ?
      """;
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, projectId);
    return count != null && count > 0;
  }

  public String findProjectName(long projectId) {
    String sql = """
      SELECT name
      FROM projects
      WHERE id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, String.class, projectId);
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public BigDecimal getMaterialsTotal(long projectId) {
    String sql = """
      SELECT COALESCE(SUM(pms.quantity * COALESCE(pms.unit_price, v.price)), 0)
      FROM project_material_selections pms
      JOIN lineitem_materials_variants v ON pms.variant_id = v.id
      WHERE pms.project_id = ?
        AND pms.is_selected = 1
      """;
    return queryForBigDecimal(sql, projectId);
  }

  public BigDecimal getEquipmentTotal(long projectId) {
    String sql = """
      SELECT COALESCE(SUM(pes.quantity * COALESCE(pes.unit_price, v.price)), 0)
      FROM project_equipment_selections pes
      JOIN lineitem_materials_variants v ON pes.variant_id = v.id
      WHERE pes.project_id = ?
        AND pes.is_selected = 1
      """;
    return queryForBigDecimal(sql, projectId);
  }

  public List<CategoryTotal> getCategoryTotals(long projectId) {
    String sql = """
      SELECT c.name AS category,
             COALESCE(SUM(pms.quantity * COALESCE(pms.unit_price, v.price)), 0) AS total
      FROM project_material_selections pms
      JOIN lineitem_materials li ON pms.lineitem_id = li.id
      JOIN subcategory_materials sc ON li.subcategory_id = sc.id
      JOIN category_materials c ON sc.category_id = c.id
      JOIN lineitem_materials_variants v ON pms.variant_id = v.id
      WHERE pms.project_id = ?
        AND pms.is_selected = 1
      GROUP BY c.name
      ORDER BY c.name
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) ->
      new CategoryTotal(rs.getString("category"), rs.getBigDecimal("total"))
    , projectId);
  }

  public BigDecimal getLaborTotal(long projectId) {
    String sql = """
      SELECT COALESCE(
        (masonry_hours * 25) +
        (plumbing_hours * 30) +
        (electrical_hours * 28) +
        (carpentry_hours * 27) +
        (installation_hours * 26) +
        (project_management_hours * 35),
      0)
      FROM project_labor
      WHERE project_id = ?
      """;
    return queryForBigDecimal(sql, projectId);
  }

  public BigDecimal getExtrasTotal(long projectId) {
    String sql = """
      SELECT COALESCE(
        (debris_removal * 300) +
        (municipal_permits * 500) +
        (dumpster_required * 200) +
        (protection_required * 150) +
        (final_cleaning * 100),
      0)
      FROM project_extras
      WHERE project_id = ?
      """;
    return queryForBigDecimal(sql, projectId);
  }

  public Financials getFinancials(long projectId) {
    String sql = """
      SELECT COALESCE(margin_percentage, 0) AS margin_percentage,
             COALESCE(contingency_percentage, 0) AS contingency_percentage
      FROM project_financials
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new Financials(rs.getBigDecimal("margin_percentage"), rs.getBigDecimal("contingency_percentage"))
      , projectId);
    } catch (EmptyResultDataAccessException ex) {
      return new Financials(BigDecimal.ZERO, BigDecimal.ZERO);
    }
  }

  private BigDecimal queryForBigDecimal(String sql, Object... args) {
    try {
      return jdbcTemplate.queryForObject(sql, BigDecimal.class, args);
    } catch (EmptyResultDataAccessException ex) {
      return BigDecimal.ZERO;
    }
  }

  public record Financials(BigDecimal marginPercentage, BigDecimal contingencyPercentage) {
  }
}
