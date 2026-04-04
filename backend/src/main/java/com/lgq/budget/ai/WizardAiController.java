package com.lgq.budget.ai;

import com.lgq.budget.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai/wizard")
public class WizardAiController {
  private final WizardAiService wizardAiService;

  public WizardAiController(WizardAiService wizardAiService) {
    this.wizardAiService = wizardAiService;
  }

  @PostMapping("/turn")
  public WizardAiResponse handleTurn(
    @AuthenticationPrincipal UserPrincipal principal,
    @RequestBody WizardAiRequest request
  ) {
    return wizardAiService.handleTurn(principal.getId(), principal.getRole(), request);
  }
}
