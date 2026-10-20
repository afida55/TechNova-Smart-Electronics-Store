package com.technova.shop.entity;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderItem {
    private Long id;
    private Long orderId;
    private Long productId;
    private Integer quantity;
    private BigDecimal price; // unit price at time of purchase

    // joined in for display, not actual columns
    private String productName;
    private String productImage;
}
