package com.technova.shop.service.impl;

import com.technova.shop.entity.StoreSettings;
import com.technova.shop.mapper.StoreSettingsMapper;
import com.technova.shop.service.StoreSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class StoreSettingsServiceImpl
        implements StoreSettingsService {

    private final StoreSettingsMapper storeSettingsMapper;


    // =========================================================
    // GET SETTINGS
    // =========================================================

    @Override
    public StoreSettings getSettings() {

        StoreSettings settings =
                storeSettingsMapper.findSettings();

        if (settings == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Store settings not found"
            );
        }

        return settings;
    }


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    @Override
    public void updateSettings(StoreSettings settings) {

        if (settings == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Settings data is required"
            );
        }


        // =====================================================
        // STORE NAME
        // =====================================================

        if (settings.getStoreName() == null ||
                settings.getStoreName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Store name is required"
            );
        }

        settings.setStoreName(
                settings.getStoreName().trim()
        );


        // =====================================================
        // STORE EMAIL
        // =====================================================

        if (settings.getStoreEmail() != null) {

            settings.setStoreEmail(
                    settings.getStoreEmail().trim()
            );
        }


        // =====================================================
        // STORE PHONE
        // =====================================================

        if (settings.getStorePhone() != null) {

            settings.setStorePhone(
                    settings.getStorePhone().trim()
            );
        }


        // =====================================================
        // STORE ADDRESS
        // =====================================================

        if (settings.getStoreAddress() != null) {

            settings.setStoreAddress(
                    settings.getStoreAddress().trim()
            );
        }


        // =====================================================
        // CURRENCY
        // =====================================================

        if (settings.getCurrency() == null ||
                settings.getCurrency().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Currency is required"
            );
        }

        settings.setCurrency(
                settings.getCurrency().trim().toUpperCase()
        );


        // =====================================================
        // TAX RATE
        // =====================================================

        if (settings.getTaxRate() == null) {
            settings.setTaxRate(BigDecimal.ZERO);
        }

        if (settings.getTaxRate().compareTo(BigDecimal.ZERO) < 0 ||
                settings.getTaxRate().compareTo(new BigDecimal("100")) > 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tax rate must be between 0 and 100"
            );
        }


        // =====================================================
        // LOW STOCK THRESHOLD
        // =====================================================

        if (settings.getLowStockThreshold() == null) {

            settings.setLowStockThreshold(10);
        }

        if (settings.getLowStockThreshold() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Low-stock threshold cannot be negative"
            );
        }


        // =====================================================
        // CUSTOMER CANCELLATION
        // =====================================================

        if (settings.getAllowCustomerCancellation() == null) {

            settings.setAllowCustomerCancellation(true);
        }


        // =====================================================
        // CANCELLATION PERIOD
        // =====================================================

        if (settings.getCancellationPeriodHours() == null) {

            settings.setCancellationPeriodHours(24);
        }

        if (settings.getCancellationPeriodHours() < 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cancellation period cannot be negative"
            );
        }


        // =====================================================
        // NEW ORDERS
        // =====================================================

        if (settings.getAllowNewOrders() == null) {

            settings.setAllowNewOrders(true);
        }


        // =====================================================
        // FIND EXISTING SETTINGS
        // =====================================================

        StoreSettings existing =
                storeSettingsMapper.findSettings();

        if (existing == null) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Store settings not found"
            );
        }

        settings.setId(existing.getId());


        // =====================================================
        // UPDATE
        // =====================================================

        int affectedRows =
                storeSettingsMapper.updateSettings(settings);

        if (affectedRows == 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Failed to update store settings"
            );
        }
    }
}