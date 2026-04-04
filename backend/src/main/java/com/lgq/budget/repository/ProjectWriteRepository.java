package com.lgq.budget.repository;

import com.lgq.budget.dto.EquipmentSelectionItem;
import com.lgq.budget.dto.MaterialSelectionItem;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ProjectWriteRepository {
  private final JdbcTemplate jdbcTemplate;

  public ProjectWriteRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public long createProject(long userId, String name) {
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(
        "INSERT INTO projects (name, user_id) VALUES (?, ?)",
        Statement.RETURN_GENERATED_KEYS
      );
      ps.setString(1, name);
      ps.setLong(2, userId);
      return ps;
    }, keyHolder);
    if (keyHolder.getKey() == null) {
      throw new IllegalStateException("No se pudo generar el id del proyecto");
    }
    long projectId = keyHolder.getKey().longValue();
    ensureSpaceStateId(projectId);
    return projectId;
  }

  public void replaceMaterialSelections(long projectId, List<MaterialSelectionItem> items) {
    jdbcTemplate.update("DELETE FROM project_material_selections WHERE project_id = ?", projectId);
    if (items == null || items.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO project_material_selections
        (project_id, lineitem_id, variant_id, quantity, unit_price, is_selected, is_custom)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """;
    for (MaterialSelectionItem item : items) {
      jdbcTemplate.update(sql,
        projectId,
        item.lineitemId(),
        item.variantId(),
        item.quantity(),
        item.unitPrice(),
        toTinyInt(item.isSelected(), true),
        toTinyInt(item.isCustom(), false)
      );
    }
  }

  public void replaceEquipmentSelections(long projectId, List<EquipmentSelectionItem> items) {
    jdbcTemplate.update("DELETE FROM project_equipment_selections WHERE project_id = ?", projectId);
    if (items == null || items.isEmpty()) {
      return;
    }
    String sql = """
      INSERT INTO project_equipment_selections
        (project_id, lineitem_id, variant_id, quantity, unit_price, room, is_selected)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      """;
    for (EquipmentSelectionItem item : items) {
      jdbcTemplate.update(sql,
        projectId,
        item.lineitemId(),
        item.variantId(),
        item.quantity(),
        item.unitPrice(),
        item.room(),
        toTinyInt(item.isSelected(), true)
      );
    }
  }

  public void upsertLabor(long projectId, ProjectLaborRequest request) {
    String updateSql = """
      UPDATE project_labor
      SET masonry_hours = ?,
          plumbing_hours = ?,
          electrical_hours = ?,
          carpentry_hours = ?,
          installation_hours = ?,
          project_management_hours = ?
      WHERE project_id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      defaultZero(request.masonryHours()),
      defaultZero(request.plumbingHours()),
      defaultZero(request.electricalHours()),
      defaultZero(request.carpentryHours()),
      defaultZero(request.installationHours()),
      defaultZero(request.projectManagementHours()),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_labor
          (project_id, masonry_hours, plumbing_hours, electrical_hours, carpentry_hours, installation_hours, project_management_hours)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        defaultZero(request.masonryHours()),
        defaultZero(request.plumbingHours()),
        defaultZero(request.electricalHours()),
        defaultZero(request.carpentryHours()),
        defaultZero(request.installationHours()),
        defaultZero(request.projectManagementHours())
      );
    }
  }

  public void upsertExtras(long projectId, ProjectExtrasRequest request) {
    String updateSql = """
      UPDATE project_extras
      SET debris_removal = ?,
          municipal_permits = ?,
          dumpster_required = ?,
          protection_required = ?,
          final_cleaning = ?
      WHERE project_id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      toTinyInt(request.debrisRemoval(), false),
      toTinyInt(request.municipalPermits(), false),
      toTinyInt(request.dumpsterRequired(), false),
      toTinyInt(request.protectionRequired(), false),
      toTinyInt(request.finalCleaning(), false),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_extras
          (project_id, debris_removal, municipal_permits, dumpster_required, protection_required, final_cleaning)
        VALUES (?, ?, ?, ?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        toTinyInt(request.debrisRemoval(), false),
        toTinyInt(request.municipalPermits(), false),
        toTinyInt(request.dumpsterRequired(), false),
        toTinyInt(request.protectionRequired(), false),
        toTinyInt(request.finalCleaning(), false)
      );
    }
  }

  public void upsertFinancials(long projectId, ProjectFinancialsRequest request) {
    String updateSql = """
      UPDATE project_financials
      SET margin_percentage = ?,
          contingency_percentage = ?
      WHERE project_id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      defaultZero(request.marginPercentage()),
      defaultZero(request.contingencyPercentage()),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_financials
          (project_id, margin_percentage, contingency_percentage)
        VALUES (?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        defaultZero(request.marginPercentage()),
        defaultZero(request.contingencyPercentage())
      );
    }
  }

  public void upsertScope(long projectId, ProjectScopeRequest request) {
    ensureSpaceStateId(projectId);
    String updateSql = """
      UPDATE project_scope
      SET reform_type = ?,
          has_layout_changes = ?,
          move_kitchen = ?,
          move_bathroom = ?,
          demolish_walls = ?,
          open_spaces = ?
      WHERE project_id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      defaultString(request.reformType(), "partial"),
      toTinyInt(request.hasLayoutChanges(), false),
      toTinyInt(request.moveKitchen(), false),
      toTinyInt(request.moveBathroom(), false),
      toTinyInt(request.demolishWalls(), false),
      toTinyInt(request.openSpaces(), false),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_scope
          (project_id, reform_type, has_layout_changes, move_kitchen, move_bathroom, demolish_walls, open_spaces)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        defaultString(request.reformType(), "partial"),
        toTinyInt(request.hasLayoutChanges(), false),
        toTinyInt(request.moveKitchen(), false),
        toTinyInt(request.moveBathroom(), false),
        toTinyInt(request.demolishWalls(), false),
        toTinyInt(request.openSpaces(), false)
      );
    }
  }

  public void upsertSpaceState(long projectId, ProjectSpaceStateRequest request) {
    ensureSpaceStateId(projectId);
    String updateSql = """
      UPDATE project_space_state
      SET area_m2 = ?,
          height_m = ?,
          has_distribution_plan = ?,
          plumbing_status = ?,
          electrical_status = ?,
          drainage_status = ?,
          wall_type = ?,
          demolition_required = ?
      WHERE id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      request.areaM2(),
      request.heightM(),
      toTinyInt(request.hasDistributionPlan(), false),
      request.plumbingStatus(),
      request.electricalStatus(),
      request.drainageStatus(),
      request.wallType(),
      toTinyInt(request.demolitionRequired(), false),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_space_state
          (id, project_id, area_m2, height_m, has_distribution_plan, plumbing_status, electrical_status, drainage_status, wall_type, demolition_required)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        projectId,
        request.areaM2(),
        request.heightM(),
        toTinyInt(request.hasDistributionPlan(), false),
        request.plumbingStatus(),
        request.electricalStatus(),
        request.drainageStatus(),
        request.wallType(),
        toTinyInt(request.demolitionRequired(), false)
      );
    }
  }

  public void upsertInstallations(long projectId, ProjectInstallationsRequest request) {
    String updateSql = """
      UPDATE project_installations
      SET plumbing_renovation = ?,
          electrical_renovation = ?,
          gas_renovation = ?,
          new_water_points = ?,
          new_light_points = ?,
          new_socket_points = ?,
          heating_type = ?,
          has_heating_system = ?
      WHERE project_id = ?
      """;
    int updated = jdbcTemplate.update(updateSql,
      defaultString(request.plumbingRenovation(), "none"),
      defaultString(request.electricalRenovation(), "none"),
      defaultString(request.gasRenovation(), "none"),
      defaultInt(request.newWaterPoints(), 0),
      defaultInt(request.newLightPoints(), 0),
      defaultInt(request.newSocketPoints(), 0),
      defaultString(request.heatingType(), "none"),
      toTinyInt(request.hasHeatingSystem(), false),
      projectId
    );
    if (updated == 0) {
      String insertSql = """
        INSERT INTO project_installations
          (project_id, plumbing_renovation, electrical_renovation, gas_renovation, new_water_points, new_light_points, new_socket_points, heating_type, has_heating_system)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
      jdbcTemplate.update(insertSql,
        projectId,
        defaultString(request.plumbingRenovation(), "none"),
        defaultString(request.electricalRenovation(), "none"),
        defaultString(request.gasRenovation(), "none"),
        defaultInt(request.newWaterPoints(), 0),
        defaultInt(request.newLightPoints(), 0),
        defaultInt(request.newSocketPoints(), 0),
        defaultString(request.heatingType(), "none"),
        toTinyInt(request.hasHeatingSystem(), false)
      );
    }
  }

  private void ensureSpaceStateId(long projectId) {
    Integer count = jdbcTemplate.queryForObject(
      "SELECT COUNT(*) FROM project_space_state WHERE id = ?",
      Integer.class,
      projectId
    );
    if (count == null || count == 0) {
      jdbcTemplate.update(
        "INSERT INTO project_space_state (id, project_id) VALUES (?, ?)",
        projectId,
        projectId
      );
    }
  }

  private int toTinyInt(Boolean value, boolean defaultValue) {
    boolean resolved = value != null ? value : defaultValue;
    return resolved ? 1 : 0;
  }

  private BigDecimal defaultZero(BigDecimal value) {
    return value != null ? value : BigDecimal.ZERO;
  }

  private String defaultString(String value, String defaultValue) {
    return value != null ? value : defaultValue;
  }

  private Integer defaultInt(Integer value, Integer defaultValue) {
    return value != null ? value : defaultValue;
  }
}
