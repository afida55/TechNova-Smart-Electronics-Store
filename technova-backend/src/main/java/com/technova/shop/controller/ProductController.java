package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.dto.PageResult;
import com.technova.shop.dto.ProductQueryParams;
import com.technova.shop.entity.Product;
import com.technova.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // GET /api/products?keyword=&categoryId=&minPrice=&maxPrice=&inStockOnly=&sortBy=&page=&pageSize=
    @GetMapping
    public ApiResponse<PageResult<Product>> search(ProductQueryParams params) {
        return ApiResponse.success(productService.search(params));
    }

    @GetMapping("/{id}")
    public ApiResponse<Product> getById(@PathVariable Long id) {
        return ApiResponse.success(productService.getById(id));
    }

    @GetMapping("/{id}/related")
    public ApiResponse<List<Product>> getRelated(@PathVariable Long id) {
        return ApiResponse.success(productService.getRelated(id));
    }
}
