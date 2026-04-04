package com.lgq.budget.controller;

import com.lgq.budget.dto.CreateProjectRequest;
import com.lgq.budget.dto.CreateProjectResponse;
import com.lgq.budget.dto.EquipmentSelectionsRequest;
import com.lgq.budget.dto.MaterialSelectionsRequest;
import com.lgq.budget.dto.ProjectExtrasRequest;
import com.lgq.budget.dto.ProjectFinancialsRequest;
import com.lgq.budget.dto.ProjectInstallationsRequest;
import com.lgq.budget.dto.ProjectLaborRequest;
import com.lgq.budget.dto.ProjectScopeRequest;
import com.lgq.budget.dto.ProjectSpaceStateRequest;
import com.lgq.budget.service.ProjectWriteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import com.lgq.budget.security.Role;
import com.lgq.budget.security.UserPrincipal;

@RestController
@RequestMapping("/api/projects")
public class ProjectWriteController {
  private final ProjectWriteService projectWriteService;

  public ProjectWriteController(ProjectWriteService projectWriteService) {
    this.projectWriteService = projectWriteService;
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CreateProjectResponse createProject(
    @Valid @RequestBody CreateProjectRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    return projectWriteService.createProject(principal.getId(), request);
  }

  @PutMapping("/{projectId}/materials")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void replaceMaterials(
    @PathVariable long projectId,
    @Valid @RequestBody MaterialSelectionsRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.replaceMaterials(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/equipment")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void replaceEquipment(
    @PathVariable long projectId,
    @Valid @RequestBody EquipmentSelectionsRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.replaceEquipment(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/labor")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertLabor(
    @PathVariable long projectId,
    @RequestBody ProjectLaborRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertLabor(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/extras")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertExtras(
    @PathVariable long projectId,
    @RequestBody ProjectExtrasRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertExtras(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/financials")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertFinancials(
    @PathVariable long projectId,
    @RequestBody ProjectFinancialsRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertFinancials(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/scope")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertScope(
    @PathVariable long projectId,
    @RequestBody ProjectScopeRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertScope(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/space-state")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertSpaceState(
    @PathVariable long projectId,
    @RequestBody ProjectSpaceStateRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertSpaceState(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }

  @PutMapping("/{projectId}/installations")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void upsertInstallations(
    @PathVariable long projectId,
    @RequestBody ProjectInstallationsRequest request,
    @AuthenticationPrincipal UserPrincipal principal
  ) {
    projectWriteService.upsertInstallations(
      principal.getId(),
      principal.getRole() == Role.ADMIN,
      projectId,
      request
    );
  }
}
