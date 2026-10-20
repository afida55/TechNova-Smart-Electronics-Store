package com.technova.shop.dto;

import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class UpdateQuantityRequest {
    @Min(value = 1, message = "quantity must be at least 1")
    private int quantity;
}
