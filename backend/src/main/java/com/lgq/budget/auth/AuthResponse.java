package com.lgq.budget.auth;

public record AuthResponse(long id, String email, String name, String role) {
}
