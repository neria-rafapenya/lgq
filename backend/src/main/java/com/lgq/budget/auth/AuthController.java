package com.lgq.budget.auth;

import com.lgq.budget.security.UserPrincipal;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final AuthService authService;
  private final String cookieName;
  private final boolean cookieSecure;
  private final String cookieSameSite;
  private final long expirationMinutes;

  public AuthController(
    AuthService authService,
    @Value("${security.jwt.cookie-name}") String cookieName,
    @Value("${security.jwt.cookie-secure}") boolean cookieSecure,
    @Value("${security.jwt.cookie-same-site:Lax}") String cookieSameSite,
    @Value("${security.jwt.expiration-minutes}") long expirationMinutes
  ) {
    this.authService = authService;
    this.cookieName = cookieName;
    this.cookieSecure = cookieSecure;
    this.cookieSameSite = cookieSameSite;
    this.expirationMinutes = expirationMinutes;
  }

  @PostMapping("/register")
  public AuthResponse register(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
    AuthSession session = authService.register(request);
    addAuthCookie(response, session.token());
    return session.user();
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody AuthRequest request, HttpServletResponse response) {
    AuthSession session = authService.login(request);
    addAuthCookie(response, session.token());
    return session.user();
  }

  @PostMapping("/logout")
  public void logout(HttpServletResponse response) {
    ResponseCookie cookie = ResponseCookie.from(cookieName, "")
      .httpOnly(true)
      .secure(cookieSecure)
      .path("/")
      .maxAge(Duration.ZERO)
      .sameSite(cookieSameSite)
      .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
  }

  @GetMapping("/me")
  public AuthResponse me(@AuthenticationPrincipal UserPrincipal principal) {
    if (principal == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    return authService.me(principal);
  }

  @PutMapping("/profile")
  public AuthResponse updateProfile(
    @AuthenticationPrincipal UserPrincipal principal,
    @RequestBody ProfileUpdateRequest request
  ) {
    if (principal == null) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
    }
    return authService.updateProfile(principal, request);
  }

  private void addAuthCookie(HttpServletResponse response, String token) {
    ResponseCookie cookie = ResponseCookie.from(cookieName, token)
      .httpOnly(true)
      .secure(cookieSecure)
      .path("/")
      .maxAge(Duration.ofMinutes(expirationMinutes))
      .sameSite(cookieSameSite)
      .build();
    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
  }
}
