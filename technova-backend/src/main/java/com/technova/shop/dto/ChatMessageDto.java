package com.technova.shop.dto;

import lombok.Data;

/** One prior turn of the conversation, sent by the frontend for context. */
@Data
public class ChatMessageDto {
    /** "user" or "model" — must match Gemini's role naming exactly. */
    private String role;
    private String text;
}
