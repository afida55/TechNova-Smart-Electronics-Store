package com.technova.shop.mapper;

import com.technova.shop.dto.CartItemView;
import com.technova.shop.entity.Cart;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface CartMapper {

    @Select("""
        SELECT
            c.id AS id,
            c.product_id AS productId,
            p.name AS productName,
            p.image AS productImage,
            p.price AS price,
            p.stock AS stock,
            c.quantity AS quantity
        FROM cart c
        JOIN product p ON c.product_id = p.id
        WHERE c.user_id = #{userId}
        ORDER BY c.id DESC
    """)
    List<CartItemView> findViewByUserId(Long userId);


    @Select("""
        SELECT *
        FROM cart
        WHERE user_id = #{userId}
          AND product_id = #{productId}
    """)
    Cart findByUserAndProduct(
            @Param("userId") Long userId,
            @Param("productId") Long productId
    );


    // Find a cart item by its CART ROW ID
    // This is different from findByUserAndProduct()
    @Select("""
        SELECT *
        FROM cart
        WHERE id = #{id}
          AND user_id = #{userId}
    """)
    Cart findById(
            @Param("id") Long id,
            @Param("userId") Long userId
    );


    @Insert("""
        INSERT INTO cart (
            user_id,
            product_id,
            quantity
        )
        VALUES (
            #{userId},
            #{productId},
            #{quantity}
        )
    """)
    @Options(
            useGeneratedKeys = true,
            keyProperty = "id"
    )
    int insert(Cart cart);


    @Update("""
        UPDATE cart
        SET quantity = #{quantity}
        WHERE id = #{id}
          AND user_id = #{userId}
    """)
    int updateQuantity(
            @Param("id") Long id,
            @Param("userId") Long userId,
            @Param("quantity") int quantity
    );


    @Delete("""
        DELETE FROM cart
        WHERE id = #{id}
          AND user_id = #{userId}
    """)
    int delete(
            @Param("id") Long id,
            @Param("userId") Long userId
    );


    @Delete("""
        DELETE FROM cart
        WHERE user_id = #{userId}
    """)
    int clearByUserId(Long userId);
}