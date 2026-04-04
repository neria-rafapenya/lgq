package com.lgq.budget.lgq.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lgq.budget.lgq.dto.LgqActionResponse;
import com.lgq.budget.lgq.dto.LgqBudgetResponse;
import com.lgq.budget.lgq.dto.LgqCatalogLine;
import com.lgq.budget.lgq.dto.LgqCatalogResponse;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionRequest;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionResponse;
import com.lgq.budget.lgq.dto.LgqCatalogSummary;
import com.lgq.budget.lgq.dto.LgqLaborLine;
import com.lgq.budget.lgq.dto.LgqProjectBaseRequest;
import com.lgq.budget.lgq.dto.LgqProjectBaseResponse;
import com.lgq.budget.lgq.dto.LgqSubactOption;
import com.lgq.budget.lgq.dto.LgqSubactResponse;
import com.lgq.budget.lgq.dto.LgqTaskLine;
import com.lgq.budget.lgq.repository.LgqActionRepository;
import com.lgq.budget.lgq.repository.LgqCatalogRepository;
import com.lgq.budget.lgq.repository.LgqProjectRepository;
import com.lgq.budget.lgq.repository.LgqSubactRepository;
import com.lgq.budget.lgq.repository.LgqSubactRepository.SubactRow;
import com.lgq.budget.repository.BudgetRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class LgqEngineService {
  private static final BigDecimal IVA_RATE = new BigDecimal("0.21");

  private final LgqCatalogRepository catalogRepository;
  private final LgqActionRepository actionRepository;
  private final LgqProjectRepository projectRepository;
  private final LgqSubactRepository subactRepository;
  private final BudgetRepository budgetRepository;
  private final ObjectMapper objectMapper;

  public LgqEngineService(
    LgqCatalogRepository catalogRepository,
    LgqActionRepository actionRepository,
    LgqProjectRepository projectRepository,
    LgqSubactRepository subactRepository,
    BudgetRepository budgetRepository,
    ObjectMapper objectMapper
  ) {
    this.catalogRepository = catalogRepository;
    this.actionRepository = actionRepository;
    this.projectRepository = projectRepository;
    this.subactRepository = subactRepository;
    this.budgetRepository = budgetRepository;
    this.objectMapper = objectMapper;
  }

  public List<LgqCatalogSummary> listCatalogs() {
    return catalogRepository.findCatalogs();
  }

  public LgqCatalogResponse getCatalog(String code) {
    return catalogRepository.findCatalogByCode(code);
  }

  public List<LgqActionResponse> listActions() {
    return actionRepository.findActiveActions();
  }

  public List<LgqSubactResponse> listSubacts(String actionCode) {
    List<SubactRow> rows = subactRepository.findByActionCode(actionCode);
    return rows.stream().map(this::toSubactResponse).toList();
  }

  public LgqProjectBaseResponse getBase(long projectId, long userId, boolean isAdmin) {
    ensureProjectAccess(projectId, userId, isAdmin);
    return projectRepository.findBase(projectId);
  }

  public void upsertBase(long projectId, long userId, boolean isAdmin, LgqProjectBaseRequest request) {
    ensureProjectAccess(projectId, userId, isAdmin);
    projectRepository.upsertBase(projectId, request);
  }

  public void replaceActions(long projectId, long userId, boolean isAdmin, List<Long> actionIds) {
    ensureProjectAccess(projectId, userId, isAdmin);
    List<Long> sanitized = actionIds;
    if (sanitized != null && sanitized.size() > 1) {
      sanitized = List.of(sanitized.get(0));
    }
    projectRepository.replaceActionSelections(projectId, sanitized);
  }

  public void replaceCatalogSelections(
    long projectId,
    long userId,
    boolean isAdmin,
    List<LgqCatalogSelectionRequest> selections
  ) {
    ensureProjectAccess(projectId, userId, isAdmin);
    projectRepository.replaceCatalogSelections(projectId, selections);
  }

  public List<LgqCatalogSelectionResponse> getCatalogSelections(long projectId, long userId, boolean isAdmin) {
    ensureProjectAccess(projectId, userId, isAdmin);
    return projectRepository.findCatalogSelections(projectId);
  }

  public LgqBudgetResponse calculate(long projectId, long userId, boolean isAdmin) {
    ensureProjectAccess(projectId, userId, isAdmin);

    LgqProjectBaseResponse base = projectRepository.findBase(projectId);
    List<Long> actionSelections = projectRepository.findActionSelections(projectId);
    if ((actionSelections == null || actionSelections.isEmpty()) && base != null && base.actionId() != null) {
      actionSelections = List.of(base.actionId());
    }
    if (actionSelections != null && actionSelections.size() == 1) {
      Long actionId = actionSelections.get(0);
      String actionCode = actionRepository.findActionCode(actionId);
      if ("integral".equalsIgnoreCase(actionCode)) {
        actionSelections = actionRepository.findActiveActionIds();
      }
    }

    JsonNode answers = base != null ? base.answers() : null;
    List<String> selectedSubacts = readSelectedSubacts(answers);

    List<LgqActionRepository.LgqActionTaskRow> tasks = actionRepository.findTasksByActionIds(actionSelections);
    if (shouldFilterBySubact(actionSelections, selectedSubacts)) {
      tasks = tasks.stream()
        .filter(task -> task.subactKey() != null && selectedSubacts.contains(task.subactKey()))
        .toList();
    }
    List<Long> taskIds = tasks.stream().map(LgqActionRepository.LgqActionTaskRow::id).toList();
    List<LgqActionRepository.LgqTaskRuleRow> rules = actionRepository.findTaskRules(taskIds);

    Map<Long, List<LgqActionRepository.LgqTaskRuleRow>> rulesByTask = new HashMap<>();
    for (LgqActionRepository.LgqTaskRuleRow rule : rules) {
      rulesByTask.computeIfAbsent(rule.taskId(), key -> new ArrayList<>()).add(rule);
    }

    Map<String, BigDecimal> rates = new HashMap<>();
    projectRepository.findRates().forEach(rate -> rates.put(rate.role(), rate.hourlyRate()));

    List<LgqTaskLine> taskLines = new ArrayList<>();
    Map<String, LgqLaborLine> laborMap = new HashMap<>();

    for (LgqActionRepository.LgqActionTaskRow task : tasks) {
      BigDecimal quantity = resolveQuantity(task, answers);
      BigDecimal hours = task.baseRateHours().multiply(quantity);

      List<LgqActionRepository.LgqTaskRuleRow> taskRules = rulesByTask.getOrDefault(task.id(), List.of());
      for (LgqActionRepository.LgqTaskRuleRow rule : taskRules) {
        if (matchesRule(rule, answers)) {
          hours = hours.multiply(rule.multiplier());
        }
      }

      BigDecimal hourlyRate = rates.getOrDefault(task.role(), BigDecimal.ZERO);
      BigDecimal amount = hours.multiply(hourlyRate);

      taskLines.add(new LgqTaskLine(
        task.id(),
        task.name(),
        task.unit(),
        quantity,
        hours,
        task.role(),
        hourlyRate,
        amount
      ));

      LgqLaborLine current = laborMap.get(task.role());
      if (current == null) {
        laborMap.put(task.role(), new LgqLaborLine(task.role(), hours, hourlyRate, amount));
      } else {
        BigDecimal newHours = current.hours().add(hours);
        BigDecimal newAmount = current.amount().add(amount);
        laborMap.put(task.role(), new LgqLaborLine(task.role(), newHours, hourlyRate, newAmount));
      }
    }

    List<LgqLaborLine> laborLines = new ArrayList<>(laborMap.values());
    List<LgqCatalogLine> catalogLines = projectRepository.findCatalogLines(projectId);

    BigDecimal catalogTotal = catalogLines.stream()
      .map(LgqCatalogLine::amount)
      .reduce(BigDecimal.ZERO, BigDecimal::add);
    BigDecimal laborTotal = laborLines.stream()
      .map(LgqLaborLine::amount)
      .reduce(BigDecimal.ZERO, BigDecimal::add);

    BigDecimal subtotal = catalogTotal.add(laborTotal);
    BigDecimal ivaAmount = subtotal.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
    BigDecimal total = subtotal.add(ivaAmount).setScale(2, RoundingMode.HALF_UP);

    projectRepository.replaceTaskLines(projectId, taskLines);
    projectRepository.replaceLaborLines(projectId, laborLines);
    projectRepository.upsertBudget(projectId, subtotal, IVA_RATE.multiply(new BigDecimal("100")), ivaAmount, total);

    return new LgqBudgetResponse(
      projectId,
      subtotal,
      IVA_RATE.multiply(new BigDecimal("100")),
      ivaAmount,
      total,
      catalogLines,
      taskLines,
      laborLines
    );
  }

  private LgqSubactResponse toSubactResponse(SubactRow row) {
    List<LgqSubactOption> options = List.of();
    if (row.optionsJson() != null && !row.optionsJson().isBlank()) {
      try {
        options = objectMapper.readValue(
          row.optionsJson(),
          new TypeReference<List<LgqSubactOption>>() {}
        );
      } catch (Exception ex) {
        options = List.of();
      }
    }
    return new LgqSubactResponse(
      row.id(),
      row.key(),
      row.label(),
      row.helper(),
      row.type(),
      row.catalogCode(),
      options,
      row.sortOrder()
    );
  }

  private BigDecimal resolveQuantity(LgqActionRepository.LgqActionTaskRow task, JsonNode answers) {
    if (task.quantityKey() != null) {
      BigDecimal fromKey = numberFromAnswers(answers, task.quantityKey());
      return normalizeQuantity(fromKey);
    }

    String unit = task.unit() == null ? "" : task.unit().toLowerCase(Locale.ROOT);
    if (unit.equals("m2")) {
      BigDecimal area = numberFromAnswers(answers, "area_m2");
      return normalizeQuantity(area);
    }
    if (unit.equals("ml")) {
      BigDecimal length = numberFromAnswers(answers, "length_ml");
      return normalizeQuantity(length);
    }
    if (unit.equals("unit")) {
      BigDecimal units = numberFromAnswers(answers, "units");
      return normalizeQuantity(units);
    }
    return BigDecimal.ZERO;
  }

  private BigDecimal normalizeQuantity(BigDecimal value) {
    if (value == null) {
      return BigDecimal.ZERO;
    }
    if (value.compareTo(BigDecimal.ZERO) < 0) {
      return BigDecimal.ZERO;
    }
    return value;
  }

  private List<String> readSelectedSubacts(JsonNode answers) {
    if (answers == null || answers.isNull()) {
      return List.of();
    }
    JsonNode node = answers.get("selectedSubacts");
    if (node == null || node.isNull() || !node.isArray()) {
      return List.of();
    }
    try {
      return objectMapper.convertValue(node, new TypeReference<List<String>>() {});
    } catch (IllegalArgumentException ex) {
      return List.of();
    }
  }

  private boolean shouldFilterBySubact(List<Long> actionSelections, List<String> selectedSubacts) {
    if (selectedSubacts == null || selectedSubacts.isEmpty()) {
      return false;
    }
    if (actionSelections == null || actionSelections.isEmpty()) {
      return false;
    }
    if (actionSelections.size() != 1) {
      return false;
    }
    String actionCode = actionRepository.findActionCode(actionSelections.get(0));
    return actionCode != null && !"integral".equalsIgnoreCase(actionCode);
  }

  private boolean matchesRule(LgqActionRepository.LgqTaskRuleRow rule, JsonNode answers) {
    if (answers == null || rule.factorKey() == null || rule.factorValue() == null) {
      return false;
    }
    JsonNode node = answers.get(rule.factorKey());
    if (node == null || node.isNull()) {
      JsonNode nested = answers.path("factors").get(rule.factorKey());
      node = nested == null || nested.isMissingNode() ? null : nested;
    }
    if (node == null || node.isNull()) {
      return false;
    }
    String value = node.isTextual() ? node.asText() : node.toString();
    String normalized = value.replace("\"", "").toLowerCase(Locale.ROOT);
    if (normalized.equals("true")) {
      normalized = "yes";
    }
    if (normalized.equals("false")) {
      normalized = "no";
    }
    return rule.factorValue().equalsIgnoreCase(normalized);
  }

  private BigDecimal numberFromAnswers(JsonNode answers, String key) {
    if (answers == null || key == null) {
      return null;
    }
    JsonNode node = answers.get(key);
    if (node == null || node.isNull()) {
      JsonNode nested = answers.path("quantities").get(key);
      node = nested == null || nested.isMissingNode() ? null : nested;
    }
    if (node == null || node.isNull()) {
      return null;
    }
    if (node.isNumber()) {
      return node.decimalValue();
    }
    if (node.isBoolean()) {
      return node.asBoolean() ? BigDecimal.ONE : BigDecimal.ZERO;
    }
    if (node.isTextual()) {
      String raw = node.asText().trim().toLowerCase(Locale.ROOT);
      if (raw.equals("yes") || raw.equals("si") || raw.equals("sí")) {
        return BigDecimal.ONE;
      }
      if (raw.equals("no")) {
        return BigDecimal.ZERO;
      }
      raw = raw.replace(",", ".");
      try {
        return new BigDecimal(raw);
      } catch (NumberFormatException ex) {
        return null;
      }
    }
    return null;
  }

  private void ensureProjectAccess(long projectId, long userId, boolean isAdmin) {
    if (!budgetRepository.existsProject(projectId, userId, isAdmin)) {
      throw new IllegalArgumentException("Proyecto no encontrado");
    }
  }
}
