package com.technova.shop.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StoreSettings {

    private Long id;

    // =========================================================
    // STORE INFORMATION
    // =========================================================

    private String storeName;

    private String storeEmail;

    private String storePhone;

    private String storeAddress;


    // =========================================================
    // STORE SETTINGS
    // =========================================================

    private String currency;

    private BigDecimal taxRate;

    private Integer lowStockThreshold;


    // =========================================================
    // ORDER SETTINGS
    // =========================================================

    private Boolean allowCustomerCancellation;

    private Integer cancellationPeriodHours;

    private Boolean allowNewOrders;


    // =========================================================
    // SYSTEM
    // =========================================================

    private LocalDateTime updateTime;
}