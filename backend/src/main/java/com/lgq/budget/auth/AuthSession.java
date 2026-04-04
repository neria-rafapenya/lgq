package com.lgq.budget.auth;

public record AuthSession(AuthResponse user, String token) {
}
