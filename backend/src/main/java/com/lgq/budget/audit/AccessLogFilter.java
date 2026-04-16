package com.lgq.budget.audit;

import com.lgq.budget.security.UserPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AccessLogFilter extends OncePerRequestFilter {
  private static final Logger LOGGER = LoggerFactory.getLogger(AccessLogFilter.class);

  private final AccessLogRepository accessLogRepository;

  public AccessLogFilter(AccessLogRepository accessLogRepository) {
    this.accessLogRepository = accessLogRepository;
  }

  @Override
  protected void doFilterInternal(
    HttpServletRequest request,
    HttpServletResponse response,
    FilterChain filterChain
  ) throws ServletException, IOException {
    filterChain.doFilter(request, response);

    if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
      return;
    }

    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    Long userId = null;
    if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal principal) {
      userId = principal.getId();
    }

    try {
      accessLogRepository.insert(
        userId,
        request.getMethod(),
        request.getRequestURI(),
        request.getRemoteAddr(),
        request.getHeader("User-Agent")
      );
    } catch (RuntimeException ex) {
      LOGGER.warn("Failed to persist access log for {} {}", request.getMethod(), request.getRequestURI(), ex);
    }
  }
}
