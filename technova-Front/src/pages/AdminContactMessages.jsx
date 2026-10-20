import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Mail,
  MessageSquare,
  RefreshCw,
  User,
  Clock,
  CheckCircle,
} from "lucide-react";

import { api } from "../lib/api";

export default function AdminContactMessages({ setPage }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await api.get("/admin/contact-messages");

      setMessages(data || []);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(
        `/admin/contact-messages/${id}/status?status=${status}`
      );

      setMessages((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, status }
            : item
        )
      );
    } catch (err) {
      alert(
        err.message ||
          "Unable to update message status."
      );
    }
  };

  return (
    <section className="space-y-5 px-4 pb-8 pt-5 sm:px-6 lg:px-8">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <button
            type="button"
            onClick={() =>
              setPage("admin")
            }
            className="mb-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Administration
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Contact Messages
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage messages submitted by customers.
          </p>

        </div>

        <button
          type="button"
          onClick={loadMessages}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>

      </div>

      {/* ========================================================
          ERROR
      ======================================================== */}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* ========================================================
          LOADING
      ======================================================== */}

      {loading && (
        <div className="flex min-h-[35vh] items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Loading messages...
            </p>

          </div>
        </div>
      )}

      {/* ========================================================
          EMPTY
      ======================================================== */}

      {!loading && !error && messages.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <MessageSquare size={25} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            No contact messages
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Customer messages will appear here.
          </p>

        </div>
      )}

      {/* ========================================================
          MESSAGES
      ======================================================== */}

      {!loading && messages.length > 0 && (
        <div className="space-y-4">

          {messages.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md"
            >

              {/* Top */}

              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="text-lg font-bold text-slate-900">
                      {item.subject}
                    </h2>

                    <StatusBadge status={item.status} />

                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:flex-wrap sm:gap-x-5">

                    <span className="inline-flex items-center gap-1.5">
                      <User size={15} />
                      {item.name}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={15} />
                      {item.email}
                    </span>

                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={15} />
                      {formatDate(item.createTime)}
                    </span>

                  </div>

                </div>

                {/* Status */}

                <select
                  value={item.status || "NEW"}
                  onChange={(event) =>
                    updateStatus(
                      item.id,
                      event.target.value
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="NEW">
                    New
                  </option>

                  <option value="READ">
                    Read
                  </option>

                  <option value="REPLIED">
                    Replied
                  </option>
                </select>

              </div>

              {/* Message */}

              <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">

                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {item.message}
                </p>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}


// ============================================================
// STATUS BADGE
// ============================================================

function StatusBadge({ status }) {
  const normalized =
    String(status || "NEW").toUpperCase();

  const styles = {
    NEW: "border-blue-200 bg-blue-50 text-blue-700",
    READ: "border-amber-200 bg-amber-50 text-amber-700",
    REPLIED:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${
        styles[normalized] ||
        "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <CheckCircle size={12} />
      {normalized}
    </span>
  );
}


// ============================================================
// DATE
// ============================================================

function formatDate(value) {
  if (!value) return "Unknown date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString();
}