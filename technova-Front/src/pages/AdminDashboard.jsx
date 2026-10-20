import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminDashboard({ setPage }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/admin/dashboard")
      .then((data) => {
        console.log("Admin dashboard:", data);
        setDashboard(data);
      })
      .catch((err) => {
        console.error(
          "Failed to load admin dashboard:",
          err
        );
        setError(
          err.message ||
            "Failed to load admin dashboard"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200" />

            <div className="absolute inset-0 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>

          <p className="mt-4 text-base font-semibold text-slate-500">
            Loading admin dashboard...
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-2xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  // ============================================================
  // STAT VALUES
  // ============================================================

  const totalUsers = Number(
    dashboard.totalUsers || 0
  );

  const totalProducts = Number(
    dashboard.totalProducts || 0
  );

  const totalOrders = Number(
    dashboard.totalOrders || 0
  );

  const totalSales = Number(
    dashboard.totalSales || 0
  );

  const pendingOrders = Number(
    dashboard.pendingOrders || 0
  );

  const lowStockProducts = Number(
    dashboard.lowStockProducts || 0
  );

  // ============================================================
  // STAT CARDS
  // ============================================================

  const cards = [
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      description: "Registered customers",
      icon: "👥",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
      valueText: "text-slate-900",
    },
    {
      title: "Total Products",
      value: totalProducts.toLocaleString(),
      description: "Products in store",
      icon: "📦",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      valueText: "text-slate-900",
    },
    {
      title: "Total Orders",
      value: totalOrders.toLocaleString(),
      description: "Orders received",
      icon: "🛒",
      iconBg: "bg-emerald-100",
      iconText: "text-emerald-600",
      valueText: "text-slate-900",
    },
    {
      title: "Total Sales",
      value: `¥${totalSales.toLocaleString()}`,
      description: "Total store revenue",
      icon: "💰",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      valueText: "text-slate-900",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.toLocaleString(),
      description: "Orders awaiting action",
      icon: "⏳",
      iconBg: "bg-orange-100",
      iconText: "text-orange-600",
      valueText:
        pendingOrders > 0
          ? "text-orange-700"
          : "text-slate-900",
    },
    {
      title: "Low Stock",
      value: lowStockProducts.toLocaleString(),
      description: "Products need attention",
      icon: "⚠️",
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
      valueText:
        lowStockProducts > 0
          ? "text-rose-700"
          : "text-slate-900",
    },
  ];

  // ============================================================
  // MANAGEMENT CARDS
  // ============================================================

  const managementCards = [
    {
      title: "Products",
      description:
        "Add, edit, remove, restore, and manage your store inventory.",
      icon: "📦",
      button: "Manage Products",
      page: "admin-products",
      iconBg: "bg-blue-50",
      iconBorder: "border-blue-100",
      iconText: "text-blue-600",
      buttonClass:
        "bg-blue-600 hover:bg-blue-700",
    },
    {
      title: "Categories",
      description:
        "Organize products into clear and useful categories.",
      icon: "🗂️",
      button: "Manage Categories",
      page: "admin-categories",
      iconBg: "bg-slate-50",
      iconBorder: "border-slate-200",
      iconText: "text-slate-700",
      buttonClass:
        "bg-slate-800 hover:bg-slate-900",
    },
    {
      title: "Orders",
      description:
        "Review orders, manage archived orders, and update statuses.",
      icon: "🛍️",
      button: "Manage Orders",
      page: "admin-orders",
      iconBg: "bg-emerald-50",
      iconBorder: "border-emerald-100",
      iconText: "text-emerald-600",
      buttonClass:
        "bg-emerald-600 hover:bg-emerald-700",
    },
    {
      title: "Users",
      description:
        "View customer accounts, edit information, and manage users.",
      icon: "👤",
      button: "Manage Users",
      page: "admin-users",
      iconBg: "bg-violet-50",
      iconBorder: "border-violet-100",
      iconText: "text-violet-600",
      buttonClass:
        "bg-violet-600 hover:bg-violet-700",
    },
    {
      title: "Sales & Analytics",
      description:
        "Monitor revenue, sales performance, orders, and top-selling products.",
      icon: "📊",
      button: "View Sales",
      page: "admin-sales",
      iconBg: "bg-amber-50",
      iconBorder: "border-amber-100",
      iconText: "text-amber-600",
      buttonClass:
        "bg-amber-600 hover:bg-amber-700",
    },
    {
      title: "Store Settings",
      description:
        "Configure your store information, order preferences, and store settings.",
      icon: "⚙️",
      button: "Manage Settings",
      page: "admin-settings",
      iconBg: "bg-slate-50",
      iconBorder: "border-slate-200",
      iconText: "text-slate-700",
      buttonClass:
        "bg-slate-800 hover:bg-slate-900",
    },
    {
      title: "Contact Messages",
      description:
        "View customer questions, support requests, and contact messages.",
      icon: "💬",
      button: "View Messages",
      page: "admin-contact-messages",
      iconBg: "bg-cyan-50",
      iconBorder: "border-cyan-100",
      iconText: "text-cyan-600",
      buttonClass:
        "bg-cyan-600 hover:bg-cyan-700",
    },
  ];

  // ============================================================
  // UI
  // ============================================================

  return (
    <section className="space-y-5 px-4 pb-7 pt-5 sm:px-6 lg:px-8">

      {/* ========================================================
          HERO
      ========================================================= */}

      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

        <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-blue-400/10 transition-colors duration-300 group-hover:bg-blue-400/15" />

        <div className="absolute -bottom-40 right-16 h-80 w-80 rounded-full bg-indigo-400/10 transition-colors duration-300 group-hover:bg-indigo-400/15" />

        <div className="absolute left-1/2 top-0 h-64 w-64 rounded-full bg-white/[0.03] transition-colors duration-300 group-hover:bg-white/[0.05]" />

        <div className="relative px-5 py-6 sm:px-7 sm:py-7">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Hero text */}

            <div className="max-w-2xl">

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">

                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />

                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>

                <span className="text-xs font-semibold text-blue-100">
                  Admin Panel
                </span>

              </div>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                Welcome to TechNova
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-blue-100/90">
                Monitor your store, manage products and
                orders, and keep everything running smoothly
                from one place.
              </p>

            </div>

            {/* Store status */}

            <div className="shrink-0">

              <div className="min-w-[180px] rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/[0.14]">

                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">
                  Store Status
                </p>

                <div className="mt-1.5 flex items-center gap-2">

                  <span className="h-2 w-2 rounded-full bg-green-400" />

                  <span className="text-sm font-semibold text-white">
                    Everything is running
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>
      </div>

      {/* ========================================================
          STORE OVERVIEW
      ========================================================= */}

      <div>

        <div className="mb-3">

          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Dashboard
          </p>

          <h2 className="mt-0.5 text-xl font-bold text-slate-900">
            Store Overview
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Key statistics from your TechNova store.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

          {cards.map((card) => (
            <div
              key={card.title}
              className="group rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <p className="text-xs font-semibold text-slate-500">
                    {card.title}
                  </p>

                  <p
                    className={`mt-0.5 text-2xl font-bold tracking-tight ${card.valueText}`}
                  >
                    {card.value}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {card.description}
                  </p>

                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${card.iconBg} ${card.iconText} text-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {card.icon}
                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* ========================================================
          NEEDS ATTENTION
      ========================================================= */}

      {(pendingOrders > 0 ||
        lowStockProducts > 0) && (
        <div className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg">

          <div className="border-b border-slate-100 px-4 py-3">

            <div className="flex items-center gap-2.5">

              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-100 bg-amber-50 text-base transition-transform duration-300 group-hover:scale-110">
                ⚡
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Needs Attention
                </h2>

                <p className="text-xs text-slate-500">
                  Items that may require your attention.
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 gap-2.5 p-3 md:grid-cols-2">

            {pendingOrders > 0 && (
              <button
                type="button"
                onClick={() =>
                  setPage("admin-orders")
                }
                className="group/attention rounded-lg border border-orange-100 bg-orange-50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-100/60 hover:shadow-sm"
              >

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />

                      <p className="text-xs font-bold text-orange-900">
                        Pending Orders
                      </p>

                    </div>

                    <p className="mt-1 text-xs leading-4 text-orange-700">
                      Review orders waiting for action.
                    </p>

                  </div>

                  <div className="flex items-center gap-1.5">

                    <span className="text-2xl font-bold text-orange-700">
                      {pendingOrders}
                    </span>

                    <span className="text-base text-orange-500 transition-transform group-hover/attention:translate-x-1">
                      →
                    </span>

                  </div>

                </div>

              </button>
            )}

            {lowStockProducts > 0 && (
              <button
                type="button"
                onClick={() =>
                  setPage("admin-products")
                }
                className="group/attention rounded-lg border border-rose-100 bg-rose-50 p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-100/60 hover:shadow-sm"
              >

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />

                      <p className="text-xs font-bold text-rose-900">
                        Low Stock Products
                      </p>

                    </div>

                    <p className="mt-1 text-xs leading-4 text-rose-700">
                      Check products with limited inventory.
                    </p>

                  </div>

                  <div className="flex items-center gap-1.5">

                    <span className="text-2xl font-bold text-rose-700">
                      {lowStockProducts}
                    </span>

                    <span className="text-base text-rose-500 transition-transform group-hover/attention:translate-x-1">
                      →
                    </span>

                  </div>

                </div>

              </button>
            )}

          </div>

        </div>
      )}

      {/* ========================================================
          STORE MANAGEMENT
      ========================================================= */}

      <div>

        <div className="mb-3">

          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Administration
          </p>

          <h2 className="mt-0.5 text-xl font-bold text-slate-900">
            Store Management
          </h2>

          <p className="mt-0.5 text-sm text-slate-500">
            Quickly access the main administration areas.
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

          {managementCards.map((card) => (
            <div
              key={card.title}
              role="button"
              tabIndex={0}
              onClick={() =>
                setPage(card.page)
              }
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" ||
                  e.key === " "
                ) {
                  e.preventDefault();
                  setPage(card.page);
                }
              }}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
            >

              <div className="flex items-start gap-3">

                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${card.iconBg} ${card.iconBorder} ${card.iconText} text-lg transition-transform duration-300 group-hover:scale-110`}
                >
                  {card.icon}
                </div>

                <div className="min-w-0 flex-1">

                  <h3 className="text-base font-bold text-slate-900">
                    {card.title}
                  </h3>

                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {card.description}
                  </p>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(card.page);
                    }}
                    className={`mt-2.5 rounded-lg ${card.buttonClass} px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                  >
                    {card.button}
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* ========================================================
          STORE SUMMARY
      ========================================================= */}

      <div className="group relative overflow-hidden rounded-2xl bg-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">

        <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 transition-colors duration-300 group-hover:bg-blue-500/15" />

        <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 transition-colors duration-300 group-hover:bg-indigo-500/15" />

        <div className="relative px-5 py-5 sm:px-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Store Summary
              </p>

              <h2 className="mt-1 text-xl font-bold text-white sm:text-2xl">
                Your TechNova store at a glance
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-400">
                You currently have{" "}
                <span className="font-semibold text-white">
                  {totalProducts.toLocaleString()}
                </span>{" "}
                products and{" "}
                <span className="font-semibold text-white">
                  {totalOrders.toLocaleString()}
                </span>{" "}
                orders in your store.
              </p>

            </div>

            <div className="grid shrink-0 grid-cols-2 gap-2.5">

              <div className="min-w-[95px] rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.10] hover:shadow-lg">

                <p className="text-2xl font-bold text-white">
                  {totalProducts.toLocaleString()}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Products
                </p>

              </div>

              <div className="min-w-[95px] rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.10] hover:shadow-lg">

                <p className="text-2xl font-bold text-white">
                  {totalOrders.toLocaleString()}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  Orders
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}