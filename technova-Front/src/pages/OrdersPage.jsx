import { useState, useEffect } from "react";
import {
  Clock,
  CreditCard,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  Loader2,
  XCircle,
  ShoppingBag,
  Calendar,
  User,
  MapPin,
  Phone,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CircleCheck,
  Trash2,
} from "lucide-react";

import { api } from "../lib/api";
import ProductImage from "../components/ProductImage";

// Backend order statuses
const STATUS_STEPS = [
  "pending",
  "paid",
  "shipped",
  "completed",
];

const STATUS_CONFIG = {
  pending: {
    label: "Order placed",
    shortLabel: "Pending",
    icon: Clock,
    description: "Your order has been received.",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },

  paid: {
    label: "Payment confirmed",
    shortLabel: "Paid",
    icon: CreditCard,
    description: "Your payment has been confirmed.",
    color: "text-[#2D3E8C]",
    bg: "bg-[#2D3E8C]/5",
    border: "border-[#2D3E8C]/20",
    dot: "bg-[#2D3E8C]",
  },

  shipped: {
    label: "On the way",
    shortLabel: "Shipped",
    icon: Truck,
    description: "Your order has been shipped.",
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
  },

  completed: {
    label: "Delivered",
    shortLabel: "Completed",
    icon: Package,
    description: "Your order has been delivered.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },

  cancelled: {
    label: "Order cancelled",
    shortLabel: "Cancelled",
    icon: XCircle,
    description: "This order has been cancelled.",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
  },
};

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  const config =
    STATUS_CONFIG[normalizedStatus] ||
    STATUS_CONFIG.pending;

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${config.color} ${config.bg} ${config.border}`}
    >
      <Icon size={12} />
      {config.shortLabel}
    </span>
  );
}

function formatDate(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatDateShort(dateString) {
  if (!dateString) return "Unknown date";

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

/* ---------------------------------------------------------
   ORDER STATUS
--------------------------------------------------------- */

function OrderStatus({ status }) {
  const normalizedStatus = String(status || "")
    .trim()
    .toLowerCase();

  if (normalizedStatus === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle
              size={18}
              className="text-red-600"
            />
          </div>

          <div>
            <div className="text-sm font-bold text-red-700">
              Order cancelled
            </div>

            <div className="text-xs text-red-500 mt-0.5">
              This order is no longer being processed.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex =
    STATUS_STEPS.indexOf(normalizedStatus);

  if (currentIndex === -1) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Order progress
          </div>

          <div className="text-sm font-semibold text-slate-800 mt-1">
            {STATUS_CONFIG[normalizedStatus]?.label}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Step {currentIndex + 1} of{" "}
          {STATUS_STEPS.length}
        </div>
      </div>

      <div className="relative">
        <div className="flex items-start">
          {STATUS_STEPS.map((step, index) => {
            const config = STATUS_CONFIG[step];
            const Icon = config.icon;

            const completed =
              index <= currentIndex;

            const active =
              index === currentIndex;

            return (
              <div
                key={step}
                className="flex-1 last:flex-none"
              >
                <div className="flex items-center">
                  <div
                    className={`relative z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border-2 transition ${
                      completed
                        ? "bg-[#2D3E8C] border-[#2D3E8C] text-white"
                        : "bg-white border-slate-200 text-slate-300"
                    } ${
                      active
                        ? "ring-4 ring-[#2D3E8C]/10"
                        : ""
                    }`}
                  >
                    {completed &&
                    index < currentIndex ? (
                      <Check size={14} />
                    ) : (
                      <Icon size={14} />
                    )}
                  </div>

                  {index <
                    STATUS_STEPS.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-1.5 rounded-full transition ${
                        index < currentIndex
                          ? "bg-[#2D3E8C]"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </div>

                <div className="mt-2 pr-2">
                  <div
                    className={`text-[9px] sm:text-[10px] font-bold ${
                      completed
                        ? "text-slate-700"
                        : "text-slate-400"
                    }`}
                  >
                    {index === 0
                      ? "Placed"
                      : index === 1
                      ? "Paid"
                      : index === 2
                      ? "Shipped"
                      : "Delivered"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-200">
        <CircleCheck
          size={14}
          className="text-emerald-500"
        />

        <span className="text-xs text-slate-500">
          {STATUS_CONFIG[normalizedStatus]?.description}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   ORDER ITEMS
--------------------------------------------------------- */

function OrderItems({
  items,
  loading,
  error,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-slate-400">
        <Loader2
          size={16}
          className="animate-spin mr-2"
        />
        Loading order items...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600">
        Could not load order items: {error}
      </div>
    );
  }

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return (
      <div className="text-sm text-slate-400 py-5">
        No item information is available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const image =
          item.productImage ||
          item.image ||
          "";

        const quantity = Number(
          item.quantity || 0
        );

        const price = Number(
          item.price || 0
        );

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 sm:gap-4 rounded-xl border border-slate-100 bg-white p-3 hover:border-slate-200 transition"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
              <ProductImage
                src={image}
                alt={
                  item.productName ||
                  "Product"
                }
                className="w-full h-full"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 line-clamp-2">
                {item.productName ||
                  "Product"}
              </div>

              <div className="text-xs text-slate-400 mt-1.5">
                Quantity: {quantity}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                {formatPrice(price)} each
              </div>
            </div>

            <div className="text-right flex-shrink-0">
              <div className="text-sm font-bold text-slate-900">
                {formatPrice(
                  price * quantity
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------
   MAIN PAGE
--------------------------------------------------------- */

export default function OrdersPage({
  setPage,
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState(null);

  const [openId, setOpenId] =
    useState(null);

  const [itemsByOrder, setItemsByOrder] =
    useState({});

  const [cancelling, setCancelling] =
    useState({});

  const [copiedOrderNo, setCopiedOrderNo] =
    useState(null);

  /* -------------------------------------------------------
     LOAD ORDERS
  ------------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    api
      .get("/orders")
      .then((data) => {
        if (mounted) {
          setOrders(
            Array.isArray(data)
              ? data
              : []
          );
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load your orders."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------------
     OPEN / CLOSE ORDER
  ------------------------------------------------------- */

  const toggleOpen = (order) => {
    const willOpen =
      openId !== order.id;

    setOpenId(
      willOpen ? order.id : null
    );

    if (
      willOpen &&
      !itemsByOrder[order.id]
    ) {
      setItemsByOrder((current) => ({
        ...current,
        [order.id]: "loading",
      }));

      api
        .get(
          `/orders/${order.id}/items`
        )
        .then((items) => {
          setItemsByOrder((current) => ({
            ...current,
            [order.id]: items,
          }));
        })
        .catch((err) => {
          setItemsByOrder((current) => ({
            ...current,
            [order.id]: {
              error:
                err?.message ||
                "Unable to load order items.",
            },
          }));
        });
    }
  };

  /* -------------------------------------------------------
     CANCEL ORDER
  ------------------------------------------------------- */

  const cancelOrder = (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) return;

    setCancelling((current) => ({
      ...current,
      [orderId]: true,
    }));

    api
      .put(`/orders/${orderId}/cancel`)
      .then(() => {
        setOrders((previous) =>
          previous.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "cancelled",
                }
              : order
          )
        );
      })
      .catch((err) => {
        console.error(
          "Cancel order error:",
          err?.response?.data || err
        );

        alert(
          "Failed to cancel order: " +
            (
              err?.response?.data
                ?.message ||
              err?.response?.data?.error ||
              err?.message ||
              "Unknown error"
            )
        );
      })
      .finally(() => {
        setCancelling((current) => ({
          ...current,
          [orderId]: false,
        }));
      });
  };

  /* -------------------------------------------------------
     DELETE CANCELLED ORDER
  ------------------------------------------------------- */

  const deleteOrder = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this cancelled order?"
    );

    if (!confirmed) return;

    setCancelling((current) => ({
      ...current,
      [orderId]: true,
    }));

    try {
      await api.del(`/orders/${orderId}`);

      setOrders((previous) =>
        previous.filter(
          (order) => order.id !== orderId
        )
      );

      // Remove cached items for the deleted order.
      setItemsByOrder((current) => {
        const updated = {
          ...current,
        };

        delete updated[orderId];

        return updated;
      });

      // Close the order if it was open.
      setOpenId((current) =>
        current === orderId
          ? null
          : current
      );
    } catch (err) {
      console.error(
        "Delete order error:",
        err
      );

      alert(
        "Failed to delete order: " +
          (
            err?.message ||
            "Unknown error"
          )
      );
    } finally {
      setCancelling((current) => ({
        ...current,
        [orderId]: false,
      }));
    }
  };

  /* -------------------------------------------------------
     COPY ORDER NUMBER
  ------------------------------------------------------- */

  const copyOrderNo = async (
    orderNo
  ) => {
    try {
      await navigator.clipboard.writeText(
        orderNo
      );

      setCopiedOrderNo(orderNo);

      setTimeout(() => {
        setCopiedOrderNo(null);
      }, 2000);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2D3E8C]/10 flex items-center justify-center mx-auto">
            <Loader2
              size={25}
              className="text-[#2D3E8C] animate-spin"
            />
          </div>

          <h2 className="text-base font-bold text-slate-800 mt-4">
            Loading your orders
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            Please wait a moment...
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     ERROR
  --------------------------------------------------------- */

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <XCircle
                size={20}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-red-700">
                We couldn't load your orders
              </h2>

              <p className="text-sm text-red-500 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     EMPTY STATE
  ------------------------------------------------------- */

  if (orders.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
            <Package
              size={40}
              className="text-slate-300"
            />
          </div>

          <div className="text-[11px] font-bold uppercase tracking-wider text-[#2D3E8C] mt-7">
            Order history
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            No orders yet
          </h1>

          <p className="text-sm text-slate-500 mt-2 leading-6 max-w-md mx-auto">
            You haven't placed an order yet.
            Explore our products and your
            purchases will appear here.
          </p>

          <button
            type="button"
            onClick={() =>
              setPage("home")
            }
            className="mt-7 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-[#2D3E8C] transition shadow-lg"
          >
            <ShoppingBag size={16} />
            Start shopping
            <ArrowRight size={15} />
          </button>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-10">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Package
                size={18}
                className="mx-auto text-slate-400"
              />

              <div className="text-[10px] font-semibold text-slate-500 mt-2">
                Track orders
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <Truck
                size={18}
                className="mx-auto text-slate-400"
              />

              <div className="text-[10px] font-semibold text-slate-500 mt-2">
                Fast delivery
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <ShieldCheck
                size={18}
                className="mx-auto text-slate-400"
              />

              <div className="text-[10px] font-semibold text-slate-500 mt-2">
                Secure shopping
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     MAIN
  ------------------------------------------------------- */

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#2D3E8C]">
            <Package size={14} />
            Your account
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">
            Your orders
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Track and manage your TechNova
            purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPage?.("home")}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-all duration-200"
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor = "#93C5FD";
            event.currentTarget.style.background = "#EFF6FF";
            event.currentTarget.style.color = "#2563EB";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor = "#E2E8F0";
            event.currentTarget.style.background = "#FFFFFF";
            event.currentTarget.style.color = "#334155";
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>
            ←
          </span>

          <span>
            Continue shopping
          </span>
        </button>
      </div>

      {/* =====================================================
          SUMMARY STRIP
      ===================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total orders
          </div>

          <div className="text-xl font-bold text-slate-900 mt-1">
            {orders.length}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            In progress
          </div>

          <div className="text-xl font-bold text-[#2D3E8C] mt-1">
            {
              orders.filter(
                (order) => {
                  const status =
                    String(
                      order.status || ""
                    )
                      .trim()
                      .toLowerCase();

                  return (
                    status !==
                      "completed" &&
                    status !==
                      "cancelled"
                  );
                }
              ).length
            }
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Delivered
          </div>

          <div className="text-xl font-bold text-emerald-600 mt-1">
            {
              orders.filter(
                (order) =>
                  String(
                    order.status || ""
                  )
                    .trim()
                    .toLowerCase() ===
                  "completed"
              ).length
            }
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cancelled
          </div>

          <div className="text-xl font-bold text-red-500 mt-1">
            {
              orders.filter(
                (order) =>
                  String(
                    order.status || ""
                  )
                    .trim()
                    .toLowerCase() ===
                  "cancelled"
              ).length
            }
          </div>
        </div>
      </div>

      {/* =====================================================
          ORDER LIST
      ===================================================== */}

      <div className="space-y-5">
        {orders.map((order) => {
          const open =
            openId === order.id;

          const items =
            itemsByOrder[order.id];

          const orderStatus =
            String(
              order.status || ""
            )
              .trim()
              .toLowerCase();

          const isCancelled =
            orderStatus ===
            "cancelled";

          // Customers can cancel only while the order is paid.
          const canCancel =
            orderStatus === "paid";

          const isDeleting =
            cancelling[order.id];

          return (
            <article
              key={order.id}
              className={`rounded-2xl border bg-white shadow-sm overflow-hidden transition-all ${
                open
                  ? "border-[#2D3E8C]/25 shadow-md"
                  : isCancelled
                  ? "border-red-200"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* =================================================
                  ORDER TOP
              ================================================= */}

              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Order
                      </span>

                      <span className="font-mono font-bold text-sm text-slate-900">
                        {order.orderNo}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyOrderNo(
                            order.orderNo
                          )
                        }
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#2D3E8C] hover:border-[#2D3E8C]/30 transition"
                        title="Copy order number"
                      >
                        {copiedOrderNo ===
                        order.orderNo ? (
                          <Check
                            size={13}
                            className="text-emerald-500"
                          />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={12} />

                        {formatDateShort(
                          order.createTime
                        )}
                      </span>

                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <User size={12} />

                        {order.receiverName ||
                          "Customer"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="sm:text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Order total
                      </div>

                      <div className="text-xl font-bold text-slate-900 mt-0.5">
                        {formatPrice(
                          order.totalPrice
                        )}
                      </div>
                    </div>

                    <StatusBadge
                      status={
                        orderStatus
                      }
                    />
                  </div>
                </div>

                {/* =================================================
                    QUICK PRODUCT PREVIEW
                ================================================= */}

                {Array.isArray(
                  items
                ) &&
                  items.length > 0 && (
                    <div className="mt-5 flex items-center gap-2 overflow-hidden">
                      {items
                        .slice(0, 4)
                        .map((item) => {
                          const image =
                            item.productImage ||
                            item.image ||
                            "";

                          return (
                            <div
                              key={item.id}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0"
                              title={
                                item.productName
                              }
                            >
                              <ProductImage
                                src={image}
                                alt={
                                  item.productName ||
                                  "Product"
                                }
                                className="w-full h-full"
                              />
                            </div>
                          );
                        })}

                      {items.length >
                        4 && (
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                          +{items.length - 4}
                        </div>
                      )}

                      <div className="ml-1 text-xs text-slate-400">
                        {items.length}{" "}
                        {items.length ===
                        1
                          ? "item"
                          : "items"}
                      </div>
                    </div>
                  )}

                {/* =================================================
                    STATUS
                ================================================= */}

                <div className="mt-5">
                  <OrderStatus
                    status={
                      orderStatus
                    }
                  />
                </div>

                {/* =================================================
                    ACTIONS
                ================================================= */}

                <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() =>
                      toggleOpen(order)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-[#2D3E8C] transition"
                  >
                    {open
                      ? "Hide details"
                      : "View order details"}

                    {open ? (
                      <ChevronUp
                        size={14}
                      />
                    ) : (
                      <ChevronDown
                        size={14}
                      />
                    )}
                  </button>

                  {/* CANCEL BUTTON
                      Only available for PAID orders. */}
                  {canCancel &&
                    !isCancelled && (
                      <button
                        type="button"
                        onClick={() =>
                          cancelOrder(
                            order.id
                          )
                        }
                        disabled={
                          cancelling[
                            order.id
                          ]
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {cancelling[
                          order.id
                        ] ? (
                          <>
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle
                              size={13}
                            />
                            Cancel order
                          </>
                        )}
                      </button>
                    )}

                  {/* DELETE BUTTON FOR CANCELLED ORDER */}
                  {isCancelled && (
                    <button
                      type="button"
                      onClick={() =>
                        deleteOrder(
                          order.id
                        )
                      }
                      disabled={isDeleting}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2
                            size={13}
                            className="animate-spin"
                          />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2
                            size={13}
                          />
                          Delete order
                        </>
                      )}
                    </button>
                  )}

                  {/* SHOP AGAIN */}
                  {orderStatus ===
                    "completed" && (
                    <button
                      type="button"
                      onClick={() =>
                        setPage("home")
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <RotateCcw
                        size={13}
                      />
                      Shop again
                    </button>
                  )}

                  <div className="ml-auto hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400">
                    <ShieldCheck
                      size={12}
                    />
                    Secure order
                  </div>
                </div>

                {/* =================================================
                    EXPANDED DETAILS
                ================================================= */}

                {open && (
                  <div className="mt-5 pt-5 border-t border-slate-200">
                    <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
                      {/* ITEMS */}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Order items
                            </div>

                            <h3 className="text-sm font-bold text-slate-800 mt-1">
                              What's in your
                              order
                            </h3>
                          </div>

                          {items !==
                            "loading" &&
                            Array.isArray(
                              items
                            ) && (
                              <span className="text-xs text-slate-400">
                                {
                                  items.length
                                }{" "}
                                items
                              </span>
                            )}
                        </div>

                        <OrderItems
                          items={
                            Array.isArray(
                              items
                            )
                              ? items
                              : null
                          }
                          loading={
                            items ===
                            "loading"
                          }
                          error={
                            items &&
                            items.error
                          }
                        />
                      </div>

                      {/* SHIPPING */}

                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Delivery details
                        </div>

                        <h3 className="text-sm font-bold text-slate-800 mt-1 mb-3">
                          Shipping address
                        </h3>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-2.5">
                              <User
                                size={14}
                                className="text-slate-400 mt-0.5 flex-shrink-0"
                              />

                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Recipient
                                </div>

                                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                                  {
                                    order.receiverName
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <Phone
                                size={14}
                                className="text-slate-400 mt-0.5 flex-shrink-0"
                              />

                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Phone
                                </div>

                                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                                  {
                                    order.receiverPhone
                                  }
                                </div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2.5">
                              <MapPin
                                size={14}
                                className="text-slate-400 mt-0.5 flex-shrink-0"
                              />

                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                  Address
                                </div>

                                <div className="text-xs text-slate-600 mt-0.5 leading-5">
                                  {
                                    order.address
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ORDER META */}

                        <div className="rounded-xl border border-slate-200 bg-white p-4 mt-3">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                            Order information
                          </div>

                          <div className="space-y-2.5">
                            <div className="flex justify-between gap-3">
                              <span className="text-xs text-slate-400">
                                Order date
                              </span>

                              <span className="text-xs font-semibold text-slate-700 text-right">
                                {formatDate(
                                  order.createTime
                                )}
                              </span>
                            </div>

                            <div className="flex justify-between gap-3">
                              <span className="text-xs text-slate-400">
                                Status
                              </span>

                              <span className="text-xs font-semibold text-slate-700 capitalize">
                                {
                                  orderStatus
                                }
                              </span>
                            </div>

                            <div className="flex justify-between gap-3 pt-2.5 border-t border-slate-100">
                              <span className="text-xs font-semibold text-slate-500">
                                Total
                              </span>

                              <span className="text-sm font-bold text-slate-900">
                                {formatPrice(
                                  order.totalPrice
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* DETAIL FOOTER */}

                    <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck
                          size={14}
                          className="text-emerald-500"
                        />

                        Your order information is
                        securely stored.
                      </div>

                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <Calendar
                          size={11}
                        />

                        Placed{" "}
                        {formatDate(
                          order.createTime
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* =====================================================
          BOTTOM SHOPPING PROMPT
      ===================================================== */}

      <div className="mt-8 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag
                size={17}
                className="text-[#2D3E8C]"
              />

              <h2 className="text-sm font-bold text-slate-900">
                Looking for something new?
              </h2>
            </div>

            <p className="text-xs text-slate-500 mt-1.5">
              Explore the TechNova catalog and
              discover your next favorite device.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setPage("home")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold hover:bg-[#2D3E8C] transition"
          >
            Browse products
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* =====================================================
          TRUST FOOTER
      ===================================================== */}

      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-7 text-[10px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck size={12} />
          Secure checkout
        </span>

        <span className="flex items-center gap-1.5">
          <Truck size={12} />
          Reliable delivery
        </span>

        <span className="flex items-center gap-1.5">
          <Package size={12} />
          Order tracking
        </span>
      </div>
    </div>
  );
}