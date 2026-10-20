package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.dto.ContactMessageRequest;
import com.technova.shop.entity.ContactMessage;
import com.technova.shop.service.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ContactMessageController {

    private final ContactMessageService contactMessageService;


    // ============================================================
    // USER - SEND CONTACT MESSAGE
    // ============================================================

    @PostMapping("/api/contact/messages")
    public ApiResponse<ContactMessage> createMessage(
            HttpServletRequest request,
            @Valid @RequestBody ContactMessageRequest body
    ) {

        Long userId =
                (Long) request.getAttribute("userId");

        return ApiResponse.success(
                "Your message has been sent successfully",
                contactMessageService.createMessage(
                        userId,
                        body
                )
        );
    }


    // ============================================================
    // ADMIN - VIEW ALL CONTACT MESSAGES
    // Protected by your existing /api/admin/** interceptor
    // ============================================================

    @GetMapping("/api/admin/contact-messages")
    public ApiResponse<List<ContactMessage>> getAllMessages() {

        return ApiResponse.success(
                contactMessageService.getAllMessages()
        );
    }


    // ============================================================
    // ADMIN - UPDATE MESSAGE STATUS
    // ============================================================

    @PutMapping("/api/admin/contact-messages/{id}/status")
    public ApiResponse<ContactMessage> updateStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {

        return ApiResponse.success(
                "Contact message status updated",
                contactMessageService.updateStatus(
                        id,
                        status
                )
        );
    }
}