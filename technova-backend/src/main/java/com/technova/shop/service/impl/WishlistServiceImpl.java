package com.technova.shop.service.impl;

import com.technova.shop.entity.Product;
import com.technova.shop.mapper.WishlistMapper;
import com.technova.shop.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistMapper wishlistMapper;

    @Override
    public List<Product> getWishlist(Long userId) {
        return wishlistMapper.findProductsByUserId(userId);
    }

    @Override
    public void add(Long userId, Long productId) {
        if (wishlistMapper.exists(userId, productId) == 0) {
            wishlistMapper.insert(userId, productId);
        }
    }

    @Override
    public void remove(Long userId, Long productId) {
        wishlistMapper.delete(userId, productId);
    }
}
