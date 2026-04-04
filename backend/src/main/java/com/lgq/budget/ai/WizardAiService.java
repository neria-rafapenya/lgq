package com.lgq.budget.ai;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lgq.budget.dto.EquipmentSelectionItem;
import com.lgq.budget.dto.EquipmentSelectionResponse;
import com.lgq.budget.dto.ConversationHistoryResponse;
import com.lgq.budget.dto.ConversationMessageResponse;
import com.lgq.budget.dto.MaterialSelectionItem;
import com.lgq.budget.dto.MaterialSelectionResponse;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import com.lgq.budget.repository.CatalogRepository;
import com.lgq.budget.repository.ProjectReadRepository;
import com.lgq.budget.security.Role;
import com.lgq.budget.service.ProjectReadService;
import com.lgq.budget.service.ProjectWriteService;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WizardAiService {
  private final ProjectReadService projectReadService;
  private final ProjectWriteService projectWriteService;
  private final ProjectReadRepository projectReadRepository;
  private final CatalogRepository catalogRepository;
  private final ConversationRepository conversationRepository;
  private final PromptLibrary promptLibrary;
  private final OpenAiClient openAiClient;
  private final ObjectMapper objectMapper;
  private final String model;
  private final String outputFormat;
  private final int maxHistory;
  private final double temperature;

  public WizardAiService(
    ProjectReadService projectReadService,
    ProjectWriteService projectWriteService,
    ProjectReadRepository projectReadRepository,
    CatalogRepository catalogRepository,
    ConversationRepository conversationRepository,
    PromptLibrary promptLibrary,
    OpenAiClient openAiClient,
    ObjectMapper objectMapper,
    @Value("${openai.model:gpt-4.1-mini}") String model,
    @Value("${app.ai.output-format:json_object}") String outputFormat,
    @Value("${app.ai.max-history:16}") int maxHistory,
    @Value("${app.ai.temperature:0.2}") double temperature
  ) {
    this.projectReadService = projectReadService;
    this.projectWriteService = projectWriteService;
    this.projectReadRepository = projectReadRepository;
    this.catalogRepository = catalogRepository;
    this.conversationRepository = conversationRepository;
    this.promptLibrary = promptLibrary;
    this.openAiClient = openAiClient;
    this.objectMapper = objectMapper;
    this.model = model;
    this.outputFormat = outputFormat;
    this.maxHistory = maxHistory;
    this.temperature = temperature;
  }

  public WizardAiResponse handleTurn(long userId, Role role, WizardAiRequest request) {
    if (request.projectId() == null) {
      throw new IllegalArgumentException("projectId is required");
    }
    long projectId = request.projectId();
    boolean isAdmin = role == Role.ADMIN;

    projectReadService.getScope(userId, isAdmin, projectId);

    Long conversationId = request.conversationId();
    if (conversationId != null
      && !conversationRepository.belongsToUserAndProject(conversationId, userId, projectId)) {
      throw new IllegalArgumentException("conversation does not belong to user");
    }
    if (conversationId == null) {
      conversationId = conversationRepository.findLatestByProject(userId, projectId);
      if (conversationId == null) {
        conversationId = conversationRepository.createConversation(userId, projectId, "Proyecto " + projectId);
      }
    }

    String userMessage = request.message() == null ? "" : request.message().trim();
    if (!userMessage.isBlank()) {
      conversationRepository.addMessage(conversationId, userId, "user", userMessage);
    }

    WizardContext context = buildContext(projectId, userMessage);
    List<ConversationMessage> history = conversationRepository.findRecentMessages(conversationId, maxHistory);

    ObjectNode payload = buildPayload(context, history);
    JsonNode response = openAiClient.createResponse(payload);
    String outputText = extractOutputText(response);
    if (outputText == null || outputText.isBlank()) {
      throw new IllegalStateException("OpenAI returned empty output");
    }

    WizardAiPayload aiPayload = parsePayload(outputText);
    String assistantMessage = aiPayload.assistantMessage();
    if (assistantMessage == null || assistantMessage.isBlank()) {
      assistantMessage = "Perfecto. ¿Podemos continuar con otra pregunta?";
    }

    WizardAiUpdates updates = aiPayload.updates();
    applyUpdates(userId, isAdmin, projectId, updates);

    conversationRepository.addMessage(conversationId, userId, "assistant", assistantMessage);

    ProjectScopeRequest scope = projectReadService.getScope(userId, isAdmin, projectId);
    ProjectSpaceStateRequest spaceState = projectReadService.getSpaceState(userId, isAdmin, projectId);
    ProjectInstallationsRequest installations = projectReadService.getInstallations(userId, isAdmin, projectId);

    WizardContext refreshed = buildContext(projectId, userMessage);

    return new WizardAiResponse(
      conversationId,
      assistantMessage,
      scope,
      spaceState,
      installations,
      refreshed.missingFields(),
      aiPayload.nextFocus()
    );
  }

  public ConversationHistoryResponse getConversationHistory(long userId, Role role, long projectId) {
    boolean isAdmin = role == Role.ADMIN;
    projectReadService.getScope(userId, isAdmin, projectId);

    Long conversationId = conversationRepository.findLatestByProject(userId, projectId);
    List<ConversationMessageResponse> messages = conversationId == null
      ? List.of()
      : conversationRepository.findMessages(conversationId);

    WizardContext context = buildContext(projectId, "");
    return new ConversationHistoryResponse(conversationId, messages, context.missingFields());
  }

  private WizardContext buildContext(long projectId, String userMessage) {
    ProjectScopeRequest scope = projectReadRepository.findScopeRaw(projectId);
    ProjectSpaceStateRequest spaceState = projectReadRepository.findSpaceStateRaw(projectId);
    ProjectInstallationsRequest installations = projectReadRepository.findInstallationsRaw(projectId);
    ProjectLaborRequest labor = projectReadRepository.findLabor(projectId);
    ProjectExtrasRequest extras = projectReadRepository.findExtras(projectId);
    ProjectFinancialsRequest financials = projectReadRepository.findFinancials(projectId);
    List<MaterialSelectionResponse> materials = projectReadRepository.findMaterialSelections(projectId);
    List<EquipmentSelectionResponse> equipment = projectReadRepository.findEquipmentSelections(projectId);
    List<CatalogItem> catalogItems = catalogRepository.findActiveDefaultItems();

    ProjectScopeRequest scopeSafe = scope != null
      ? scope
      : new ProjectScopeRequest(null, null, null, null, null, null);
    ProjectSpaceStateRequest spaceSafe = spaceState != null
      ? spaceState
      : new ProjectSpaceStateRequest(null, null, null, null, null, null, null, null);
    ProjectInstallationsRequest installationsSafe = installations != null
      ? installations
      : new ProjectInstallationsRequest(null, null, null, null, null, null, null, null);
    ProjectLaborRequest laborSafe = labor != null
      ? labor
      : new ProjectLaborRequest(null, null, null, null, null, null);
    ProjectExtrasRequest extrasSafe = extras != null
      ? extras
      : new ProjectExtrasRequest(null, null, null, null, null);
    ProjectFinancialsRequest financialsSafe = financials != null
      ? financials
      : new ProjectFinancialsRequest(null, null);

    List<String> missing = new ArrayList<>();
    if (scopeSafe.reformType() == null) {
      missing.add("scope.reformType");
    }
    if (scopeSafe.hasLayoutChanges() == null) {
      missing.add("scope.hasLayoutChanges");
    }
    if (scopeSafe.moveKitchen() == null) {
      missing.add("scope.moveKitchen");
    }
    if (scopeSafe.moveBathroom() == null) {
      missing.add("scope.moveBathroom");
    }
    if (scopeSafe.demolishWalls() == null) {
      missing.add("scope.demolishWalls");
    }
    if (scopeSafe.openSpaces() == null) {
      missing.add("scope.openSpaces");
    }

    if (spaceSafe.areaM2() == null) {
      missing.add("space_state.areaM2");
    }
    if (spaceSafe.heightM() == null) {
      missing.add("space_state.heightM");
    }
    if (spaceSafe.hasDistributionPlan() == null) {
      missing.add("space_state.hasDistributionPlan");
    }
    if (spaceSafe.plumbingStatus() == null) {
      missing.add("space_state.plumbingStatus");
    }
    if (spaceSafe.electricalStatus() == null) {
      missing.add("space_state.electricalStatus");
    }
    if (spaceSafe.drainageStatus() == null) {
      missing.add("space_state.drainageStatus");
    }
    if (spaceSafe.wallType() == null) {
      missing.add("space_state.wallType");
    }
    if (spaceSafe.demolitionRequired() == null) {
      missing.add("space_state.demolitionRequired");
    }

    if (installationsSafe.plumbingRenovation() == null) {
      missing.add("installations.plumbingRenovation");
    }
    if (installationsSafe.electricalRenovation() == null) {
      missing.add("installations.electricalRenovation");
    }
    if (installationsSafe.gasRenovation() == null) {
      missing.add("installations.gasRenovation");
    }
    if (installationsSafe.newWaterPoints() == null) {
      missing.add("installations.newWaterPoints");
    }
    if (installationsSafe.newLightPoints() == null) {
      missing.add("installations.newLightPoints");
    }
    if (installationsSafe.newSocketPoints() == null) {
      missing.add("installations.newSocketPoints");
    }
    if (installationsSafe.heatingType() == null) {
      missing.add("installations.heatingType");
    }
    if (installationsSafe.hasHeatingSystem() == null) {
      missing.add("installations.hasHeatingSystem");
    }

    if (materials == null || materials.isEmpty()) {
      missing.add("budget.materials");
    }
    if (equipment == null || equipment.isEmpty()) {
      missing.add("budget.equipment");
    }
    if (labor == null) {
      missing.add("budget.labor");
    }
    if (extras == null) {
      missing.add("budget.extras");
    }
    if (financials == null) {
      missing.add("budget.financials");
    }

    return new WizardContext(
      scopeSafe,
      spaceSafe,
      installationsSafe,
      laborSafe,
      extrasSafe,
      financialsSafe,
      materials == null ? List.of() : materials,
      equipment == null ? List.of() : equipment,
      catalogItems == null ? List.of() : catalogItems,
      missing,
      userMessage
    );
  }

  private ObjectNode buildPayload(WizardContext context, List<ConversationMessage> history) {
    ObjectNode payload = objectMapper.createObjectNode();
    payload.put("model", model);
    payload.put("temperature", temperature);

    ArrayNode input = objectMapper.createArrayNode();
    input.add(message("system", promptLibrary.getWizardPrompt()));
    input.add(message("system", context.asJson(objectMapper)));

    for (ConversationMessage msg : history) {
      if (msg == null || msg.content() == null || msg.content().isBlank()) {
        continue;
      }
      input.add(message(msg.role(), msg.content()));
    }

    if (history.isEmpty()) {
      input.add(message("user", "Inicia la entrevista con la primera pregunta."));
    }

    payload.set("input", input);

    ObjectNode text = objectMapper.createObjectNode();
    ObjectNode format = objectMapper.createObjectNode();
    if ("json_schema".equalsIgnoreCase(outputFormat)) {
      format.put("type", "json_schema");
      format.put("name", "lgq_wizard_turn");
      format.set("schema", buildSchema());
      format.put("strict", true);
    } else {
      format.put("type", "json_object");
    }
    text.set("format", format);
    payload.set("text", text);

    return payload;
  }

  private ObjectNode message(String role, String content) {
    ObjectNode node = objectMapper.createObjectNode();
    node.put("role", role);
    node.put("content", content);
    return node;
  }

  private ObjectNode buildSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    schema.put("type", "object");
    schema.put("additionalProperties", false);

    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("assistant_message", objectMapper.createObjectNode().put("type", "string"));

    ObjectNode updates = objectMapper.createObjectNode();
    updates.put("type", "object");
    updates.put("additionalProperties", false);
    ObjectNode updatesProps = objectMapper.createObjectNode();
    updatesProps.set("scope", scopeSchema());
    updatesProps.set("space_state", spaceStateSchema());
    updatesProps.set("installations", installationsSchema());
    updatesProps.set("materials", materialSelectionsSchema());
    updatesProps.set("equipment", equipmentSelectionsSchema());
    updatesProps.set("labor", laborSchema());
    updatesProps.set("extras", extrasSchema());
    updatesProps.set("financials", financialsSchema());
    updates.set("properties", updatesProps);

    properties.set("updates", updates);
    ObjectNode nextFocus = objectMapper.createObjectNode();
    ArrayNode focusEnum = objectMapper.createArrayNode();
    focusEnum.add("scope");
    focusEnum.add("space_state");
    focusEnum.add("installations");
    focusEnum.add("catalog");
    focusEnum.add("budget");
    focusEnum.add("summary");
    nextFocus.put("type", "string");
    nextFocus.set("enum", focusEnum);
    properties.set("next_focus", nextFocus);

    schema.set("properties", properties);

    ArrayNode required = objectMapper.createArrayNode();
    required.add("assistant_message");
    required.add("updates");
    required.add("next_focus");
    schema.set("required", required);

    return schema;
  }

  private ObjectNode scopeSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("reformType", enumOrNull("partial", "integral"));
    properties.set("hasLayoutChanges", booleanOrNull());
    properties.set("moveKitchen", booleanOrNull());
    properties.set("moveBathroom", booleanOrNull());
    properties.set("demolishWalls", booleanOrNull());
    properties.set("openSpaces", booleanOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode spaceStateSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("areaM2", numberOrNull());
    properties.set("heightM", numberOrNull());
    properties.set("hasDistributionPlan", booleanOrNull());
    properties.set("plumbingStatus", enumOrNull("good", "regular", "bad"));
    properties.set("electricalStatus", enumOrNull("good", "regular", "bad"));
    properties.set("drainageStatus", enumOrNull("good", "regular", "bad"));
    properties.set("wallType", enumOrNull("pladur", "brick", "load_bearing", "mixed"));
    properties.set("demolitionRequired", booleanOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode installationsSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("plumbingRenovation", enumOrNull("none", "partial", "full"));
    properties.set("electricalRenovation", enumOrNull("none", "partial", "full"));
    properties.set("gasRenovation", enumOrNull("none", "partial", "full"));
    properties.set("newWaterPoints", integerOrNull());
    properties.set("newLightPoints", integerOrNull());
    properties.set("newSocketPoints", integerOrNull());
    properties.set("heatingType", enumOrNull("none", "electric", "gas", "aerothermal"));
    properties.set("hasHeatingSystem", booleanOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode materialSelectionsSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);

    ObjectNode properties = objectMapper.createObjectNode();
    ObjectNode items = objectMapper.createObjectNode();
    ArrayNode itemsType = objectMapper.createArrayNode();
    itemsType.add("array");
    itemsType.add("null");
    items.set("type", itemsType);

    ObjectNode itemSchema = objectMapper.createObjectNode();
    itemSchema.put("type", "object");
    itemSchema.put("additionalProperties", false);
    ObjectNode itemProps = objectMapper.createObjectNode();
    itemProps.set("lineitemId", integerOrNull());
    itemProps.set("variantId", integerOrNull());
    itemProps.set("quantity", numberOrNull());
    itemProps.set("unitPrice", numberOrNull());
    itemProps.set("isSelected", booleanOrNull());
    itemProps.set("isCustom", booleanOrNull());
    itemSchema.set("properties", itemProps);
    items.set("items", itemSchema);

    properties.set("items", items);
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode equipmentSelectionsSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);

    ObjectNode properties = objectMapper.createObjectNode();
    ObjectNode items = objectMapper.createObjectNode();
    ArrayNode itemsType = objectMapper.createArrayNode();
    itemsType.add("array");
    itemsType.add("null");
    items.set("type", itemsType);

    ObjectNode itemSchema = objectMapper.createObjectNode();
    itemSchema.put("type", "object");
    itemSchema.put("additionalProperties", false);
    ObjectNode itemProps = objectMapper.createObjectNode();
    itemProps.set("lineitemId", integerOrNull());
    itemProps.set("variantId", integerOrNull());
    itemProps.set("quantity", integerOrNull());
    itemProps.set("unitPrice", numberOrNull());
    ObjectNode room = objectMapper.createObjectNode();
    ArrayNode roomType = objectMapper.createArrayNode();
    roomType.add("string");
    roomType.add("null");
    room.set("type", roomType);
    ArrayNode roomEnum = objectMapper.createArrayNode();
    roomEnum.add("bathroom");
    roomEnum.add("kitchen");
    roomEnum.add("general");
    roomEnum.addNull();
    room.set("enum", roomEnum);
    itemProps.set("room", room);
    itemProps.set("isSelected", booleanOrNull());
    itemSchema.set("properties", itemProps);
    items.set("items", itemSchema);

    properties.set("items", items);
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode laborSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("masonryHours", numberOrNull());
    properties.set("plumbingHours", numberOrNull());
    properties.set("electricalHours", numberOrNull());
    properties.set("carpentryHours", numberOrNull());
    properties.set("installationHours", numberOrNull());
    properties.set("projectManagementHours", numberOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode extrasSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("debrisRemoval", booleanOrNull());
    properties.set("municipalPermits", booleanOrNull());
    properties.set("dumpsterRequired", booleanOrNull());
    properties.set("protectionRequired", booleanOrNull());
    properties.set("finalCleaning", booleanOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode financialsSchema() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("object");
    type.add("null");
    schema.set("type", type);
    schema.put("additionalProperties", false);
    ObjectNode properties = objectMapper.createObjectNode();
    properties.set("marginPercentage", numberOrNull());
    properties.set("contingencyPercentage", numberOrNull());
    schema.set("properties", properties);
    return schema;
  }

  private ObjectNode enumOrNull(String... values) {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("string");
    type.add("null");
    schema.set("type", type);
    ArrayNode enums = objectMapper.createArrayNode();
    for (String value : values) {
      enums.add(value);
    }
    enums.addNull();
    schema.set("enum", enums);
    return schema;
  }

  private ObjectNode booleanOrNull() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("boolean");
    type.add("null");
    schema.set("type", type);
    return schema;
  }

  private ObjectNode numberOrNull() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("number");
    type.add("null");
    schema.set("type", type);
    return schema;
  }

  private ObjectNode integerOrNull() {
    ObjectNode schema = objectMapper.createObjectNode();
    ArrayNode type = objectMapper.createArrayNode();
    type.add("integer");
    type.add("null");
    schema.set("type", type);
    return schema;
  }

  private String extractOutputText(JsonNode response) {
    if (response == null) {
      return null;
    }
    JsonNode outputText = response.get("output_text");
    if (outputText != null && !outputText.isNull()) {
      return outputText.asText();
    }
    JsonNode output = response.get("output");
    if (output != null && output.isArray()) {
      for (JsonNode item : output) {
        if (item == null) {
          continue;
        }
        JsonNode content = item.get("content");
        if (content != null && content.isArray()) {
          for (JsonNode contentItem : content) {
            JsonNode type = contentItem.get("type");
            if (type != null && Objects.equals(type.asText(), "output_text")) {
              JsonNode text = contentItem.get("text");
              if (text != null) {
                return text.asText();
              }
            }
          }
        }
      }
    }
    return null;
  }

  private WizardAiPayload parsePayload(String outputText) {
    try {
      return objectMapper.readValue(outputText, WizardAiPayload.class);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to parse AI output", ex);
    }
  }

  private void applyUpdates(long userId, boolean isAdmin, long projectId, WizardAiUpdates updates) {
    if (updates == null) {
      return;
    }

    ProjectScopeRequest scopeUpdate = updates.scope();
    if (hasScopeUpdates(scopeUpdate)) {
      ProjectScopeRequest current = projectReadService.getScope(userId, isAdmin, projectId);
      ProjectScopeRequest merged = new ProjectScopeRequest(
        coalesce(scopeUpdate.reformType(), current.reformType()),
        coalesce(scopeUpdate.hasLayoutChanges(), current.hasLayoutChanges()),
        coalesce(scopeUpdate.moveKitchen(), current.moveKitchen()),
        coalesce(scopeUpdate.moveBathroom(), current.moveBathroom()),
        coalesce(scopeUpdate.demolishWalls(), current.demolishWalls()),
        coalesce(scopeUpdate.openSpaces(), current.openSpaces())
      );
      projectWriteService.upsertScope(userId, isAdmin, projectId, merged);
    }

    ProjectSpaceStateRequest spaceUpdate = updates.spaceState();
    if (hasSpaceUpdates(spaceUpdate)) {
      ProjectSpaceStateRequest current = projectReadService.getSpaceState(userId, isAdmin, projectId);
      ProjectSpaceStateRequest merged = new ProjectSpaceStateRequest(
        coalesce(spaceUpdate.areaM2(), current.areaM2()),
        coalesce(spaceUpdate.heightM(), current.heightM()),
        coalesce(spaceUpdate.hasDistributionPlan(), current.hasDistributionPlan()),
        coalesce(spaceUpdate.plumbingStatus(), current.plumbingStatus()),
        coalesce(spaceUpdate.electricalStatus(), current.electricalStatus()),
        coalesce(spaceUpdate.drainageStatus(), current.drainageStatus()),
        coalesce(spaceUpdate.wallType(), current.wallType()),
        coalesce(spaceUpdate.demolitionRequired(), current.demolitionRequired())
      );
      projectWriteService.upsertSpaceState(userId, isAdmin, projectId, merged);
    }

    ProjectInstallationsRequest installationsUpdate = updates.installations();
    if (hasInstallationsUpdates(installationsUpdate)) {
      ProjectInstallationsRequest current = projectReadService.getInstallations(userId, isAdmin, projectId);
      ProjectInstallationsRequest merged = new ProjectInstallationsRequest(
        coalesce(installationsUpdate.plumbingRenovation(), current.plumbingRenovation()),
        coalesce(installationsUpdate.electricalRenovation(), current.electricalRenovation()),
        coalesce(installationsUpdate.gasRenovation(), current.gasRenovation()),
        coalesce(installationsUpdate.newWaterPoints(), current.newWaterPoints()),
        coalesce(installationsUpdate.newLightPoints(), current.newLightPoints()),
        coalesce(installationsUpdate.newSocketPoints(), current.newSocketPoints()),
        coalesce(installationsUpdate.heatingType(), current.heatingType()),
        coalesce(installationsUpdate.hasHeatingSystem(), current.hasHeatingSystem())
      );
      projectWriteService.upsertInstallations(userId, isAdmin, projectId, merged);
    }

    if (updates.materials() != null && updates.materials().items() != null) {
      List<CatalogItem> catalogItems = catalogRepository.findActiveDefaultItems();
      List<MaterialSelectionItem> items = sanitizeMaterialItems(updates.materials().items(), catalogItems);
      projectWriteService.replaceMaterials(
        userId,
        isAdmin,
        projectId,
        new com.lgq.budget.dto.MaterialSelectionsRequest(items)
      );
    }

    if (updates.equipment() != null && updates.equipment().items() != null) {
      List<CatalogItem> catalogItems = catalogRepository.findActiveDefaultItems();
      List<EquipmentSelectionItem> items = sanitizeEquipmentItems(updates.equipment().items(), catalogItems);
      projectWriteService.replaceEquipment(
        userId,
        isAdmin,
        projectId,
        new com.lgq.budget.dto.EquipmentSelectionsRequest(items)
      );
    }

    ProjectLaborRequest laborUpdate = updates.labor();
    if (hasLaborUpdates(laborUpdate)) {
      ProjectLaborRequest current = projectReadRepository.findLabor(projectId);
      ProjectLaborRequest merged = new ProjectLaborRequest(
        coalesce(laborUpdate.masonryHours(), current == null ? null : current.masonryHours()),
        coalesce(laborUpdate.plumbingHours(), current == null ? null : current.plumbingHours()),
        coalesce(laborUpdate.electricalHours(), current == null ? null : current.electricalHours()),
        coalesce(laborUpdate.carpentryHours(), current == null ? null : current.carpentryHours()),
        coalesce(laborUpdate.installationHours(), current == null ? null : current.installationHours()),
        coalesce(laborUpdate.projectManagementHours(), current == null ? null : current.projectManagementHours())
      );
      projectWriteService.upsertLabor(userId, isAdmin, projectId, merged);
    }

    ProjectExtrasRequest extrasUpdate = updates.extras();
    if (hasExtrasUpdates(extrasUpdate)) {
      ProjectExtrasRequest current = projectReadRepository.findExtras(projectId);
      ProjectExtrasRequest merged = new ProjectExtrasRequest(
        coalesce(extrasUpdate.debrisRemoval(), current == null ? null : current.debrisRemoval()),
        coalesce(extrasUpdate.municipalPermits(), current == null ? null : current.municipalPermits()),
        coalesce(extrasUpdate.dumpsterRequired(), current == null ? null : current.dumpsterRequired()),
        coalesce(extrasUpdate.protectionRequired(), current == null ? null : current.protectionRequired()),
        coalesce(extrasUpdate.finalCleaning(), current == null ? null : current.finalCleaning())
      );
      projectWriteService.upsertExtras(userId, isAdmin, projectId, merged);
    }

    ProjectFinancialsRequest financialsUpdate = updates.financials();
    if (hasFinancialsUpdates(financialsUpdate)) {
      ProjectFinancialsRequest current = projectReadRepository.findFinancials(projectId);
      ProjectFinancialsRequest merged = new ProjectFinancialsRequest(
        coalesce(financialsUpdate.marginPercentage(), current == null ? null : current.marginPercentage()),
        coalesce(financialsUpdate.contingencyPercentage(), current == null ? null : current.contingencyPercentage())
      );
      projectWriteService.upsertFinancials(userId, isAdmin, projectId, merged);
    }
  }

  private List<MaterialSelectionItem> sanitizeMaterialItems(
    List<MaterialSelectionItem> items,
    List<CatalogItem> catalogItems
  ) {
    List<MaterialSelectionItem> sanitized = new ArrayList<>();
    if (items == null) {
      return sanitized;
    }
    List<String> allowed = catalogItems == null
      ? List.of()
      : catalogItems.stream()
        .map(item -> item.lineitemId() + ":" + item.variantId())
        .toList();
    for (MaterialSelectionItem item : items) {
      if (item == null) {
        continue;
      }
      if (item.lineitemId() == null || item.variantId() == null || item.quantity() == null) {
        continue;
      }
      if (!allowed.isEmpty() && !allowed.contains(item.lineitemId() + ":" + item.variantId())) {
        continue;
      }
      if (item.quantity().doubleValue() <= 0) {
        continue;
      }
      sanitized.add(item);
    }
    return sanitized;
  }

  private List<EquipmentSelectionItem> sanitizeEquipmentItems(
    List<EquipmentSelectionItem> items,
    List<CatalogItem> catalogItems
  ) {
    List<EquipmentSelectionItem> sanitized = new ArrayList<>();
    if (items == null) {
      return sanitized;
    }
    List<String> allowed = catalogItems == null
      ? List.of()
      : catalogItems.stream()
        .map(item -> item.lineitemId() + ":" + item.variantId())
        .toList();
    for (EquipmentSelectionItem item : items) {
      if (item == null) {
        continue;
      }
      if (item.lineitemId() == null || item.variantId() == null || item.quantity() == null) {
        continue;
      }
      if (!allowed.isEmpty() && !allowed.contains(item.lineitemId() + ":" + item.variantId())) {
        continue;
      }
      if (item.quantity() <= 0) {
        continue;
      }
      String room = item.room() == null || item.room().isBlank() ? "general" : item.room();
      sanitized.add(new EquipmentSelectionItem(
        item.lineitemId(),
        item.variantId(),
        item.quantity(),
        item.unitPrice(),
        room,
        item.isSelected()
      ));
    }
    return sanitized;
  }

  private boolean hasScopeUpdates(ProjectScopeRequest update) {
    if (update == null) {
      return false;
    }
    return update.reformType() != null
      || update.hasLayoutChanges() != null
      || update.moveKitchen() != null
      || update.moveBathroom() != null
      || update.demolishWalls() != null
      || update.openSpaces() != null;
  }

  private boolean hasSpaceUpdates(ProjectSpaceStateRequest update) {
    if (update == null) {
      return false;
    }
    return update.areaM2() != null
      || update.heightM() != null
      || update.hasDistributionPlan() != null
      || update.plumbingStatus() != null
      || update.electricalStatus() != null
      || update.drainageStatus() != null
      || update.wallType() != null
      || update.demolitionRequired() != null;
  }

  private boolean hasInstallationsUpdates(ProjectInstallationsRequest update) {
    if (update == null) {
      return false;
    }
    return update.plumbingRenovation() != null
      || update.electricalRenovation() != null
      || update.gasRenovation() != null
      || update.newWaterPoints() != null
      || update.newLightPoints() != null
      || update.newSocketPoints() != null
      || update.heatingType() != null
      || update.hasHeatingSystem() != null;
  }

  private boolean hasLaborUpdates(ProjectLaborRequest update) {
    if (update == null) {
      return false;
    }
    return update.masonryHours() != null
      || update.plumbingHours() != null
      || update.electricalHours() != null
      || update.carpentryHours() != null
      || update.installationHours() != null
      || update.projectManagementHours() != null;
  }

  private boolean hasExtrasUpdates(ProjectExtrasRequest update) {
    if (update == null) {
      return false;
    }
    return update.debrisRemoval() != null
      || update.municipalPermits() != null
      || update.dumpsterRequired() != null
      || update.protectionRequired() != null
      || update.finalCleaning() != null;
  }

  private boolean hasFinancialsUpdates(ProjectFinancialsRequest update) {
    if (update == null) {
      return false;
    }
    return update.marginPercentage() != null
      || update.contingencyPercentage() != null;
  }

  private <T> T coalesce(T update, T current) {
    if (update == null) {
      return current;
    }
    if (update instanceof String updateString) {
      if (updateString.isBlank()) {
        return current;
      }
    }
    return update;
  }

  private record WizardContext(
    ProjectScopeRequest scope,
    ProjectSpaceStateRequest spaceState,
    ProjectInstallationsRequest installations,
    ProjectLaborRequest labor,
    ProjectExtrasRequest extras,
    ProjectFinancialsRequest financials,
    List<MaterialSelectionResponse> materials,
    List<EquipmentSelectionResponse> equipment,
    List<CatalogItem> catalogItems,
    List<String> missingFields,
    String lastUserMessage
  ) {
    String asJson(ObjectMapper mapper) {
      ObjectNode context = mapper.createObjectNode();
      ObjectNode current = mapper.createObjectNode();
      current.set("scope", mapper.valueToTree(scope));
      current.set("space_state", mapper.valueToTree(spaceState));
      current.set("installations", mapper.valueToTree(installations));
      current.set("labor", mapper.valueToTree(labor));
      current.set("extras", mapper.valueToTree(extras));
      current.set("financials", mapper.valueToTree(financials));
      current.set("materials", mapper.valueToTree(materials));
      current.set("equipment", mapper.valueToTree(equipment));
      context.set("current_state", current);
      context.set("catalog_items", mapper.valueToTree(catalogItems));
      context.set("missing_fields", mapper.valueToTree(missingFields));
      context.put("last_user_message", lastUserMessage == null ? "" : lastUserMessage);
      try {
        return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(context);
      } catch (JsonProcessingException ex) {
        throw new IllegalStateException("Failed to serialize wizard context", ex);
      }
    }
  }
}
