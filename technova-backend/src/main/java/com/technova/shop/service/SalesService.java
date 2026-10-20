package com.technova.shop.service;

import com.technova.shop.mapper.SalesMapper;

import java.math.BigDecimal;
import java.util.List;

public interface SalesService {

    BigDecimal getTotalSales();

    long getTotalOrders();

    long getCompletedOrders();

    long getCancelledOrders();

    List<com.technova.shop.entity.Order> getRecentSales();

    List<SalesMapper.TopSellingProduct> getTopSellingProducts();

    List<SalesMapper.SalesTrend> getSalesTrend();
}