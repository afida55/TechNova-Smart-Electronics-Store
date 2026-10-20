import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export default function AdminOrders({ setPage }) {
    const [orders, setOrders] = useState([]);
    const [deletedOrders, setDeletedOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState("");

    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [deletingOrderId, setDeletingOrderId] = useState(null);
    const [restoringOrderId, setRestoringOrderId] = useState(null);
    const [permanentlyDeleting, setPermanentlyDeleting] = useState(false);

    // =========================================================
    // LOCK BACKGROUND SCROLL WHEN MODAL IS OPEN
    // =========================================================

    const isModalOpen =
        detailsLoading ||
        selectedOrder ||
        detailsError;

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const scrollY = window.scrollY;

        const originalBodyStyle = {
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
        };

        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.position =
                originalBodyStyle.position;

            document.body.style.top =
                originalBodyStyle.top;

            document.body.style.width =
                originalBodyStyle.width;

            document.body.style.overflow =
                originalBodyStyle.overflow;

            window.scrollTo(0, scrollY);
        };
    }, [isModalOpen]);

    // =========================================================
    // LOAD ORDERS
    // =========================================================

    async function loadOrders() {
        try {
            setLoading(true);
            setError("");

            const [activeData, deletedData] =
                await Promise.all([
                    api.get("/admin/orders"),
                    api.get("/admin/orders/deleted"),
                ]);

            setOrders(
                Array.isArray(activeData)
                    ? activeData
                    : []
            );

            setDeletedOrders(
                Array.isArray(deletedData)
                    ? deletedData
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load orders:",
                err
            );

            setError(
                err.message ||
                "Failed to load orders"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadOrders();
    }, []);

    // =========================================================
    // LOAD ORDER DETAILS
    // =========================================================

    async function openOrderDetails(orderId) {
        try {
            setDetailsError("");
            setDetailsLoading(true);
            setSelectedOrder(null);
            setOrderItems([]);

            const [order, items] =
                await Promise.all([
                    api.get(
                        `/admin/orders/${orderId}`
                    ),
                    api.get(
                        `/admin/orders/${orderId}/items`
                    ),
                ]);

            setSelectedOrder(order);

            setOrderItems(
                Array.isArray(items)
                    ? items
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load order details:",
                err
            );

            setDetailsError(
                err.message ||
                "Failed to load order details"
            );
        } finally {
            setDetailsLoading(false);
        }
    }

    function closeOrderDetails() {
        setSelectedOrder(null);
        setOrderItems([]);
        setDetailsError("");
        setDetailsLoading(false);
    }

    // =========================================================
    // UPDATE STATUS
    //
    // FLOW:
    //
    // PAID -> SHIPPED -> COMPLETED
    //
    // PAID -> CANCELLED
    // =========================================================

    async function handleStatusChange(
        orderId,
        nextStatus
    ) {
        const order = orders.find(
            (item) => item.id === orderId
        );

        if (!order) {
            return;
        }

        let message = "";

        if (nextStatus === "shipped") {
            message =
                "Mark this order as shipped?";
        } else if (nextStatus === "completed") {
            message =
                "Mark this order as completed?";
        } else if (nextStatus === "cancelled") {
            message =
                "Are you sure you want to cancel this order? The product stock will be restored.";
        } else {
            return;
        }

        if (!window.confirm(message)) {
            return;
        }

        try {
            setUpdatingOrderId(orderId);

            await api.put(
                `/admin/orders/${orderId}/status`,
                {
                    status: nextStatus,
                }
            );

            await loadOrders();

            if (
                selectedOrder &&
                selectedOrder.id === orderId
            ) {
                await openOrderDetails(orderId);
            }
        } catch (err) {
            console.error(
                "Failed to update order status:",
                err
            );

            alert(
                err.message ||
                "Failed to update order status"
            );
        } finally {
            setUpdatingOrderId(null);
        }
    }

    // =========================================================
    // DELETE ORDER
    //
    // ADMIN DELETE = SOFT DELETE
    //
    // It does NOT:
    // - cancel the order
    // - restore stock
    // - delete order items
    // - change business status
    //
    // It only moves the order to Deleted Orders.
    // =========================================================

    async function handleDeleteOrder(orderId) {
        const order = orders.find(
            (item) => item.id === orderId
        );

        if (!order) {
            return;
        }

        const orderLabel =
            order.orderNo || order.id;

        const confirmed = window.confirm(
            `Are you sure you want to delete order #${orderLabel}?\n\nThe order will be moved to Deleted Orders and can be restored later.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingOrderId(orderId);

            await api.del(
                `/admin/orders/${orderId}`
            );

            if (
                selectedOrder &&
                selectedOrder.id === orderId
            ) {
                closeOrderDetails();
            }

            await loadOrders();
        } catch (err) {
            console.error(
                "Failed to delete order:",
                err
            );

            alert(
                err.message ||
                "Failed to delete order"
            );
        } finally {
            setDeletingOrderId(null);
        }
    }

    // =========================================================
    // RESTORE ORDER
    //
    // RESTORE ONLY CHANGES isDeleted BACK TO FALSE.
    //
    // It does NOT:
    // - change order status
    // - restore stock
    // - change order items
    // =========================================================

    async function handleRestoreOrder(orderId) {
        const order = deletedOrders.find(
            (item) => item.id === orderId
        );

        if (!order) {
            return;
        }

        const orderLabel =
            order.orderNo || order.id;

        const confirmed = window.confirm(
            `Restore order #${orderLabel}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setRestoringOrderId(orderId);

            await api.put(
                `/admin/orders/${orderId}/restore`,
                {}
            );

            await loadOrders();

            /*
             * If the restored order is currently open
             * in the details modal, refresh its details.
             */
            if (
                selectedOrder &&
                selectedOrder.id === orderId
            ) {
                await openOrderDetails(orderId);
            }
        } catch (err) {
            console.error(
                "Failed to restore order:",
                err
            );

            alert(
                err.message ||
                "Failed to restore order"
            );
        } finally {
            setRestoringOrderId(null);
        }
    }

    // =========================================================
    // PERMANENTLY DELETE ALL DELETED ORDERS
    //
    // This permanently removes:
    // - deleted order_items
    // - deleted orders
    //
    // It does NOT affect active orders.
    // =========================================================

    async function handlePermanentlyDeleteDeletedOrders() {
        if (deletedOrders.length === 0) {
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to permanently delete all ${deletedOrders.length} deleted order${
                deletedOrders.length === 1
                    ? ""
                    : "s"
            }?\n\nThis action cannot be undone. The deleted orders and their order items will be permanently removed from the database.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setPermanentlyDeleting(true);

            await api.del(
                "/admin/orders/deleted/permanent"
            );

            closeOrderDetails();

            await loadOrders();

            alert(
                "All deleted orders have been permanently removed."
            );
        } catch (err) {
            console.error(
                "Failed to permanently delete deleted orders:",
                err
            );

            alert(
                err.message ||
                "Failed to permanently delete deleted orders"
            );
        } finally {
            setPermanentlyDeleting(false);
        }
    }

    // =========================================================
    // STATUS HELPERS
    // =========================================================

    function getNextStatus(status) {
        switch (status) {
            case "paid":
                return "shipped";

            case "shipped":
                return "completed";

            default:
                return null;
        }
    }

    function getStatusLabel(status) {
        switch (status) {
            case "pending":
                return "Pending";

            case "paid":
                return "Paid";

            case "shipped":
                return "Shipped";

            case "completed":
                return "Completed";

            case "cancelled":
                return "Cancelled";

            default:
                return status || "Unknown";
        }
    }

    function getStatusClass(status) {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-700";

            case "paid":
                return "bg-blue-100 text-blue-700";

            case "shipped":
                return "bg-purple-100 text-purple-700";

            case "completed":
                return "bg-green-100 text-green-700";

            case "cancelled":
                return "bg-red-100 text-red-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    }

    // =========================================================
    // FILTER ACTIVE ORDERS
    // =========================================================

    const filteredOrders = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        return orders
            .filter((order) => {
                if (
                    statusFilter !== "all" &&
                    order.status !== statusFilter
                ) {
                    return false;
                }

                if (!keyword) {
                    return true;
                }

                return (
                    String(order.id || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.orderNo || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.userId || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.receiverName || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.receiverPhone || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.address || "")
                        .toLowerCase()
                        .includes(keyword)
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        a.createTime || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createTime || 0
                    ).getTime();

                return dateB - dateA;
            });
    }, [orders, search, statusFilter]);

    // =========================================================
    // FILTER DELETED ORDERS
    // =========================================================

    const filteredDeletedOrders = useMemo(() => {
        const keyword =
            search.trim().toLowerCase();

        return deletedOrders
            .filter((order) => {
                if (!keyword) {
                    return true;
                }

                return (
                    String(order.id || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.orderNo || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.userId || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.receiverName || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.receiverPhone || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(order.address || "")
                        .toLowerCase()
                        .includes(keyword)
                );
            })
            .sort((a, b) => {
                const dateA =
                    new Date(
                        a.createTime || 0
                    ).getTime();

                const dateB =
                    new Date(
                        b.createTime || 0
                    ).getTime();

                return dateB - dateA;
            });
    }, [deletedOrders, search]);

    // =========================================================
    // STATISTICS
    // =========================================================

    const statistics = useMemo(() => {
        const total = orders.length;

        // Kept for compatibility with old orders.
        const pending = orders.filter(
            (order) =>
                order.status === "pending"
        ).length;

        const paid = orders.filter(
            (order) =>
                order.status === "paid"
        ).length;

        const shipped = orders.filter(
            (order) =>
                order.status === "shipped"
        ).length;

        const completed = orders.filter(
            (order) =>
                order.status === "completed"
        ).length;

        const cancelled = orders.filter(
            (order) =>
                order.status === "cancelled"
        ).length;

        const revenue = orders
            .filter(
                (order) =>
                    order.status !== "cancelled"
            )
            .reduce(
                (sum, order) =>
                    sum +
                    Number(
                        order.totalPrice || 0
                    ),
                0
            );

        return {
            total,
            pending,
            paid,
            shipped,
            completed,
            cancelled,
            deleted: deletedOrders.length,
            revenue,
        };
    }, [orders, deletedOrders]);

    // =========================================================
    // FORMATTERS
    // =========================================================

    function formatPrice(value) {
        return Number(value || 0).toFixed(2);
    }

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString();
    }

    function calculateItemSubtotal(item) {
        return (
            Number(item.price || 0) *
            Number(item.quantity || 0)
        );
    }

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-screen bg-gray-50">

            {/* =====================================================
                HEADER
            ===================================================== */}

            <header className="border-b bg-white">
                <div className="mx-auto max-w-7xl px-6 py-5">

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Order Management
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage customer orders and update order status
                            </p>
                        </div>

                        <div className="flex items-center gap-3">

                            {/* DASHBOARD */}

                            <button
                                onClick={() =>
                                    setPage("admin")
                                }
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md active:translate-y-0 active:bg-gray-200"
                            >
                                ← Dashboard
                            </button>

                            {/* REFRESH */}

                            <button
                                onClick={loadOrders}
                                disabled={
                                    loading ||
                                    permanentlyDeleting
                                }
                                className="rounded-lg bg-gray-900 px-4 py-2 text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                            >
                                {loading
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>

                        </div>

                    </div>

                </div>
            </header>

            {/* =====================================================
                MAIN
            ===================================================== */}

            <main className="mx-auto max-w-7xl px-6 py-8">

                {/* =================================================
                    STATISTICS
                ================================================= */}

                <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Total
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-900">
                            {statistics.total}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-yellow-200 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-1 text-2xl font-bold text-yellow-600">
                            {statistics.pending}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Paid
                        </p>

                        <p className="mt-1 text-2xl font-bold text-blue-600">
                            {statistics.paid}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Shipped
                        </p>

                        <p className="mt-1 text-2xl font-bold text-purple-600">
                            {statistics.shipped}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Completed
                        </p>

                        <p className="mt-1 text-2xl font-bold text-green-600">
                            {statistics.completed}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Cancelled
                        </p>

                        <p className="mt-1 text-2xl font-bold text-red-600">
                            {statistics.cancelled}
                        </p>
                    </div>

                    <div className="rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:shadow-md">
                        <p className="text-sm text-gray-500">
                            Deleted
                        </p>

                        <p className="mt-1 text-2xl font-bold text-gray-500">
                            {statistics.deleted}
                        </p>
                    </div>

                    <div className="col-span-2 rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md md:col-span-3 lg:col-span-7">

                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-sm text-gray-500">
                                    Revenue
                                </p>

                                <p className="mt-1 text-2xl font-bold text-gray-900">
                                    ¥
                                    {formatPrice(
                                        statistics.revenue
                                    )}
                                </p>
                            </div>

                            <div className="text-right">

                                <p className="text-sm text-gray-500">
                                    Active Orders
                                </p>

                                <p className="mt-1 text-lg font-semibold text-gray-900">
                                    {statistics.total}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SEARCH / FILTER
                ================================================= */}

                <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">

                    <div className="flex flex-col gap-4 md:flex-row">

                        <div className="flex-1">

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Search orders
                            </label>

                            <input
                                type="text"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Search by order number, customer, phone, address..."
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:border-transparent focus:bg-white focus:ring-2 focus:ring-gray-900"
                            />

                        </div>

                        <div className="md:w-56">

                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(e) =>
                                    setStatusFilter(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-gray-900"
                            >

                                <option value="all">
                                    All Statuses
                                </option>

                                <option value="paid">
                                    Paid
                                </option>

                                <option value="shipped">
                                    Shipped
                                </option>

                                <option value="completed">
                                    Completed
                                </option>

                                <option value="cancelled">
                                    Cancelled
                                </option>

                            </select>

                        </div>

                    </div>

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">

                        <span>
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {filteredOrders.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {orders.length}
                            </span>{" "}
                            active orders
                        </span>

                        {(search ||
                            statusFilter !== "all") && (

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter(
                                        "all"
                                    );
                                }}
                                className="rounded-md px-2 py-1 font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900 hover:underline"
                            >
                                Clear filters
                            </button>

                        )}

                    </div>

                </div>

                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-red-700">

                        <p className="font-medium">
                            {error}
                        </p>

                        <button
                            onClick={loadOrders}
                            className="mt-2 rounded-md px-2 py-1 text-sm transition-all duration-200 hover:bg-red-100 hover:text-red-900 hover:underline"
                        >
                            Try again
                        </button>

                    </div>

                )}

                {/* =================================================
                    ACTIVE ORDERS
                ================================================= */}

                {loading ? (

                    <div className="rounded-xl border bg-white p-12 text-center">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                        <p className="mt-4 text-gray-500">
                            Loading orders...
                        </p>

                    </div>

                ) : filteredOrders.length === 0 ? (

                    <div className="rounded-xl border bg-white p-12 text-center">

                        <div className="mb-4 text-5xl">
                            📦
                        </div>

                        <h2 className="text-lg font-semibold text-gray-900">
                            No orders found
                        </h2>

                        <p className="mt-1 text-gray-500">
                            Try changing your search or status filter.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">

                        <div className="flex items-center justify-between border-b bg-white px-5 py-4">

                            <div>

                                <h2 className="font-semibold text-gray-900">
                                    Active Orders
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Orders currently visible to customers
                                </p>

                            </div>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-200">
                                {orders.length}
                            </span>

                        </div>

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="border-b bg-gray-50">

                                    <tr>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Order
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Receiver
                                        </th>

                                        <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                            Total
                                        </th>

                                        <th className="px-5 py-4 text-center font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Date
                                        </th>

                                        <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y">

                                    {filteredOrders.map(
                                        (order) => {

                                            const nextStatus =
                                                getNextStatus(
                                                    order.status
                                                );

                                            const isUpdating =
                                                updatingOrderId ===
                                                order.id;

                                            const isDeleting =
                                                deletingOrderId ===
                                                order.id;

                                            return (

                                                <tr
                                                    key={order.id}
                                                    className="transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
                                                >

                                                    <td className="px-5 py-4">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openOrderDetails(
                                                                    order.id
                                                                )
                                                            }
                                                            className="group rounded-lg px-1 py-1 text-left transition-all duration-200 hover:bg-gray-50"
                                                        >

                                                            <p className="font-semibold text-gray-900 transition-colors duration-200 group-hover:text-black group-hover:underline">
                                                                #
                                                                {order.orderNo ||
                                                                    order.id}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-500 transition-colors duration-200 group-hover:text-gray-700">
                                                                ID:{" "}
                                                                {
                                                                    order.id
                                                                }
                                                            </p>

                                                        </button>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <p className="text-gray-900">
                                                            User #
                                                            {
                                                                order.userId
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <p className="font-medium text-gray-900">
                                                            {
                                                                order.receiverName ||
                                                                "-"
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {
                                                                order.receiverPhone ||
                                                                "-"
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="px-5 py-4 text-right">

                                                        <span className="font-semibold text-gray-900">
                                                            ¥
                                                            {formatPrice(
                                                                order.totalPrice
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-4 text-center">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getStatusClass(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                order.status
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">

                                                        <span className="text-gray-600">
                                                            {formatDate(
                                                                order.createTime
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <div className="flex flex-wrap items-center justify-end gap-2">

                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openOrderDetails(
                                                                        order.id
                                                                    )
                                                                }
                                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md active:translate-y-0"
                                                            >
                                                                View
                                                            </button>

                                                            {/* NEXT STATUS */}

                                                            {nextStatus && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            order.id,
                                                                            nextStatus
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isUpdating ||
                                                                        isDeleting ||
                                                                        permanentlyDeleting
                                                                    }
                                                                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                                >
                                                                    {isUpdating
                                                                        ? "Updating..."
                                                                        : nextStatus ===
                                                                          "shipped"
                                                                        ? "Ship"
                                                                        : "Complete"}
                                                                </button>

                                                            )}

                                                            {/* CANCEL */}

                                                            {order.status ===
                                                                "paid" && (

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleStatusChange(
                                                                            order.id,
                                                                            "cancelled"
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        isUpdating ||
                                                                        isDeleting ||
                                                                        permanentlyDeleting
                                                                    }
                                                                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-100 hover:text-red-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                                >
                                                                    Cancel
                                                                </button>

                                                            )}

                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteOrder(
                                                                        order.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isDeleting ||
                                                                    isUpdating ||
                                                                    permanentlyDeleting
                                                                }
                                                                className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-medium text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-50 hover:text-red-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                            >
                                                                {isDeleting
                                                                    ? "Deleting..."
                                                                    : "Delete"}
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

                {/* =================================================
                    DELETED ORDERS
                ================================================= */}

                <div className="mt-10 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:border-gray-300 hover:shadow-md">

                    <div className="flex flex-col gap-3 border-b bg-gray-50 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <div className="flex items-center gap-3">

                                <h2 className="font-semibold text-gray-900">
                                    Deleted Orders
                                </h2>

                                <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-300">
                                    {deletedOrders.length}
                                </span>

                            </div>

                            <p className="mt-1 text-xs text-gray-500">
                                Deleted orders are archived and can be restored.
                            </p>

                        </div>

                    </div>

                    {filteredDeletedOrders.length === 0 ? (

                        <div className="p-10 text-center">

                            <div className="mb-3 text-4xl">
                                🗑️
                            </div>

                            <h3 className="font-semibold text-gray-900">
                                No deleted orders
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Deleted orders will appear here.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full text-sm">

                                <thead className="border-b bg-gray-50">

                                    <tr>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Order
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Customer
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Receiver
                                        </th>

                                        <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                            Total
                                        </th>

                                        <th className="px-5 py-4 text-center font-semibold text-gray-700">
                                            Status
                                        </th>

                                        <th className="px-5 py-4 text-left font-semibold text-gray-700">
                                            Date
                                        </th>

                                        <th className="px-5 py-4 text-right font-semibold text-gray-700">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y">

                                    {filteredDeletedOrders.map(
                                        (order) => {

                                            const isRestoring =
                                                restoringOrderId ===
                                                order.id;

                                            return (

                                                <tr
                                                    key={order.id}
                                                    className="transition-all duration-200 hover:bg-gray-100 hover:shadow-sm"
                                                >

                                                    <td className="px-5 py-4">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openOrderDetails(
                                                                    order.id
                                                                )
                                                            }
                                                            className="group rounded-lg px-1 py-1 text-left transition-all duration-200 hover:bg-gray-50"
                                                        >

                                                            <p className="font-semibold text-gray-700 transition-colors duration-200 group-hover:text-gray-900 group-hover:underline">
                                                                #
                                                                {order.orderNo ||
                                                                    order.id}
                                                            </p>

                                                            <p className="mt-1 text-xs text-gray-400 transition-colors duration-200 group-hover:text-gray-600">
                                                                ID:{" "}
                                                                {
                                                                    order.id
                                                                }
                                                            </p>

                                                        </button>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <p className="text-gray-600">
                                                            User #
                                                            {
                                                                order.userId
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <p className="font-medium text-gray-700">
                                                            {
                                                                order.receiverName ||
                                                                "-"
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {
                                                                order.receiverPhone ||
                                                                "-"
                                                            }
                                                        </p>

                                                    </td>

                                                    <td className="px-5 py-4 text-right">

                                                        <span className="font-semibold text-gray-700">
                                                            ¥
                                                            {formatPrice(
                                                                order.totalPrice
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-4 text-center">

                                                        <span
                                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getStatusClass(
                                                                order.status
                                                            )}`}
                                                        >
                                                            {getStatusLabel(
                                                                order.status
                                                            )}
                                                        </span>

                                                        <div className="mt-1">

                                                            <span className="inline-flex rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-300">
                                                                Deleted
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td className="whitespace-nowrap px-5 py-4">

                                                        <span className="text-gray-500">
                                                            {formatDate(
                                                                order.createTime
                                                            )}
                                                        </span>

                                                    </td>

                                                    <td className="px-5 py-4">

                                                        <div className="flex flex-wrap items-center justify-end gap-2">

                                                            {/* VIEW */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openOrderDetails(
                                                                        order.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    permanentlyDeleting
                                                                }
                                                                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                View
                                                            </button>

                                                            {/* RESTORE */}

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRestoreOrder(
                                                                        order.id
                                                                    )
                                                                }
                                                                disabled={
                                                                    isRestoring ||
                                                                    permanentlyDeleting
                                                                }
                                                                className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                            >
                                                                {isRestoring
                                                                    ? "Restoring..."
                                                                    : "Restore"}
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* =================================================
                    PERMANENT DELETE DELETED ORDERS
                ================================================= */}

                {deletedOrders.length > 0 && (

                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div>

                            <h3 className="text-sm font-semibold text-red-800">
                                Permanently Delete Deleted Orders
                            </h3>

                            <p className="mt-1 text-xs leading-5 text-red-600">

                                This will permanently remove all{" "}

                                <span className="font-semibold">
                                    {deletedOrders.length}
                                </span>{" "}

                                deleted order
                                {deletedOrders.length === 1
                                    ? ""
                                    : "s"}{" "}
                                and their order items from the database.
                                This action cannot be undone.

                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={
                                handlePermanentlyDeleteDeletedOrders
                            }
                            disabled={
                                permanentlyDeleting ||
                                loading
                            }
                            className="shrink-0 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-100 hover:text-red-700 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {permanentlyDeleting
                                ? "Deleting..."
                                : "Permanently Delete All"}
                        </button>

                    </div>

                )}

            </main>

            {/* =====================================================
                ORDER DETAILS MODAL
            ===================================================== */}

            {isModalOpen && (

                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 sm:p-5"
                    onMouseDown={(e) => {
                        if (
                            e.target === e.currentTarget
                        ) {
                            closeOrderDetails();
                        }
                    }}
                >

                    <div
                        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onMouseDown={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div className="flex shrink-0 items-center justify-between border-b bg-white px-5 py-4 sm:px-6">

                            <div className="min-w-0">

                                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                                    Order Details
                                </h2>

                                {selectedOrder && (

                                    <div className="mt-1 flex flex-wrap items-center gap-2">

                                        <p className="text-sm text-gray-500">
                                            #
                                            {selectedOrder.orderNo ||
                                                selectedOrder.id}
                                        </p>

                                        {selectedOrder.isDeleted && (

                                            <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[10px] font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-300">
                                                Deleted
                                            </span>

                                        )}

                                    </div>

                                )}

                            </div>

                            <button
                                type="button"
                                onClick={closeOrderDetails}
                                aria-label="Close order details"
                                className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-2xl leading-none text-gray-400 transition-all duration-200 hover:scale-110 hover:bg-gray-100 hover:text-gray-900 active:scale-95 active:bg-gray-200"
                            >
                                ×
                            </button>

                        </div>

                        {/* =================================================
                            MODAL CONTENT
                        ================================================= */}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

                            {detailsLoading ? (

                                <div className="flex min-h-[320px] items-center justify-center p-8">

                                    <div className="text-center">

                                        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                                        <p className="mt-4 text-sm text-gray-500">
                                            Loading order details...
                                        </p>

                                    </div>

                                </div>

                            ) : detailsError ? (

                                <div className="p-6 sm:p-8">

                                    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                                        {detailsError}
                                    </div>

                                </div>

                            ) : selectedOrder ? (

                                <div className="space-y-5 p-5 sm:p-6">

                                    {/* =================================================
                                        ORDER SUMMARY
                                    ================================================= */}

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                                        <div className="rounded-xl border bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm">

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Status
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">

                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 hover:scale-105 ${getStatusClass(
                                                        selectedOrder.status
                                                    )}`}
                                                >
                                                    {getStatusLabel(
                                                        selectedOrder.status
                                                    )}
                                                </span>

                                                {selectedOrder.isDeleted && (

                                                    <span className="inline-flex rounded-full bg-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition-all duration-200 hover:bg-gray-300">
                                                        Deleted
                                                    </span>

                                                )}

                                            </div>

                                        </div>

                                        <div className="rounded-xl border bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm">

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Order Date
                                            </p>

                                            <p className="mt-3 text-sm font-medium text-gray-900">
                                                {formatDate(
                                                    selectedOrder.createTime
                                                )}
                                            </p>

                                        </div>

                                        <div className="rounded-xl border bg-gray-50 p-4 transition-all duration-200 hover:border-gray-300 hover:bg-gray-100 hover:shadow-sm">

                                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                                Total
                                            </p>

                                            <p className="mt-2 text-2xl font-bold text-gray-900">
                                                ¥
                                                {formatPrice(
                                                    selectedOrder.totalPrice
                                                )}
                                            </p>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        CUSTOMER + RECEIVER
                                    ================================================= */}

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                                        <div className="rounded-xl border p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">

                                            <h3 className="mb-4 text-sm font-semibold text-gray-900">
                                                Customer
                                            </h3>

                                            <div className="space-y-3 text-sm">

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-gray-500">
                                                        User ID
                                                    </span>

                                                    <span className="font-medium text-gray-900">
                                                        #
                                                        {
                                                            selectedOrder.userId
                                                        }
                                                    </span>

                                                </div>

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-gray-500">
                                                        Order ID
                                                    </span>

                                                    <span className="font-medium text-gray-900">
                                                        #
                                                        {
                                                            selectedOrder.id
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="rounded-xl border p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">

                                            <h3 className="mb-4 text-sm font-semibold text-gray-900">
                                                Receiver
                                            </h3>

                                            <div className="space-y-3 text-sm">

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-gray-500">
                                                        Name
                                                    </span>

                                                    <span className="max-w-[65%] text-right font-medium text-gray-900">
                                                        {
                                                            selectedOrder.receiverName ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                                <div className="flex items-center justify-between gap-4">

                                                    <span className="text-gray-500">
                                                        Phone
                                                    </span>

                                                    <span className="max-w-[65%] text-right font-medium text-gray-900">
                                                        {
                                                            selectedOrder.receiverPhone ||
                                                            "-"
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        ADDRESS
                                    ================================================= */}

                                    <div className="rounded-xl border p-5 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm">

                                        <h3 className="mb-3 text-sm font-semibold text-gray-900">
                                            Delivery Address
                                        </h3>

                                        <div className="rounded-lg bg-gray-50 px-4 py-3 transition-all duration-200 hover:bg-gray-100">

                                            <p className="break-words text-sm leading-6 text-gray-600">
                                                {
                                                    selectedOrder.address ||
                                                    "No address provided"
                                                }
                                            </p>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        ORDER ITEMS
                                    ================================================= */}

                                    <div>

                                        <div className="mb-4 flex items-center justify-between">

                                            <h3 className="text-sm font-semibold text-gray-900">
                                                Order Items
                                            </h3>

                                            <span className="rounded-md px-2 py-1 text-sm text-gray-500 transition-all duration-200 hover:bg-gray-100 hover:text-gray-900">
                                                {
                                                    orderItems.length
                                                }{" "}
                                                {orderItems.length ===
                                                1
                                                    ? "item"
                                                    : "items"}
                                            </span>

                                        </div>

                                        {orderItems.length ===
                                        0 ? (

                                            <div className="rounded-xl border p-8 text-center text-sm text-gray-500 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50">
                                                No items found for this order.
                                            </div>

                                        ) : (

                                            <div className="overflow-hidden rounded-xl border transition-all duration-200 hover:border-gray-300 hover:shadow-sm">

                                                <div className="divide-y">

                                                    {orderItems.map(
                                                        (item) => (

                                                            <div
                                                                key={
                                                                    item.id
                                                                }
                                                                className="flex flex-col gap-4 p-4 transition-all duration-200 hover:bg-gray-50 sm:flex-row sm:items-center"
                                                            >

                                                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 transition-all duration-200 hover:scale-105 hover:shadow-md">

                                                                    {item.productImage ? (

                                                                        <img
                                                                            src={
                                                                                item.productImage
                                                                            }
                                                                            alt={
                                                                                item.productName ||
                                                                                "Product"
                                                                            }
                                                                            className="h-full w-full object-cover"
                                                                        />

                                                                    ) : (

                                                                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                                            No image
                                                                        </div>

                                                                    )}

                                                                </div>

                                                                <div className="min-w-0 flex-1">

                                                                    <p className="truncate font-semibold text-gray-900 transition-colors duration-200 hover:text-black">
                                                                        {
                                                                            item.productName ||
                                                                            `Product #${item.productId}`
                                                                        }
                                                                    </p>

                                                                    <p className="mt-1 text-xs text-gray-500">
                                                                        Product ID:{" "}
                                                                        {
                                                                            item.productId
                                                                        }
                                                                    </p>

                                                                    <p className="mt-2 text-sm text-gray-500">
                                                                        ¥
                                                                        {formatPrice(
                                                                            item.price
                                                                        )}{" "}
                                                                        ×{" "}
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </p>

                                                                </div>

                                                                <div className="shrink-0 text-left sm:text-right">

                                                                    <p className="text-xs text-gray-400">
                                                                        Subtotal
                                                                    </p>

                                                                    <p className="mt-1 text-base font-bold text-gray-900">
                                                                        ¥
                                                                        {formatPrice(
                                                                            calculateItemSubtotal(
                                                                                item
                                                                            )
                                                                        )}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                                <div className="border-t bg-gray-50 px-5 py-4 transition-all duration-200 hover:bg-gray-100">

                                                    <div className="flex items-center justify-between">

                                                        <span className="font-semibold text-gray-700">
                                                            Order Total
                                                        </span>

                                                        <span className="text-xl font-bold text-gray-900">
                                                            ¥
                                                            {formatPrice(
                                                                selectedOrder.totalPrice
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                    {/* =================================================
                                        ACTIONS
                                    ================================================= */}

                                    <div className="border-t pt-5">

                                        {selectedOrder.isDeleted ? (

                                            <div className="flex flex-wrap items-center gap-3">

                                                <div className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm text-gray-600 transition-all duration-200 hover:bg-gray-200">
                                                    This order is deleted.
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestoreOrder(
                                                            selectedOrder.id
                                                        )
                                                    }
                                                    disabled={
                                                        restoringOrderId ===
                                                        selectedOrder.id ||
                                                        permanentlyDeleting
                                                    }
                                                    className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                >
                                                    {restoringOrderId ===
                                                    selectedOrder.id
                                                        ? "Restoring..."
                                                        : "Restore Order"}
                                                </button>

                                            </div>

                                        ) : (

                                            <div className="flex flex-wrap items-center gap-3">

                                                {/* NEXT STATUS */}

                                                {getNextStatus(
                                                    selectedOrder.status
                                                ) && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                selectedOrder.id,
                                                                getNextStatus(
                                                                    selectedOrder.status
                                                                )
                                                            )
                                                        }
                                                        disabled={
                                                            updatingOrderId ===
                                                                selectedOrder.id ||
                                                            deletingOrderId ===
                                                                selectedOrder.id ||
                                                            permanentlyDeleting
                                                        }
                                                        className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                    >
                                                        {updatingOrderId ===
                                                        selectedOrder.id
                                                            ? "Updating..."
                                                            : getNextStatus(
                                                                  selectedOrder.status
                                                              ) === "shipped"
                                                            ? "Mark as Shipped"
                                                            : "Mark as Completed"}
                                                    </button>

                                                )}

                                                {/* CANCEL */}

                                                {selectedOrder.status ===
                                                    "paid" && (

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleStatusChange(
                                                                selectedOrder.id,
                                                                "cancelled"
                                                            )
                                                        }
                                                        disabled={
                                                            updatingOrderId ===
                                                                selectedOrder.id ||
                                                            deletingOrderId ===
                                                                selectedOrder.id ||
                                                            permanentlyDeleting
                                                        }
                                                        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-100 hover:text-red-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                    >
                                                        Cancel Order
                                                    </button>

                                                )}

                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteOrder(
                                                            selectedOrder.id
                                                        )
                                                    }
                                                    disabled={
                                                        deletingOrderId ===
                                                            selectedOrder.id ||
                                                        updatingOrderId ===
                                                            selectedOrder.id ||
                                                        permanentlyDeleting
                                                    }
                                                    className="rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-50 hover:text-red-700 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-sm"
                                                >
                                                    {deletingOrderId ===
                                                    selectedOrder.id
                                                        ? "Deleting..."
                                                        : "Delete Order"}
                                                </button>

                                            </div>

                                        )}

                                    </div>

                                </div>

                            ) : null}

                        </div>

                        {/* =================================================
                            MODAL FOOTER
                        ================================================= */}

                        <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-white px-5 py-4 sm:px-6">

                            <button
                                type="button"
                                onClick={closeOrderDetails}
                                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-700 hover:shadow-md active:translate-y-0 active:bg-gray-950"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}