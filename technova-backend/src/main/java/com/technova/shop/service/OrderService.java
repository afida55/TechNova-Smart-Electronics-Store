package com.technova.shop.service;

import com.technova.shop.dto.CheckoutRequest;
import com.technova.shop.entity.Order;
import com.technova.shop.entity.OrderItem;

import java.util.List;

public interface OrderService {

    // =========================
    // USER SIDE
    // =========================

    /**
     * Place an order for the logged-in user.
     */
    Order checkout(Long userId, CheckoutRequest request);

    /**
     * Get orders belonging to the logged-in user.
     */
    List<Order> getOrders(Long userId);

    /**
     * Get one order belonging to the logged-in user.
     */
    Order getOrderDetail(Long userId, Long orderId);

    /**
     * Get items belonging to an order.
     */
    List<OrderItem> getOrderItems(Long orderId);

    /**
     * Cancel one of the current user's pending orders.
     */
    void cancelOrder(Long userId, Long orderId);

    /**
     * Permanently delete one of the current user's cancelled orders.
     */
    void deleteCancelledOrder(Long userId, Long orderId);


    // =========================
    // ADMIN SIDE
    // =========================

    /**
     * Get all active orders.
     */
    List<Order> getAllOrders();

    /**
     * Get all orders that were soft-deleted by admin.
     */
    List<Order> getDeletedOrders();

    /**
     * Get one order, including deleted orders.
     */
    Order getAdminOrderDetail(Long orderId);

    /**
     * Get items of an admin order.
     */
    List<OrderItem> getAdminOrderItems(Long orderId);

    /**
     * Update order status.
     */
    void updateStatus(Long orderId, String nextStatus);

    /**
     * Soft-delete an order.
     */
    void deleteOrder(Long orderId);

    /**
     * Restore a soft-deleted order.
     */
    void restoreOrder(Long orderId);
    void permanentlyDeleteDeletedOrders();
}