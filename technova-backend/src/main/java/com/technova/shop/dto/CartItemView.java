package com.technova.shop.dto;

import lombok.Data;
import java.math.BigDecimal;

/** Cart row joined with product info, ready for the frontend cart page. */
@Data
public class CartItemView {
    private Long id;          // cart row id
    private Long productId;
    private String productName;
    private String productImage;
    private BigDecimal price;
    private Integer stock;
    private Integer quantity;
}
