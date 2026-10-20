package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.dto.CheckoutRequest;
import com.technova.shop.entity.Order;
import com.technova.shop.entity.OrderItem;
import com.technova.shop.service.OrderService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * Place a new order.
     *
     * POST /api/orders
     *
     * Requires a logged-in user.
     */
    @PostMapping
    public ApiResponse<Order> checkout(
            HttpServletRequest req,
            @Valid @RequestBody CheckoutRequest body
    ) {
        return ApiResponse.success(
                "Order placed",
                orderService.checkout(userId(req), body)
        );
    }

    /**
     * Get the current user's orders.
     *
     * GET /api/orders
     *
     * Only the authenticated user's orders are returned.
     */
    @GetMapping
    public ApiResponse<List<Order>> getOrders(
            HttpServletRequest req
    ) {
        return ApiResponse.success(
                orderService.getOrders(userId(req))
        );
    }

    /**
     * Get details of one of the current user's orders.
     *
     * GET /api/orders/{id}
     */
    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderDetail(
            HttpServletRequest req,
            @PathVariable Long id
    ) {
        return ApiResponse.success(
                orderService.getOrderDetail(
                        userId(req),
                        id
                )
        );
    }

    /**
     * Get items belonging to one of the current user's orders.
     *
     * GET /api/orders/{id}/items
     *
     * The getOrderDetail() call performs the ownership check
     * before the order items are returned.
     */
    @GetMapping("/{id}/items")
    public ApiResponse<List<OrderItem>> getOrderItems(
            HttpServletRequest req,
            @PathVariable Long id
    ) {
        // Ownership check
        orderService.getOrderDetail(
                userId(req),
                id
        );

        return ApiResponse.success(
                orderService.getOrderItems(id)
        );
    }

    /**
     * Cancel one of the current user's pending orders.
     *
     * PUT /api/orders/{id}/cancel
     *
     * Only the logged-in owner of the order can cancel it.
     */
    @PutMapping("/{id}/cancel")
    public ApiResponse<Void> cancelOrder(
            HttpServletRequest req,
            @PathVariable Long id
    ) {
        orderService.cancelOrder(
                userId(req),
                id
        );

        return ApiResponse.success(
                "Order cancelled",
                null
        );
    }

    /**
     * Delete one of the current user's cancelled orders.
     *
     * DELETE /api/orders/{id}
     *
     * Only cancelled orders can be deleted.
     * The user can only delete their own order.
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteOrder(
            HttpServletRequest req,
            @PathVariable Long id
    ) {
        orderService.deleteCancelledOrder(
                userId(req),
                id
        );

        return ApiResponse.success(
                "Order deleted",
                Boolean.TRUE
        );
    }

    /**
     * Extract authenticated user ID from the request.
     *
     * AuthInterceptor places this value after validating
     * the JWT token.
     */
    private Long userId(HttpServletRequest req) {
        return (Long) req.getAttribute("userId");
    }
}