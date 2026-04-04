package com.lgq.budget.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.Objects;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiCopyService {
  private final OpenAiClient openAiClient;
  private final ObjectMapper objectMapper;
  private final String model;
  private final double temperature;

  public AiCopyService(
    OpenAiClient openAiClient,
    ObjectMapper objectMapper,
    @Value("${openai.model:gpt-4.1-mini}") String model,
    @Value("${app.ai.copy-temperature:0.3}") double temperature
  ) {
    this.openAiClient = openAiClient;
    this.objectMapper = objectMapper;
    this.model = model;
    this.temperature = temperature;
  }

  public String rewrite(String prompt) {
    if (prompt == null || prompt.isBlank()) {
      return "";
    }
    ObjectNode payload = objectMapper.createObjectNode();
    payload.put("model", model);
    payload.put("temperature", temperature);

    ArrayNode input = objectMapper.createArrayNode();
    input.add(message("system",
      "Reescribe el texto en español de forma natural y cercana. " +
        "Mantén una sola pregunta si la hay, no añadas información extra. " +
        "No cambies nombres propios, cifras, unidades ni el orden de los elementos."));
    input.add(message("user", prompt.trim()));
    payload.set("input", input);

    JsonNode response = openAiClient.createResponse(payload);
    String output = extractOutputText(response);
    return output == null ? "" : output.trim();
  }

  private ObjectNode message(String role, String content) {
    ObjectNode node = objectMapper.createObjectNode();
    node.put("role", role);
    node.put("content", content);
    return node;
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
}
