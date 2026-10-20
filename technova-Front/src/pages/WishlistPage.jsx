import {
  Heart,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import { C } from "../lib/tokens";
import ProductCard from "../components/ProductCard";

export default function WishlistPage({
  wishlistProducts = [],
  openProduct,
  addToCart,
  compareIds = [],
  toggleCompare,
  toggleWishlist,
  setPage,
}) {
  const savedCount = wishlistProducts.length;

  /*
   * Empty wishlist
   */
  if (savedCount === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center">
            <Heart
              size={32}
              className="text-red-400"
            />
          </div>

          <div
            className="f-display"
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: C.ink,
              marginTop: 20,
            }}
          >
            Your wishlist is empty
          </div>

          <p
            className="f-body"
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              color: C.muted,
              marginTop: 8,
              maxWidth: 420,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Save products you love and come back to them
            whenever you're ready. Your saved items will
            appear here.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-7">

            {/* BROWSE PRODUCTS */}
            <button
              type="button"
              onClick={() => setPage("home")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 f-body"
              style={{
                background: C.ink,
                color: "#fff",
                border: "1px solid transparent",
                borderRadius: 10,
                padding: "11px 20px",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.background =
                  "#2D3E8C";
                event.currentTarget.style.transform =
                  "translateY(-1px)";
                event.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(45, 62, 140, 0.18)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background =
                  C.ink;
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "none";
              }}
            >
              <ShoppingBag size={15} />
              Browse products
            </button>

            {/* EXPLORE CATALOG */}
            <button
              type="button"
              onClick={() => setPage("home")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 f-body"
              style={{
                background: "#fff",
                color: C.ink,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "11px 20px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.borderColor =
                  "#93C5FD";
                event.currentTarget.style.background =
                  "#EFF6FF";
                event.currentTarget.style.color =
                  "#2563EB";
                event.currentTarget.style.transform =
                  "translateY(-1px)";
                event.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(37, 99, 235, 0.12)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.borderColor =
                  C.border;
                event.currentTarget.style.background =
                  "#FFFFFF";
                event.currentTarget.style.color =
                  C.ink;
                event.currentTarget.style.transform =
                  "translateY(0)";
                event.currentTarget.style.boxShadow =
                  "none";
              }}
            >
              Explore catalog
            </button>

          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 max-w-md mx-auto">

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <Heart
                size={17}
                className="mx-auto text-slate-400"
              />

              <div className="text-[11px] font-semibold text-slate-600 mt-2">
                Save favorites
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <Sparkles
                size={17}
                className="mx-auto text-slate-400"
              />

              <div className="text-[11px] font-semibold text-slate-600 mt-2">
                Compare items
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
              <ShoppingBag
                size={17}
                className="mx-auto text-slate-400"
              />

              <div className="text-[11px] font-semibold text-slate-600 mt-2">
                Shop anytime
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  /*
   * Wishlist with products
   */
  return (
    <div
      style={{
        maxWidth: 1180,
        margin: "0 auto",
      }}
      className="px-4 sm:px-6 py-8 sm:py-10"
    >

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-8">

        <div>

          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D3E8C]">
            <Heart
              size={14}
              className="fill-current"
            />
            Your favorites
          </div>

          <h1
            className="f-display"
            style={{
              fontSize: 30,
              fontWeight: 700,
              color: C.ink,
              marginTop: 6,
              lineHeight: 1.15,
            }}
          >
            Saved for later
          </h1>

          <p
            className="f-body"
            style={{
              fontSize: 13.5,
              color: C.muted,
              marginTop: 7,
              lineHeight: 1.6,
            }}
          >
            Keep track of products you love and come back
            when you're ready to buy.
          </p>

        </div>

        {/* ==================================================
            CONTINUE SHOPPING
        =================================================== */}

        <button
          type="button"
          onClick={() => setPage("home")}
          className="self-start sm:self-auto inline-flex items-center gap-2 f-body"
          style={{
            background: "#fff",
            color: C.ink,
            border: `1px solid ${C.border}`,
            borderRadius: 10,
            padding: "10px 15px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.borderColor =
              "#93C5FD";
            event.currentTarget.style.background =
              "#EFF6FF";
            event.currentTarget.style.color =
              "#2563EB";
            event.currentTarget.style.transform =
              "translateY(-1px)";
            event.currentTarget.style.boxShadow =
              "0 4px 12px rgba(37, 99, 235, 0.12)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.borderColor =
              C.border;
            event.currentTarget.style.background =
              "#FFFFFF";
            event.currentTarget.style.color =
              C.ink;
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.boxShadow =
              "none";
          }}
        >
          <ArrowLeft size={15} />
          Continue shopping
        </button>

      </div>

      {/* ======================================================
          WISHLIST SUMMARY
      ======================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-5 mb-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <Heart
                size={18}
                className="text-red-500 fill-red-500"
              />
            </div>

            <div>

              <div className="text-sm font-bold text-slate-900">
                {savedCount}{" "}
                {savedCount === 1
                  ? "saved product"
                  : "saved products"}
              </div>

              <div className="text-xs text-slate-400 mt-0.5">
                Your personal collection of favorites
              </div>

            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles size={14} />
            Find your next favorite
          </div>

        </div>
      </div>

      {/* ======================================================
          PRODUCTS
      ======================================================= */}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">

        {wishlistProducts.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            openProduct={openProduct}
            addToCart={addToCart}
            toggleCompare={toggleCompare}
            isComparing={compareIds.includes(p.id)}
            toggleWishlist={toggleWishlist}
            isWishlisted={true}
          />
        ))}

      </div>

      {/* ======================================================
          BOTTOM SHOPPING PROMPT
      ======================================================= */}

      <div className="mt-10 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50 p-5 sm:p-6">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

          <div>

            <div className="flex items-center gap-2">

              <Sparkles
                size={17}
                className="text-[#2D3E8C]"
              />

              <h2 className="text-sm font-bold text-slate-900">
                Looking for something else?
              </h2>

            </div>

            <p className="text-xs text-slate-500 mt-1.5">
              Explore the TechNova catalog and discover more
              electronics.
            </p>

          </div>

          <button
            type="button"
            onClick={() => setPage("home")}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-bold transition-all duration-200"
            onMouseEnter={(event) => {
              event.currentTarget.style.background =
                "#2D3E8C";
              event.currentTarget.style.transform =
                "translateY(-1px)";
              event.currentTarget.style.boxShadow =
                "0 4px 12px rgba(45, 62, 140, 0.18)";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background =
                "#0F172A";
              event.currentTarget.style.transform =
                "translateY(0)";
              event.currentTarget.style.boxShadow =
                "none";
            }}
          >
            <ShoppingBag size={15} />
            Browse catalog
          </button>

        </div>
      </div>

    </div>
  );
}