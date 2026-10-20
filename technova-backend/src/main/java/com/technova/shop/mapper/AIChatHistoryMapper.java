package com.technova.shop.mapper;

import com.technova.shop.entity.AIChatHistory;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface AIChatHistoryMapper {

    @Insert("""
        INSERT INTO ai_chat_history (user_id, user_message, ai_response)
        VALUES (#{userId}, #{userMessage}, #{aiResponse})
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(AIChatHistory chatHistory);

    @Select("""
        SELECT id, user_id, user_message, ai_response, created_at
        FROM ai_chat_history
        WHERE user_id = #{userId}
        ORDER BY created_at ASC
    """)
    @Results(id = "aiChatHistoryMap", value = {
            @Result(property = "id", column = "id"),
            @Result(property = "userId", column = "user_id"),
            @Result(property = "userMessage", column = "user_message"),
            @Result(property = "aiResponse", column = "ai_response"),
            @Result(property = "createdAt", column = "created_at")
    })
    List<AIChatHistory> findByUserId(Long userId);
}