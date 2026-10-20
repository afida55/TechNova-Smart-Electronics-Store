package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.Category;
import com.technova.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class AdminCategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<Category>> getAllCategories() {
        return ApiResponse.success(
                categoryService.getAllCategories()
        );
    }

    @PostMapping
    public ApiResponse<Category> createCategory(
            @RequestBody Category category
    ) {
        return ApiResponse.success(
                "Category created",
                categoryService.createCategory(category)
        );
    }

    @PutMapping("/{id}")
    public ApiResponse<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category
    ) {
        return ApiResponse.success(
                "Category updated",
                categoryService.updateCategory(id, category)
        );
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(
            @PathVariable Long id
    ) {
        categoryService.deleteCategory(id);

        return ApiResponse.success(
                "Category deleted",
                null
        );
    }

    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restoreCategory(
            @PathVariable Long id
    ) {
        categoryService.restoreCategory(id);

        return ApiResponse.success(
                "Category restored",
                null
        );
    }
}