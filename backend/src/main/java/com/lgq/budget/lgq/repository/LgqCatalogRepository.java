package com.lgq.budget.lgq.repository;

import com.lgq.budget.lgq.dto.LgqCatalogItemResponse;
import com.lgq.budget.lgq.dto.LgqCatalogResponse;
import com.lgq.budget.lgq.dto.LgqCatalogSummary;
import com.lgq.budget.lgq.dto.LgqCatalogVariantResponse;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class LgqCatalogRepository {
  private final JdbcTemplate jdbcTemplate;

  public LgqCatalogRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public List<LgqCatalogSummary> findCatalogs() {
    String sql = """
      SELECT id, code, name
      FROM lgq_catalogs
      ORDER BY code
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) -> new LgqCatalogSummary(
      rs.getLong("id"),
      rs.getString("code"),
      rs.getString("name")
    ));
  }

  public LgqCatalogResponse findCatalogByCode(String code) {
    String catalogSql = """
      SELECT id, code, name
      FROM lgq_catalogs
      WHERE code = ?
      """;
    List<LgqCatalogSummary> summaries = jdbcTemplate.query(catalogSql, (rs, rowNum) -> new LgqCatalogSummary(
      rs.getLong("id"),
      rs.getString("code"),
      rs.getString("name")
    ), code);
    if (summaries.isEmpty()) {
      return null;
    }
    LgqCatalogSummary summary = summaries.get(0);

    String itemSql = """
      SELECT
        i.id AS item_id,
        i.code AS item_code,
        i.name AS item_name,
        i.unit AS item_unit,
        i.description AS item_description,
        i.image_url AS item_image,
        v.id AS variant_id,
        v.name AS variant_name,
        v.material AS variant_material,
        v.quality AS variant_quality,
        v.image_url AS variant_image,
        v.size_x_cm AS variant_size_x,
        v.size_y_cm AS variant_size_y,
        v.size_z_cm AS variant_size_z,
        v.price AS variant_price,
        v.is_default AS variant_default
      FROM lgq_catalog_items i
      LEFT JOIN lgq_catalog_variants v
        ON v.item_id = i.id AND v.is_active = 1
      WHERE i.catalog_id = ? AND i.is_active = 1
      ORDER BY i.id, v.is_default DESC, v.id
      """;

    List<ItemRow> rows = jdbcTemplate.query(itemSql, new ItemRowMapper(), summary.id());
    Map<Long, ItemBuilder> grouped = new LinkedHashMap<>();
    for (ItemRow row : rows) {
      ItemBuilder builder = grouped.computeIfAbsent(row.itemId, id -> new ItemBuilder(row));
      if (row.variantId != null) {
        builder.variants.add(new LgqCatalogVariantResponse(
          row.variantId,
          row.variantName,
          row.variantMaterial,
          row.variantQuality,
          row.variantImage,
          row.variantSizeX,
          row.variantSizeY,
          row.variantSizeZ,
          row.variantPrice,
          row.variantDefault
        ));
      }
    }

    List<LgqCatalogItemResponse> items = grouped.values().stream()
      .map(ItemBuilder::build)
      .toList();

    return new LgqCatalogResponse(summary.id(), summary.code(), summary.name(), items);
  }

  private static class ItemRow {
    private final long itemId;
    private final String itemCode;
    private final String itemName;
    private final String itemUnit;
    private final String itemDescription;
    private final String itemImage;
    private final Long variantId;
    private final String variantName;
    private final String variantMaterial;
    private final String variantQuality;
    private final String variantImage;
    private final BigDecimal variantSizeX;
    private final BigDecimal variantSizeY;
    private final BigDecimal variantSizeZ;
    private final BigDecimal variantPrice;
    private final boolean variantDefault;

    private ItemRow(
      long itemId,
      String itemCode,
      String itemName,
      String itemUnit,
      String itemDescription,
      String itemImage,
      Long variantId,
      String variantName,
      String variantMaterial,
      String variantQuality,
      String variantImage,
      BigDecimal variantSizeX,
      BigDecimal variantSizeY,
      BigDecimal variantSizeZ,
      BigDecimal variantPrice,
      boolean variantDefault
    ) {
      this.itemId = itemId;
      this.itemCode = itemCode;
      this.itemName = itemName;
      this.itemUnit = itemUnit;
      this.itemDescription = itemDescription;
      this.itemImage = itemImage;
      this.variantId = variantId;
      this.variantName = variantName;
      this.variantMaterial = variantMaterial;
      this.variantQuality = variantQuality;
      this.variantImage = variantImage;
      this.variantSizeX = variantSizeX;
      this.variantSizeY = variantSizeY;
      this.variantSizeZ = variantSizeZ;
      this.variantPrice = variantPrice;
      this.variantDefault = variantDefault;
    }
  }

  private static class ItemRowMapper implements RowMapper<ItemRow> {
    @Override
    public ItemRow mapRow(ResultSet rs, int rowNum) throws SQLException {
      Long variantId = rs.getObject("variant_id") == null ? null : rs.getLong("variant_id");
      return new ItemRow(
        rs.getLong("item_id"),
        rs.getString("item_code"),
        rs.getString("item_name"),
        rs.getString("item_unit"),
        rs.getString("item_description"),
        rs.getString("item_image"),
        variantId,
        rs.getString("variant_name"),
        rs.getString("variant_material"),
        rs.getString("variant_quality"),
        rs.getString("variant_image"),
        rs.getBigDecimal("variant_size_x"),
        rs.getBigDecimal("variant_size_y"),
        rs.getBigDecimal("variant_size_z"),
        rs.getBigDecimal("variant_price"),
        rs.getBoolean("variant_default")
      );
    }
  }

  private static class ItemBuilder {
    private final long itemId;
    private final String itemCode;
    private final String itemName;
    private final String itemUnit;
    private final String itemDescription;
    private final String itemImage;
    private final List<LgqCatalogVariantResponse> variants = new ArrayList<>();

    private ItemBuilder(ItemRow row) {
      this.itemId = row.itemId;
      this.itemCode = row.itemCode;
      this.itemName = row.itemName;
      this.itemUnit = row.itemUnit;
      this.itemDescription = row.itemDescription;
      this.itemImage = row.itemImage;
    }

    private LgqCatalogItemResponse build() {
      return new LgqCatalogItemResponse(
        itemId,
        itemCode,
        itemName,
        itemUnit,
        itemDescription,
        itemImage,
        variants
      );
    }
  }
}
