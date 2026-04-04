package com.lgq.budget.lgq.controller;

import com.lgq.budget.lgq.dto.LgqActionResponse;
import com.lgq.budget.lgq.dto.LgqBudgetResponse;
import com.lgq.budget.lgq.dto.LgqCatalogResponse;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionResponse;
import com.lgq.budget.lgq.dto.LgqCatalogSelectionRequest;
import com.lgq.budget.lgq.dto.LgqCatalogSummary;
import com.lgq.budget.lgq.dto.LgqProjectBaseRequest;
import com.lgq.budget.lgq.dto.LgqProjectBaseResponse;
import com.lgq.budget.lgq.dto.LgqSubactResponse;
import com.lgq.budget.lgq.service.LgqEngineService;
import com.lgq.budget.lgq.service.LgqBudgetPdfService;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/lgq")
public class LgqEngineController {
  private final LgqEngineService engineService;
  private final LgqBudgetPdfService pdfService;

  public LgqEngineController(LgqEngineService engineService, LgqBudgetPdfService pdfService) {
    this.engineService = engineService;
    this.pdfService = pdfService;
  }

  @GetMapping("/catalogs")
  public List<LgqCatalogSummary> listCatalogs(@AuthenticationPrincipal UserPrincipal principal) {
    return engineService.listCatalogs();
  }

  @GetMapping("/catalogs/{code}")
  public LgqCatalogResponse getCatalog(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable String code
  ) {
    return engineService.getCatalog(code);
  }

  @GetMapping("/actions")
  public List<LgqActionResponse> listActions(@AuthenticationPrincipal UserPrincipal principal) {
    return engineService.listActions();
  }

  @GetMapping("/actions/{code}/subacts")
  public List<LgqSubactResponse> listSubacts(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable String code
  ) {
    return engineService.listSubacts(code);
  }

  @GetMapping("/projects/{projectId}/base")
  public ResponseEntity<LgqProjectBaseResponse> getBase(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId
  ) {
    LgqProjectBaseResponse base = engineService.getBase(
      projectId,
      principal.getId(),
      principal.getRole() == Role.ADMIN
    );
    if (base == null) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(base);
  }

  @PutMapping("/projects/{projectId}/base")
  public void upsertBase(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId,
    @RequestBody LgqProjectBaseRequest request
  ) {
    engineService.upsertBase(projectId, principal.getId(), principal.getRole() == Role.ADMIN, request);
  }

  @PutMapping("/projects/{projectId}/actions")
  public void replaceActions(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId,
    @RequestBody List<Long> actionIds
  ) {
    engineService.replaceActions(projectId, principal.getId(), principal.getRole() == Role.ADMIN, actionIds);
  }

  @PutMapping("/projects/{projectId}/catalog")
  public void replaceCatalog(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId,
    @RequestBody List<LgqCatalogSelectionRequest> selections
  ) {
    engineService.replaceCatalogSelections(projectId, principal.getId(), principal.getRole() == Role.ADMIN, selections);
  }

  @GetMapping("/projects/{projectId}/catalog")
  public List<LgqCatalogSelectionResponse> listCatalogSelections(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId
  ) {
    return engineService.getCatalogSelections(projectId, principal.getId(), principal.getRole() == Role.ADMIN);
  }

  @PostMapping("/projects/{projectId}/calculate")
  public LgqBudgetResponse calculate(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId
  ) {
    return engineService.calculate(projectId, principal.getId(), principal.getRole() == Role.ADMIN);
  }

  @GetMapping("/projects/{projectId}/budget/pdf")
  public ResponseEntity<byte[]> downloadPdf(
    @AuthenticationPrincipal UserPrincipal principal,
    @PathVariable long projectId
  ) {
    byte[] pdf = pdfService.generateBudgetPdf(projectId, principal.getId(), principal.getRole() == Role.ADMIN);
    return ResponseEntity.ok()
      .contentType(MediaType.APPLICATION_PDF)
      .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=presupuesto-lgq-" + projectId + ".pdf")
      .body(pdf);
  }
}
