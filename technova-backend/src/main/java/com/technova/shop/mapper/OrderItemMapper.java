package com.technova.shop.mapper;

import com.technova.shop.entity.OrderItem;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface OrderItemMapper {

    @Insert("INSERT INTO order_item (order_id, product_id, quantity, price) VALUES (#{orderId}, #{productId}, #{quantity}, #{price})")
    int insert(OrderItem item);

    @Select("""
        SELECT oi.*, p.name AS productName, p.image AS productImage
        FROM order_item oi
        JOIN product p ON oi.product_id = p.id
        WHERE oi.order_id = #{orderId}
    """)
    List<OrderItem> findByOrderId(Long orderId);

    @Delete("""
        DELETE FROM order_item
        WHERE order_id = #{orderId}
    """)
    int deleteByOrderId(@Param("orderId") Long orderId);

    @Delete("""
    DELETE oi
    FROM order_item oi
    INNER JOIN `order` o
        ON oi.order_id = o.id
    WHERE o.is_deleted = TRUE
""")
    int permanentlyDeleteDeletedOrderItems();
}