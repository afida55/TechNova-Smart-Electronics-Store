package com.technova.shop.service.impl;

import com.technova.shop.dto.AdminDashboardDto;
import com.technova.shop.mapper.OrderMapper;
import com.technova.shop.mapper.ProductMapper;
import com.technova.shop.mapper.UserMapper;
import com.technova.shop.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserMapper userMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;

    @Override
    public AdminDashboardDto getDashboard() {

        long totalUsers = userMapper.countAllUsers();

        long totalProducts = productMapper.countAllProducts();

        long totalOrders = orderMapper.countAllOrders();

        BigDecimal totalSales = orderMapper.sumTotalSales();

        long pendingOrders = orderMapper.countPendingOrders();

        long lowStockProducts = productMapper.countLowStockProducts();

        return new AdminDashboardDto(
                totalUsers,
                totalProducts,
                totalOrders,
                totalSales,
                pendingOrders,
                lowStockProducts
        );
    }
}