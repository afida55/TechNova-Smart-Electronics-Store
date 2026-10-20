package com.technova.shop.mapper;

import com.technova.shop.entity.Product;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface WishlistMapper {

    @Select("""
        SELECT p.* FROM wishlist w
        JOIN product p ON w.product_id = p.id
        WHERE w.user_id = #{userId}
        ORDER BY w.create_time DESC
    """)
    List<Product> findProductsByUserId(Long userId);

    @Select("SELECT COUNT(*) FROM wishlist WHERE user_id = #{userId} AND product_id = #{productId}")
    int exists(@Param("userId") Long userId, @Param("productId") Long productId);

    @Insert("INSERT INTO wishlist (user_id, product_id, create_time) VALUES (#{userId}, #{productId}, NOW())")
    int insert(@Param("userId") Long userId, @Param("productId") Long productId);

    @Delete("DELETE FROM wishlist WHERE user_id = #{userId} AND product_id = #{productId}")
    int delete(@Param("userId") Long userId, @Param("productId") Long productId);
}
