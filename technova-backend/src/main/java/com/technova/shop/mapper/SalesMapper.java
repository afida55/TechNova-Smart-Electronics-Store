package com.technova.shop.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface SalesMapper {

    /**
     * Total sales revenue.
     *
     * Cancelled orders are not sales.
     * Soft-deleted orders are also excluded.
     */
    @Select("""
        SELECT COALESCE(SUM(total_price), 0)
        FROM `order`
        WHERE status != 'cancelled'
          AND is_deleted = FALSE
    """)
    BigDecimal getTotalSales();


    /**
     * Total orders that contribute to sales.
     */
    @Select("""
        SELECT COUNT(*)
        FROM `order`
        WHERE status != 'cancelled'
          AND is_deleted = FALSE
    """)
    long getTotalOrders();


    /**
     * Number of completed orders.
     */
    @Select("""
        SELECT COUNT(*)
        FROM `order`
        WHERE status = 'completed'
          AND is_deleted = FALSE
    """)
    long getCompletedOrders();


    /**
     * Number of cancelled orders.
     *
     * Cancelled orders are shown for information,
     * but their value is not included in sales revenue.
     */
    @Select("""
        SELECT COUNT(*)
        FROM `order`
        WHERE status = 'cancelled'
          AND is_deleted = FALSE
    """)
    long getCancelledOrders();


    /**
     * Recent sales.
     *
     * Returns the latest non-cancelled and non-deleted orders.
     */
    @Select("""
        SELECT
            id,
            order_no AS orderNo,
            user_id AS userId,
            total_price AS totalPrice,
            status,
            receiver_name AS receiverName,
            receiver_phone AS receiverPhone,
            address,
            create_time AS createTime,
            is_deleted AS isDeleted
        FROM `order`
        WHERE status != 'cancelled'
          AND is_deleted = FALSE
        ORDER BY create_time DESC
        LIMIT 10
    """)
    List<com.technova.shop.entity.Order> getRecentSales();


    /**
     * Top-selling products.
     *
     * Uses order_item quantities from non-cancelled,
     * non-deleted orders.
     */
    @Select("""
        SELECT
            oi.product_id AS productId,
            p.name AS productName,
            SUM(oi.quantity) AS quantity,
            COALESCE(SUM(oi.quantity * oi.price), 0) AS revenue
        FROM order_item oi
        JOIN `order` o
            ON oi.order_id = o.id
        JOIN product p
            ON oi.product_id = p.id
        WHERE o.status != 'cancelled'
          AND o.is_deleted = FALSE
        GROUP BY
            oi.product_id,
            p.name
        ORDER BY quantity DESC, revenue DESC
        LIMIT 10
    """)
    List<TopSellingProduct> getTopSellingProducts();


    /**
     * Sales trend for the last 6 months.
     *
     * Returns the total sales for each month.
     *
     * Cancelled and soft-deleted orders are excluded.
     */
    @Select("""
        SELECT
            DATE_FORMAT(create_time, '%Y-%m') AS period,
            COALESCE(SUM(total_price), 0) AS sales
        FROM `order`
        WHERE status != 'cancelled'
          AND is_deleted = FALSE
          AND create_time >= DATE_SUB(
              DATE_FORMAT(CURDATE(), '%Y-%m-01'),
              INTERVAL 5 MONTH
          )
        GROUP BY DATE_FORMAT(create_time, '%Y-%m')
        ORDER BY period ASC
    """)
    List<SalesTrend> getSalesTrend();


    /**
     * DTO for top-selling products.
     */
    class TopSellingProduct {

        private Long productId;
        private String productName;
        private Long quantity;
        private BigDecimal revenue;

        public Long getProductId() {
            return productId;
        }

        public void setProductId(Long productId) {
            this.productId = productId;
        }

        public String getProductName() {
            return productName;
        }

        public void setProductName(String productName) {
            this.productName = productName;
        }

        public Long getQuantity() {
            return quantity;
        }

        public void setQuantity(Long quantity) {
            this.quantity = quantity;
        }

        public BigDecimal getRevenue() {
            return revenue;
        }

        public void setRevenue(BigDecimal revenue) {
            this.revenue = revenue;
        }
    }


    /**
     * DTO for monthly sales trend.
     */
    class SalesTrend {

        private String period;
        private BigDecimal sales;

        public String getPeriod() {
            return period;
        }

        public void setPeriod(String period) {
            this.period = period;
        }

        public BigDecimal getSales() {
            return sales;
        }

        public void setSales(BigDecimal sales) {
            this.sales = sales;
        }
    }
}