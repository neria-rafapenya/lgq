package com.lgq.budget.lgq.controller;

import com.lgq.budget.lgq.dto.LgqCatalogItemUpsertRequest;
import com.lgq.budget.lgq.dto.LgqCatalogVariantUpsertRequest;
import com.lgq.budget.lgq.dto.LgqIdResponse;
import com.lgq.budget.lgq.service.LgqCatalogAdminService;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/lgq/admin")
public class LgqCatalogAdminController {
  private final LgqCatalogAdminService catalogAdminService;

  public LgqCatalogAdminController(LgqCatalogAdminService catalogAdminService) {
    this.catalogAdminService = catalogAdminService;
  }

  @PostMapping("/catalogs/{code}/items")
  public LgqIdResponse createItem(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable String code,
    @RequestBody LgqCatalogItemUpsertRequest request
  ) {
    requireAdmin(principal);
    long id = catalogAdminService.createItem(code, request);
    return new LgqIdResponse(id);
  }

  @PutMapping("/items/{itemId}")
  public void updateItem(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long itemId,
    @RequestBody LgqCatalogItemUpsertRequest request
  ) {
    requireAdmin(principal);
    catalogAdminService.updateItem(itemId, request);
  }

  @DeleteMapping("/items/{itemId}")
  public void deleteItem(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long itemId
  ) {
    requireAdmin(principal);
    catalogAdminService.deleteItem(itemId);
  }

  @PostMapping("/items/{itemId}/variants")
  public LgqIdResponse createVariant(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long itemId,
    @RequestBody LgqCatalogVariantUpsertRequest request
  ) {
    requireAdmin(principal);
    long id = catalogAdminService.createVariant(itemId, request);
    return new LgqIdResponse(id);
  }

  @PutMapping("/variants/{variantId}")
  public void updateVariant(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long variantId,
    @RequestBody LgqCatalogVariantUpsertRequest request
  ) {
    requireAdmin(principal);
    catalogAdminService.updateVariant(variantId, request);
  }

  @DeleteMapping("/variants/{variantId}")
  public void deleteVariant(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long variantId
  ) {
    requireAdmin(principal);
    catalogAdminService.deleteVariant(variantId);
  }

  private void requireAdmin(UserPrincipal principal) {
    if (principal == null || principal.getRole() != Role.ADMIN) {
      throw new ResponseStatusException(HttpStatus.FORBIDDEN, "admin_only");
    }
  }
}
