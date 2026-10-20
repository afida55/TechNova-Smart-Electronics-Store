package com.technova.shop.controller;

import com.technova.shop.dto.AddCartRequest;
import com.technova.shop.dto.ApiResponse;
import com.technova.shop.dto.CartItemView;
import com.technova.shop.dto.UpdateQuantityRequest;
import com.technova.shop.service.CartService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<List<CartItemView>> getCart(HttpServletRequest req) {
        return ApiResponse.success(cartService.getCart(userId(req)));
    }

    @PostMapping
    public ApiResponse<Void> add(HttpServletRequest req, @Valid @RequestBody AddCartRequest body) {
        cartService.addToCart(userId(req), body.getProductId(), body.getQuantity());
        return ApiResponse.success("Added to cart", null);
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateQuantity(HttpServletRequest req, @PathVariable Long id, @Valid @RequestBody UpdateQuantityRequest body) {
        cartService.updateQuantity(userId(req), id, body.getQuantity());
        return ApiResponse.success(null);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> remove(HttpServletRequest req, @PathVariable Long id) {
        cartService.removeItem(userId(req), id);
        return ApiResponse.success(null);
    }

    private Long userId(HttpServletRequest req) {
        return (Long) req.getAttribute("userId");
    }
}
