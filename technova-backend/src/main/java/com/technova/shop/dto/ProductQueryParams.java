package com.technova.shop.dto;

import lombok.Data;
import java.math.BigDecimal;

/** Bound from query string: /api/products?keyword=&categoryId=&minPrice=&maxPrice=... */
@Data
public class ProductQueryParams {
    private String keyword;
    private Long categoryId;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean inStockOnly;
    // relevance | price_asc | price_desc | rating | newest
    private String sortBy = "relevance";
    private int page = 1;
    private int pageSize = 12;
}
