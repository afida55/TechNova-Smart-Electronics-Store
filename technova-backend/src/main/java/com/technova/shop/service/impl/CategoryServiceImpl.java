package com.technova.shop.service.impl;

import com.technova.shop.entity.Category;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.CategoryMapper;
import com.technova.shop.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;

    // =========================================================
    // USER SIDE
    // =========================================================

    @Override
    public List<Category> getTree() {

        // Only active categories should appear to customers.
        List<Category> all = categoryMapper.findAllActive();

        Map<Long, Category> byId = new HashMap<>();

        for (Category category : all) {
            byId.put(category.getId(), category);
        }

        List<Category> roots = all.stream()
                .filter(category ->
                        category.getParentId() == null ||
                                category.getParentId() == 0
                )
                .collect(Collectors.toList());

        for (Category category : all) {

            if (category.getParentId() != null &&
                    category.getParentId() != 0) {

                Category parent = byId.get(category.getParentId());

                if (parent != null) {
                    parent.getChildren().add(category);
                }
            }
        }

        return roots;
    }

    // =========================================================
    // ADMIN SIDE
    // =========================================================

    @Override
    public List<Category> getAllCategories() {

        // Admin needs to see both active and deleted categories.
        return categoryMapper.findAll();
    }

    @Override
    public Category createCategory(Category category) {

        if (category.getName() == null ||
                category.getName().trim().isEmpty()) {

            throw new BusinessException("Category name is required");
        }

        category.setName(category.getName().trim());
        category.setIsDeleted(false);

        categoryMapper.insert(category);

        return categoryMapper.findById(category.getId());
    }

    @Override
    public Category updateCategory(
            Long id,
            Category category
    ) {

        Category existing = categoryMapper.findAnyById(id);

        if (existing == null) {
            throw new BusinessException(404, "Category not found");
        }

        if (Boolean.TRUE.equals(existing.getIsDeleted())) {
            throw new BusinessException(
                    400,
                    "Deleted category cannot be edited. Restore it first."
            );
        }

        if (category.getName() == null ||
                category.getName().trim().isEmpty()) {

            throw new BusinessException("Category name is required");
        }

        category.setId(id);
        category.setName(category.getName().trim());

        categoryMapper.update(category);

        return categoryMapper.findById(id);
    }

    @Override
    public void deleteCategory(Long id) {

        Category existing = categoryMapper.findAnyById(id);

        if (existing == null) {
            throw new BusinessException(404, "Category not found");
        }

        if (Boolean.TRUE.equals(existing.getIsDeleted())) {
            throw new BusinessException(
                    400,
                    "Category is already deleted"
            );
        }

        categoryMapper.deleteById(id);
    }

    @Override
    public void restoreCategory(Long id) {

        Category existing = categoryMapper.findAnyById(id);

        if (existing == null) {
            throw new BusinessException(404, "Category not found");
        }

        if (!Boolean.TRUE.equals(existing.getIsDeleted())) {
            throw new BusinessException(
                    400,
                    "Category is already active"
            );
        }

        categoryMapper.restoreById(id);
    }
}