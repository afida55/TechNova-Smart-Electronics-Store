package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.Order;
import com.technova.shop.mapper.SalesMapper;
import com.technova.shop.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/sales")
@RequiredArgsConstructor
public class AdminSalesController {

    private final SalesService salesService;

    @GetMapping
    public ApiResponse<Map<String, Object>> getSales() {

        BigDecimal totalSales =
                salesService.getTotalSales();

        long totalOrders =
                salesService.getTotalOrders();

        long completedOrders =
                salesService.getCompletedOrders();

        long cancelledOrders =
                salesService.getCancelledOrders();

        List<Order> recentSales =
                salesService.getRecentSales();

        List<SalesMapper.TopSellingProduct> topProducts =
                salesService.getTopSellingProducts();

        List<SalesMapper.SalesTrend> salesTrend =
                salesService.getSalesTrend();

        Map<String, Object> data =
                new HashMap<>();

        data.put("totalSales", totalSales);
        data.put("totalOrders", totalOrders);
        data.put("completedOrders", completedOrders);
        data.put("cancelledOrders", cancelledOrders);
        data.put("recentSales", recentSales);
        data.put("topProducts", topProducts);
        data.put("salesTrend", salesTrend);

        return ApiResponse.success(data);
    }
}