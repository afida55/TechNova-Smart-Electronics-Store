package com.technova.shop.controller;

import com.technova.shop.dto.ApiResponse;
import com.technova.shop.entity.Order;
import com.technova.shop.entity.OrderItem;
import com.technova.shop.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;


    // =========================================================
    // GET ALL ACTIVE ORDERS
    // =========================================================

    /**
     * Get all active orders.
     *
     * GET /api/admin/orders
     */
    @GetMapping
    public ApiResponse<List<Order>> getAllOrders() {

        return ApiResponse.success(
                orderService.getAllOrders()
        );
    }


    // =========================================================
    // GET ALL DELETED ORDERS
    // =========================================================

    /**
     * Get all soft-deleted orders.
     *
     * GET /api/admin/orders/deleted
     */
    @GetMapping("/deleted")
    public ApiResponse<List<Order>> getDeletedOrders() {

        return ApiResponse.success(
                orderService.getDeletedOrders()
        );
    }


    // =========================================================
    // GET ONE ORDER
    // =========================================================

    /**
     * Get one order.
     *
     * GET /api/admin/orders/{id}
     *
     * Admin can view both active and deleted orders.
     */
    @GetMapping("/{id}")
    public ApiResponse<Order> getOrderDetail(
            @PathVariable Long id
    ) {

        return ApiResponse.success(
                orderService.getAdminOrderDetail(id)
        );
    }


    // =========================================================
    // GET ORDER ITEMS
    // =========================================================

    /**
     * Get items of one order.
     *
     * GET /api/admin/orders/{id}/items
     */
    @GetMapping("/{id}/items")
    public ApiResponse<List<OrderItem>> getOrderItems(
            @PathVariable Long id
    ) {

        return ApiResponse.success(
                orderService.getAdminOrderItems(id)
        );
    }


    // =========================================================
    // UPDATE ORDER STATUS
    // =========================================================

    /**
     * Update order status.
     *
     * PUT /api/admin/orders/{id}/status
     *
     * pending -> paid -> shipped -> completed
     *
     * pending -> cancelled
     */
    @PutMapping("/{id}/status")
    public ApiResponse<Void> updateStatus(
            @PathVariable Long id,
            @RequestBody StatusBody body
    ) {

        orderService.updateStatus(
                id,
                body.getStatus()
        );

        return ApiResponse.success(
                "Order status updated",
                null
        );
    }


    // =========================================================
    // SOFT DELETE ORDER
    // =========================================================

    /**
     * Soft-delete an order.
     *
     * DELETE /api/admin/orders/{id}
     *
     * This does NOT:
     * - cancel the order
     * - change the status
     * - restore stock
     * - delete order items
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteOrder(
            @PathVariable Long id
    ) {

        orderService.deleteOrder(id);

        return ApiResponse.success(
                "Order deleted",
                null
        );
    }
    @DeleteMapping("/deleted/permanent")
    public ApiResponse<Void> permanentlyDeleteDeletedOrders() {
        orderService.permanentlyDeleteDeletedOrders();
        return ApiResponse.success(
                "Deleted orders permanently removed",
                null
        );
    }

    // =========================================================
    // RESTORE ORDER
    // =========================================================

    /**
     * Restore a soft-deleted order.
     *
     * PUT /api/admin/orders/{id}/restore
     */
    @PutMapping("/{id}/restore")
    public ApiResponse<Void> restoreOrder(
            @PathVariable Long id
    ) {

        orderService.restoreOrder(id);

        return ApiResponse.success(
                "Order restored",
                null
        );
    }


    // =========================================================
    // STATUS REQUEST BODY
    // =========================================================

    @Data
    public static class StatusBody {
        private String status;
    }
}