package com.lgq.budget.auth;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lgq.budget.audit.UserHistoryRepository;
import com.lgq.budget.security.JwtService;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final ObjectMapper objectMapper;
  private final UserHistoryRepository userHistoryRepository;

  public AuthService(
    UserRepository userRepository,
    PasswordEncoder passwordEncoder,
    JwtService jwtService,
    ObjectMapper objectMapper,
    UserHistoryRepository userHistoryRepository
  ) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.objectMapper = objectMapper;
    this.userHistoryRepository = userHistoryRepository;
  }

  public AuthSession register(AuthRequest request) {
    String email = normalizeEmail(request.email());
    UserRepository.UserRecord existing = userRepository.findByEmail(email);
    if (existing != null) {
      throw new IllegalArgumentException("Email already exists");
    }

    String hash = passwordEncoder.encode(request.password());
    Role role = Role.USER;
    long userId = userRepository.createUser(email, hash, role);
    userHistoryRepository.recordSnapshot(userId, toJson(new UserSnapshot(email, role.name().toLowerCase())));

    String token = jwtService.generateToken(userId, email, role);
    return new AuthSession(new AuthResponse(userId, email, null, role.name().toLowerCase()), token);
  }

  public AuthSession login(AuthRequest request) {
    String email = normalizeEmail(request.email());
    UserRepository.UserRecord user = userRepository.findByEmail(email);
    if (user == null || !passwordEncoder.matches(request.password(), user.passwordHash())) {
      throw new IllegalArgumentException("Invalid credentials");
    }
    userRepository.updateLastLogin(user.id());
    String token = jwtService.generateToken(user.id(), user.email(), user.role());
    return new AuthSession(new AuthResponse(user.id(), user.email(), user.name(), user.role().name().toLowerCase()), token);
  }

  public AuthResponse me(UserPrincipal principal) {
    UserRepository.UserRecord user = userRepository.findById(principal.getId());
    if (user == null) {
      return new AuthResponse(principal.getId(), principal.getUsername(), null, principal.getRole().name().toLowerCase());
    }
    return new AuthResponse(user.id(), user.email(), user.name(), user.role().name().toLowerCase());
  }

  public AuthResponse updateProfile(UserPrincipal principal, ProfileUpdateRequest request) {
    String name = request == null ? null : normalizeName(request.name());
    userRepository.updateName(principal.getId(), name);
    UserRepository.UserRecord user = userRepository.findById(principal.getId());
    if (user == null) {
      return new AuthResponse(principal.getId(), principal.getUsername(), name, principal.getRole().name().toLowerCase());
    }
    return new AuthResponse(user.id(), user.email(), user.name(), user.role().name().toLowerCase());
  }

  private String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }

  private String normalizeName(String name) {
    if (name == null) return null;
    String trimmed = name.trim();
    return trimmed.isBlank() ? null : trimmed;
  }

  private String toJson(Object payload) {
    try {
      return objectMapper.writeValueAsString(payload);
    } catch (JsonProcessingException ex) {
      throw new IllegalStateException("Failed to serialize payload", ex);
    }
  }

  private record UserSnapshot(String email, String role) {
  }
}
