package com.lgq.budget.ai;

import com.lgq.budget.dto.ConversationMessageResponse;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Collections;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class ConversationRepository {
  private final JdbcTemplate jdbcTemplate;

  public ConversationRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public long createConversation(long userId, long projectId, String title) {
    String sql = "INSERT INTO conversations (user_id, project_id, title) VALUES (?, ?, ?)";
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
      ps.setLong(1, userId);
      ps.setLong(2, projectId);
      ps.setString(3, title);
      return ps;
    }, keyHolder);
    Number key = keyHolder.getKey();
    if (key == null) {
      throw new IllegalStateException("Failed to create conversation");
    }
    return key.longValue();
  }

  public void addMessage(long conversationId, long userId, String role, String content) {
    String sql = "INSERT INTO conversation_messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)";
    jdbcTemplate.update(sql, conversationId, userId, role, content);
  }

  public boolean belongsToUser(long conversationId, long userId) {
    String sql = "SELECT COUNT(*) FROM conversations WHERE id = ? AND user_id = ?";
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, conversationId, userId);
    return count != null && count > 0;
  }

  public boolean belongsToUserAndProject(long conversationId, long userId, long projectId) {
    String sql = "SELECT COUNT(*) FROM conversations WHERE id = ? AND user_id = ? AND project_id = ?";
    Integer count = jdbcTemplate.queryForObject(sql, Integer.class, conversationId, userId, projectId);
    return count != null && count > 0;
  }

  public Long findLatestByProject(long userId, long projectId) {
    String sql = """
      SELECT id
      FROM conversations
      WHERE user_id = ? AND project_id = ?
      ORDER BY id DESC
      LIMIT 1
      """;
    List<Long> ids = jdbcTemplate.query(sql, (rs, rowNum) -> rs.getLong("id"), userId, projectId);
    return ids.isEmpty() ? null : ids.get(0);
  }

  public List<ConversationMessageResponse> findMessages(long conversationId) {
    String sql = """
      SELECT id, role, content
      FROM conversation_messages
      WHERE conversation_id = ?
      ORDER BY id ASC
      """;
    return jdbcTemplate.query(
      sql,
      (rs, rowNum) -> new ConversationMessageResponse(
        rs.getLong("id"),
        rs.getString("role"),
        rs.getString("content")
      ),
      conversationId
    );
  }

  public List<ConversationMessage> findRecentMessages(long conversationId, int limit) {
    String sql = """
      SELECT role, content
      FROM conversation_messages
      WHERE conversation_id = ?
      ORDER BY id DESC
      LIMIT ?
      """;
    List<ConversationMessage> messages = jdbcTemplate.query(sql, (rs, rowNum) ->
      new ConversationMessage(rs.getString("role"), rs.getString("content")),
      conversationId,
      limit
    );
    Collections.reverse(messages);
    return messages;
  }
}
