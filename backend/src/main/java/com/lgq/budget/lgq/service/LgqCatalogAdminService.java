package com.lgq.budget.lgq.service;

import com.lgq.budget.lgq.dto.LgqCatalogItemUpsertRequest;
import com.lgq.budget.lgq.dto.LgqCatalogVariantUpsertRequest;
import com.lgq.budget.lgq.repository.LgqCatalogAdminRepository;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class LgqCatalogAdminService {
  private final LgqCatalogAdminRepository repository;

  public LgqCatalogAdminService(LgqCatalogAdminRepository repository) {
    this.repository = repository;
  }

  public long createItem(String catalogCode, LgqCatalogItemUpsertRequest request) {
    long catalogId = repository.findCatalogIdByCode(catalogCode)
      .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catalog not found"));
    return repository.insertItem(catalogId, request);
  }

  public void updateItem(long itemId, LgqCatalogItemUpsertRequest request) {
    repository.updateItem(itemId, request);
  }

  public void deleteItem(long itemId) {
    repository.deleteItem(itemId);
  }

  public long createVariant(long itemId, LgqCatalogVariantUpsertRequest request) {
    if (Boolean.TRUE.equals(request.isDefault())) {
      repository.clearDefaultVariant(itemId);
    }
    return repository.insertVariant(itemId, request);
  }

  public void updateVariant(long variantId, LgqCatalogVariantUpsertRequest request) {
    Optional<Long> itemId = repository.findVariantItemId(variantId);
    if (itemId.isEmpty()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Variant not found");
    }
    if (Boolean.TRUE.equals(request.isDefault())) {
      repository.clearDefaultVariant(itemId.get());
    }
    repository.updateVariant(variantId, request);
  }

  public void deleteVariant(long variantId) {
    repository.deleteVariant(variantId);
  }
}
