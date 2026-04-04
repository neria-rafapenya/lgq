package com.lgq.budget.repository;

import com.lgq.budget.dto.EquipmentSelectionResponse;
import com.lgq.budget.dto.MaterialSelectionResponse;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import java.util.List;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ProjectReadRepository {
  private final JdbcTemplate jdbcTemplate;

  public ProjectReadRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public ProjectScopeRequest findScope(long projectId) {
    String sql = """
      SELECT reform_type,
             has_layout_changes,
             move_kitchen,
             move_bathroom,
             demolish_walls,
             open_spaces
      FROM project_scope
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectScopeRequest(
          rs.getString("reform_type"),
          toBooleanDefault(rs.getObject("has_layout_changes", Integer.class), false),
          toBooleanDefault(rs.getObject("move_kitchen", Integer.class), false),
          toBooleanDefault(rs.getObject("move_bathroom", Integer.class), false),
          toBooleanDefault(rs.getObject("demolish_walls", Integer.class), false),
          toBooleanDefault(rs.getObject("open_spaces", Integer.class), false)
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectSpaceStateRequest findSpaceState(long projectId) {
    String sql = """
      SELECT area_m2,
             height_m,
             has_distribution_plan,
             plumbing_status,
             electrical_status,
             drainage_status,
             wall_type,
             demolition_required
      FROM project_space_state
      WHERE id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectSpaceStateRequest(
          rs.getBigDecimal("area_m2"),
          rs.getBigDecimal("height_m"),
          toBooleanDefault(rs.getObject("has_distribution_plan", Integer.class), false),
          rs.getString("plumbing_status"),
          rs.getString("electrical_status"),
          rs.getString("drainage_status"),
          rs.getString("wall_type"),
          toBooleanDefault(rs.getObject("demolition_required", Integer.class), false)
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectInstallationsRequest findInstallations(long projectId) {
    String sql = """
      SELECT plumbing_renovation,
             electrical_renovation,
             gas_renovation,
             new_water_points,
             new_light_points,
             new_socket_points,
             heating_type,
             has_heating_system
      FROM project_installations
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectInstallationsRequest(
          rs.getString("plumbing_renovation"),
          rs.getString("electrical_renovation"),
          rs.getString("gas_renovation"),
          rs.getObject("new_water_points", Integer.class),
          rs.getObject("new_light_points", Integer.class),
          rs.getObject("new_socket_points", Integer.class),
          rs.getString("heating_type"),
          toBooleanDefault(rs.getObject("has_heating_system", Integer.class), false)
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectScopeRequest findScopeRaw(long projectId) {
    String sql = """
      SELECT reform_type,
             has_layout_changes,
             move_kitchen,
             move_bathroom,
             demolish_walls,
             open_spaces
      FROM project_scope
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectScopeRequest(
          rs.getString("reform_type"),
          toNullableBoolean(rs.getObject("has_layout_changes", Integer.class)),
          toNullableBoolean(rs.getObject("move_kitchen", Integer.class)),
          toNullableBoolean(rs.getObject("move_bathroom", Integer.class)),
          toNullableBoolean(rs.getObject("demolish_walls", Integer.class)),
          toNullableBoolean(rs.getObject("open_spaces", Integer.class))
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectSpaceStateRequest findSpaceStateRaw(long projectId) {
    String sql = """
      SELECT area_m2,
             height_m,
             has_distribution_plan,
             plumbing_status,
             electrical_status,
             drainage_status,
             wall_type,
             demolition_required
      FROM project_space_state
      WHERE id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectSpaceStateRequest(
          rs.getBigDecimal("area_m2"),
          rs.getBigDecimal("height_m"),
          toNullableBoolean(rs.getObject("has_distribution_plan", Integer.class)),
          rs.getString("plumbing_status"),
          rs.getString("electrical_status"),
          rs.getString("drainage_status"),
          rs.getString("wall_type"),
          toNullableBoolean(rs.getObject("demolition_required", Integer.class))
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectInstallationsRequest findInstallationsRaw(long projectId) {
    String sql = """
      SELECT plumbing_renovation,
             electrical_renovation,
             gas_renovation,
             new_water_points,
             new_light_points,
             new_socket_points,
             heating_type,
             has_heating_system
      FROM project_installations
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectInstallationsRequest(
          rs.getString("plumbing_renovation"),
          rs.getString("electrical_renovation"),
          rs.getString("gas_renovation"),
          rs.getObject("new_water_points", Integer.class),
          rs.getObject("new_light_points", Integer.class),
          rs.getObject("new_socket_points", Integer.class),
          rs.getString("heating_type"),
          toNullableBoolean(rs.getObject("has_heating_system", Integer.class))
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectLaborRequest findLabor(long projectId) {
    String sql = """
      SELECT masonry_hours,
             plumbing_hours,
             electrical_hours,
             carpentry_hours,
             installation_hours,
             project_management_hours
      FROM project_labor
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectLaborRequest(
          rs.getBigDecimal("masonry_hours"),
          rs.getBigDecimal("plumbing_hours"),
          rs.getBigDecimal("electrical_hours"),
          rs.getBigDecimal("carpentry_hours"),
          rs.getBigDecimal("installation_hours"),
          rs.getBigDecimal("project_management_hours")
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectExtrasRequest findExtras(long projectId) {
    String sql = """
      SELECT debris_removal,
             municipal_permits,
             dumpster_required,
             protection_required,
             final_cleaning
      FROM project_extras
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectExtrasRequest(
          toBooleanDefault(rs.getObject("debris_removal", Integer.class), false),
          toBooleanDefault(rs.getObject("municipal_permits", Integer.class), false),
          toBooleanDefault(rs.getObject("dumpster_required", Integer.class), false),
          toBooleanDefault(rs.getObject("protection_required", Integer.class), false),
          toBooleanDefault(rs.getObject("final_cleaning", Integer.class), false)
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public ProjectFinancialsRequest findFinancials(long projectId) {
    String sql = """
      SELECT margin_percentage,
             contingency_percentage
      FROM project_financials
      WHERE project_id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new ProjectFinancialsRequest(
          rs.getBigDecimal("margin_percentage"),
          rs.getBigDecimal("contingency_percentage")
        ),
        projectId
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public List<MaterialSelectionResponse> findMaterialSelections(long projectId) {
    String sql = """
      SELECT id,
             lineitem_id,
             variant_id,
             quantity,
             unit_price,
             is_selected,
             is_custom
      FROM project_material_selections
      WHERE project_id = ?
      ORDER BY id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) ->
      new MaterialSelectionResponse(
        rs.getLong("id"),
        rs.getLong("lineitem_id"),
        rs.getLong("variant_id"),
        rs.getBigDecimal("quantity"),
        rs.getBigDecimal("unit_price"),
        toBooleanDefault(rs.getObject("is_selected", Integer.class), false),
        toBooleanDefault(rs.getObject("is_custom", Integer.class), false)
      ),
      projectId
    );
  }

  public List<EquipmentSelectionResponse> findEquipmentSelections(long projectId) {
    String sql = """
      SELECT id,
             lineitem_id,
             variant_id,
             quantity,
             unit_price,
             room,
             is_selected
      FROM project_equipment_selections
      WHERE project_id = ?
      ORDER BY id
      """;
    return jdbcTemplate.query(sql, (rs, rowNum) ->
      new EquipmentSelectionResponse(
        rs.getLong("id"),
        rs.getLong("lineitem_id"),
        rs.getLong("variant_id"),
        rs.getInt("quantity"),
        rs.getBigDecimal("unit_price"),
        rs.getString("room"),
        toBooleanDefault(rs.getObject("is_selected", Integer.class), false)
      ),
      projectId
    );
  }

  private boolean toBooleanDefault(Integer value, boolean defaultValue) {
    if (value == null) {
      return defaultValue;
    }
    return value != 0;
  }

  private Boolean toNullableBoolean(Integer value) {
    if (value == null) {
      return null;
    }
    return value != 0;
  }
}
