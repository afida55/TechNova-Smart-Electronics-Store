package com.technova.shop.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CompareRequest {

    @NotEmpty(message = "At least 2 products are required.")
    private List<Long> productIds;

    public List<Long> getProductIds() {
        return productIds;
    }

    public void setProductIds(List<Long> productIds) {
        this.productIds = productIds;
    }
}