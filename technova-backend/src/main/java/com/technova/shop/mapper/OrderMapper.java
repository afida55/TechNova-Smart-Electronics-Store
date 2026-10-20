package com.technova.shop.mapper;

import com.technova.shop.entity.Order;
import org.apache.ibatis.annotations.*;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface OrderMapper {

    // =========================================================
    // CREATE ORDER
    // =========================================================

    @Insert("""
        INSERT INTO `order`
            (order_no, user_id, total_price, status,
             receiver_name, receiver_phone, address,
             create_time, is_deleted)
        VALUES
            (#{orderNo}, #{userId}, #{totalPrice}, #{status},
             #{receiverName}, #{receiverPhone}, #{address},
             NOW(), FALSE)
    """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Order order);


    // =========================================================
    // USER ORDERS
    // Only show orders that have NOT been deleted by admin
    // =========================================================

    @Select("""
        SELECT *
        FROM `order`
        WHERE user_id = #{userId}
          AND is_deleted = FALSE
        ORDER BY create_time DESC
    """)
    List<Order> findByUserId(Long userId);


    // =========================================================
    // USER ORDER DETAIL
    // Deleted orders should not be accessible normally
    // =========================================================

    @Select("""
        SELECT *
        FROM `order`
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    Order findById(Long id);


    // =========================================================
    // ADMIN - ACTIVE ORDERS
    // =========================================================

    @Select("""
        SELECT *
        FROM `order`
        WHERE is_deleted = FALSE
        ORDER BY create_time DESC
    """)
    List<Order> findAll();


    // =========================================================
    // ADMIN - DELETED ORDERS
    // =========================================================

    @Select("""
        SELECT *
        FROM `order`
        WHERE is_deleted = TRUE
        ORDER BY create_time DESC
    """)
    List<Order> findDeleted();


    // =========================================================
    // ADMIN - FIND ANY ORDER
    // Used when admin opens an order detail.
    // Includes both active and deleted orders.
    // =========================================================

    @Select("""
        SELECT *
        FROM `order`
        WHERE id = #{id}
    """)
    Order findAnyById(Long id);


    // =========================================================
    // USER - UPDATE STATUS
    // =========================================================

    @Update("""
        UPDATE `order`
        SET status = #{status}
        WHERE id = #{id}
          AND user_id = #{userId}
          AND is_deleted = FALSE
    """)
    int updateStatus(
            @Param("id") Long id,
            @Param("userId") Long userId,
            @Param("status") String status
    );


    // =========================================================
    // ADMIN - UPDATE STATUS
    // =========================================================

    @Update("""
        UPDATE `order`
        SET status = #{status}
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int updateStatusByAdmin(
            @Param("id") Long id,
            @Param("status") String status
    );


    // =========================================================
    // USER - DELETE CANCELLED ORDER
    //
    // This is still a REAL DELETE for the user's own
    // cancelled order, as in your previous logic.
    // =========================================================

    @Delete("""
        DELETE FROM `order`
        WHERE id = #{id}
          AND user_id = #{userId}
          AND status = 'cancelled'
          AND is_deleted = FALSE
    """)
    int deleteCancelledOrder(
            @Param("id") Long id,
            @Param("userId") Long userId
    );


    // =========================================================
    // ADMIN - SOFT DELETE ORDER
    //
    // Does NOT change status.
    // Does NOT restore/deduct stock.
    // =========================================================

    @Update("""
        UPDATE `order`
        SET is_deleted = TRUE
        WHERE id = #{id}
          AND is_deleted = FALSE
    """)
    int deleteByAdmin(@Param("id") Long id);


    // =========================================================
    // ADMIN - RESTORE ORDER
    // =========================================================

    @Update("""
        UPDATE `order`
        SET is_deleted = FALSE
        WHERE id = #{id}
          AND is_deleted = TRUE
    """)
    int restoreByAdmin(@Param("id") Long id);

    @Delete("""
    DELETE FROM `order`
    WHERE is_deleted = TRUE
""")
    int permanentlyDeleteDeletedOrders();
    // =========================================================
    // ADMIN DASHBOARD - TOTAL ACTIVE ORDERS
    // =========================================================

    @Select("""
        SELECT COUNT(*)
        FROM `order`
        WHERE is_deleted = FALSE
    """)
    long countAllOrders();


    // =========================================================
    // ADMIN DASHBOARD - SALES
    // Exclude cancelled and deleted orders
    // =========================================================

    @Select("""
        SELECT COALESCE(SUM(total_price), 0)
        FROM `order`
        WHERE status != 'cancelled'
          AND is_deleted = FALSE
    """)
    BigDecimal sumTotalSales();


    // =========================================================
    // ADMIN DASHBOARD - PENDING ORDERS
    // =========================================================

    @Select("""
        SELECT COUNT(*)
        FROM `order`
        WHERE status = 'pending'
          AND is_deleted = FALSE
    """)
    long countPendingOrders();
}