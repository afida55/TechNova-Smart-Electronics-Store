package com.technova.shop.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {
    @NotBlank(message = "message is required")
    private String message;

    /** Optional prior turns, so the assistant has conversation context. */
    private List<ChatMessageDto> history;
}
