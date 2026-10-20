package com.technova.shop.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CheckoutRequest {

    @NotBlank(message = "Receiver name is required")
    private String receiverName;

    @NotBlank(message = "Receiver phone is required")
    private String receiverPhone;

    @NotBlank(message = "Shipping address is required")
    private String address;

    /*
     * false/null = normal Cart checkout
     * true       = Buy Now checkout
     */
    private Boolean buyNow = false;

    /*
     * Used by Buy Now.
     *
     * Normal cart checkout can leave this empty.
     */
    private List<CheckoutItemRequest> items;

    @Data
    public static class CheckoutItemRequest {

        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;
    }
}