package com.lgq.budget.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class JwtService {
  private final SecretKey secretKey;
  private final long expirationMinutes;

  public JwtService(
    @Value("${security.jwt.secret}") String secret,
    @Value("${security.jwt.expiration-minutes}") long expirationMinutes
  ) {
    if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
      throw new IllegalStateException("JWT secret must be at least 32 bytes. Set JWT_SECRET in .env or environment.");
    }
    this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    this.expirationMinutes = expirationMinutes;
  }

  public String generateToken(long userId, String email, Role role) {
    Instant now = Instant.now();
    Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

    return Jwts.builder()
      .setSubject(email)
      .claim("userId", userId)
      .claim("role", role.name().toLowerCase())
      .setIssuedAt(Date.from(now))
      .setExpiration(Date.from(expiresAt))
      .signWith(secretKey, SignatureAlgorithm.HS256)
      .compact();
  }

  public Jws<Claims> parseToken(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(secretKey)
      .build()
      .parseClaimsJws(token);
  }

  public boolean isTokenValid(String token) {
    try {
      parseToken(token);
      return true;
    } catch (Exception ex) {
      return false;
    }
  }

  public long getUserId(String token) {
    Claims claims = parseToken(token).getBody();
    Object value = claims.get("userId");
    if (value instanceof Integer) {
      return ((Integer) value).longValue();
    }
    if (value instanceof Long) {
      return (Long) value;
    }
    return Long.parseLong(String.valueOf(value));
  }

  public Role getRole(String token) {
    Claims claims = parseToken(token).getBody();
    return Role.fromDb(String.valueOf(claims.get("role")));
  }

  public String getEmail(String token) {
    return parseToken(token).getBody().getSubject();
  }
}
