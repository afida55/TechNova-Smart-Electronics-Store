package com.technova.shop.service;

import com.technova.shop.entity.Product;

import java.util.List;

public interface WishlistService {
    List<Product> getWishlist(Long userId);
    void add(Long userId, Long productId);
    void remove(Long userId, Long productId);
}
