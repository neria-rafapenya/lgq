package com.lgq.budget.ai;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Component;

/**
 * Carrega i combina els prompts utilitzats pel LLM.
 */
@Component
public class PromptLibrary {
  private final ResourceLoader resourceLoader;
  private final String promptLocation;
  private String wizardPrompt;

  /**
   * Crea el catàleg de prompts amb la ubicació base configurada.
   *
   * @param resourceLoader carregador de recursos de Spring
   * @param promptLocation ruta del prompt principal
   */
  public PromptLibrary(ResourceLoader resourceLoader, @Value("${app.ai.prompt-file:classpath:prompts/wizard.md}") String promptLocation) {
    this.resourceLoader = resourceLoader;
    this.promptLocation = promptLocation;
    this.wizardPrompt = "";
  }

  /**
   * Retorna el prompt combinat per al wizard, carregant-lo si cal.
   *
   * @return prompt complet en format text
   */
  public String getWizardPrompt() {
    if (wizardPrompt.isBlank()) {
      wizardPrompt = loadPromptWithOptionalExtras(promptLocation);
    }
    return wizardPrompt;
  }

  /**
   * Carrega el prompt principal i afegeix els blocs opcionals.
   *
   * @param location ubicació del prompt principal
   * @return text combinat
   */
  private String loadPromptWithOptionalExtras(String location) {
    StringBuilder merged = new StringBuilder(loadPrompt(location));
    String tree = loadOptionalPrompt("classpath:prompts/wizard_tree.md");
    if (!tree.isBlank()) {
      merged.append("\n\n").append(tree);
    }
    String labor = loadOptionalPrompt("classpath:prompts/wizard_labor_estimates.md");
    if (!labor.isBlank()) {
      merged.append("\n\n").append(labor);
    }
    String lgqTree = loadOptionalPrompt("classpath:prompts/lgq_engine_tree.md");
    if (!lgqTree.isBlank()) {
      merged.append("\n\n").append(lgqTree);
    }
    String lgqMap = loadOptionalPrompt("classpath:prompts/lgq_engine_mapping.md");
    if (!lgqMap.isBlank()) {
      merged.append("\n\n").append(lgqMap);
    }
    return merged.toString().trim();
  }

  /**
   * Llegeix el prompt principal des d'una ubicació concreta.
   *
   * @param location ubicació del recurs
   * @return text del prompt
   */
  private String loadPrompt(String location) {
    Resource resource = resourceLoader.getResource(location);
    try {
      return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
    } catch (IOException ex) {
      throw new IllegalStateException("Failed to load prompt from " + location, ex);
    }
  }

  /**
   * Carrega un prompt opcional si existeix; si no, retorna cadena buida.
   *
   * @param location ubicació del recurs opcional
   * @return text del prompt o cadena buida
   */
  private String loadOptionalPrompt(String location) {
    Resource resource = resourceLoader.getResource(location);
    if (!resource.exists()) {
      return "";
    }
    try {
      return new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8).trim();
    } catch (IOException ex) {
      return "";
    }
  }
}
