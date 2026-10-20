package com.technova.shop.service;

import com.technova.shop.dto.ContactMessageRequest;
import com.technova.shop.entity.ContactMessage;

import java.util.List;

public interface ContactMessageService {

    ContactMessage createMessage(
            Long userId,
            ContactMessageRequest request
    );

    List<ContactMessage> getAllMessages();

    ContactMessage updateStatus(
            Long id,
            String status
    );
}