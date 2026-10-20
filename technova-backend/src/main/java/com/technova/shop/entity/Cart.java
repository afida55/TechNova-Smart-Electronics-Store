package com.technova.shop.entity;

import lombok.Data;

@Data
public class Cart {
    private Long id;
    private Long userId;
    private Long productId;
    private Integer quantity;
}
