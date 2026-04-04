package com.lgq.budget.ai;

import com.lgq.budget.security.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
public class AiCopyController {
  private final AiCopyService aiCopyService;

  public AiCopyController(AiCopyService aiCopyService) {
    this.aiCopyService = aiCopyService;
  }

  @PostMapping("/copy")
  public AiCopyResponse rewrite(
    @AuthenticationPrincipal UserPrincipal principal,
    @RequestBody AiCopyRequest request
  ) {
    String prompt = request == null ? "" : request.prompt();
    String text = aiCopyService.rewrite(prompt);
    return new AiCopyResponse(text.isBlank() ? prompt : text);
  }
}
