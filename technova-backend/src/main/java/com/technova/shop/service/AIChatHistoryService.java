package com.technova.shop.service;

import com.technova.shop.entity.AIChatHistory;
import com.technova.shop.mapper.AIChatHistoryMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AIChatHistoryService {

    private final AIChatHistoryMapper chatHistoryMapper;

    public AIChatHistoryService(AIChatHistoryMapper chatHistoryMapper) {
        this.chatHistoryMapper = chatHistoryMapper;
    }

    public void saveChat(Long userId, String userMessage, String aiResponse) {
        AIChatHistory history = new AIChatHistory();
        history.setUserId(userId);
        history.setUserMessage(userMessage);
        history.setAiResponse(aiResponse);

        chatHistoryMapper.insert(history);
    }

    public List<AIChatHistory> getUserHistory(Long userId) {
        return chatHistoryMapper.findByUserId(userId);
    }
}