import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function AdminSettings({ setPage }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");

      const data = await api.get("/admin/settings");

      setSettings({
        storeName: data?.storeName || "",
        storeEmail: data?.storeEmail || "",
        storePhone: data?.storePhone || "",
        storeAddress: data?.storeAddress || "",
        currency: data?.currency || "CNY",
        taxRate: data?.taxRate ?? 0,
        lowStockThreshold: data?.lowStockThreshold ?? 10,
        allowCustomerCancellation:
          data?.allowCustomerCancellation ?? true,
        cancellationPeriodHours:
          data?.cancellationPeriodHours ?? 24,
        allowNewOrders: data?.allowNewOrders ?? true,
      });
    } catch (err) {
      console.error("Failed to load store settings:", err);
      setError(err.message || "Failed to load store settings");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(field, value) {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();

    if (!settings) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        storeName: settings.storeName.trim(),
        storeEmail: settings.storeEmail.trim(),
        storePhone: settings.storePhone.trim(),
        storeAddress: settings.storeAddress.trim(),
        currency: settings.currency,
        taxRate: Number(settings.taxRate),
        lowStockThreshold: Number(settings.lowStockThreshold),
        allowCustomerCancellation:
          Boolean(settings.allowCustomerCancellation),
        cancellationPeriodHours: Number(
          settings.cancellationPeriodHours
        ),
        allowNewOrders: Boolean(settings.allowNewOrders),
      };

      await api.put("/admin/settings", payload);

      setMessage("Store settings updated successfully.");

      await loadSettings();
    } catch (err) {
      console.error("Failed to save store settings:", err);

      setError(
        err.message || "Failed to update store settings"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[55vh] w-full items-center justify-center">
        <div className="rounded-xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-3 text-sm font-semibold text-slate-700">
            Loading store settings...
          </p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="mx-auto mt-5 w-full max-w-lg px-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <p className="text-sm font-semibold text-red-700">
            {error || "Store settings could not be loaded."}
          </p>

          <button
            type="button"
            onClick={loadSettings}
            className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg active:translate-y-0"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const inputClass =
    "w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 hover:border-blue-400 hover:bg-slate-50 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 overflow-x-hidden px-4 pb-8 pt-1 sm:px-5">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-4 flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />

            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-600">
              Administration
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Store Settings
          </h1>

          <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
            Manage your store information, configuration,
            inventory rules, and order preferences.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setPage("admin")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg active:translate-y-0"
        >
          <span>←</span>
          Dashboard
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ====================================================== */}

      {message && (
        <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 transition-all duration-200 hover:border-emerald-300 hover:shadow-md">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-emerald-600">
            ✓
          </div>

          <p className="min-w-0 text-xs font-medium text-emerald-700">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-3 flex items-center gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 transition-all duration-200 hover:border-red-300 hover:shadow-md">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs">
            ⚠️
          </div>

          <p className="min-w-0 text-xs font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* =====================================================
          QUICK OVERVIEW
      ====================================================== */}

      <div className="mb-4 grid min-w-0 grid-cols-2 gap-2.5 lg:grid-cols-4">
        {/* STORE */}

        <div className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-100">
              🏪
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Store
            </span>
          </div>

          <p className="mt-2.5 truncate text-xs font-bold text-slate-900">
            {settings.storeName || "TechNova"}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Store name
          </p>
        </div>

        {/* CURRENCY */}

        <div className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-emerald-100">
              💰
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Currency
            </span>
          </div>

          <p className="mt-2.5 text-xs font-bold text-slate-900">
            {settings.currency}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Store currency
          </p>
        </div>

        {/* TAX */}

        <div className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-violet-100">
              %
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Tax
            </span>
          </div>

          <p className="mt-2.5 text-xs font-bold text-slate-900">
            {Number(settings.taxRate || 0).toFixed(2)}%
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Current rate
          </p>
        </div>

        {/* ORDERS */}

        <div className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base transition-all duration-200 group-hover:scale-110 ${
                settings.allowNewOrders
                  ? "bg-emerald-50 group-hover:bg-emerald-100"
                  : "bg-red-50 group-hover:bg-red-100"
              }`}
            >
              🛒
            </div>

            <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Orders
            </span>
          </div>

          <p
            className={`mt-2.5 text-xs font-bold ${
              settings.allowNewOrders
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {settings.allowNewOrders
              ? "Enabled"
              : "Disabled"}
          </p>

          <p className="mt-0.5 text-[10px] text-slate-400">
            New orders
          </p>
        </div>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}

      <form
        onSubmit={handleSave}
        className="min-w-0 space-y-3.5"
      >
        {/* ===================================================
            STORE INFORMATION
        ==================================================== */}

        <section className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-blue-300 hover:shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-blue-100">
              🏪
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Store Information
              </h2>

              <p className="text-[10px] text-slate-400">
                Basic information about your store.
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
              {/* STORE NAME */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Store Name
                </label>

                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) =>
                    handleChange(
                      "storeName",
                      e.target.value
                    )
                  }
                  placeholder="TechNova"
                  required
                  className={inputClass}
                />
              </div>

              {/* STORE EMAIL */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Store Email
                </label>

                <input
                  type="email"
                  value={settings.storeEmail}
                  onChange={(e) =>
                    handleChange(
                      "storeEmail",
                      e.target.value
                    )
                  }
                  placeholder="admin@technova.com"
                  className={inputClass}
                />
              </div>

              {/* STORE PHONE */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Store Phone
                </label>

                <input
                  type="text"
                  value={settings.storePhone}
                  onChange={(e) =>
                    handleChange(
                      "storePhone",
                      e.target.value
                    )
                  }
                  placeholder="Enter store phone"
                  className={inputClass}
                />
              </div>

              {/* STORE ADDRESS */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Store Address
                </label>

                <input
                  type="text"
                  value={settings.storeAddress}
                  onChange={(e) =>
                    handleChange(
                      "storeAddress",
                      e.target.value
                    )
                  }
                  placeholder="Enter store address"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STORE CONFIGURATION
        ==================================================== */}

        <section className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-emerald-300 hover:shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-emerald-100">
              ⚙️
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Store Configuration
              </h2>

              <p className="text-[10px] text-slate-400">
                Currency, tax, and inventory configuration.
              </p>
            </div>
          </div>

          <div className="p-4">
            <div className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-3">
              {/* CURRENCY */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Currency
                </label>

                <select
                  value={settings.currency}
                  onChange={(e) =>
                    handleChange(
                      "currency",
                      e.target.value
                    )
                  }
                  className={inputClass}
                >
                  <option value="CNY">
                    CNY — Chinese Yuan
                  </option>

                  <option value="USD">
                    USD — US Dollar
                  </option>

                  <option value="EUR">
                    EUR — Euro
                  </option>

                  <option value="JPY">
                    JPY — Japanese Yen
                  </option>
                </select>
              </div>

              {/* TAX */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Tax Rate (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.taxRate}
                  onChange={(e) =>
                    handleChange(
                      "taxRate",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>

              {/* LOW STOCK */}

              <div className="min-w-0">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Low-Stock Threshold
                </label>

                <input
                  type="number"
                  min="0"
                  value={settings.lowStockThreshold}
                  onChange={(e) =>
                    handleChange(
                      "lowStockThreshold",
                      e.target.value
                    )
                  }
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            ORDER SETTINGS
        ==================================================== */}

        <section className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-violet-300 hover:shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-violet-100">
              🛒
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Order Settings
              </h2>

              <p className="text-[10px] text-slate-400">
                Control customer order behavior.
              </p>
            </div>
          </div>

          <div className="space-y-2.5 p-4">
            {/* ALLOW NEW ORDERS */}

            <div className="group/row flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Allow New Orders
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Allow customers to place new orders.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={settings.allowNewOrders}
                onClick={() =>
                  handleChange(
                    "allowNewOrders",
                    !settings.allowNewOrders
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
                  settings.allowNewOrders
                    ? "border-emerald-500 bg-emerald-500 hover:bg-emerald-600"
                    : "border-slate-300 bg-slate-300 hover:bg-slate-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    settings.allowNewOrders
                      ? "left-[22px]"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* CUSTOMER CANCELLATION */}

            <div className="group/row flex min-w-0 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:border-violet-300 hover:bg-white hover:shadow-md sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">
                  Allow Customer Cancellation
                </p>

                <p className="mt-0.5 text-[10px] text-slate-500">
                  Allow customers to cancel eligible orders.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={
                  settings.allowCustomerCancellation
                }
                onClick={() =>
                  handleChange(
                    "allowCustomerCancellation",
                    !settings.allowCustomerCancellation
                  )
                }
                className={`relative h-6 w-11 shrink-0 rounded-full border transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-500/10 ${
                  settings.allowCustomerCancellation
                    ? "border-emerald-500 bg-emerald-500 hover:bg-emerald-600"
                    : "border-slate-300 bg-slate-300 hover:bg-slate-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                    settings.allowCustomerCancellation
                      ? "left-[22px]"
                      : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* CANCELLATION PERIOD */}

            <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:border-blue-300 hover:bg-white hover:shadow-md">
              <div className="w-full max-w-sm">
                <label className="mb-1 block text-[11px] font-bold text-slate-600">
                  Cancellation Period
                </label>

                <div className="flex min-w-0 gap-2">
                  <input
                    type="number"
                    min="0"
                    disabled={
                      !settings.allowCustomerCancellation
                    }
                    value={
                      settings.cancellationPeriodHours
                    }
                    onChange={(e) =>
                      handleChange(
                        "cancellationPeriodHours",
                        e.target.value
                      )
                    }
                    className={`min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none transition-all duration-200 ${
                      settings.allowCustomerCancellation
                        ? "border-slate-200 bg-white text-slate-800 hover:border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  />

                  <span
                    className={`flex shrink-0 items-center rounded-lg border px-3 text-[11px] font-semibold ${
                      settings.allowCustomerCancellation
                        ? "border-slate-200 bg-white text-slate-500"
                        : "border-slate-200 bg-slate-100 text-slate-400"
                    }`}
                  >
                    hours
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  How long customers can cancel after
                  placing an order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            STORE STATUS
        ==================================================== */}

        <section className="group min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-lg">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-base transition-all duration-200 group-hover:scale-110 group-hover:bg-amber-100">
              📊
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900">
                Store Status
              </h2>

              <p className="text-[10px] text-slate-400">
                Current operational status.
              </p>
            </div>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-2.5 p-4 sm:grid-cols-3">
            {/* NEW ORDERS */}

            <div className="group/status min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    settings.allowNewOrders
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />

                <span className="text-[10px] font-semibold text-slate-500">
                  New Orders
                </span>
              </div>

              <p
                className={`mt-1.5 text-sm font-bold ${
                  settings.allowNewOrders
                    ? "text-emerald-600"
                    : "text-red-600"
                }`}
              >
                {settings.allowNewOrders
                  ? "Open"
                  : "Closed"}
              </p>
            </div>

            {/* CANCELLATION */}

            <div className="group/status min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-violet-300 hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                    settings.allowCustomerCancellation
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />

                <span className="text-[10px] font-semibold text-slate-500">
                  Cancellation
                </span>
              </div>

              <p
                className={`mt-1.5 text-sm font-bold ${
                  settings.allowCustomerCancellation
                    ? "text-emerald-600"
                    : "text-slate-500"
                }`}
              >
                {settings.allowCustomerCancellation
                  ? "Allowed"
                  : "Disabled"}
              </p>
            </div>

            {/* LOW STOCK */}

            <div className="group/status min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-all duration-200 hover:-translate-y-1 hover:border-amber-300 hover:bg-white hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />

                <span className="text-[10px] font-semibold text-slate-500">
                  Low Stock
                </span>
              </div>

              <p className="mt-1.5 text-sm font-bold text-slate-800">
                ≤ {settings.lowStockThreshold}
              </p>
            </div>
          </div>
        </section>

        {/* ===================================================
            SYSTEM INFORMATION
        ==================================================== */}

        <section className="group min-w-0 overflow-hidden rounded-lg bg-slate-950 shadow-sm transition-all duration-200 hover:shadow-xl">
          <div className="relative min-w-0 p-4">
            <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/10 transition-transform duration-500 group-hover:scale-125" />

            <div className="relative">
              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-400">
                System
              </p>

              <h2 className="mt-0.5 text-sm font-bold text-white">
                System Information
              </h2>

              <div className="mt-3 grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.05] p-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1]">
                  <p className="text-[9px] text-slate-500">
                    Application
                  </p>

                  <p className="mt-0.5 truncate text-[11px] font-bold text-white">
                    TechNova
                  </p>
                </div>

                <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.05] p-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1]">
                  <p className="text-[9px] text-slate-500">
                    Version
                  </p>

                  <p className="mt-0.5 text-[11px] font-bold text-white">
                    1.0.0
                  </p>
                </div>

                <div className="min-w-0 rounded-lg border border-white/10 bg-white/[0.05] p-2.5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.1]">
                  <p className="text-[9px] text-slate-500">
                    Backend
                  </p>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />

                    <p className="text-[11px] font-bold text-white">
                      Connected
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            SAVE BUTTON
        ==================================================== */}

        <div className="flex min-w-0 justify-end pt-0.5">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 sm:w-auto ${
              saving
                ? "cursor-not-allowed bg-slate-400"
                : "bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0"
            }`}
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <span>✓</span>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}