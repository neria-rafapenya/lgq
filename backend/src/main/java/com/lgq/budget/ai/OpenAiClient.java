package com.lgq.budget.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OpenAiClient {
  private static final URI RESPONSES_URI = URI.create("https://api.openai.com/v1/responses");

  private final HttpClient httpClient = HttpClient.newHttpClient();
  private final ObjectMapper objectMapper;
  private final String apiKey;

  public OpenAiClient(ObjectMapper objectMapper, @Value("${openai.api-key:}") String apiKey) {
    this.objectMapper = objectMapper;
    this.apiKey = apiKey == null ? "" : apiKey.trim();
  }

  public JsonNode createResponse(ObjectNode payload) {
    if (apiKey.isBlank()) {
      throw new IllegalStateException("OPENAI_API_KEY is missing");
    }

    HttpRequest request = HttpRequest.newBuilder(RESPONSES_URI)
      .header("Authorization", "Bearer " + apiKey)
      .header("Content-Type", "application/json")
      .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
      .build();

    try {
      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
      if (response.statusCode() < 200 || response.statusCode() >= 300) {
        throw new IllegalStateException("OpenAI error: " + response.statusCode() + " -> " + response.body());
      }
      return objectMapper.readTree(response.body());
    } catch (InterruptedException ex) {
      Thread.currentThread().interrupt();
      throw new IllegalStateException("OpenAI request interrupted", ex);
    } catch (IOException ex) {
      throw new IllegalStateException("OpenAI request failed", ex);
    }
  }
}
