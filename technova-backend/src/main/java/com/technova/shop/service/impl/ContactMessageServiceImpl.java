package com.technova.shop.service.impl;

import com.technova.shop.dto.ContactMessageRequest;
import com.technova.shop.entity.ContactMessage;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.ContactMessageMapper;
import com.technova.shop.service.ContactMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactMessageServiceImpl
        implements ContactMessageService {

    private final ContactMessageMapper contactMessageMapper;


    // ============================================================
    // USER - CREATE MESSAGE
    // ============================================================

    @Override
    public ContactMessage createMessage(
            Long userId,
            ContactMessageRequest request
    ) {

        if (request == null) {
            throw new BusinessException(
                    "Contact message is required"
            );
        }

        String name =
                request.getName() == null
                        ? ""
                        : request.getName().trim();

        String email =
                request.getEmail() == null
                        ? ""
                        : request.getEmail().trim();

        String subject =
                request.getSubject() == null
                        ? ""
                        : request.getSubject().trim();

        String message =
                request.getMessage() == null
                        ? ""
                        : request.getMessage().trim();

        if (name.isEmpty()) {
            throw new BusinessException(
                    "Name is required"
            );
        }

        if (email.isEmpty()) {
            throw new BusinessException(
                    "Email is required"
            );
        }

        if (subject.isEmpty()) {
            throw new BusinessException(
                    "Subject is required"
            );
        }

        if (message.isEmpty()) {
            throw new BusinessException(
                    "Message is required"
            );
        }

        ContactMessage contactMessage =
                new ContactMessage();

        contactMessage.setUserId(userId);
        contactMessage.setName(name);
        contactMessage.setEmail(email);
        contactMessage.setSubject(subject);
        contactMessage.setMessage(message);
        contactMessage.setStatus("NEW");

        int affected =
                contactMessageMapper.insert(
                        contactMessage
                );

        if (affected == 0) {
            throw new BusinessException(
                    "Message could not be sent"
            );
        }

        return contactMessage;
    }


    // ============================================================
    // ADMIN - GET ALL
    // ============================================================

    @Override
    public List<ContactMessage> getAllMessages() {

        return contactMessageMapper.findAll();
    }


    // ============================================================
    // ADMIN - UPDATE STATUS
    // ============================================================

    @Override
    public ContactMessage updateStatus(
            Long id,
            String status
    ) {

        ContactMessage existing =
                contactMessageMapper.findById(id);

        if (existing == null) {
            throw new BusinessException(
                    404,
                    "Contact message not found"
            );
        }

        if (status == null ||
                status.trim().isEmpty()) {

            throw new BusinessException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!normalizedStatus.equals("NEW") &&
                !normalizedStatus.equals("READ") &&
                !normalizedStatus.equals("REPLIED")) {

            throw new BusinessException(
                    "Invalid contact message status"
            );
        }

        int affected =
                contactMessageMapper.updateStatus(
                        id,
                        normalizedStatus
                );

        if (affected == 0) {
            throw new BusinessException(
                    404,
                    "Contact message could not be updated"
            );
        }

        existing.setStatus(normalizedStatus);

        return existing;
    }
}