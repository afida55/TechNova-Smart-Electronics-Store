package com.technova.shop.service.impl;

import com.technova.shop.dto.CartItemView;
import com.technova.shop.dto.CheckoutRequest;
import com.technova.shop.entity.Order;
import com.technova.shop.entity.OrderItem;
import com.technova.shop.exception.BusinessException;
import com.technova.shop.mapper.CartMapper;
import com.technova.shop.mapper.OrderItemMapper;
import com.technova.shop.mapper.OrderMapper;
import com.technova.shop.mapper.ProductMapper;
import com.technova.shop.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    /*
     * ORDER STATUS FLOW
     *
     * paid -> shipped -> completed
     *
     * cancelled is a separate outcome and can happen
     * while the order is still paid.
     */
    private static final List<String> STATUS_FLOW =
            List.of("paid", "shipped", "completed");

    private final CartMapper cartMapper;
    private final ProductMapper productMapper;
    private final OrderMapper orderMapper;
    private final OrderItemMapper orderItemMapper;


    // =========================================================
    // USER SIDE - CHECKOUT
    // =========================================================

    @Override
    @Transactional
    public Order checkout(
            Long userId,
            CheckoutRequest request
    ) {

        boolean isBuyNow =
                Boolean.TRUE.equals(request.getBuyNow());

        BigDecimal total = BigDecimal.ZERO;


        // =====================================================
        // BUY NOW CHECKOUT
        // =====================================================

        if (isBuyNow) {

            /*
             * BUY NOW DOES NOT USE THE CART.
             *
             * The frontend sends the selected product
             * through request.items.
             *
             * Example:
             *
             * items = [
             *     {
             *         productId: 15,
             *         quantity: 2
             *     }
             * ]
             *
             * The user's existing cart remains untouched.
             */

            if (request.getItems() == null ||
                    request.getItems().isEmpty()) {

                throw new BusinessException(
                        "No product selected"
                );
            }


            // -------------------------------------------------
            // Validate Buy Now items and calculate total
            // -------------------------------------------------

            for (
                    CheckoutRequest.CheckoutItemRequest requestedItem
                    : request.getItems()
            ) {

                if (requestedItem.getProductId() == null) {

                    throw new BusinessException(
                            "Product ID is required"
                    );
                }

                if (requestedItem.getQuantity() == null ||
                        requestedItem.getQuantity() <= 0) {

                    throw new BusinessException(
                            "Invalid product quantity"
                    );
                }


                var product =
                        productMapper.findById(
                                requestedItem.getProductId()
                        );

                if (product == null) {

                    throw new BusinessException(
                            "Product not found: "
                                    + requestedItem.getProductId()
                    );
                }


                if (requestedItem.getQuantity() >
                        product.getStock()) {

                    throw new BusinessException(
                            "\""
                                    + product.getName()
                                    + "\" no longer has enough stock"
                    );
                }


                total = total.add(
                        product.getPrice().multiply(
                                BigDecimal.valueOf(
                                        requestedItem.getQuantity()
                                )
                        )
                );
            }


        } else {

            // =================================================
            // NORMAL CART CHECKOUT
            // =================================================

            /*
             * Normal checkout continues to use the user's cart.
             */

            List<CartItemView> items =
                    cartMapper.findViewByUserId(userId);

            if (items.isEmpty()) {

                throw new BusinessException(
                        "Your cart is empty"
                );
            }


            // -------------------------------------------------
            // Validate cart stock and calculate total
            // -------------------------------------------------

            for (CartItemView item : items) {

                if (item.getQuantity() <= 0) {

                    throw new BusinessException(
                            "Invalid quantity for product: "
                                    + item.getProductName()
                    );
                }


                if (item.getQuantity() > item.getStock()) {

                    throw new BusinessException(
                            "\""
                                    + item.getProductName()
                                    + "\" no longer has enough stock"
                    );
                }


                total = total.add(
                        item.getPrice().multiply(
                                BigDecimal.valueOf(
                                        item.getQuantity()
                                )
                        )
                );
            }
        }


        // =====================================================
        // CREATE ORDER
        // =====================================================

        Order order = new Order();

        order.setOrderNo(
                generateOrderNo()
        );

        order.setUserId(
                userId
        );

        order.setTotalPrice(
                total
        );

        /*
         * Payment is considered successful when checkout
         * is completed.
         */
        order.setStatus(
                "paid"
        );

        /*
         * Order is active when first created.
         */
        order.setIsDeleted(
                false
        );

        order.setReceiverName(
                request.getReceiverName()
        );

        order.setReceiverPhone(
                request.getReceiverPhone()
        );

        order.setAddress(
                request.getAddress()
        );


        int inserted =
                orderMapper.insert(order);

        if (inserted == 0 ||
                order.getId() == null) {

            throw new BusinessException(
                    "Unable to create order"
            );
        }


        // =====================================================
        // CREATE ORDER ITEMS + REDUCE STOCK
        // =====================================================

        if (isBuyNow) {

            // -------------------------------------------------
            // BUY NOW ITEMS
            // -------------------------------------------------

            for (
                    CheckoutRequest.CheckoutItemRequest requestedItem
                    : request.getItems()
            ) {

                var product =
                        productMapper.findById(
                                requestedItem.getProductId()
                        );

                if (product == null) {

                    throw new BusinessException(
                            "Product not found: "
                                    + requestedItem.getProductId()
                    );
                }


                int quantity =
                        requestedItem.getQuantity();


                int decremented =
                        productMapper.decrementStock(
                                product.getId(),
                                quantity
                        );

                if (decremented == 0) {

                    throw new BusinessException(
                            "\""
                                    + product.getName()
                                    + "\" no longer has enough stock"
                    );
                }


                OrderItem orderItem =
                        new OrderItem();

                orderItem.setOrderId(
                        order.getId()
                );

                orderItem.setProductId(
                        product.getId()
                );

                orderItem.setQuantity(
                        quantity
                );

                orderItem.setPrice(
                        product.getPrice()
                );


                int itemInserted =
                        orderItemMapper.insert(
                                orderItem
                        );

                if (itemInserted == 0) {

                    throw new BusinessException(
                            "Unable to create order item"
                    );
                }
            }


            /*
             * IMPORTANT:
             *
             * DO NOT CLEAR THE CART HERE.
             *
             * Buy Now is completely independent from
             * the user's existing cart.
             */


        } else {

            // -------------------------------------------------
            // NORMAL CART ITEMS
            // -------------------------------------------------

            List<CartItemView> items =
                    cartMapper.findViewByUserId(userId);


            for (CartItemView item : items) {

                int decremented =
                        productMapper.decrementStock(
                                item.getProductId(),
                                item.getQuantity()
                        );

                if (decremented == 0) {

                    throw new BusinessException(
                            "\""
                                    + item.getProductName()
                                    + "\" no longer has enough stock"
                    );
                }


                OrderItem orderItem =
                        new OrderItem();

                orderItem.setOrderId(
                        order.getId()
                );

                orderItem.setProductId(
                        item.getProductId()
                );

                orderItem.setQuantity(
                        item.getQuantity()
                );

                orderItem.setPrice(
                        item.getPrice()
                );


                int itemInserted =
                        orderItemMapper.insert(
                                orderItem
                        );

                if (itemInserted == 0) {

                    throw new BusinessException(
                            "Unable to create order item"
                    );
                }
            }


            // -------------------------------------------------
            // CLEAR CART ONLY FOR NORMAL CHECKOUT
            // -------------------------------------------------

            cartMapper.clearByUserId(
                    userId
            );
        }


        return order;
    }


    // =========================================================
    // USER SIDE - GET ORDERS
    // =========================================================

    @Override
    public List<Order> getOrders(
            Long userId
    ) {

        return orderMapper.findByUserId(
                userId
        );
    }


    // =========================================================
    // USER SIDE - ORDER DETAIL
    // =========================================================

    @Override
    public Order getOrderDetail(
            Long userId,
            Long orderId
    ) {

        Order order =
                orderMapper.findById(
                        orderId
                );

        if (order == null ||
                order.getUserId() == null ||
                !order.getUserId().equals(userId)) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }

        return order;
    }


    // =========================================================
    // USER SIDE - ORDER ITEMS
    // =========================================================

    @Override
    public List<OrderItem> getOrderItems(
            Long orderId
    ) {

        return orderItemMapper.findByOrderId(
                orderId
        );
    }


    // =========================================================
    // USER SIDE - CANCEL ORDER
    // =========================================================

    @Override
    @Transactional
    public void cancelOrder(
            Long userId,
            Long orderId
    ) {

        Order order =
                orderMapper.findById(
                        orderId
                );

        if (order == null ||
                order.getUserId() == null ||
                !order.getUserId().equals(userId)) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        /*
         * An order can only be cancelled before shipping.
         *
         * Since checkout immediately creates a PAID order,
         * cancellation is allowed from PAID only.
         */
        if (!"paid".equalsIgnoreCase(
                order.getStatus()
        )) {

            throw new BusinessException(
                    "Only a paid order can be cancelled"
            );
        }


        // -----------------------------------------------------
        // RESTORE PRODUCT STOCK
        // -----------------------------------------------------

        List<OrderItem> items =
                orderItemMapper.findByOrderId(
                        orderId
                );


        for (OrderItem item : items) {

            int restored =
                    productMapper.restoreStock(
                            item.getProductId(),
                            item.getQuantity()
                    );

            if (restored == 0) {

                throw new BusinessException(
                        "Unable to restore stock for product ID: "
                                + item.getProductId()
                );
            }
        }


        // -----------------------------------------------------
        // CHANGE ORDER STATUS
        // -----------------------------------------------------

        int updated =
                orderMapper.updateStatus(
                        orderId,
                        userId,
                        "cancelled"
                );

        if (updated == 0) {

            throw new BusinessException(
                    "Unable to cancel order"
            );
        }
    }


    // =========================================================
    // USER SIDE - DELETE CANCELLED ORDER
    // =========================================================

    @Override
    @Transactional
    public void deleteCancelledOrder(
            Long userId,
            Long orderId
    ) {

        Order order =
                orderMapper.findById(
                        orderId
                );

        if (order == null ||
                order.getUserId() == null ||
                !order.getUserId().equals(userId)) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        // Only cancelled orders can be permanently deleted

        if (!"cancelled".equalsIgnoreCase(
                order.getStatus()
        )) {

            throw new BusinessException(
                    "Only cancelled orders can be deleted"
            );
        }


        // -----------------------------------------------------
        // Delete child records first
        // -----------------------------------------------------

        orderItemMapper.deleteByOrderId(
                orderId
        );


        // -----------------------------------------------------
        // Delete parent order
        // -----------------------------------------------------

        int deleted =
                orderMapper.deleteCancelledOrder(
                        orderId,
                        userId
                );

        if (deleted == 0) {

            throw new BusinessException(
                    "Unable to delete order"
            );
        }
    }


    // =========================================================
    // ADMIN - ACTIVE ORDERS
    // =========================================================

    @Override
    public List<Order> getAllOrders() {

        return orderMapper.findAll();
    }


    // =========================================================
    // ADMIN - DELETED ORDERS
    // =========================================================

    @Override
    public List<Order> getDeletedOrders() {

        return orderMapper.findDeleted();
    }


    // =========================================================
    // ADMIN - DELETE ORDER
    // =========================================================

    @Override
    @Transactional
    public void deleteOrder(
            Long orderId
    ) {

        Order order =
                orderMapper.findById(
                        orderId
                );

        if (order == null) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        /*
         * SOFT DELETE ONLY
         *
         * Do NOT:
         * - change status
         * - restore stock
         * - delete order items
         */

        int deleted =
                orderMapper.deleteByAdmin(
                        orderId
                );

        if (deleted == 0) {

            throw new BusinessException(
                    "Unable to delete order"
            );
        }
    }


    // =========================================================
    // ADMIN - RESTORE ORDER
    // =========================================================

    @Override
    @Transactional
    public void restoreOrder(
            Long orderId
    ) {

        Order order =
                orderMapper.findAnyById(
                        orderId
                );

        if (order == null) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        if (!Boolean.TRUE.equals(
                order.getIsDeleted()
        )) {

            throw new BusinessException(
                    "Order is already active"
            );
        }


        int restored =
                orderMapper.restoreByAdmin(
                        orderId
                );

        if (restored == 0) {

            throw new BusinessException(
                    "Unable to restore order"
            );
        }
    }


    // =========================================================
    // ADMIN - UPDATE ORDER STATUS
    // =========================================================

    @Override
    @Transactional
    public void updateStatus(
            Long orderId,
            String nextStatus
    ) {

        if (nextStatus == null ||
                nextStatus.trim().isEmpty()) {

            throw new BusinessException(
                    "Order status is required"
            );
        }


        nextStatus =
                nextStatus.trim().toLowerCase();


        // -----------------------------------------------------
        // Find active order
        // -----------------------------------------------------

        Order order =
                orderMapper.findById(
                        orderId
                );

        if (order == null) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        String currentStatus =
                order.getStatus();


        // =====================================================
        // CANCEL ORDER
        // =====================================================

        if ("cancelled".equals(
                nextStatus
        )) {

            if (!"paid".equalsIgnoreCase(
                    currentStatus
            )) {

                throw new BusinessException(
                        "Only a paid order can be cancelled"
                );
            }


            // -------------------------------------------------
            // Restore stock
            // -------------------------------------------------

            List<OrderItem> items =
                    orderItemMapper.findByOrderId(
                            orderId
                    );


            for (OrderItem item : items) {

                int restored =
                        productMapper.restoreStock(
                                item.getProductId(),
                                item.getQuantity()
                        );

                if (restored == 0) {

                    throw new BusinessException(
                            "Unable to restore stock for product ID: "
                                    + item.getProductId()
                    );
                }
            }


            // -------------------------------------------------
            // Cancel order
            // -------------------------------------------------

            int updated =
                    orderMapper.updateStatusByAdmin(
                            orderId,
                            "cancelled"
                    );

            if (updated == 0) {

                throw new BusinessException(
                        "Unable to cancel order"
                );
            }

            return;
        }


        // =====================================================
        // NORMAL STATUS FLOW
        // =====================================================

        int currentIdx =
                STATUS_FLOW.indexOf(
                        currentStatus
                );

        int nextIdx =
                STATUS_FLOW.indexOf(
                        nextStatus
                );


        if (nextIdx == -1) {

            throw new BusinessException(
                    "Unknown status: "
                            + nextStatus
            );
        }


        /*
         * Status must move exactly one step:
         *
         * paid      -> shipped
         * shipped   -> completed
         */

        if (currentIdx == -1 ||
                nextIdx != currentIdx + 1) {

            throw new BusinessException(
                    "Cannot move order from "
                            + currentStatus
                            + " to "
                            + nextStatus
            );
        }


        // -----------------------------------------------------
        // Update status
        // -----------------------------------------------------

        int updated =
                orderMapper.updateStatusByAdmin(
                        orderId,
                        nextStatus
                );

        if (updated == 0) {

            throw new BusinessException(
                    "Unable to update order status"
            );
        }
    }


    // =========================================================
    // ADMIN - PERMANENTLY DELETE ALL DELETED ORDERS
    // =========================================================

    @Override
    @Transactional
    public void permanentlyDeleteDeletedOrders() {

        /*
         * Delete order items first.
         */

        orderItemMapper
                .permanentlyDeleteDeletedOrderItems();


        /*
         * Then delete deleted orders.
         */

        orderMapper
                .permanentlyDeleteDeletedOrders();
    }


    // =========================================================
    // ADMIN - ORDER DETAIL
    // =========================================================

    @Override
    public Order getAdminOrderDetail(
            Long orderId
    ) {

        /*
         * Admin can view deleted orders too.
         */

        Order order =
                orderMapper.findAnyById(
                        orderId
                );

        if (order == null) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }

        return order;
    }


    // =========================================================
    // ADMIN - ORDER ITEMS
    // =========================================================

    @Override
    public List<OrderItem> getAdminOrderItems(
            Long orderId
    ) {

        /*
         * The order may be soft-deleted,
         * so use findAnyById().
         */

        Order order =
                orderMapper.findAnyById(
                        orderId
                );

        if (order == null) {

            throw new BusinessException(
                    404,
                    "Order not found"
            );
        }


        return orderItemMapper.findByOrderId(
                orderId
        );
    }


    // =========================================================
    // HELPER
    // =========================================================

    private String generateOrderNo() {

        return "TN"
                + System.currentTimeMillis()
                + UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();
    }
}