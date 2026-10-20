package com.technova.shop.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class Product {

    private Long id;

    private String name;

    private BigDecimal price;

    private Integer stock;

    private Long categoryId;

    private String image;

    private String description;

    private LocalDateTime createTime;

    // =========================================================
    // PRODUCT DETAILS
    // =========================================================

    private BigDecimal discountPrice;

    private Double rating;

    private Integer reviewCount;

    /**
     * JSON string containing product specifications.
     * Example:
     * {"RAM":"8GB","Storage":"256GB","Display":"6.4 inch"}
     */
    private String specs;

    private Boolean isFeatured;

    private Integer viewCount;

    /**
     * Soft delete flag.
     * false = active
     * true  = deleted
     */
    private Boolean isDeleted;

    // =========================================================
    // CATEGORY INFORMATION
    // =========================================================

    /**
     * Parent category name.
     *
     * Example:
     * Phones
     * Laptops
     * Audio
     */
    private String categoryName;

    /**
     * Subcategory name.
     *
     * Example:
     * Flagship
     * Budget
     * Gaming
     * Earbuds
     */
    private String subcategoryName;

    private List<ProductImage> images;
}