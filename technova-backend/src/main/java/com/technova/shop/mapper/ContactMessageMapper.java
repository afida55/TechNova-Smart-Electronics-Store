package com.technova.shop.mapper;

import com.technova.shop.entity.ContactMessage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ContactMessageMapper {

    // ============================================================
    // CREATE CONTACT MESSAGE
    // ============================================================

    @Insert("""
        INSERT INTO contact_message
            (
                user_id,
                name,
                email,
                subject,
                message,
                status,
                create_time
            )
        VALUES
            (
                #{userId},
                #{name},
                #{email},
                #{subject},
                #{message},
                'NEW',
                NOW()
            )
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(ContactMessage contactMessage);


    // ============================================================
    // ADMIN - GET ALL CONTACT MESSAGES
    // ============================================================

    @Select("""
        SELECT
            id,
            user_id AS userId,
            name,
            email,
            subject,
            message,
            status,
            create_time AS createTime
        FROM contact_message
        ORDER BY create_time DESC
    """)
    List<ContactMessage> findAll();


    // ============================================================
    // ADMIN - FIND ONE
    // ============================================================

    @Select("""
        SELECT
            id,
            user_id AS userId,
            name,
            email,
            subject,
            message,
            status,
            create_time AS createTime
        FROM contact_message
        WHERE id = #{id}
    """)
    ContactMessage findById(Long id);


    // ============================================================
    // ADMIN - UPDATE STATUS
    // ============================================================

    @Update("""
        UPDATE contact_message
        SET status = #{status}
        WHERE id = #{id}
    """)
    int updateStatus(
            @Param("id") Long id,
            @Param("status") String status
    );
}