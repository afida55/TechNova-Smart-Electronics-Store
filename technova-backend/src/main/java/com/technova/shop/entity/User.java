package com.technova.shop.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class User {

    private Long id;
    private String username;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    private String phone;
    private String email;

    // ============================================================
    // SAVED SHIPPING INFORMATION
    // ============================================================

    private String receiverName;
    private String receiverPhone;
    private String shippingStreet;
    private String shippingCity;
    private String shippingZip;

    // ============================================================
    // SAVED PAYMENT INFORMATION
    // ============================================================

    private String savedPaymentMethod;
    private String savedCardName;
    private String savedCardLast4;
    private String savedCardExpiry;

    private LocalDateTime createTime;

    private String role;
    private Boolean isDeleted;
}