package com.technova.shop.mapper;

import com.technova.shop.entity.StoreSettings;
import org.apache.ibatis.annotations.*;

@Mapper
public interface StoreSettingsMapper {

    // =========================================================
    // GET SETTINGS
    // =========================================================

    @Select("""
        SELECT
            id,
            store_name AS storeName,
            store_email AS storeEmail,
            store_phone AS storePhone,
            store_address AS storeAddress,
            currency,
            tax_rate AS taxRate,
            low_stock_threshold AS lowStockThreshold,
            allow_customer_cancellation AS allowCustomerCancellation,
            cancellation_period_hours AS cancellationPeriodHours,
            allow_new_orders AS allowNewOrders,
            update_time AS updateTime
        FROM store_settings
        ORDER BY id
        LIMIT 1
    """)
    StoreSettings findSettings();


    // =========================================================
    // UPDATE SETTINGS
    // =========================================================

    @Update("""
        UPDATE store_settings
        SET
            store_name = #{storeName},
            store_email = #{storeEmail},
            store_phone = #{storePhone},
            store_address = #{storeAddress},
            currency = #{currency},
            tax_rate = #{taxRate},
            low_stock_threshold = #{lowStockThreshold},
            allow_customer_cancellation = #{allowCustomerCancellation},
            cancellation_period_hours = #{cancellationPeriodHours},
            allow_new_orders = #{allowNewOrders}
        WHERE id = #{id}
    """)
    int updateSettings(StoreSettings settings);
}