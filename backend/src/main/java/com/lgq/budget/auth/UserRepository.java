package com.lgq.budget.auth;

import com.lgq.budget.security.Role;
import java.sql.PreparedStatement;
import java.sql.Statement;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
  private final JdbcTemplate jdbcTemplate;

  public UserRepository(JdbcTemplate jdbcTemplate) {
    this.jdbcTemplate = jdbcTemplate;
  }

  public UserRecord findByEmail(String email) {
    String sql = """
      SELECT id, email, name, password_hash, role
      FROM users
      WHERE email = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new UserRecord(
          rs.getLong("id"),
          rs.getString("email"),
          rs.getString("name"),
          rs.getString("password_hash"),
          Role.fromDb(rs.getString("role"))
        ),
        email
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public UserRecord findById(long id) {
    String sql = """
      SELECT id, email, name, password_hash, role
      FROM users
      WHERE id = ?
      """;
    try {
      return jdbcTemplate.queryForObject(sql, (rs, rowNum) ->
        new UserRecord(
          rs.getLong("id"),
          rs.getString("email"),
          rs.getString("name"),
          rs.getString("password_hash"),
          Role.fromDb(rs.getString("role"))
        ),
        id
      );
    } catch (EmptyResultDataAccessException ex) {
      return null;
    }
  }

  public long createUser(String email, String passwordHash, Role role) {
    KeyHolder keyHolder = new GeneratedKeyHolder();
    jdbcTemplate.update(connection -> {
      PreparedStatement ps = connection.prepareStatement(
        "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
        Statement.RETURN_GENERATED_KEYS
      );
      ps.setString(1, email);
      ps.setString(2, passwordHash);
      ps.setString(3, role.name().toLowerCase());
      return ps;
    }, keyHolder);

    if (keyHolder.getKey() == null) {
      throw new IllegalStateException("No se pudo crear el usuario");
    }
    return keyHolder.getKey().longValue();
  }

  public void updateLastLogin(long userId) {
    jdbcTemplate.update("UPDATE users SET last_login_at = current_timestamp() WHERE id = ?", userId);
  }

  public void updateName(long userId, String name) {
    jdbcTemplate.update("UPDATE users SET name = ? WHERE id = ?", name, userId);
  }

  public record UserRecord(long id, String email, String name, String passwordHash, Role role) {
  }
}
