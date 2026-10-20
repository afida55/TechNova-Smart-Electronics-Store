package com.technova.shop.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
public class AdminDashboardDto {

    private long totalUsers;
    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalSales;
    private long pendingOrders;
    private long lowStockProducts;
}