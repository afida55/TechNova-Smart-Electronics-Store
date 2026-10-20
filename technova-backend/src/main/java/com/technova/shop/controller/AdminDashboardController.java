package com.technova.shop.controller;

import com.technova.shop.dto.AdminDashboardDto;
import com.technova.shop.dto.ApiResponse;
import com.technova.shop.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService dashboardService;

    @GetMapping
    public ApiResponse<AdminDashboardDto> getDashboard() {
        return ApiResponse.success(
                dashboardService.getDashboard()
        );
    }
}