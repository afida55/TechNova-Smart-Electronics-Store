package com.technova.shop.mapper;

import com.technova.shop.entity.User;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface UserMapper {

    // ============================================================
    // USER / ACTIVE USER
    // ============================================================

    @Select("""
        SELECT
            id,
            username,
            password,
            phone,
            email,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            shipping_street AS shippingStreet,
            shipping_city AS shippingCity,
            shipping_zip AS shippingZip,
            saved_payment_method AS savedPaymentMethod,
            saved_card_name AS savedCardName,
            saved_card_last4 AS savedCardLast4,
            saved_card_expiry AS savedCardExpiry,
            create_time,
            role,
            is_deleted AS isDeleted
        FROM user
        WHERE username = #{username}
          AND is_deleted = FALSE
    """)
    User findByUsername(String username);


    @Select("""
        SELECT
            id,
            username,
            password,
            phone,
            email,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            shipping_street AS shippingStreet,
            shipping_city AS shippingCity,
            shipping_zip AS shippingZip,
            saved_payment_method AS savedPaymentMethod,
            saved_card_name AS savedCardName,
            saved_card_last4 AS savedCardLast4,
            saved_card_expiry AS savedCardExpiry,
            create_time,
            role,
            is_deleted AS isDeleted
        FROM user
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    User findById(Long id);


    // ============================================================
    // FIND USER - ACTIVE OR DELETED
    // Used when restoring a deleted user.
    // ============================================================

    @Select("""
        SELECT
            id,
            username,
            password,
            phone,
            email,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            shipping_street AS shippingStreet,
            shipping_city AS shippingCity,
            shipping_zip AS shippingZip,
            saved_payment_method AS savedPaymentMethod,
            saved_card_name AS savedCardName,
            saved_card_last4 AS savedCardLast4,
            saved_card_expiry AS savedCardExpiry,
            create_time,
            role,
            is_deleted AS isDeleted
        FROM user
        WHERE id = #{id}
    """)
    User findAnyById(Long id);


    // ============================================================
    // DUPLICATE CHECKS
    // ACTIVE USERS ONLY
    // ============================================================

    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE username = #{username}
          AND is_deleted = FALSE
    """)
    int countByUsername(String username);


    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE email = #{email}
          AND is_deleted = FALSE
    """)
    int countByEmail(String email);


    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE username = #{username}
          AND id != #{excludeId}
          AND is_deleted = FALSE
    """)
    int countByUsernameExcludingId(
            @Param("username") String username,
            @Param("excludeId") Long excludeId
    );


    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE email = #{email}
          AND id != #{excludeId}
          AND is_deleted = FALSE
    """)
    int countByEmailExcludingId(
            @Param("email") String email,
            @Param("excludeId") Long excludeId
    );


    // ============================================================
    // ADMIN - ACTIVE USERS
    // ============================================================

    @Select("""
        SELECT
            id,
            username,
            password,
            phone,
            email,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            shipping_street AS shippingStreet,
            shipping_city AS shippingCity,
            shipping_zip AS shippingZip,
            saved_payment_method AS savedPaymentMethod,
            saved_card_name AS savedCardName,
            saved_card_last4 AS savedCardLast4,
            saved_card_expiry AS savedCardExpiry,
            create_time,
            role,
            is_deleted AS isDeleted
        FROM user
        WHERE is_deleted = FALSE
        ORDER BY create_time DESC
    """)
    List<User> findAll();


    // ============================================================
    // ADMIN - DELETED USERS
    // ============================================================

    @Select("""
        SELECT
            id,
            username,
            password,
            phone,
            email,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            shipping_street AS shippingStreet,
            shipping_city AS shippingCity,
            shipping_zip AS shippingZip,
            saved_payment_method AS savedPaymentMethod,
            saved_card_name AS savedCardName,
            saved_card_last4 AS savedCardLast4,
            saved_card_expiry AS savedCardExpiry,
            create_time,
            role,
            is_deleted AS isDeleted
        FROM user
        WHERE is_deleted = TRUE
        ORDER BY create_time DESC
    """)
    List<User> findDeleted();


    // ============================================================
    // NORMAL USER REGISTRATION
    // Always creates USER.
    // ============================================================

    @Insert("""
        INSERT INTO user
            (
                username,
                password,
                phone,
                email,
                create_time,
                role,
                is_deleted
            )
        VALUES
            (
                #{username},
                #{password},
                #{phone},
                #{email},
                NOW(),
                'USER',
                FALSE
            )
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(User user);


    // ============================================================
    // ADMIN CREATE USER / ADMIN
    // Role is supplied by UserServiceImpl.
    // ============================================================

    @Insert("""
        INSERT INTO user
            (
                username,
                password,
                phone,
                email,
                create_time,
                role,
                is_deleted
            )
        VALUES
            (
                #{username},
                #{password},
                #{phone},
                #{email},
                NOW(),
                #{role},
                FALSE
            )
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insertByAdmin(User user);


    // ============================================================
    // UPDATE USER
    // Only active users can be updated.
    // Admin can change USER <-> ADMIN.
    // ============================================================

    @Update("""
        UPDATE user
        SET
            username = #{username},
            email = #{email},
            phone = #{phone},
            role = #{role}
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int update(User user);


    // ============================================================
    // UPDATE SAVED SHIPPING ADDRESS
    // ============================================================

    @Update("""
        UPDATE user
        SET
            receiver_name = #{receiverName},
            receiver_phone = #{receiverPhone},
            shipping_street = #{shippingStreet},
            shipping_city = #{shippingCity},
            shipping_zip = #{shippingZip}
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int updateShippingAddress(User user);


    // ============================================================
    // UPDATE SAVED PAYMENT INFORMATION
    // ============================================================

    @Update("""
        UPDATE user
        SET
            saved_payment_method = #{savedPaymentMethod},
            saved_card_name = #{savedCardName},
            saved_card_last4 = #{savedCardLast4},
            saved_card_expiry = #{savedCardExpiry}
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int updatePaymentDetails(User user);


    // ============================================================
    // SOFT DELETE
    // ============================================================

    @Update("""
        UPDATE user
        SET is_deleted = TRUE
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int deleteById(Long id);


    // ============================================================
    // RESTORE
    // ============================================================

    @Update("""
        UPDATE user
        SET is_deleted = FALSE
        WHERE id = #{id}
          AND is_deleted = TRUE
    """)
    int restoreById(Long id);


    // ============================================================
    // DASHBOARD COUNTS
    // ============================================================

    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE is_deleted = FALSE
    """)
    long countAllUsers();


    @Select("""
        SELECT COUNT(*)
        FROM user
        WHERE is_deleted = TRUE
    """)
    long countDeletedUsers();
    @Update("""
    UPDATE user
    SET password = #{password}
    WHERE id = #{id}
      AND is_deleted = FALSE
    """)
    int updatePassword(
            @Param("id") Long id,
            @Param("password") String password
    );
}