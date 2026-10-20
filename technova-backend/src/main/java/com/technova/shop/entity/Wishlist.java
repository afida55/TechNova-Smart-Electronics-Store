package com.technova.shop.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Wishlist {
    private Long id;
    private Long userId;
    private Long productId;
    private LocalDateTime createTime;
}
