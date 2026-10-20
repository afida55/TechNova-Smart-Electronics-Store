package com.technova.shop.entity;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class Order {

    private Long id;
    private String orderNo;
    private Long userId;
    private BigDecimal totalPrice;

    // pending -> paid -> shipped -> completed
    // also: cancelled
    private String status;

    private String receiverName;
    private String receiverPhone;
    private String address;
    private LocalDateTime createTime;

    // Soft delete
    private Boolean isDeleted;
}