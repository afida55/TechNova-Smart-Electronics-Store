package com.technova.shop.service;

import com.technova.shop.entity.StoreSettings;

public interface StoreSettingsService {

    StoreSettings getSettings();

    void updateSettings(StoreSettings settings);
}