package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.StoreSettings;
import com.technova.shop.service.StoreSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final StoreSettingsService storeSettingsService;


    // =========================================================
    // GET SETTINGS
    // =========================================================

    /**
     * Get current store settings.
     *
     * GET /api/admin/settings
     */
    @GetMapping
    public ApiResponse<StoreSettings> getSettings() {

        return ApiResponse.success(
                storeSettingsService.getSettings()
        );
    }


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    /**
     * Update store settings.
     *
     * PUT /api/admin/settings
     */
    @PutMapping
    public ApiResponse<Void> updateSettings(
            @RequestBody StoreSettings settings
    ) {

        storeSettingsService.updateSettings(settings);

        return ApiResponse.success(
                "Settings updated successfully",
                null
        );
    }
}