import {
  LayoutDashboard,
  Store,
  LogOut,
} from "lucide-react";

import { useState } from "react";
import { C } from "../lib/tokens";
import { useAuth } from "../lib/AuthContext";

export default function AdminNavBar({
  page,
  setPage,
}) {
  const { logout } = useAuth();

  const [logoutConfirmOpen, setLogoutConfirmOpen] =
    useState(false);

  /*
   * Open logout confirmation popup.
   */
  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  /*
   * Confirm logout.
   */
  const confirmLogout = () => {
    logout();

    setLogoutConfirmOpen(false);

    setPage("auth");

    window.scrollTo?.({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  /*
   * Cancel logout.
   */
  const cancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* ==================================================
              BRAND
          ================================================== */}

          <button
            type="button"
            onClick={() => setPage("admin")}
            className="group flex items-center gap-3 rounded-xl transition-all duration-200 hover:opacity-90"
          >
            {/* Logo */}
            <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 text-lg font-extrabold text-white shadow-md shadow-blue-600/20 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-blue-600/25">
              <span className="relative z-10">
                T
              </span>

              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </div>

            {/* Brand text */}
            <div className="hidden text-left sm:block">
              <div className="text-[17px] font-bold leading-tight tracking-tight text-slate-900">
                TechNova
              </div>

              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Admin Panel
              </div>
            </div>
          </button>

          {/* ==================================================
              NAVIGATION
          ================================================== */}

          <nav className="flex items-center gap-1.5">

            {/* Dashboard */}
            <button
              type="button"
              onClick={() => setPage("admin")}
              className={`group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 ${
                page === "admin"
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100 hover:text-slate-900 hover:shadow-sm"
              }`}
            >
              <LayoutDashboard
                size={17}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              <span className="hidden md:inline">
                Dashboard
              </span>
            </button>

            {/* View Store */}
            <button
              type="button"
              onClick={() => setPage("home")}
              className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
            >
              <Store
                size={17}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:scale-105"
              />

              <span className="hidden md:inline">
                View Store
              </span>
            </button>

            {/* Divider */}
            <div className="mx-1.5 hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleLogout}
              className="group flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-500 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
            >
              <LogOut
                size={17}
                strokeWidth={2.2}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />

              <span className="hidden sm:inline">
                Sign out
              </span>
            </button>

          </nav>
        </div>
      </header>

      {/* =========================================================
          LOGOUT CONFIRMATION POPUP

          Same popup style and behavior as the user NavBar.
      ========================================================= */}

      {logoutConfirmOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            background: "rgba(15, 23, 42, 0.45)",
            backdropFilter: "blur(3px)",
          }}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              cancelLogout();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-logout-title"
            style={{
              width: "min(400px, 100%)",
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              boxShadow:
                "0 24px 70px rgba(15, 23, 42, 0.25)",
            }}
          >
            {/* Logout icon */}
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: "#FEF2F2",
                color: "#DC2626",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <LogOut size={20} />
            </div>

            {/* Title */}
            <h2
              id="admin-logout-title"
              className="f-display"
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 750,
                color: C.ink,
              }}
            >
              Sign out?
            </h2>

            {/* Message */}
            <p
              className="f-body"
              style={{
                margin: "8px 0 22px",
                color: C.muted,
                fontSize: 13.5,
                lineHeight: 1.6,
              }}
            >
              Are you sure you want to sign out of your
              TechNova account?
            </p>

            {/* Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              {/* Cancel */}
              <button
                type="button"
                onClick={cancelLogout}
                className="f-body"
                style={{
                  minHeight: 40,
                  padding: "0 16px",
                  borderRadius: 9,
                  border: `1px solid ${C.line}`,
                  background: "#f1f5f9",
                  color: C.ink,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition:
                    "all 0.2s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background =
                    "#e2e8f0";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background =
                    "#f1f5f9";
                }}
              >
                Cancel
              </button>

              {/* Confirm Sign Out */}
              <button
                type="button"
                onClick={confirmLogout}
                className="f-body"
                style={{
                  minHeight: 40,
                  padding: "0 16px",
                  borderRadius: 9,
                  border: "none",
                  background: "#DC2626",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
