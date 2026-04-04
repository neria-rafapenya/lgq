package com.lgq.budget.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record EquipmentSelectionsRequest(@NotNull List<@Valid EquipmentSelectionItem> items) {
}
