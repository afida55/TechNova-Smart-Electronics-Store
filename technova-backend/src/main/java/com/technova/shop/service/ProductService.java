package com.technova.shop.service;

import com.technova.shop.dto.PageResult;
import com.technova.shop.dto.ProductQueryParams;
import com.technova.shop.entity.Product;

import java.util.List;

public interface ProductService {

    // USER SIDE
    PageResult<Product> search(ProductQueryParams params);

    Product getById(Long id);

    List<Product> getRelated(Long productId);


    // ADMIN SIDE
    List<Product> getAllProducts();

    Product createProduct(Product product);

    Product updateProduct(
            Long id,
            Product product
    );

    void deleteProduct(Long id);

    void restoreProduct(Long id);
}