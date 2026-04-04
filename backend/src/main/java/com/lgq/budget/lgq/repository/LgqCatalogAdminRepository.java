package com.lgq.budget.lgq.repository;

import com.lgq.budget.lgq.dto.LgqCatalogItemUpsertRequest;
import com.lgq.budget.lgq.dto.LgqCatalogVariantUpsertRequest;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class LgqCatalogAdminRepository {
  private final JdbcTemplate jdbcTemplate;

  public LgqCatalogAdminRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public Optional<Long> findCatalogIdByCode(String code) {
    String sql = "SELECT id FROM lgq_catalogs WHERE code = ?";
    return jdbcTemplate.query(sql, rs -> rs.next() ? Optional.of(rs.getLong("id")) : Optional.empty(), code);
  }

  public long insertItem(long catalogId, LgqCatalogItemUpsertRequest request) {
    String sql =
      "INSERT INTO lgq_catalog_items (catalog_id, code, name, unit, description, image_url, is_active) "
        + "VALUES (?, ?, ?, ?, ?, ?, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
      ps.setLong(1, catalogId);
      ps.setString(2, request.code());
      ps.setString(3, request.name());
      ps.setString(4, request.unit());
      ps.setString(5, request.description());
      ps.setString(6, request.imageUrl());
      ps.setBoolean(7, request.isActive() == null || request.isActive());
      return ps;
    }, keyHolder);
    return keyHolder.getKey().longValue();
  }

  public void updateItem(long itemId, LgqCatalogItemUpsertRequest request) {
    String sql =
      "UPDATE lgq_catalog_items SET code = ?, name = ?, unit = ?, description = ?, image_url = ?, is_active = ? "
        + "WHERE id = ?";
    jdbcTemplate.update(
      sql,
      request.code(),
      request.name(),
      request.unit(),
      request.description(),
      request.imageUrl(),
      request.isActive() == null || request.isActive(),
      itemId
    );
  }

  public void deleteItem(long itemId) {
    jdbcTemplate.update("DELETE FROM lgq_catalog_items WHERE id = ?", itemId);
  }

  public long insertVariant(long itemId, LgqCatalogVariantUpsertRequest request) {
    String sql =
      "INSERT INTO lgq_catalog_variants (item_id, name, material, quality, image_url, size_x_cm, size_y_cm, size_z_cm, price, is_default, is_active) "
        + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
      ps.setLong(1, itemId);
      ps.setString(2, request.name());
      ps.setString(3, request.material());
      ps.setString(4, request.quality());
      ps.setString(5, request.imageUrl());
      ps.setBigDecimal(6, request.sizeXcm());
      ps.setBigDecimal(7, request.sizeYcm());
      ps.setBigDecimal(8, request.sizeZcm());
      ps.setBigDecimal(9, request.price());
      ps.setBoolean(10, Boolean.TRUE.equals(request.isDefault()));
      ps.setBoolean(11, request.isActive() == null || request.isActive());
      return ps;
    }, keyHolder);
    return keyHolder.getKey().longValue();
  }

  public void updateVariant(long variantId, LgqCatalogVariantUpsertRequest request) {
    String sql =
      "UPDATE lgq_catalog_variants SET name = ?, material = ?, quality = ?, image_url = ?, size_x_cm = ?, size_y_cm = ?, size_z_cm = ?, price = ?, is_default = ?, is_active = ? "
        + "WHERE id = ?";
    jdbcTemplate.update(
      sql,
      request.name(),
      request.material(),
      request.quality(),
      request.imageUrl(),
      request.sizeXcm(),
      request.sizeYcm(),
      request.sizeZcm(),
      request.price(),
      Boolean.TRUE.equals(request.isDefault()),
      request.isActive() == null || request.isActive(),
      variantId
    );
  }

  public void deleteVariant(long variantId) {
    jdbcTemplate.update("DELETE FROM lgq_catalog_variants WHERE id = ?", variantId);
  }

  public Optional<Long> findVariantItemId(long variantId) {
    String sql = "SELECT item_id FROM lgq_catalog_variants WHERE id = ?";
    return jdbcTemplate.query(sql, rs -> rs.next() ? Optional.of(rs.getLong("item_id")) : Optional.empty(), variantId);
  }

  public void clearDefaultVariant(long itemId) {
    jdbcTemplate.update("UPDATE lgq_catalog_variants SET is_default = 0 WHERE item_id = ?", itemId);
  }
}
