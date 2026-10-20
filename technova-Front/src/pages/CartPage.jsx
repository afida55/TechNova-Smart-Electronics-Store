import {
  ShoppingCart,
  Minus,
  Plus,
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Truck,
  ShieldCheck,
  CreditCard,
  Clock,
  Package,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Check,
  Lock,
  ArrowRight,
} from "lucide-react";

import ProductImage from "../components/ProductImage";

export default function CartPage({
  cartItems = [],
  updateQuantity,
  removeItem,
  setPage,
  openProduct,
  products = [],
}) {
  // ============================================================
  // CONSTANTS
  // ============================================================

  const FREE_SHIPPING_THRESHOLD = 200;
  const SHIPPING_COST = 12;

  // ============================================================
  // CART CALCULATIONS
  // ============================================================

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum +
      Number(item?.price || 0) *
        Number(item?.quantity || 0),
    0
  );

  const shipping =
    subtotal > 0 &&
    subtotal < FREE_SHIPPING_THRESHOLD
      ? SHIPPING_COST
      : 0;

  const total = subtotal + shipping;

  const itemCount = cartItems.reduce(
    (sum, item) =>
      sum + Number(item?.quantity || 0),
    0
  );

  const remainingForFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0
  );

  const shippingProgress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100
  );

  const getCartProductId = (item) => {
    return (
      item?.productId ??
      item?.product_id ??
      item?.product?.id ??
      item?.product?.productId ??
      null
    );
  };

  // ============================================================
  // GET CATALOG PRODUCT
  // ============================================================

  const getCatalogProduct = (item) => {
    const productId = getCartProductId(item);

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      return null;
    }

    return (
      products.find(
        (product) =>
          String(product?.id) === String(productId)
      ) || null
    );
  };

  // ============================================================
  // RECOMMENDED PRODUCTS
  // ============================================================

  const cartProductIds = new Set(
    cartItems
      .map((item) => getCartProductId(item))
      .filter(
        (id) =>
          id !== undefined &&
          id !== null &&
          id !== ""
      )
      .map((id) => String(id))
  );

  const recommended = products
    .filter((product) => {
      if (
        product?.id === undefined ||
        product?.id === null
      ) {
        return false;
      }

      if (
        cartProductIds.has(String(product.id))
      ) {
        return false;
      }

      const hasStock =
        product?.stock !== undefined &&
        product?.stock !== null &&
        product?.stock !== "";

      if (!hasStock) {
        return true;
      }

      const stock = Number(product.stock);

      if (!Number.isFinite(stock)) {
        return true;
      }

      return stock > 0;
    })
    .slice(0, 4);

  // ============================================================
  // PRODUCT OPEN
  // ============================================================

  const handleOpenProduct = (itemOrId) => {
    let productId = null;

    if (
      itemOrId &&
      typeof itemOrId === "object"
    ) {
      productId = getCartProductId(itemOrId);
    } else {
      productId = itemOrId;
    }

    if (
      productId === undefined ||
      productId === null ||
      productId === ""
    ) {
      console.error(
        "Could not find product ID:",
        itemOrId
      );

      return;
    }

    if (typeof openProduct === "function") {
      openProduct(productId);
      return;
    }

    if (typeof setPage === "function") {
      setPage("product");
    }
  };

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[72vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl text-center">

          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 rounded-[28px] bg-blue-50 rotate-6" />

            <div className="relative w-24 h-24 rounded-[28px] bg-white border border-slate-200 shadow-sm flex items-center justify-center">
              <ShoppingCart
                size={38}
                strokeWidth={1.7}
                className="text-[#2D3E8C]"
              />
            </div>
          </div>

          <div className="mt-7">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-bold uppercase tracking-wider text-[#2D3E8C]">
              <Sparkles size={11} />
              Your shopping bag
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Your cart is empty
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 max-w-md mx-auto">
              Looks like you haven't added
              anything yet. Explore TechNova
              and discover technology you'll
              love.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setPage("home")}
            className="mt-8 inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-[#2D3E8C] transition shadow-lg shadow-slate-200"
          >
            <ShoppingBag size={17} />
            Start shopping
            <ArrowRight size={16} />
          </button>

          <div className="grid grid-cols-3 gap-3 mt-12 max-w-lg mx-auto">

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ShieldCheck
                size={19}
                className="mx-auto text-[#2D3E8C]"
              />

              <div className="text-[11px] font-bold text-slate-700 mt-2">
                Secure
              </div>

              <div className="text-[10px] text-slate-400 mt-1">
                Protected checkout
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Truck
                size={19}
                className="mx-auto text-[#2D3E8C]"
              />

              <div className="text-[11px] font-bold text-slate-700 mt-2">
                Fast delivery
              </div>

              <div className="text-[10px] text-slate-400 mt-1">
                Reliable shipping
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <RotateCcw
                size={19}
                className="mx-auto text-[#2D3E8C]"
              />

              <div className="text-[11px] font-bold text-slate-700 mt-2">
                Easy returns
              </div>

              <div className="text-[10px] text-slate-400 mt-1">
                Shop confidently
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN CART
  // ============================================================

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-10">

      {/* ======================================================
          PAGE HEADER
      ======================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-7">

        <div>
          <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2D3E8C]">
            <ShoppingCart size={13} />
            Shopping bag
          </div>

          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Your cart
          </h1>

          <p className="mt-1.5 text-sm text-slate-500">
            {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}{" "}
            ready for checkout
          </p>
        </div>

        {/* ==================================================
            CONTINUE SHOPPING #1
        =================================================== */}

        <button
          type="button"
          onClick={() => setPage("home")}
          className="self-start lg:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 ease-out"
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
              "#E2E8F0";
            event.currentTarget.style.background =
              "#FFFFFF";
            event.currentTarget.style.color =
              "#334155";
            event.currentTarget.style.transform =
              "translateY(0)";
            event.currentTarget.style.boxShadow =
              "none";
          }}
        >
          <ArrowLeft size={16} />
          Continue shopping
        </button>
      </div>

      {/* ======================================================
          FREE SHIPPING PROGRESS
      ======================================================= */}

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="p-4 sm:p-5">

          <div className="flex items-start gap-3">

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Truck
                size={18}
                className="text-[#2D3E8C]"
              />
            </div>

            <div className="flex-1 min-w-0">

              {remainingForFreeShipping > 0 ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">

                    <p className="text-sm font-bold text-slate-800">
                      Add{" "}
                      <span className="text-[#2D3E8C]">
                        $
                        {remainingForFreeShipping.toFixed(
                          2
                        )}
                      </span>{" "}
                      more for free shipping
                    </p>

                    <span className="text-[11px] font-medium text-slate-400">
                      Free shipping over $
                      {FREE_SHIPPING_THRESHOLD}
                    </span>

                  </div>

                  <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#2D3E8C] to-blue-500 transition-all duration-500"
                      style={{
                        width: `${shippingProgress}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-between mt-1.5">
                    <span className="text-[10px] text-slate-400">
                      ${subtotal.toFixed(2)}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      ${FREE_SHIPPING_THRESHOLD}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">

                  <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                    <Check
                      size={14}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      You've unlocked free shipping!
                    </p>

                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Your order qualifies for complimentary delivery.
                    </p>
                  </div>

                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          MAIN GRID
      ======================================================= */}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_390px] gap-6 lg:items-start">

        {/* ====================================================
            LEFT
        ===================================================== */}

        <div className="space-y-4">

          <div className="flex items-center justify-between px-1">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cart items
              </h2>

              <p className="text-xs text-slate-400 mt-0.5">
                Review your selected products
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <Package size={14} />
              {itemCount}{" "}
              {itemCount === 1 ? "item" : "items"}
            </div>

          </div>

          {/* ==================================================
              CART ITEMS
          =================================================== */}

          {cartItems.map((item) => {
            const quantity = Number(
              item?.quantity || 0
            );

            const price = Number(
              item?.price || 0
            );

            const catalogProduct =
              getCatalogProduct(item);

            const productId =
              getCartProductId(item) ??
              catalogProduct?.id ??
              null;

            const hasItemStock =
              item?.stock !== undefined &&
              item?.stock !== null &&
              item?.stock !== "";

            const hasCatalogStock =
              catalogProduct?.stock !==
                undefined &&
              catalogProduct?.stock !==
                null &&
              catalogProduct?.stock !== "";

            const rawStock =
              hasItemStock
                ? item.stock
                : hasCatalogStock
                ? catalogProduct.stock
                : null;

            const parsedStock =
              rawStock === null
                ? null
                : Number(rawStock);

            const isStockKnown =
              Number.isFinite(parsedStock);

            const stock = isStockKnown
              ? parsedStock
              : null;

            const itemTotal =
              price * quantity;

            const isOutOfStock =
              isStockKnown &&
              stock <= 0;

            const exceedsStock =
              isStockKnown &&
              stock > 0 &&
              quantity > stock;

            const isLowStock =
              isStockKnown &&
              stock > 0 &&
              stock <= 6;

            const image =
              item?.image ||
              item?.images?.[0]?.image ||
              item?.images?.[0]?.url ||
              catalogProduct?.image ||
              catalogProduct?.images?.[0]?.image ||
              catalogProduct?.images?.[0]?.url ||
              "";

            const productName =
              item?.name ||
              catalogProduct?.name ||
              "Unnamed product";

            const category =
              item?.cat ||
              catalogProduct?.cat ||
              "";

            return (
              <div
                key={
                  item?.id ??
                  productId ??
                  `${productName}-${quantity}`
                }
                className={`group rounded-2xl border bg-white shadow-sm transition-all duration-200 ease-out overflow-hidden hover:-translate-y-1 hover:shadow-lg ${
                  isOutOfStock || exceedsStock
                    ? "border-red-200 hover:border-red-300"
                    : "border-slate-200 hover:border-blue-300"
                }`}
              >
                <div className="p-4 sm:p-5">

                  <div className="flex gap-4 sm:gap-5">

                    <button
                      type="button"
                      onClick={() =>
                        handleOpenProduct(item)
                      }
                      className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden cursor-pointer transition-all duration-300 group-hover:border-blue-200"
                      aria-label={`View ${productName}`}
                    >
                      <ProductImage
                        src={image}
                        alt={productName}
                        className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </button>

                    <div className="flex-1 min-w-0">

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          {category && (
                            <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400 mb-1">
                              {category}
                            </div>
                          )}

                          <div
                            onClick={() =>
                              handleOpenProduct(item)
                            }
                            className="block cursor-pointer text-left text-sm sm:text-base font-bold leading-6 text-black"
                            style={{
                              color: "#000000",
                              opacity: 1,
                              visibility: "visible",
                              display: "block",
                            }}
                          >
                            {productName}
                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeItem(item?.id)
                          }
                          disabled={
                            item?.id === undefined ||
                            item?.id === null
                          }
                          aria-label={`Remove ${productName}`}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>

                      <div className="mt-3">

                        {isOutOfStock ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                            <Clock size={12} />
                            Currently out of stock
                          </div>
                        ) : exceedsStock ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-bold">
                            <Clock size={12} />
                            Only {stock} available
                          </div>
                        ) : isLowStock ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                            <Clock size={12} />
                            Only {stock} left
                          </div>
                        ) : isStockKnown ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            <Check size={12} />
                            In stock
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                            <Clock size={12} />
                            Stock status unavailable
                          </div>
                        )}

                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">

                        <div className="flex items-center rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item?.id,
                                quantity - 1
                              )
                            }
                            disabled={
                              quantity <= 1 ||
                              item?.id === undefined ||
                              item?.id === null
                            }
                            aria-label="Decrease quantity"
                            className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Minus size={14} />
                          </button>

                          <span className="w-9 text-center text-sm font-bold text-slate-800">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item?.id,
                                quantity + 1
                              )
                            }
                            disabled={
                              item?.id === undefined ||
                              item?.id === null ||
                              (isStockKnown &&
                                (isOutOfStock ||
                                  quantity >= stock))
                            }
                            aria-label="Increase quantity"
                            className="w-9 h-9 flex items-center justify-center hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <Plus size={14} />
                          </button>

                        </div>

                        <div className="text-xs sm:text-sm text-slate-500">
                          ${price.toFixed(2)} each
                        </div>

                        <div className="ml-auto text-base sm:text-lg font-bold text-slate-900">
                          ${itemTotal.toFixed(2)}
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* ==================================================
              SERVICE BENEFITS
          =================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <ShieldCheck
                  size={18}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="text-xs font-bold text-slate-800 mt-3">
                Secure checkout
              </div>

              <div className="text-[11px] text-slate-400 mt-1 leading-5">
                Your payment information is protected.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Truck
                  size={18}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="text-xs font-bold text-slate-800 mt-3">
                Reliable delivery
              </div>

              <div className="text-[11px] text-slate-400 mt-1 leading-5">
                Fast and dependable order delivery.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <RotateCcw
                  size={18}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="text-xs font-bold text-slate-800 mt-3">
                Easy returns
              </div>

              <div className="text-[11px] text-slate-400 mt-1 leading-5">
                Shop confidently with our return policy.
              </div>
            </div>

          </div>

          {/* ==================================================
              RECOMMENDED
          =================================================== */}

          {recommended.length > 0 && (
            <div className="pt-7">

              <div className="flex items-end justify-between mb-4">

                <div>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#2D3E8C]">
                    <Sparkles size={11} />
                    Complete your setup
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    You might also like
                  </h2>

                  <p className="text-xs text-slate-400 mt-1">
                    Popular products you may want to add.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPage("home")}
                  className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#2D3E8C] transition-all duration-200"
                  onMouseEnter={(event) => {
                    event.currentTarget.style.color =
                      "#2563EB";
                    event.currentTarget.style.transform =
                      "translateX(2px)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.color =
                      "#2D3E8C";
                    event.currentTarget.style.transform =
                      "translateX(0)";
                  }}
                >
                  View all
                  <ChevronRight size={14} />
                </button>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

                {recommended.map((product) => {
                  const productImage =
                    product?.image ||
                    product?.images?.[0]?.image ||
                    product?.images?.[0]?.url ||
                    "";

                  const hasStock =
                    product?.stock !== undefined &&
                    product?.stock !== null &&
                    product?.stock !== "";

                  const numericStock =
                    hasStock
                      ? Number(product.stock)
                      : null;

                  const stockKnown =
                    Number.isFinite(numericStock);

                  const lowStock =
                    stockKnown &&
                    numericStock > 0 &&
                    numericStock <= 6;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        handleOpenProduct(product.id)
                      }
                      className="group text-left rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition overflow-hidden"
                    >

                      <div className="relative aspect-square bg-slate-50 overflow-hidden">

                        <ProductImage
                          src={productImage}
                          alt={
                            product.name ||
                            "Product"
                          }
                          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />

                        {lowStock && (
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-[9px] font-bold text-amber-700 shadow-sm">
                            Low stock
                          </div>
                        )}

                      </div>

                      <div className="p-3">

                        {product.cat && (
                          <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                            {product.cat}
                          </div>
                        )}

                        <div className="mt-1 text-xs font-bold text-slate-900 group-hover:text-[#2D3E8C] transition line-clamp-2 leading-5">
                          {product.name}
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2">

                          <div className="text-sm font-bold text-slate-900">
                            $
                            {Number(
                              product.price || 0
                            ).toFixed(2)}
                          </div>

                          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center group-hover:bg-[#2D3E8C] transition">
                            <ArrowRight size={13} />
                          </div>

                        </div>
                      </div>
                    </button>
                  );
                })}

              </div>

              <button
                type="button"
                onClick={() => setPage("home")}
                className="sm:hidden w-full mt-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:border-[#2D3E8C] hover:text-[#2D3E8C] transition"
              >
                View more products
              </button>

            </div>
          )}

        </div>

        {/* ====================================================
            RIGHT - ORDER SUMMARY
        ===================================================== */}

        <aside className="lg:sticky lg:top-24">

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            <div className="p-5 sm:p-6 border-b border-slate-100">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Order summary
                  </h2>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Review before checkout
                  </p>
                </div>

                <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <ShoppingBag
                    size={16}
                    className="text-slate-500"
                  />
                </div>

              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">
                  Shipping
                </span>

                <span
                  className={
                    shipping === 0
                      ? "font-bold text-emerald-600"
                      : "font-semibold text-slate-900"
                  }
                >
                  {shipping === 0
                    ? "Free"
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              {shipping === 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2.5">

                  <Check
                    size={14}
                    className="text-emerald-600"
                  />

                  <span className="text-[11px] font-semibold text-emerald-700">
                    You're saving $
                    {SHIPPING_COST.toFixed(2)}{" "}
                    on shipping
                  </span>

                </div>
              )}

              {shipping > 0 && (
                <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">

                  <div className="flex items-start gap-2">

                    <Truck
                      size={15}
                      className="text-amber-600 mt-0.5 flex-shrink-0"
                    />

                    <p className="text-[11px] leading-5 text-amber-700">
                      Add{" "}
                      <strong>
                        $
                        {remainingForFreeShipping.toFixed(
                          2
                        )}
                      </strong>{" "}
                      more to unlock free shipping.
                    </p>

                  </div>
                </div>
              )}

              <div className="border-t border-slate-200 pt-4">

                <div className="flex items-end justify-between">

                  <div>
                    <div className="text-base font-bold text-slate-900">
                      Total
                    </div>

                    <div className="text-[10px] text-slate-400 mt-1">
                      Taxes included
                    </div>
                  </div>

                  <div className="text-2xl font-bold text-[#2D3E8C]">
                    ${total.toFixed(2)}
                  </div>

                </div>
              </div>

              <button
                type="button"
                onClick={() => setPage("checkout")}
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-[#2D3E8C] transition shadow-lg shadow-slate-200 flex items-center justify-center gap-2"
              >
                <CreditCard size={17} />
                Proceed to checkout
                <ArrowRight size={15} />
              </button>

              {/* ==================================================
                  CONTINUE SHOPPING #2
              =================================================== */}

              <button
                type="button"
                onClick={() => setPage("home")}
                className="w-full py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-200 ease-out"
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
                    "#E2E8F0";
                  event.currentTarget.style.background =
                    "#FFFFFF";
                  event.currentTarget.style.color =
                    "#334155";
                  event.currentTarget.style.transform =
                    "translateY(0)";
                  event.currentTarget.style.boxShadow =
                    "none";
                }}
              >
                Continue shopping
              </button>

            </div>

            {/* =================================================
                TRUST AREA
            ================================================== */}

            <div className="border-t border-slate-100 bg-slate-50 p-5">

              <div className="flex items-center gap-2 mb-4">

                <Lock
                  size={13}
                  className="text-slate-400"
                />

                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Shopping with confidence
                </span>

              </div>

              <div className="space-y-3">

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <ShieldCheck
                      size={15}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      Secure payment
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Your payment is protected
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <Truck
                      size={15}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      Fast delivery
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Reliable shipping service
                    </div>
                  </div>

                </div>

                <div className="flex items-center gap-3">

                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
                    <RotateCcw
                      size={15}
                      className="text-slate-500"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-700">
                      Easy returns
                    </div>

                    <div className="text-[10px] text-slate-400">
                      Simple return process
                    </div>
                  </div>

                </div>

              </div>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 mt-5 pt-4 border-t border-slate-200">

                <CreditCard size={12} />

                Secure checkout powered by TechNova

              </div>

            </div>

          </div>
        </aside>
      </div>
    </div>
  );
}