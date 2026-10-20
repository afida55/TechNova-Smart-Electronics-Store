package com.technova.shop.service.impl;

import com.technova.shop.entity.Order;
import com.technova.shop.mapper.SalesMapper;
import com.technova.shop.service.SalesService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SalesServiceImpl implements SalesService {

    private final SalesMapper salesMapper;

    @Override
    public BigDecimal getTotalSales() {
        BigDecimal totalSales = salesMapper.getTotalSales();

        return totalSales != null
                ? totalSales
                : BigDecimal.ZERO;
    }

    @Override
    public long getTotalOrders() {
        return salesMapper.getTotalOrders();
    }

    @Override
    public long getCompletedOrders() {
        return salesMapper.getCompletedOrders();
    }

    @Override
    public long getCancelledOrders() {
        return salesMapper.getCancelledOrders();
    }

    @Override
    public List<Order> getRecentSales() {
        List<Order> orders = salesMapper.getRecentSales();

        return orders != null
                ? orders
                : List.of();
    }

    @Override
    public List<SalesMapper.TopSellingProduct> getTopSellingProducts() {
        List<SalesMapper.TopSellingProduct> products =
                salesMapper.getTopSellingProducts();

        return products != null
                ? products
                : List.of();
    }

    @Override
    public List<SalesMapper.SalesTrend> getSalesTrend() {

        List<SalesMapper.SalesTrend> databaseTrend =
                salesMapper.getSalesTrend();

        /*
         * Put database results into a map so we can easily
         * find the sales amount for each month.
         */
        Map<String, BigDecimal> salesByMonth = new HashMap<>();

        if (databaseTrend != null) {
            for (SalesMapper.SalesTrend trend : databaseTrend) {
                if (trend.getPeriod() != null) {
                    salesByMonth.put(
                            trend.getPeriod(),
                            trend.getSales() != null
                                    ? trend.getSales()
                                    : BigDecimal.ZERO
                    );
                }
            }
        }

        /*
         * Build exactly the latest 6 months.
         *
         * This also adds months with zero sales so the graph
         * does not skip months where there were no orders.
         */
        List<SalesMapper.SalesTrend> result = new ArrayList<>();

        YearMonth currentMonth = YearMonth.now();
        DateTimeFormatter formatter =
                DateTimeFormatter.ofPattern("yyyy-MM");

        for (int i = 5; i >= 0; i--) {

            YearMonth month = currentMonth.minusMonths(i);

            String period = month.format(formatter);

            BigDecimal sales =
                    salesByMonth.getOrDefault(
                            period,
                            BigDecimal.ZERO
                    );

            SalesMapper.SalesTrend trend =
                    new SalesMapper.SalesTrend();

            trend.setPeriod(period);
            trend.setSales(sales);

            result.add(trend);
        }

        return result;
    }
}