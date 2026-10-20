package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.Product;
import com.technova.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;


    // =========================================================
    // GET ALL PRODUCTS
    // =========================================================

    @GetMapping
    public ApiResponse<List<Product>> getAllProducts() {

        return ApiResponse.success(
                productService.getAllProducts()
        );
    }


    // =========================================================
    // CREATE PRODUCT
    // =========================================================

    @PostMapping
    public ApiResponse<Product> createProduct(
            @RequestBody Product product
    ) {

        return ApiResponse.success(
                "Product created",
                productService.createProduct(product)
        );
    }


    // =========================================================
    // UPDATE PRODUCT
    // =========================================================

    @PutMapping("/{id}")
    public ApiResponse<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody Product product
    ) {

        return ApiResponse.success(
                "Product updated",
                productService.updateProduct(
                        id,
                        product
                )
        );
    }


    // =========================================================
    // SOFT DELETE PRODUCT
    // =========================================================

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProduct(
            @PathVariable Long id
    ) {

        productService.deleteProduct(id);

        return ApiResponse.success(
                null
        );
    }


    // =========================================================
    // RESTORE PRODUCT
    // =========================================================

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restoreProduct(
            @PathVariable Long id
    ) {

        productService.restoreProduct(id);

        return ApiResponse.success(
                "Product restored",
                null
        );
    }
}