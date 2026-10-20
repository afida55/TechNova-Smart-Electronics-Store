package com.technova.shop.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AIChatHistory {

    private Long id;
    private Long userId;
    private String userMessage;
    private String aiResponse;
    private LocalDateTime createdAt;
}