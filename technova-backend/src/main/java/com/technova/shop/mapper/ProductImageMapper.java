package com.technova.shop.mapper;

import com.technova.shop.entity.ProductImage;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface ProductImageMapper {

    @Select("""
        SELECT
            id,
            product_id AS productId,
            color,
            image,
            is_primary AS isPrimary
        FROM product_image
        WHERE product_id = #{productId}
        ORDER BY is_primary DESC, id ASC
    """)
    List<ProductImage> findByProductId(Long productId);
}