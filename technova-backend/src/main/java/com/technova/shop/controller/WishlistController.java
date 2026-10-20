package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.Product;
import com.technova.shop.service.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ApiResponse<List<Product>> getWishlist(HttpServletRequest req) {
        return ApiResponse.success(wishlistService.getWishlist(userId(req)));
    }

    @PostMapping("/{productId}")
    public ApiResponse<Void> add(HttpServletRequest req, @PathVariable Long productId) {
        wishlistService.add(userId(req), productId);
        return ApiResponse.success("Added to wishlist", null);
    }

    @DeleteMapping("/{productId}")
    public ApiResponse<Void> remove(HttpServletRequest req, @PathVariable Long productId) {
        wishlistService.remove(userId(req), productId);
        return ApiResponse.success(null);
    }

    private Long userId(HttpServletRequest req) {
        return (Long) req.getAttribute("userId");
    }
}
