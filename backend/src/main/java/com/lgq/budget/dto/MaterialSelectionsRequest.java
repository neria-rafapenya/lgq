package com.lgq.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record MaterialSelectionsRequest(@NotNull List<@Valid MaterialSelectionItem> items) {
}
