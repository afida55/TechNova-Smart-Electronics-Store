import {
  Heart,
  ArrowLeftRight,
  ShoppingCart,
} from "lucide-react";

import ProductImage from "./ProductImage";

export default function ProductCard({
  p,
  openProduct,
  addToCart,
  toggleCompare,
  isComparing,
  toggleWishlist,
  isWishlisted,
  smallImage = false,
}) {
  if (!p) return null;

  const handleAddToCart = (event) => {
    event.stopPropagation();
    addToCart?.(p.id);
  };

  const handleWishlist = (event) => {
    event.stopPropagation();
    toggleWishlist?.(p.id);
  };

  const handleCompare = (event) => {
    event.stopPropagation();
    toggleCompare?.(p.id);
  };

  const handleOpen = () => {
    openProduct?.(p.id);
  };

  const stock = Number(p.stock || 0);
  const price = Number(p.price || 0);

  return (
    <div className="group relative bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* ======================================================
          IMAGE
      ====================================================== */}

      <div
        className={`relative overflow-hidden cursor-pointer bg-slate-50 flex items-center justify-center ${
          smallImage
            ? "h-32 sm:h-36"
            : "aspect-square"
        }`}
        onClick={handleOpen}
      >
        <ProductImage
          src={p.image}
          alt={p.name || "Product"}
          className={
            smallImage
              ? "w-[55%] h-[75%]"
              : "w-full h-full"
          }
        />

        {stock === 0 && (
          <div
            className={`absolute top-2 left-2 rounded-full font-semibold bg-red-500 text-white shadow-sm ${
              smallImage
                ? "px-2 py-0.5 text-[10px]"
                : "px-2.5 py-0.5 text-xs"
            }`}
          >
            Out of Stock
          </div>
        )}

        {stock > 0 && stock <= 6 && (
          <div
            className={`absolute top-2 left-2 rounded-full font-semibold bg-orange-500 text-white shadow-sm ${
              smallImage
                ? "px-2 py-0.5 text-[10px]"
                : "px-2.5 py-0.5 text-xs"
            }`}
          >
            Only {stock} left
          </div>
        )}
      </div>

      {/* ======================================================
          CONTENT
      ====================================================== */}

      <div
        className={`flex flex-col flex-1 ${
          smallImage ? "p-2.5" : "p-3"
        }`}
      >
        {/* CATEGORY + WISHLIST */}

        <div
          className={`flex items-start justify-between ${
            smallImage ? "mb-0.5" : "mb-1"
          }`}
        >
          {p.cat && (
            <span
              className={`font-medium text-slate-400 uppercase tracking-wider ${
                smallImage
                  ? "text-[8px]"
                  : "text-[10px]"
              }`}
            >
              {p.cat}
            </span>
          )}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            className={`rounded-full hover:bg-slate-100 transition ${
              smallImage
                ? "p-0.5 -mt-0.5 -mr-0.5"
                : "p-1 -mt-1 -mr-1"
            }`}
          >
            <Heart
              size={smallImage ? 14 : 16}
              className={
                isWishlisted
                  ? "fill-red-500 text-red-500"
                  : "text-slate-400"
              }
            />
          </button>
        </div>

        {/* ======================================================
            PRODUCT NAME
        ====================================================== */}

        <button
          type="button"
          onClick={handleOpen}
          className="text-left"
        >
          <h3
            className={`font-semibold text-slate-900 hover:text-blue-600 transition line-clamp-2 leading-snug ${
              smallImage
                ? "text-xs"
                : "text-sm"
            }`}
          >
            {p.name || "Unnamed product"}
          </h3>
        </button>

        {/* ======================================================
            PRICE
        ====================================================== */}

        <div
          className={`flex items-baseline gap-2 ${
            smallImage ? "mt-1" : "mt-2"
          }`}
        >
          <span
            className={`font-bold text-slate-900 ${
              smallImage
                ? "text-base"
                : "text-lg"
            }`}
          >
            ${price.toFixed(2)}
          </span>
        </div>

        {/* ======================================================
            ACTIONS
        ====================================================== */}

        <div
          className={`flex border-t border-slate-100 ${
            smallImage
              ? "gap-1.5 mt-2 pt-2"
              : "gap-2 mt-3 pt-3"
          }`}
        >
          {/* ADD TO CART */}

          <button
            type="button"
            disabled={stock === 0}
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center rounded-full font-semibold transition bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed disabled:text-slate-500 ${
              smallImage
                ? "gap-1 py-1.5 px-2 text-xs"
                : "gap-1.5 py-2 px-3 text-sm"
            }`}
          >
            <ShoppingCart
              size={smallImage ? 12 : 14}
            />

            {stock === 0 ? "Sold Out" : "Add"}
          </button>

          {/* COMPARE */}

          <button
            type="button"
            onClick={handleCompare}
            aria-label={
              isComparing
                ? "Remove from compare"
                : "Compare"
            }
            title={
              isComparing
                ? "Remove from compare"
                : "Compare"
            }
            className={`rounded-full border transition ${
              smallImage
                ? "p-1.5"
                : "p-2"
            } ${
              isComparing
                ? "border-blue-500 bg-blue-50 text-blue-600"
                : "border-slate-200 hover:border-blue-300 text-slate-400 hover:text-blue-500"
            }`}
          >
            <ArrowLeftRight
              size={smallImage ? 13 : 15}
            />
          </button>
        </div>
      </div>
    </div>
  );
}