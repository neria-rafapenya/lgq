package com.lgq.budget.seed;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class SeedRunner implements ApplicationRunner {
  private static final Logger logger = LoggerFactory.getLogger(SeedRunner.class);
  private static final Pattern INSERT_PATTERN = Pattern.compile(
    "INSERT\\s+INTO\\s+`?([a-zA-Z0-9_]+)`?\\s*\\(([^)]+)\\)\\s*VALUES",
    Pattern.CASE_INSENSITIVE | Pattern.DOTALL
  );

  private final JdbcTemplate jdbcTemplate;
  private final boolean enabled;
  private final String filePath;
  private final Set<String> allowedTables;

  public SeedRunner(
    JdbcTemplate jdbcTemplate,
    @Value("${app.seed.enabled:true}") boolean enabled,
    @Value("${app.seed.file:../data/lgq.sql}") String filePath,
    @Value("${app.seed.tables:category_materials,subcategory_materials,lineitem_materials,lineitem_materials_variants}")
    String allowedTables
  ) {
    this.jdbcTemplate = jdbcTemplate;
    this.enabled = enabled;
    this.filePath = filePath;
    this.allowedTables = new HashSet<>();
    Arrays.stream(allowedTables.split(","))
      .map(String::trim)
      .filter(value -> !value.isEmpty())
      .forEach(value -> this.allowedTables.add(value.toLowerCase(Locale.ROOT)));
  }

  @Override
  public void run(ApplicationArguments args) {
    if (!enabled) {
      logger.info("Seed disabled.");
      return;
    }

    Path path = Path.of(filePath);
    if (!Files.exists(path)) {
      logger.warn("Seed file not found: {}", path.toAbsolutePath());
      return;
    }

    try {
      String content = Files.readString(path);
      List<String> statements = splitStatements(content);
      int executed = 0;
      for (String statement : statements) {
        String trimmed = statement.trim();
        if (trimmed.isEmpty()) {
          continue;
        }
        if (trimmed.startsWith("--") || trimmed.startsWith("/*") || trimmed.startsWith("SET ")) {
          continue;
        }
        String upsert = toUpsertIfAllowed(trimmed);
        if (upsert == null) {
          continue;
        }
        jdbcTemplate.execute(upsert);
        executed++;
      }
      logger.info("Seed applied. Statements executed: {}", executed);
    } catch (IOException ex) {
      logger.error("Failed to read seed file", ex);
    }
  }

  private String toUpsertIfAllowed(String statement) {
    Matcher matcher = INSERT_PATTERN.matcher(statement);
    if (!matcher.find()) {
      return null;
    }
    String table = matcher.group(1).toLowerCase(Locale.ROOT);
    if (!allowedTables.contains(table)) {
      return null;
    }
    String columnsRaw = matcher.group(2);
    List<String> columns = parseColumns(columnsRaw);
    List<String> updateColumns = new ArrayList<>();
    for (String column : columns) {
      if ("id".equalsIgnoreCase(column)) {
        continue;
      }
      updateColumns.add("`" + column + "`=VALUES(`" + column + "`)");
    }
    if (updateColumns.isEmpty()) {
      return statement;
    }
    return statement + " ON DUPLICATE KEY UPDATE " + String.join(", ", updateColumns);
  }

  private List<String> parseColumns(String raw) {
    String[] parts = raw.split(",");
    List<String> columns = new ArrayList<>();
    for (String part : parts) {
      String cleaned = part.replace("`", "").trim();
      if (!cleaned.isEmpty()) {
        columns.add(cleaned);
      }
    }
    return columns;
  }

  private List<String> splitStatements(String content) {
    List<String> statements = new ArrayList<>();
    StringBuilder current = new StringBuilder();
    boolean inString = false;

    for (int i = 0; i < content.length(); i++) {
      char ch = content.charAt(i);
      if (ch == '\'' && (i == 0 || content.charAt(i - 1) != '\\')) {
        inString = !inString;
      }
      if (ch == ';' && !inString) {
        statements.add(current.toString());
        current.setLength(0);
      } else {
        current.append(ch);
      }
    }

    if (current.length() > 0) {
      statements.add(current.toString());
    }
    return statements;
  }
}
