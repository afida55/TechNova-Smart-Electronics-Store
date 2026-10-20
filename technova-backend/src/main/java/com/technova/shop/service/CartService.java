package com.technova.shop.service;

import com.technova.shop.dto.CartItemView;

import java.util.List;

public interface CartService {
    List<CartItemView> getCart(Long userId);
    void addToCart(Long userId, Long productId, int quantity);
    void updateQuantity(Long userId, Long cartItemId, int quantity);
    void removeItem(Long userId, Long cartItemId);
}
