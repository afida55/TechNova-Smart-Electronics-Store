package com.technova.shop.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ContactMessage {

    private Long id;

    private Long userId;

    private String name;

    private String email;

    private String subject;

    private String message;

    private String status;

    private LocalDateTime createTime;
}