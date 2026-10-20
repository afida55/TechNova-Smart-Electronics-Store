package com.technova.shop.service;

import com.technova.shop.entity.Category;

import java.util.List;

public interface CategoryService {

    // USER SIDE
    List<Category> getTree();

    // ADMIN SIDE
    List<Category> getAllCategories();

    Category createCategory(Category category);

    Category updateCategory(Long id, Category category);

    void deleteCategory(Long id);

    void restoreCategory(Long id);
}