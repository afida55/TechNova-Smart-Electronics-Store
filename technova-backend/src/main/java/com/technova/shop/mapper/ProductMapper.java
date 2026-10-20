package com.technova.shop.mapper;

import com.technova.shop.dto.ProductQueryParams;
import com.technova.shop.entity.Product;
import com.technova.shop.entity.ProductImage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface ProductMapper {

    // =========================================================
    // USER SIDE
    // =========================================================

    @Select("""
            <script>
                SELECT
                    p.*,
                    c.name AS categoryName
                FROM product p
                LEFT JOIN category c
                    ON p.category_id = c.id
                WHERE p.is_deleted = 0

                <if test="params.keyword != null and params.keyword != ''">
                    AND (
                        p.name LIKE CONCAT('%', #{params.keyword}, '%')
                        OR p.description LIKE CONCAT('%', #{params.keyword}, '%')
                    )
                </if>

                <if test="params.categoryId != null">
                    AND p.category_id = #{params.categoryId}
                </if>

                <if test="params.minPrice != null">
                    AND p.price &gt;= #{params.minPrice}
                </if>

                <if test="params.maxPrice != null">
                    AND p.price &lt;= #{params.maxPrice}
                </if>

                <if test="params.inStockOnly != null and params.inStockOnly">
                    AND p.stock &gt; 0
                </if>

                <choose>
                    <when test="params.sortBy == 'price_asc'">
                        ORDER BY p.price ASC
                    </when>

                    <when test="params.sortBy == 'price_desc'">
                        ORDER BY p.price DESC
                    </when>

                    <when test="params.sortBy == 'rating'">
                        ORDER BY p.rating DESC
                    </when>

                    <when test="params.sortBy == 'popular'">
                        ORDER BY p.view_count DESC
                    </when>

                    <when test="params.sortBy == 'newest'">
                        ORDER BY p.create_time DESC
                    </when>

                    <otherwise>
                        ORDER BY p.create_time DESC
                    </otherwise>
                </choose>

                LIMIT #{offset}, #{pageSize}
            </script>
            """)
    List<Product> search(
            @Param("params") ProductQueryParams params,
            @Param("offset") int offset,
            @Param("pageSize") int pageSize
    );


    @Select("""
            <script>
                SELECT COUNT(*)
                FROM product p
                WHERE p.is_deleted = 0

                <if test="params.keyword != null and params.keyword != ''">
                    AND (
                        p.name LIKE CONCAT('%', #{params.keyword}, '%')
                        OR p.description LIKE CONCAT('%', #{params.keyword}, '%')
                    )
                </if>

                <if test="params.categoryId != null">
                    AND p.category_id = #{params.categoryId}
                </if>

                <if test="params.minPrice != null">
                    AND p.price &gt;= #{params.minPrice}
                </if>

                <if test="params.maxPrice != null">
                    AND p.price &lt;= #{params.maxPrice}
                </if>

                <if test="params.inStockOnly != null and params.inStockOnly">
                    AND p.stock &gt; 0
                </if>
            </script>
            """)
    long count(
            @Param("params") ProductQueryParams params
    );


    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.id = #{id}
              AND p.is_deleted = 0
            """)
    Product findById(Long id);


    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.id = #{id}
            """)
    Product findAnyById(Long id);


    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.category_id = #{categoryId}
              AND p.id != #{productId}
              AND p.is_deleted = 0
            ORDER BY p.rating DESC, p.view_count DESC
            LIMIT #{limit}
            """)
    List<Product> findRelated(
            @Param("categoryId") Long categoryId,
            @Param("productId") Long productId,
            @Param("limit") int limit
    );


    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.id = #{id}
            FOR UPDATE
            """)
    Product findByIdForUpdate(Long id);


    // =========================================================
    // STOCK
    // =========================================================

    @Update("""
            UPDATE product
            SET stock = stock - #{quantity}
            WHERE id = #{productId}
              AND stock >= #{quantity}
            """)
    int decrementStock(
            @Param("productId") Long productId,
            @Param("quantity") int quantity
    );


    @Update("""
            UPDATE product
            SET stock = stock + #{quantity}
            WHERE id = #{productId}
            """)
    int restoreStock(
            @Param("productId") Long productId,
            @Param("quantity") int quantity
    );


    // =========================================================
    // VIEW COUNT
    // =========================================================

    @Update("""
            UPDATE product
            SET view_count = COALESCE(view_count, 0) + 1
            WHERE id = #{id}
            """)
    int incrementViewCount(Long id);


    // =========================================================
    // FEATURED / TRENDING
    // =========================================================

    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.is_deleted = 0
              AND p.is_featured = 1
            ORDER BY p.rating DESC, p.view_count DESC
            LIMIT #{limit}
            """)
    List<Product> findFeatured(int limit);


    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            WHERE p.is_deleted = 0
            ORDER BY p.view_count DESC, p.rating DESC
            LIMIT #{limit}
            """)
    List<Product> findTrending(int limit);


    // =========================================================
    // ADMIN
    // =========================================================

    @Select("""
            SELECT
                p.*,
                c.name AS categoryName
            FROM product p
            LEFT JOIN category c
                ON p.category_id = c.id
            ORDER BY p.id DESC
            """)
    List<Product> findAll();


    @Insert("""
            INSERT INTO product (
                name,
                price,
                stock,
                category_id,
                image,
                description,
                create_time,
                discount_price,
                rating,
                review_count,
                specs,
                is_featured,
                view_count,
                is_deleted
            )
            VALUES (
                #{name},
                #{price},
                #{stock},
                #{categoryId},
                #{image},
                #{description},
                NOW(),
                #{discountPrice},
                #{rating},
                #{reviewCount},
                #{specs},
                #{isFeatured},
                #{viewCount},
                #{isDeleted}
            )
            """)
    @Options(useGeneratedKeys = true, keyProperty = "id")
    int insert(Product product);


    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    @Select("""
            <script>
                SELECT
                    id,
                    product_id AS productId,
                    color,
                    image,
                    is_primary AS isPrimary
                FROM product_image
                WHERE product_id IN
                <foreach collection="productIds"
                         item="productId"
                         open="("
                         separator=","
                         close=")">
                    #{productId}
                </foreach>
                ORDER BY
                    product_id ASC,
                    is_primary DESC,
                    id ASC
            </script>
            """)
    List<ProductImage> findImagesByProductIds(
            @Param("productIds") List<Long> productIds
    );


    // =========================================================
    // UPDATE
    // =========================================================

    @Update("""
            UPDATE product
            SET
                name = #{name},
                price = #{price},
                stock = #{stock},
                category_id = #{categoryId},
                image = #{image},
                description = #{description},
                discount_price = #{discountPrice},
                rating = #{rating},
                review_count = #{reviewCount},
                specs = #{specs},
                is_featured = #{isFeatured}
            WHERE id = #{id}
            """)
    int update(Product product);


    // =========================================================
    // SOFT DELETE / RESTORE
    // =========================================================

    @Update("""
            UPDATE product
            SET is_deleted = 1
            WHERE id = #{id}
            """)
    int deleteById(Long id);


    @Update("""
            UPDATE product
            SET is_deleted = 0
            WHERE id = #{id}
            """)
    int restoreById(Long id);


    // =========================================================
    // ADMIN DASHBOARD
    // =========================================================

    @Select("""
            SELECT COUNT(*)
            FROM product
            WHERE is_deleted = 0
            """)
    long countActiveProducts();


    @Select("""
            SELECT COUNT(*)
            FROM product
            WHERE is_deleted = 0
              AND stock <= 5
            """)
    long countLowStockProducts();


    @Select("""
            SELECT COUNT(*)
            FROM product
            WHERE is_deleted = 0
            """)
    long countAllProducts();
}