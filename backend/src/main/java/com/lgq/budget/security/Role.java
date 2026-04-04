package com.lgq.budget.security;

public enum Role {
  ADMIN,
  PROFESSIONAL,
  USER;

  public String asAuthority() {
    return "ROLE_" + name();
  }

  public static Role fromDb(String value) {
    if (value == null) {
      return USER;
    }
    return Role.valueOf(value.toUpperCase());
  }
}
