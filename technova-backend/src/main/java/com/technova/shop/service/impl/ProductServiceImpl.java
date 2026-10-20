package com.technova.shop.service.impl;

import com.technova.shop.dto.PageResult;
import com.technova.shop.dto.ProductQueryParams;
import com.technova.shop.entity.Product;
import com.technova.shop.entity.ProductImage;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.ProductMapper;
import com.technova.shop.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductMapper productMapper;


    // =========================================================
    // USER SIDE
    // =========================================================

    @Override
    public PageResult<Product> search(ProductQueryParams params) {

        int page = Math.max(params.getPage(), 1);

        int pageSize =
                Math.min(
                        Math.max(params.getPageSize(), 1),
                        100
                );

        int offset =
                (page - 1) * pageSize;

        List<Product> list =
                productMapper.search(
                        params,
                        offset,
                        pageSize
                );

        // Attach all product images
        attachImages(list);

        long total =
                productMapper.count(params);

        return new PageResult<>(
                list,
                total,
                page,
                pageSize
        );
    }


    @Override
    public Product getById(Long id) {

        Product product =
                productMapper.findById(id);

        if (product == null) {
            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }

        productMapper.incrementViewCount(id);

        // Attach all product images
        attachImages(List.of(product));

        return product;
    }


    @Override
    public List<Product> getRelated(Long productId) {

        Product product =
                getById(productId);

        List<Product> related =
                productMapper.findRelated(
                        product.getCategoryId(),
                        productId,
                        4
                );

        // Attach images to related products
        attachImages(related);

        return related;
    }


    // =========================================================
    // ADMIN SIDE
    // =========================================================

    @Override
    public List<Product> getAllProducts() {

        List<Product> products =
                productMapper.findAll();

        // Attach images
        attachImages(products);

        return products;
    }


    @Override
    public Product createProduct(Product product) {

        if (product.getName() == null ||
                product.getName().trim().isEmpty()) {

            throw new BusinessException(
                    "Product name is required"
            );
        }

        // specs is a MySQL JSON column.
        // Make sure it always receives valid JSON.
        if (product.getSpecs() == null ||
                product.getSpecs().trim().isEmpty()) {

            product.setSpecs("{}");
        }

        productMapper.insert(product);

        Product created =
                productMapper.findById(
                        product.getId()
                );

        if (created != null) {
            attachImages(List.of(created));
        }

        return created;
    }


    @Override
    public Product updateProduct(
            Long id,
            Product product
    ) {

        Product existing =
                productMapper.findAnyById(id);

        if (existing == null) {

            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }

        if (product.getName() == null ||
                product.getName().trim().isEmpty()) {

            throw new BusinessException(
                    "Product name is required"
            );
        }

        product.setId(id);

        productMapper.update(product);

        /*
         * Use findAnyById here because an admin may
         * update a product even if it is currently deleted.
         */
        Product updated =
                productMapper.findAnyById(id);

        if (updated != null) {
            attachImages(List.of(updated));
        }

        return updated;
    }


    @Override
    public void deleteProduct(Long id) {

        /*
         * Use findAnyById instead of findById.
         *
         * findById() only finds active products.
         */
        Product existing =
                productMapper.findAnyById(id);

        if (existing == null) {

            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }

        productMapper.deleteById(id);
    }


    @Override
    public void restoreProduct(Long id) {

        /*
         * This can find both active and deleted products.
         */
        Product existing =
                productMapper.findAnyById(id);

        if (existing == null) {

            throw new BusinessException(
                    404,
                    "Product not found"
            );
        }

        productMapper.restoreById(id);
    }


    // =========================================================
    // PRODUCT IMAGES
    // =========================================================

    private void attachImages(List<Product> products) {

        if (products == null ||
                products.isEmpty()) {

            return;
        }

        List<Long> productIds =
                products.stream()
                        .map(Product::getId)
                        .filter(id -> id != null)
                        .toList();

        if (productIds.isEmpty()) {
            return;
        }

        List<ProductImage> images =
                productMapper.findImagesByProductIds(
                        productIds
                );

        Map<Long, List<ProductImage>> imagesByProduct =
                images.stream()
                        .collect(
                                Collectors.groupingBy(
                                        ProductImage::getProductId
                                )
                        );

        for (Product product : products) {

            product.setImages(
                    imagesByProduct.getOrDefault(
                            product.getId(),
                            Collections.emptyList()
                    )
            );
        }
    }
}