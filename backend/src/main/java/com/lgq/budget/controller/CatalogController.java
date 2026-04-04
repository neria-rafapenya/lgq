package com.lgq.budget.controller;

import com.lgq.budget.ai.CatalogItem;
import com.lgq.budget.repository.CatalogRepository;
import com.lgq.budget.security.UserPrincipal;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog")
public class CatalogController {
  private final CatalogRepository catalogRepository;

  public CatalogController(CatalogRepository catalogRepository) {
    this.catalogRepository = catalogRepository;
  }

  @GetMapping
  public List<CatalogItem> listCatalog(
    @AuthenticationPrincipal UserPrincipal principal,
    @RequestParam(required = false) String category
  ) {
    List<CatalogItem> items = catalogRepository.findActiveDefaultItems();
    if (category == null || category.isBlank()) {
      return items;
    }
    String match = category.toLowerCase(Locale.ROOT).trim();
    return items.stream()
      .filter(item -> {
        if (item == null) {
          return false;
        }
        String itemCategory = Objects.toString(item.category(), "").toLowerCase(Locale.ROOT);
        String itemSubcategory = Objects.toString(item.subcategory(), "").toLowerCase(Locale.ROOT);
        return itemCategory.contains(match) || itemSubcategory.contains(match);
      })
      .toList();
  }
}
