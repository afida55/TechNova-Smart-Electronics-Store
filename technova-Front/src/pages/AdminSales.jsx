import { useEffect, useState } from "react";
import { api } from "../lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function AdminSales({ setPage }) {
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = () => {
    setLoading(true);
    setError("");

    api
      .get("/admin/sales")
      .then((data) => {
        console.log("Admin sales:", data);
        setSales(data);
      })
      .catch((err) => {
        console.error("Failed to load sales:", err);
        setError(err.message || "Failed to load sales");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative mx-auto w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
          </div>

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Loading sales...
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="w-full max-w-xl mx-auto py-16 px-4">
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-2xl">
            ⚠️
          </div>

          <h2 className="text-lg font-bold text-slate-900 mt-4">
            Unable to load sales
          </h2>

          <p className="text-sm text-slate-500 mt-2 leading-6">
            {error}
          </p>

          <button
            type="button"
            onClick={loadSales}
            className="mt-5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!sales) {
    return null;
  }

  // =========================================================
  // DATA
  // =========================================================

  const totalSales = Number(sales.totalSales || 0);
  const totalOrders = Number(sales.totalOrders || 0);
  const completedOrders = Number(sales.completedOrders || 0);
  const cancelledOrders = Number(sales.cancelledOrders || 0);

  const averageOrderValue =
    totalOrders > 0
      ? totalSales / totalOrders
      : 0;

  const recentSales = Array.isArray(sales.recentSales)
    ? sales.recentSales
    : [];

  const topProducts = Array.isArray(sales.topProducts)
    ? sales.topProducts
    : [];

  const salesTrend = Array.isArray(sales.salesTrend)
    ? sales.salesTrend
    : [];

  // =========================================================
  // HELPERS
  // =========================================================

  const formatMonth = (period) => {
    if (!period) return "Unknown";

    const parts = String(period).split("-");

    if (parts.length !== 2) {
      return period;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    if (!year || !month) {
      return period;
    }

    const date = new Date(year, month - 1, 1);

    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (value) => {
    return `¥${Number(value || 0).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =========================================================
  // CHART DATA
  // =========================================================

  const chartData = salesTrend.map((item) => ({
    period: item.period,
    label: formatMonth(item.period),
    sales: Number(item.sales || 0),
  }));

  // =========================================================
  // TREND
  // =========================================================

  const firstSales =
    chartData.length > 0
      ? chartData[0].sales
      : 0;

  const latestSales =
    chartData.length > 0
      ? chartData[
          chartData.length - 1
        ].sales
      : 0;

  const salesDifference =
    latestSales - firstSales;

  const salesPercentageChange =
    firstSales > 0
      ? (salesDifference /
          firstSales) *
        100
      : latestSales > 0
      ? 100
      : 0;

  const trendIsPositive =
    salesDifference > 0;

  const trendIsNegative =
    salesDifference < 0;

  // =========================================================
  // STATS
  // =========================================================

  const stats = [
    {
      title: "Total Sales",
      value: formatCurrency(totalSales),
      description: "Revenue from non-cancelled orders",
      icon: "💰",
      iconBg: "bg-emerald-50",
      iconBorder: "border-emerald-100",
      iconText: "text-emerald-600",
      valueText: "text-emerald-700",
    },

    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      description: "Orders contributing to sales",
      icon: "🛒",
      iconBg: "bg-blue-50",
      iconBorder: "border-blue-100",
      iconText: "text-blue-600",
      valueText: "text-slate-900",
    },

    {
      title: "Completed Orders",
      value: completedOrders.toLocaleString(),
      description: "Successfully completed orders",
      icon: "✓",
      iconBg: "bg-green-50",
      iconBorder: "border-green-100",
      iconText: "text-green-600",
      valueText: "text-green-700",
    },

    {
      title: "Cancelled Orders",
      value: cancelledOrders.toLocaleString(),
      description: "Orders that were cancelled",
      icon: "×",
      iconBg: "bg-rose-50",
      iconBorder: "border-rose-100",
      iconText: "text-rose-600",
      valueText:
        cancelledOrders > 0
          ? "text-rose-700"
          : "text-slate-900",
    },

    {
      title: "Average Order Value",
      value: formatCurrency(averageOrderValue),
      description: "Average value per sales order",
      icon: "◉",
      iconBg: "bg-violet-50",
      iconBorder: "border-violet-100",
      iconText: "text-violet-600",
      valueText: "text-slate-900",
    },
  ];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <section className="w-full max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 xl:px-8 space-y-6 pb-8">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div className="min-w-0">

          <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-600">
            Administration
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Sales & Analytics
          </h1>

          <p className="text-sm text-slate-500 mt-1.5">
            Monitor your store revenue, orders, and sales performance.
          </p>

        </div>

        <button
          type="button"
          onClick={() => setPage("admin")}
          className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span>←</span>
          Dashboard
        </button>

      </div>


      {/* =====================================================
          STAT CARDS
      ====================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">

        {stats.map((stat) => (
          <div
            key={stat.title}
            className="group min-w-0 min-h-[132px] bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-slate-300 transition-all duration-200"
          >

            <div className="flex items-start justify-between gap-3">

              <div className="min-w-0 flex-1">

                <p className="text-xs sm:text-sm font-semibold text-slate-500 truncate">
                  {stat.title}
                </p>

                <p
                  className={`text-xl sm:text-2xl font-bold tracking-tight mt-2 truncate ${stat.valueText}`}
                >
                  {stat.value}
                </p>

                <p className="text-[11px] text-slate-400 mt-1.5 leading-4 line-clamp-2">
                  {stat.description}
                </p>

              </div>

              <div
                className={`w-10 h-10 shrink-0 rounded-xl ${stat.iconBg} ${stat.iconBorder} border ${stat.iconText} flex items-center justify-center text-lg group-hover:scale-110 group-hover:rotate-2 transition-all duration-200`}
              >
                {stat.icon}
              </div>

            </div>

          </div>
        ))}

      </div>


      {/* =====================================================
          SALES OVERVIEW
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">

        <div className="px-5 py-4 sm:px-6 border-b border-slate-100">

          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
            Performance
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Sales Overview
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            A quick overview of your store's current sales performance.
          </p>

        </div>

        <div className="p-5 sm:p-6">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* REVENUE */}

            <div className="lg:col-span-2 min-h-[155px] rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-5 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              <div className="flex items-center justify-between gap-5 h-full">

                <div className="min-w-0">

                  <p className="text-xs sm:text-sm font-semibold text-emerald-800">
                    Store Revenue
                  </p>

                  <p className="text-3xl sm:text-4xl font-bold tracking-tight text-emerald-700 mt-2">
                    {formatCurrency(totalSales)}
                  </p>

                  <p className="text-xs sm:text-sm text-emerald-700/70 mt-2">
                    Revenue generated from non-cancelled orders.
                  </p>

                </div>

                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-white/70 border border-emerald-100 flex items-center justify-center text-xl sm:text-2xl hover:scale-105 transition-transform duration-200">
                  💰
                </div>

              </div>

            </div>


            {/* ORDER SUMMARY */}

            <div className="min-h-[155px] rounded-2xl bg-slate-50 border border-slate-200 p-5 sm:p-6 hover:bg-slate-100/70 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">

              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                Sales Orders
              </p>

              <p className="text-3xl sm:text-4xl font-bold text-slate-900 mt-2">
                {totalOrders.toLocaleString()}
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">

                <div className="rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                  <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                    Completed
                  </p>

                  <p className="text-sm font-bold text-green-700 mt-0.5">
                    {completedOrders.toLocaleString()}
                  </p>
                </div>

                <div className="rounded-xl bg-white border border-slate-200 px-3 py-2.5">
                  <p className="text-[10px] uppercase font-bold tracking-wide text-slate-400">
                    Cancelled
                  </p>

                  <p className="text-sm font-bold text-rose-700 mt-0.5">
                    {cancelledOrders.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          SALES TREND GRAPH
      ====================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">

        {/* GRAPH HEADER */}

        <div className="px-5 py-4 sm:px-6 border-b border-slate-100">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

            <div>

              <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                Analytics
              </p>

              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Sales Trend
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monthly sales revenue over the last 6 months.
              </p>

            </div>

            {chartData.length > 1 && (
              <div
                className={`inline-flex self-start sm:self-auto items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                  trendIsPositive
                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                    : trendIsNegative
                    ? "bg-rose-50 border-rose-100 text-rose-700"
                    : "bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >

                <span className="text-base leading-none">
                  {trendIsPositive
                    ? "↗"
                    : trendIsNegative
                    ? "↘"
                    : "→"}
                </span>

                <span>
                  {trendIsPositive
                    ? "+"
                    : ""}
                  {salesPercentageChange.toFixed(1)}%
                </span>

                <span className="hidden sm:inline font-medium opacity-70">
                  vs. first month
                </span>

              </div>
            )}

          </div>

        </div>


        {/* GRAPH */}

        <div className="px-3 sm:px-5 lg:px-6 pt-5 pb-2">

          {chartData.length === 0 ? (

            <div className="h-[300px] flex flex-col items-center justify-center text-center">

              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl">
                📈
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-4">
                No sales trend data yet
              </p>

              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Monthly sales performance will appear here once sales data is available.
              </p>

            </div>

          ) : (

            <div className="h-[300px] sm:h-[340px] w-full">

              <ResponsiveContainer width="100%" height="100%">

                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="salesAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="0%"
                        stopColor="#2563eb"
                        stopOpacity={0.22}
                      />

                      <stop
                        offset="100%"
                        stopColor="#2563eb"
                        stopOpacity={0.02}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    stroke="#e2e8f0"
                    strokeDasharray="4 6"
                    vertical={false}
                  />


                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={10}
                    minTickGap={20}
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  />


                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={68}
                    tickMargin={8}
                    tick={{
                      fill: "#64748b",
                      fontSize: 11,
                      fontWeight: 500,
                    }}
                    tickFormatter={(value) => {

                      if (value >= 1000000) {
                        return `¥${(
                          value / 1000000
                        ).toFixed(1)}M`;
                      }

                      if (value >= 1000) {
                        return `¥${(
                          value / 1000
                        ).toFixed(0)}K`;
                      }

                      return `¥${Number(
                        value
                      ).toLocaleString()}`;

                    }}
                  />


                  <Tooltip
                    cursor={{
                      stroke: "#94a3b8",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={({
                      active,
                      payload,
                      label,
                    }) => {

                      if (
                        !active ||
                        !payload ||
                        payload.length === 0
                      ) {
                        return null;
                      }

                      const value = Number(
                        payload[0]?.value || 0
                      );

                      return (
                        <div className="min-w-[175px] rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl">

                          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                            {label}
                          </p>

                          <p className="mt-1 text-lg font-bold text-slate-900">
                            {formatCurrency(value)}
                          </p>

                          <div className="mt-2 flex items-center gap-2">

                            <span className="h-2 w-2 rounded-full bg-blue-600" />

                            <span className="text-xs font-medium text-slate-500">
                              Monthly sales
                            </span>

                          </div>

                        </div>
                      );
                    }}
                  />


                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#salesAreaGradient)"
                    fillOpacity={1}
                    activeDot={{
                      r: 7,
                      fill: "#2563eb",
                      stroke: "#ffffff",
                      strokeWidth: 3,
                    }}
                    dot={{
                      r: 4,
                      fill: "#2563eb",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    animationDuration={900}
                    animationEasing="ease-out"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          )}

        </div>


        {/* GRAPH SUMMARY */}

        {chartData.length > 0 && (
          <div className="px-5 sm:px-6 pb-5 pt-3">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="group rounded-xl bg-slate-50 border border-slate-200 p-3.5 hover:bg-slate-100 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  First Month
                </p>

                <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                  {formatCurrency(firstSales)}
                </p>

              </div>


              <div className="group rounded-xl bg-blue-50 border border-blue-100 p-3.5 hover:bg-blue-100/70 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">

                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                  Latest Month
                </p>

                <p className="text-base sm:text-lg font-bold text-blue-700 mt-1">
                  {formatCurrency(latestSales)}
                </p>

              </div>


              <div
                className={`group rounded-xl border p-3.5 hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200 ${
                  trendIsPositive
                    ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100/70"
                    : trendIsNegative
                    ? "bg-rose-50 border-rose-100 hover:bg-rose-100/70"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >

                <p
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    trendIsPositive
                      ? "text-emerald-600"
                      : trendIsNegative
                      ? "text-rose-600"
                      : "text-slate-400"
                  }`}
                >
                  Overall Change
                </p>

                <p
                  className={`text-base sm:text-lg font-bold mt-1 ${
                    trendIsPositive
                      ? "text-emerald-700"
                      : trendIsNegative
                      ? "text-rose-700"
                      : "text-slate-900"
                  }`}
                >
                  {salesDifference > 0
                    ? "+"
                    : ""}
                  {formatCurrency(
                    salesDifference
                  )}
                </p>

              </div>

            </div>

          </div>
        )}

      </div>


      {/* =====================================================
          RECENT SALES + TOP PRODUCTS
      ====================================================== */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        {/* RECENT SALES */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Sales
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Latest orders contributing to sales.
                </p>

              </div>

              <span className="w-9 h-9 shrink-0 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg hover:scale-105 transition-transform duration-200">
                🧾
              </span>

            </div>

          </div>


          {recentSales.length === 0 ? (

            <div className="min-h-[220px] p-8 flex flex-col items-center justify-center text-center">

              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                🧾
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-3">
                No sales yet
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Recent sales will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {recentSales.slice(0, 5).map(
                (sale) => (

                  <div
                    key={sale.id}
                    className="min-h-[88px] px-5 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 hover:px-6 transition-all duration-200"
                  >

                    <div className="min-w-0">

                      <p className="text-sm font-bold text-slate-900 truncate">
                        #
                        {sale.orderNo ||
                          sale.id}
                      </p>

                      <p className="text-xs text-slate-500 mt-1 truncate">
                        {sale.receiverName ||
                          "Customer"}
                      </p>

                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {sale.createTime
                          ? new Date(
                              sale.createTime
                            ).toLocaleString()
                          : "Date unavailable"}
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-sm sm:text-base font-bold text-emerald-700">
                        {formatCurrency(
                          sale.totalPrice
                        )}
                      </p>

                      <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                        {sale.status ||
                          "Paid"}
                      </span>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>


        {/* TOP PRODUCTS */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Top-Selling Products
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Products generating the most sales.
                </p>

              </div>

              <span className="w-9 h-9 shrink-0 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center text-lg hover:scale-105 transition-transform duration-200">
                ⭐
              </span>

            </div>

          </div>


          {topProducts.length === 0 ? (

            <div className="min-h-[220px] p-8 flex flex-col items-center justify-center text-center">

              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-xl">
                📦
              </div>

              <p className="text-sm font-semibold text-slate-700 mt-3">
                No product sales yet
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Top-selling products will appear here.
              </p>

            </div>

          ) : (

            <div className="divide-y divide-slate-100">

              {topProducts.slice(0, 5).map(
                (product, index) => (

                  <div
                    key={
                      product.productId ||
                      product.id ||
                      index
                    }
                    className="min-h-[88px] px-5 py-4 flex items-center gap-3 hover:bg-slate-50 hover:px-6 transition-all duration-200"
                  >

                    <div className="w-8 h-8 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-sm font-bold text-slate-900 truncate">
                        {product.productName ||
                          "Product"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {Number(
                          product.quantity ||
                            0
                        ).toLocaleString()}{" "}
                        sold
                      </p>

                    </div>

                    <div className="text-right shrink-0">

                      <p className="text-sm font-bold text-slate-900">
                        {formatCurrency(
                          product.revenue
                        )}
                      </p>

                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Revenue
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <div className="relative overflow-hidden bg-slate-950 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">

        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-blue-500/10" />

        <div className="absolute -left-20 -bottom-24 w-64 h-64 rounded-full bg-indigo-500/10" />

        <div className="relative p-5 sm:p-6">

          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
            Quick Actions
          </p>

          <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5">
            Continue managing your store
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Quickly move to another administration area.
          </p>


          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">

            {/* PRODUCTS */}

            <button
              type="button"
              onClick={() =>
                setPage("admin-products")
              }
              className="group min-h-[92px] p-4 rounded-xl bg-white/[0.06] border border-white/10 text-left hover:bg-white/[0.11] hover:-translate-y-1 hover:border-white/20 hover:shadow-lg transition-all duration-200"
            >

              <span className="text-lg group-hover:scale-110 inline-block transition-transform duration-200">
                📦
              </span>

              <p className="text-sm font-bold text-white mt-1.5">
                Products
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage inventory
              </p>

            </button>


            {/* ORDERS */}

            <button
              type="button"
              onClick={() =>
                setPage("admin-orders")
              }
              className="group min-h-[92px] p-4 rounded-xl bg-white/[0.06] border border-white/10 text-left hover:bg-white/[0.11] hover:-translate-y-1 hover:border-white/20 hover:shadow-lg transition-all duration-200"
            >

              <span className="text-lg group-hover:scale-110 inline-block transition-transform duration-200">
                🛍️
              </span>

              <p className="text-sm font-bold text-white mt-1.5">
                Orders
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage orders
              </p>

            </button>


            {/* DASHBOARD */}

            <button
              type="button"
              onClick={() =>
                setPage("admin")
              }
              className="group min-h-[92px] p-4 rounded-xl bg-white/[0.06] border border-white/10 text-left hover:bg-white/[0.11] hover:-translate-y-1 hover:border-white/20 hover:shadow-lg transition-all duration-200"
            >

              <span className="text-lg group-hover:scale-110 inline-block transition-transform duration-200">
                📊
              </span>

              <p className="text-sm font-bold text-white mt-1.5">
                Dashboard
              </p>

              <p className="text-[11px] text-slate-400 mt-0.5">
                Return to overview
              </p>

            </button>

          </div>

        </div>

      </div>

    </section>
  );
}