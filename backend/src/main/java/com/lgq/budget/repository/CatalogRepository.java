package com.lgq.budget.repository;

import com.lgq.budget.ai.CatalogItem;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class CatalogRepository {
  private final JdbcTemplate jdbcTemplate;

  public CatalogRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<CatalogItem> findActiveDefaultItems() {
    String sql = """
      SELECT li.id AS lineitem_id,
             v.id AS variant_id,
             li.name AS name,
             c.name AS category,
             sc.name AS subcategory,
             li.unit AS unit,
             v.quality AS quality,
             v.price AS price
      FROM lineitem_materials li
      JOIN subcategory_materials sc ON li.subcategory_id = sc.id
      JOIN category_materials c ON sc.category_id = c.id
      JOIN lineitem_materials_variants v ON v.lineitem_id = li.id AND v.is_default = 1
      WHERE li.is_active = 1
        AND v.is_active = 1
      ORDER BY c.name, sc.name, li.name
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) ->
      new CatalogItem(
        rs.getLong("lineitem_id"),
        rs.getLong("variant_id"),
        rs.getString("name"),
        rs.getString("category"),
        rs.getString("subcategory"),
        rs.getString("unit"),
        rs.getString("quality"),
        rs.getBigDecimal("price")
      )
    );
  }
}
