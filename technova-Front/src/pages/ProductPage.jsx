import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowLeftRight,
  Heart,
  Star,
  Minus,
  Plus,
  ShoppingCart,
  Check,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Package,
  CreditCard,
  Headphones,
  Box,
  Clock3,
  ShoppingBag,
  Cpu,
  Battery,
  Wifi,
  Monitor,
  HardDrive,
  MemoryStick,
  Cable,
  Info,
  BadgeCheck,
  ArrowUpRight,
} from "lucide-react";

import { api } from "../lib/api";
import { adaptProducts } from "../lib/adaptProduct";

import {
  StockTag,
  Stars,
  Breadcrumb,
} from "../components/Primitives";

import ProductImage from "../components/ProductImage";

// ============================================================
// HELPERS
// ============================================================

function getSpecValue(specs, keys) {
  if (!specs || typeof specs !== "object") {
    return null;
  }

  for (const key of keys) {
    const foundKey = Object.keys(specs).find(
      (existingKey) =>
        existingKey.toLowerCase() === key.toLowerCase()
    );

    if (
      foundKey &&
      specs[foundKey] !== null &&
      specs[foundKey] !== undefined &&
      specs[foundKey] !== ""
    ) {
      return specs[foundKey];
    }
  }

  return null;
}

// ============================================================
// PRODUCT HIGHLIGHTS
// ============================================================

function getProductHighlights(product) {
  const specs = product?.specs || {};
  const highlights = [];

  const display = getSpecValue(specs, [
    "Display",
    "Screen",
    "Screen Size",
  ]);

  const processor = getSpecValue(specs, [
    "Processor",
    "CPU",
    "Chipset",
    "Chip",
  ]);

  const ram = getSpecValue(specs, [
    "RAM",
    "Memory",
  ]);

  const storage = getSpecValue(specs, [
    "Storage",
    "Capacity",
  ]);

  const battery = getSpecValue(specs, [
    "Battery",
    "Battery Life",
  ]);

  const connectivity = getSpecValue(specs, [
    "Connectivity",
    "Bluetooth",
    "Network",
    "Wifi",
    "WiFi",
    "Wi-Fi",
  ]);

  if (display) {
    highlights.push({
      label: "Display",
      value: String(display),
      icon: Monitor,
    });
  }

  if (processor) {
    highlights.push({
      label: "Processor",
      value: String(processor),
      icon: Cpu,
    });
  }

  if (ram) {
    highlights.push({
      label: "RAM",
      value: String(ram),
      icon: MemoryStick,
    });
  }

  if (storage) {
    highlights.push({
      label: "Storage",
      value: String(storage),
      icon: HardDrive,
    });
  }

  if (battery) {
    highlights.push({
      label: "Battery",
      value: String(battery),
      icon: Battery,
    });
  }

  if (connectivity) {
    highlights.push({
      label: "Connectivity",
      value: String(connectivity),
      icon: Wifi,
    });
  }

  return highlights.slice(0, 6);
}

// ============================================================
// WHAT'S IN THE BOX
// ============================================================

function getWhatsInTheBox(product) {
  const category = String(
    product?.cat || ""
  ).toLowerCase();

  const name = String(
    product?.name || ""
  ).toLowerCase();

  if (
    category.includes("phone") ||
    category.includes("tablet") ||
    name.includes("phone") ||
    name.includes("tablet")
  ) {
    return [
      "Device",
      "USB-C Cable",
      "Power Adapter",
      "Quick Start Guide",
    ];
  }

  if (
    category.includes("laptop") ||
    category.includes("gaming") ||
    category.includes("business") ||
    name.includes("book")
  ) {
    return [
      "Laptop",
      "Power Adapter",
      "Charging Cable",
      "Documentation",
    ];
  }

  if (
    category.includes("audio") ||
    category.includes("earbud") ||
    category.includes("headphone") ||
    name.includes("buds") ||
    name.includes("headphone")
  ) {
    return [
      "Audio Device",
      "Charging Cable",
      "Ear Tips / Accessories",
      "Documentation",
    ];
  }

  if (
    category.includes("wearable") ||
    category.includes("watch") ||
    category.includes("fitness") ||
    name.includes("watch") ||
    name.includes("band")
  ) {
    return [
      "Wearable",
      "Charging Cable",
      "Band / Strap",
      "Documentation",
    ];
  }

  if (
    category.includes("charger") ||
    name.includes("charger")
  ) {
    return [
      "Charger",
      "Power Cable",
      "Documentation",
    ];
  }

  if (
    category.includes("cable") ||
    name.includes("cable")
  ) {
    return [
      "Cable",
      "Cable Organizer",
      "Documentation",
    ];
  }

  if (
    category.includes("case") ||
    name.includes("case")
  ) {
    return [
      "Protective Case",
      "Installation Guide",
    ];
  }

  return [
    "Product",
    "Documentation",
    "Warranty Information",
  ];
}

// ============================================================
// SPEC ICON
// ============================================================

function getSpecIcon(key) {
  const normalized = String(key).toLowerCase();

  if (
    normalized.includes("display") ||
    normalized.includes("screen") ||
    normalized.includes("resolution")
  ) {
    return Monitor;
  }

  if (
    normalized.includes("processor") ||
    normalized.includes("cpu") ||
    normalized.includes("chip")
  ) {
    return Cpu;
  }

  if (
    normalized.includes("ram") ||
    normalized.includes("memory")
  ) {
    return MemoryStick;
  }

  if (
    normalized.includes("storage") ||
    normalized.includes("capacity")
  ) {
    return HardDrive;
  }

  if (
    normalized.includes("battery") ||
    normalized.includes("power")
  ) {
    return Battery;
  }

  if (
    normalized.includes("bluetooth") ||
    normalized.includes("wifi") ||
    normalized.includes("wi-fi") ||
    normalized.includes("network") ||
    normalized.includes("connectivity")
  ) {
    return Wifi;
  }

  if (
    normalized.includes("cable") ||
    normalized.includes("port") ||
    normalized.includes("usb")
  ) {
    return Cable;
  }

  return Info;
}

// ============================================================
// PRODUCT PAGE
// ============================================================

export default function ProductPage({
  product,
  addToCart,
  compareIds = [],
  toggleCompare,
  wishlist = [],
  toggleWishlist,
  setPage,
  openProduct,
  onBuyNow,
}) {
  const [activeShot, setActiveShot] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);

  const [related, setRelated] = useState([]);

  const [quantity, setQuantity] = useState(1);

  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [added, setAdded] = useState(false);

  // ==========================================================
  // LOAD RELATED PRODUCTS
  // ==========================================================

  useEffect(() => {
    if (!product?.id) {
      setRelated([]);
      return;
    }

    setActiveShot(0);
    setSelectedColor(null);
    setQuantity(1);
    setAdded(false);

    api
      .get(`/products/${product.id}/related`)
      .then((list) => {
        const adapted = adaptProducts(
          Array.isArray(list) ? list : []
        );

        setRelated(adapted);
      })
      .catch((error) => {
        console.error(
          "Failed to load related products:",
          error
        );

        setRelated([]);
      });
  }, [product?.id]);

  // ==========================================================
  // PRODUCT IMAGES
  // ==========================================================

  const productImages = useMemo(() => {
    if (
      Array.isArray(product?.images) &&
      product.images.length > 0
    ) {
      return product.images.filter(
        (img) =>
          img &&
          (img.image || img.url)
      );
    }

    if (product?.image) {
      return [
        {
          id: "main-image",
          productId: String(product.id),
          color: "Default",
          image: product.image,
          isPrimary: true,
        },
      ];
    }

    return [];
  }, [product]);

  // ==========================================================
  // COLOR OPTIONS
  // ==========================================================

  const colorOptions = useMemo(() => {
    const seen = new Set();

    return productImages.filter((img) => {
      const color = String(
        img.color || "Default"
      ).trim();

      const key = color.toLowerCase();

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }, [productImages]);

  // ==========================================================
  // INITIAL IMAGE
  // ==========================================================

  useEffect(() => {
    if (!productImages.length) {
      setActiveShot(0);
      setSelectedColor(null);
      return;
    }

    const primaryIndex =
      productImages.findIndex(
        (img) => img.isPrimary
      );

    const initialIndex =
      primaryIndex >= 0
        ? primaryIndex
        : 0;

    setActiveShot(initialIndex);

    setSelectedColor(
      productImages[initialIndex]?.color ||
        "Default"
    );
  }, [productImages]);

  // ==========================================================
  // NO PRODUCT
  // ==========================================================

  if (!product) {
    return null;
  }

  // ==========================================================
  // PRODUCT DATA
  // ==========================================================

  const activeImage =
    productImages[activeShot]?.image ||
    productImages[activeShot]?.url ||
    productImages[0]?.image ||
    productImages[0]?.url ||
    "";

  const isWishlisted =
    wishlist.includes(product.id);

  const isCompared =
    compareIds.includes(product.id);

  const maxStock =
    Number(product.stock) || 0;

  const rating =
    Number(product.reviews?.avg) || 0;

  const reviewCount =
    Number(product.reviews?.total) || 0;

  const originalPrice =
    Number(product.price) || 0;

  const discountPrice =
    product.discountPrice !== null &&
    product.discountPrice !== undefined
      ? Number(product.discountPrice)
      : null;

  const hasDiscount =
    discountPrice !== null &&
    Number.isFinite(discountPrice) &&
    discountPrice > 0 &&
    discountPrice < originalPrice;

  const currentPrice =
    hasDiscount
      ? discountPrice
      : originalPrice;

  const savings =
    hasDiscount
      ? originalPrice - discountPrice
      : 0;

  const discountPercent =
    hasDiscount &&
    originalPrice > 0
      ? Math.round(
          (1 -
            discountPrice /
              originalPrice) *
            100
        )
      : 0;

  // ==========================================================
  // STOCK
  // ==========================================================

  const stockInfo = (() => {
    if (maxStock <= 0) {
      return {
        text: "Out of Stock",
        color: "text-red-600",
      };
    }

    if (maxStock <= 6) {
      return {
        text: `Only ${maxStock} left`,
        color: "text-orange-600",
      };
    }

    if (maxStock <= 20) {
      return {
        text: `${maxStock} in stock`,
        color: "text-emerald-600",
      };
    }

    return {
      text: "In Stock",
      color: "text-emerald-600",
    };
  })();

  // ==========================================================
  // EXTRA DATA
  // ==========================================================

  const highlights =
    getProductHighlights(product);

  const boxItems =
    getWhatsInTheBox(product);

  const specEntries =
    product.specs &&
    typeof product.specs === "object"
      ? Object.entries(product.specs)
      : [];

  // ==========================================================
  // IMAGE / COLOR
  // ==========================================================

  const handleColorSelect = (color) => {
    const index =
      productImages.findIndex(
        (img) =>
          String(
            img.color || "Default"
          ).toLowerCase() ===
          String(
            color || "Default"
          ).toLowerCase()
      );

    if (index === -1) {
      return;
    }

    setActiveShot(index);

    setSelectedColor(
      productImages[index]?.color ||
        "Default"
    );
  };

  const showPreviousImage = () => {
    if (productImages.length <= 1) {
      return;
    }

    setActiveShot((current) => {
      const nextIndex =
        current === 0
          ? productImages.length - 1
          : current - 1;

      setSelectedColor(
        productImages[nextIndex]?.color ||
          "Default"
      );

      return nextIndex;
    });
  };

  const showNextImage = () => {
    if (productImages.length <= 1) {
      return;
    }

    setActiveShot((current) => {
      const nextIndex =
        current ===
        productImages.length - 1
          ? 0
          : current + 1;

      setSelectedColor(
        productImages[nextIndex]?.color ||
          "Default"
      );

      return nextIndex;
    });
  };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart = async () => {
    if (
      maxStock <= 0 ||
      adding ||
      buying ||
      quantity <= 0
    ) {
      return;
    }

    setAdding(true);

    try {
      await addToCart(
        product.id,
        quantity
      );

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Failed to add product to cart:",
        error
      );
    } finally {
      setAdding(false);
    }
  };

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow = async () => {
    if (
      maxStock <= 0 ||
      buying ||
      adding ||
      quantity <= 0
    ) {
      return;
    }

    setBuying(true);

    try {
      if (typeof onBuyNow === "function") {
        await onBuyNow(
          product,
          quantity
        );

        return;
      }

      await addToCart(
        product.id,
        quantity
      );

      setPage?.("checkout");
    } catch (error) {
      console.error(
        "Failed to process Buy Now:",
        error
      );
    } finally {
      setBuying(false);
    }
  };

  // ==========================================================
  // WISHLIST
  // ==========================================================

  const handleWishlist = () => {
    toggleWishlist?.(product.id);
  };

  // ==========================================================
  // COMPARE
  // ==========================================================

  const handleCompare = () => {
    toggleCompare?.(product.id);
  };

  // ==========================================================
  // AI
  // ==========================================================

  const handleOpenAI = () => {
    setPage?.("ai-chat");
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-0 w-full overflow-x-hidden bg-slate-50">

      <div className="mx-auto w-full max-w-6xl px-3 pb-12 sm:px-5 lg:px-6">

        {/* ====================================================
            BREADCRUMB
        ==================================================== */}

        <div className="pt-3">
          <Breadcrumb
            items={[
              {
                label: "Home",
                onClick: () =>
                  setPage?.("home"),
              },
              {
                label:
                  product.cat || "Products",
                onClick: () =>
                  setPage?.("home"),
              },
              ...(product.sub
                ? [
                    {
                      label: product.sub,
                    },
                  ]
                : []),
              {
                label: product.name,
              },
            ]}
          />
        </div>

        {/* ====================================================
            BACK BAR
        ==================================================== */}

        <div className="mb-4 mt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() =>
              setPage?.("home")
            }
            className="group flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-[#2D3E8C]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition group-hover:border-[#2D3E8C] group-hover:bg-blue-50">
              <ChevronLeft size={15} />
            </span>

            Back to catalog
          </button>

          <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-medium text-slate-400 shadow-sm ring-1 ring-slate-200 sm:flex">
            <Shield
              size={12}
              className="text-[#2D3E8C]"
            />
            Secure TechNova shopping
          </div>
        </div>

        {/* ====================================================
            MAIN PRODUCT AREA
        ==================================================== */}

        <section className="grid min-w-0 items-start gap-5 lg:grid-cols-[1fr_0.92fr] lg:gap-7">

          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="min-w-0">

            {/* MAIN GALLERY */}
            <div className="group/gallery relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* BADGES */}
              <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
                <StockTag stock={maxStock} />

                {hasDiscount && (
                  <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    SAVE {discountPercent}%
                  </span>
                )}
              </div>

              {/* IMAGE COUNTER */}
              {productImages.length > 1 && (
                <div className="absolute bottom-3 left-3 z-20 rounded-full bg-slate-900/75 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                  {activeShot + 1} /{" "}
                  {productImages.length}
                </div>
              )}

              {/* WISHLIST */}
              <button
                type="button"
                onClick={handleWishlist}
                aria-label={
                  isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
                }
                className={`absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm backdrop-blur-md transition ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-slate-200 bg-white/95 text-slate-500 hover:border-red-200 hover:text-red-500"
                }`}
              >
                <Heart
                  size={16}
                  className={
                    isWishlisted
                      ? "fill-red-500"
                      : ""
                  }
                />
              </button>

              {/* IMAGE */}
              <div className="relative flex aspect-[4/3] min-h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 p-5 sm:min-h-[340px] sm:p-7 lg:min-h-[390px] lg:p-8">

                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[55%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/30 blur-3xl" />

                {activeImage ? (
                  <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-xl">

                    <ProductImage
                      key={activeImage}
                      src={activeImage}
                      alt={`${product.name}${
                        selectedColor
                          ? ` ${selectedColor}`
                          : ""
                      } product image`}
                      className="relative z-10 max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover/gallery:scale-[1.05]"
                    />

                    <div className="pointer-events-none absolute bottom-2 right-2 z-20 hidden rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-semibold text-slate-500 shadow-sm backdrop-blur-md sm:block">
                      Hover to zoom
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400">
                    <Package
                      size={30}
                      className="mb-2"
                    />

                    <span className="text-xs">
                      No product image available
                    </span>
                  </div>
                )}
              </div>

              {/* PREVIOUS */}
              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Previous product image"
                  className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-md transition hover:text-slate-900 sm:opacity-0 sm:group-hover/gallery:opacity-100"
                >
                  <ChevronLeft size={17} />
                </button>
              )}

              {/* NEXT */}
              {productImages.length > 1 && (
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Next product image"
                  className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-slate-500 shadow-md transition hover:text-slate-900 sm:opacity-0 sm:group-hover/gallery:opacity-100"
                >
                  <ChevronRight size={17} />
                </button>
              )}
            </div>

            {/* ==================================================
                COLOR OPTIONS
            ================================================== */}

            {colorOptions.length > 0 && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">

                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      Available options
                    </div>

                    <div className="mt-0.5 text-[10px] text-slate-400">
                      Choose a color or product variant
                    </div>
                  </div>

                  {selectedColor && (
                    <div className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                      {selectedColor}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(
                    (option) => {
                      const optionColor =
                        option.color ||
                        "Default";

                      const isSelected =
                        String(
                          selectedColor || ""
                        ).toLowerCase() ===
                        String(
                          optionColor
                        ).toLowerCase();

                      return (
                        <button
                          type="button"
                          key={
                            option.id ??
                            `${product.id}-${optionColor}`
                          }
                          onClick={() =>
                            handleColorSelect(
                              optionColor
                            )
                          }
                          title={optionColor}
                          aria-label={`Select ${optionColor}`}
                          className={`group/variant relative overflow-hidden rounded-xl border-2 bg-white p-1 transition ${
                            isSelected
                              ? "border-[#2D3E8C] shadow-sm ring-2 ring-[#2D3E8C]/10"
                              : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="relative h-14 w-14 overflow-hidden rounded-lg bg-slate-50 sm:h-16 sm:w-16">
                            <ProductImage
                              src={
                                option.image ||
                                option.url
                              }
                              alt={`${product.name} ${optionColor}`}
                              className="h-full w-full object-contain transition-transform duration-300 group-hover/variant:scale-105"
                            />

                            {isSelected && (
                              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#2D3E8C] text-white">
                                <Check size={9} />
                              </span>
                            )}
                          </div>

                          <div
                            className={`px-0.5 pb-0.5 pt-1 text-center text-[9px] font-semibold ${
                              isSelected
                                ? "text-[#2D3E8C]"
                                : "text-slate-500"
                            }`}
                          >
                            {optionColor}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* ==================================================
                RELATED PRODUCTS
            ================================================== */}

            {related.length > 0 && (
              <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <div className="mb-4 flex items-end justify-between gap-3">
                  <div>
                    <div className="mb-0.5 flex items-center gap-1.5">
                      <Sparkles
                        size={12}
                        className="text-[#2D3E8C]"
                      />

                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#2D3E8C]">
                        Recommended
                      </span>
                    </div>

                    <h2 className="text-base font-bold tracking-tight text-slate-900">
                      You may also like
                    </h2>
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500">
                    {related.length}{" "}
                    {related.length === 1
                      ? "product"
                      : "products"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {related
                    .slice(0, 3)
                    .map((p) => {
                      const relatedImage =
                        p.image ||
                        p.images?.[0]
                          ?.image ||
                        p.images?.[0]
                          ?.url ||
                        "";

                      const relatedPrice =
                        p.discountPrice !==
                          null &&
                        p.discountPrice !==
                          undefined
                          ? Number(
                              p.discountPrice
                            )
                          : Number(
                              p.price || 0
                            );

                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() =>
                            openProduct?.(
                              p.id
                            )
                          }
                          className="group/recommend overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:-translate-y-0.5 hover:border-[#2D3E8C]/30 hover:shadow-md"
                        >
                          <div className="relative flex h-28 items-center justify-center overflow-hidden bg-slate-50 p-3">
                            {relatedImage ? (
                              <ProductImage
                                src={
                                  relatedImage
                                }
                                alt={
                                  p.name
                                }
                                className="relative h-full w-full object-contain transition-transform duration-300 group-hover/recommend:scale-105"
                              />
                            ) : (
                              <Package
                                size={22}
                                className="text-slate-300"
                              />
                            )}

                            <span className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-slate-400 opacity-0 shadow-sm transition group-hover/recommend:opacity-100">
                              <ArrowUpRight
                                size={12}
                              />
                            </span>
                          </div>

                          <div className="p-2.5">
                            <div className="mb-0.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                              {p.cat ||
                                "Electronics"}
                            </div>

                            <div className="line-clamp-2 min-h-[30px] text-[11px] font-bold leading-4 text-slate-800">
                              {p.name}
                            </div>

                            <div className="mt-2 flex items-center justify-between gap-1">
                              <span className="text-xs font-bold text-[#2D3E8C]">
                                $
                                {relatedPrice.toFixed(
                                  2
                                )}
                              </span>

                              {p.reviews
                                ?.total >
                                0 && (
                                <span className="flex items-center gap-0.5 text-[9px] text-slate-400">
                                  <Star
                                    size={8}
                                    className="fill-[#C9A96E] text-[#C9A96E]"
                                  />

                                  {Number(
                                    p.reviews
                                      .avg ||
                                      0
                                  ).toFixed(
                                    1
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </section>
            )}
          </div>

          {/* ==================================================
              RIGHT — PRODUCT DETAILS
          ================================================== */}

          <div className="min-w-0">

            {/* CATEGORY + COMPARE */}
            <div className="flex items-center justify-between gap-3">
              <div className="max-w-[70%] truncate rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                {product.cat ||
                  "Electronics"}

                {product.sub
                  ? ` · ${product.sub}`
                  : ""}
              </div>

              <button
                type="button"
                onClick={handleCompare}
                className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition ${
                  isCompared
                    ? "bg-blue-50 text-[#2D3E8C]"
                    : "text-slate-400 hover:bg-slate-50 hover:text-[#2D3E8C]"
                }`}
              >
                <ArrowLeftRight size={12} />

                {isCompared
                  ? "Compared"
                  : "Compare"}
              </button>
            </div>

            {/* NAME */}
            <h1 className="mt-2.5 text-2xl font-bold leading-tight tracking-tight text-slate-950 sm:text-3xl">
              {product.name}
            </h1>

            {/* RATING */}
            <div className="mt-2.5">
              {reviewCount > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#C9A96E]/10 px-2.5 py-1">
                    <Stars
                      value={rating}
                      size={13}
                    />

                    <span className="text-xs font-bold text-slate-800">
                      {rating.toFixed(1)}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {reviewCount} reviews
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Star size={13} />
                  No reviews yet
                </div>
              )}
            </div>

            {/* PRICE */}
            <div className="mt-4 border-b border-slate-200 pb-4">
              <div className="flex flex-wrap items-end gap-x-2.5 gap-y-1.5">
                <span
                  className={`text-3xl font-bold tracking-tight sm:text-4xl ${
                    hasDiscount
                      ? "text-red-600"
                      : "text-slate-950"
                  }`}
                >
                  ${currentPrice.toFixed(2)}
                </span>

                {hasDiscount && (
                  <>
                    <span className="mb-0.5 text-sm text-slate-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>

                    <span className="mb-0.5 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-600">
                      Save $
                      {savings.toFixed(
                        2
                      )}
                    </span>
                  </>
                )}
              </div>

              <p className="mt-1 text-[10px] text-slate-400">
                Price shown for the selected product configuration.
              </p>
            </div>

            {/* STOCK */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  maxStock > 0
                    ? "bg-emerald-500"
                    : "bg-red-500"
                }`}
              />

              <span
                className={`text-xs font-bold ${stockInfo.color}`}
              >
                {stockInfo.text}
              </span>

              {maxStock > 0 &&
                maxStock <= 6 && (
                  <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-1 text-[9px] font-bold text-orange-600">
                    <Zap size={9} />
                    Selling fast
                  </span>
                )}
            </div>

            {/* DESCRIPTION */}
            {product.description && (
              <div className="mt-3">
                <p className="text-xs leading-6 text-slate-600 sm:text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {/* HIGHLIGHTS */}
            {highlights.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-xs font-bold text-slate-900">
                    Key highlights
                  </h2>

                  <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                    At a glance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {highlights.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <div
                          key={
                            item.label
                          }
                          className="rounded-xl border border-slate-200 bg-white p-2.5 transition hover:border-blue-100 hover:bg-blue-50/30"
                        >
                          <div className="flex items-center gap-1.5">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[#2D3E8C]">
                              <Icon size={12} />
                            </div>

                            <div className="truncate text-[8px] font-bold uppercase tracking-wider text-slate-400">
                              {item.label}
                            </div>
                          </div>

                          <div className="mt-1.5 line-clamp-2 text-[11px] font-bold leading-4 text-slate-800">
                            {item.value}
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* QUANTITY */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Quantity
                </span>

                {maxStock > 0 && (
                  <span className="text-[10px] text-slate-400">
                    {maxStock} available
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="flex h-full w-9 items-center justify-center text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus size={13} />
                  </button>

                  <span className="flex w-9 items-center justify-center bg-white text-xs font-bold text-slate-900">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.min(
                          maxStock,
                          quantity + 1
                        )
                      )
                    }
                    disabled={
                      quantity >=
                        maxStock ||
                      maxStock === 0
                    }
                    className="flex h-full w-9 items-center justify-center text-slate-500 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <div className="text-right">
                  <div className="text-[8px] font-medium uppercase tracking-wider text-slate-400">
                    Order total
                  </div>

                  <div className="mt-0.5 text-base font-bold text-slate-950">
                    $
                    {(
                      currentPrice *
                      quantity
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* PURCHASE BUTTONS */}
            <div className="mt-3 space-y-2">

              {/* ADD TO CART */}
              <button
                type="button"
                disabled={
                  maxStock === 0 ||
                  adding ||
                  buying
                }
                onClick={
                  handleAddToCart
                }
                className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition sm:text-sm ${
                  maxStock === 0 ||
                  adding ||
                  buying
                    ? "cursor-not-allowed bg-slate-200 text-slate-400"
                    : added
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "bg-slate-950 text-white hover:bg-[#2D3E8C]"
                }`}
              >
                {adding ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Adding to cart...
                  </>
                ) : added ? (
                  <>
                    <Check size={15} />
                    Added to Cart
                  </>
                ) : maxStock === 0 ? (
                  "Out of Stock"
                ) : (
                  <>
                    <ShoppingCart size={15} />
                    Add to Cart
                  </>
                )}
              </button>

              {/* BUY NOW */}
              <button
                type="button"
                disabled={
                  maxStock === 0 ||
                  adding ||
                  buying
                }
                onClick={handleBuyNow}
                className={`group flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 text-xs font-bold transition sm:text-sm ${
                  maxStock === 0 ||
                  adding ||
                  buying
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                    : "border-[#2D3E8C] bg-[#2D3E8C] text-white hover:bg-[#243273]"
                }`}
              >
                {buying ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Processing...
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} />
                    Buy Now
                  </>
                )}
              </button>
            </div>

            {/* WISHLIST + COMPARE */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleWishlist}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[10px] font-bold transition ${
                  isWishlisted
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-500"
                }`}
              >
                <Heart
                  size={13}
                  className={
                    isWishlisted
                      ? "fill-red-500"
                      : ""
                  }
                />

                {isWishlisted
                  ? "Saved"
                  : "Add to Wishlist"}
              </button>

              <button
                type="button"
                onClick={handleCompare}
                className={`flex h-9 items-center justify-center gap-1.5 rounded-lg border text-[10px] font-bold transition ${
                  isCompared
                    ? "border-blue-200 bg-blue-50 text-[#2D3E8C]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-[#2D3E8C]"
                }`}
              >
                <ArrowLeftRight size={13} />

                {isCompared
                  ? "Compared"
                  : "Add to Compare"}
              </button>
            </div>

            {/* AI BUYING ADVISOR */}
            <button
              type="button"
              onClick={handleOpenAI}
              className="group/ai relative mt-3 w-full overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-indigo-50 to-white p-3.5 text-left transition hover:border-[#2D3E8C]/30 hover:shadow-md"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-200/30 blur-2xl" />

              <div className="relative flex items-start gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2D3E8C] text-white">
                  <Sparkles size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900">
                        AI Buying Advisor
                      </h3>

                      <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[7px] font-bold uppercase tracking-wide text-blue-600">
                        Smart Pick
                      </span>
                    </div>

                    <ChevronRight
                      size={14}
                      className="shrink-0 text-[#2D3E8C]"
                    />
                  </div>

                  <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-600">
                    {product.why ||
                      `Get personalized advice about this ${
                        product.cat ||
                        "electronics"
                      }.`}
                  </p>

                  <div className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-[#2D3E8C]">
                    <Sparkles size={10} />
                    Ask AI about this product
                  </div>
                </div>
              </div>
            </button>

            {/* PURCHASE CONFIDENCE */}
            <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center gap-2.5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Truck
                    size={14}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    Fast delivery
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-400">
                    Reliable TechNova delivery
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <CreditCard
                    size={14}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    Secure payment
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-400">
                    Protected checkout
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <RotateCcw
                    size={14}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <div className="text-[11px] font-bold text-slate-800">
                    30-day returns
                  </div>

                  <div className="mt-0.5 text-[9px] text-slate-400">
                    Easy return process
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            PRODUCT INFORMATION
        ==================================================== */}

        <section className="mt-10 border-t border-slate-200 pt-8">

          <div className="mb-5">
            <div className="flex items-center gap-1.5">
              <Info
                size={13}
                className="text-[#2D3E8C]"
              />

              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#2D3E8C]">
                Product information
              </span>
            </div>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Everything you need to know
            </h2>

            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
              Explore the product overview, technical specifications,
              key features, included accessories, and important
              purchase information.
            </p>
          </div>

          {/* SUMMARY */}
          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <BadgeCheck
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Product
              </div>

              <div className="mt-0.5 line-clamp-2 text-xs font-bold text-slate-800">
                {product.name}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Package
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Category
              </div>

              <div className="mt-0.5 text-xs font-bold text-slate-800">
                {product.cat ||
                  "Electronics"}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Shield
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <div className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Availability
              </div>

              <div
                className={`mt-0.5 text-xs font-bold ${stockInfo.color}`}
              >
                {stockInfo.text}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Star
                  size={15}
                  className="text-[#C9A96E]"
                />
              </div>

              <div className="mt-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                Customer rating
              </div>

              <div className="mt-0.5 text-xs font-bold text-slate-800">
                {reviewCount > 0
                  ? `${rating.toFixed(
                      1
                    )} / 5`
                  : "Not rated yet"}
              </div>
            </div>
          </div>

          {/* HIGHLIGHTS */}
          {highlights.length > 0 && (
            <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-6">
              {highlights.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <div
                      key={`info-${item.label}`}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                        <Icon
                          size={14}
                          className="text-[#2D3E8C]"
                        />
                      </div>

                      <div className="mt-2 text-[8px] font-bold uppercase tracking-wider text-slate-400">
                        {item.label}
                      </div>

                      <div className="mt-0.5 line-clamp-3 text-[11px] font-bold leading-4 text-slate-800">
                        {item.value}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          {/* OVERVIEW + SPECS */}
          <div className="grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">

            {/* OVERVIEW */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                  <Info
                    size={15}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Product overview
                  </h3>

                  <p className="mt-0.5 text-[9px] text-slate-400">
                    A closer look at this product
                  </p>
                </div>
              </div>

              {product.description ? (
                <p className="mt-3 text-xs leading-6 text-slate-600">
                  {product.description}
                </p>
              ) : (
                <p className="mt-3 text-xs leading-6 text-slate-500">
                  This product is available through TechNova.
                  Explore the specifications and highlights
                  for more information.
                </p>
              )}

              {product.why && (
                <div className="mt-3 rounded-lg bg-blue-50/70 p-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles
                      size={11}
                      className="text-[#2D3E8C]"
                    />

                    <span className="text-[10px] font-bold text-[#2D3E8C]">
                      Why consider it?
                    </span>
                  </div>

                  <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                    {product.why}
                  </p>
                </div>
              )}

              {selectedColor && (
                <div className="mt-3 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                  <span className="text-[10px] text-slate-500">
                    Selected option
                  </span>

                  <span className="text-[10px] font-bold text-slate-800">
                    {selectedColor}
                  </span>
                </div>
              )}
            </div>

            {/* SPECIFICATIONS */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <Cpu
                      size={15}
                      className="text-[#2D3E8C]"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Technical specifications
                    </h3>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      Detailed product information
                    </p>
                  </div>
                </div>
              </div>

              {specEntries.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {specEntries.map(
                    ([key, value], index) => {
                      const Icon =
                        getSpecIcon(key);

                      return (
                        <div
                          key={key}
                          className={`grid grid-cols-1 gap-1.5 px-4 py-2.5 sm:grid-cols-[0.8fr_1.2fr] sm:gap-4 ${
                            index % 2 ===
                            0
                              ? "bg-slate-50/60"
                              : "bg-white"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-1.5">
                            <Icon
                              size={12}
                              className="shrink-0 text-slate-400"
                            />

                            <span className="text-[10px] font-semibold text-slate-500 sm:text-xs">
                              {key}
                            </span>
                          </div>

                          <span className="break-words text-[11px] font-bold text-slate-900 sm:text-right">
                            {String(value)}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              ) : (
                <div className="p-7 text-center">
                  <Info
                    size={24}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-xs text-slate-400">
                    Detailed specifications will be available soon.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* BOX + PROTECTION */}
          <div className="mt-4 grid gap-4 lg:grid-cols-2">

            {/* BOX */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-4 py-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Box
                      size={15}
                      className="text-[#2D3E8C]"
                    />
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      What's in the box
                    </h3>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      Included with your purchase
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-2 p-4 sm:grid-cols-2">
                {boxItems.map(
                  (item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white shadow-sm">
                        {index === 0 ? (
                          <Box
                            size={13}
                            className="text-[#2D3E8C]"
                          />
                        ) : (
                          <Check
                            size={13}
                            className="text-emerald-600"
                          />
                        )}
                      </div>

                      <span className="text-[10px] font-semibold text-slate-700">
                        {item}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* PROTECTION */}
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4">

              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Shield
                    size={15}
                    className="text-[#2D3E8C]"
                  />
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Warranty & purchase protection
                  </h3>

                  <p className="mt-0.5 text-[9px] text-slate-500">
                    Shop with confidence
                  </p>
                </div>
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-600">
                Your purchase is covered by applicable TechNova
                warranty and return policies.
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-white/80 p-3">
                  <RotateCcw
                    size={14}
                    className="text-[#2D3E8C]"
                  />

                  <div className="mt-1.5 text-[10px] font-bold text-slate-800">
                    Easy returns
                  </div>

                  <div className="mt-0.5 text-[8px] leading-3 text-slate-400">
                    30-day return policy
                  </div>
                </div>

                <div className="rounded-lg bg-white/80 p-3">
                  <Headphones
                    size={14}
                    className="text-[#2D3E8C]"
                  />

                  <div className="mt-1.5 text-[10px] font-bold text-slate-800">
                    Customer support
                  </div>

                  <div className="mt-0.5 text-[8px] leading-3 text-slate-400">
                    Help when you need it
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            SERVICE CARDS
        ==================================================== */}

        <section className="mt-6">
          <div className="grid gap-2.5 md:grid-cols-3">

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Clock3
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <h3 className="mt-2.5 text-xs font-bold text-slate-900">
                Fast order processing
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                In-stock products are prepared for shipment quickly.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <Truck
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <h3 className="mt-2.5 text-xs font-bold text-slate-900">
                Reliable delivery
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Track your order after it has been shipped.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                <CreditCard
                  size={15}
                  className="text-[#2D3E8C]"
                />
              </div>

              <h3 className="mt-2.5 text-xs font-bold text-slate-900">
                Secure checkout
              </h3>

              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Complete your purchase through TechNova's secure checkout.
              </p>
            </div>
          </div>
        </section>

        {/* ====================================================
            REVIEWS
        ==================================================== */}

        <section className="mt-8 border-t border-slate-200 pt-7">

          <div className="mb-4">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#2D3E8C]">
              Customer feedback
            </div>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
              Customer Reviews
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              See what customers think about this product.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">

            {reviewCount > 0 ? (
              <div className="grid items-center gap-5 md:grid-cols-[180px_1fr]">

                {/* RATING SUMMARY */}
                <div className="text-center md:border-r md:border-slate-200 md:pr-5 md:text-left">
                  <div className="text-4xl font-bold tracking-tight text-slate-950">
                    {rating.toFixed(1)}
                  </div>

                  <div className="mt-1 flex justify-center md:justify-start">
                    <Stars
                      value={rating}
                      size={16}
                    />
                  </div>

                  <div className="mt-1.5 text-[10px] text-slate-500">
                    Based on{" "}
                    {reviewCount}{" "}
                    {reviewCount === 1
                      ? "rating"
                      : "ratings"}
                  </div>
                </div>

                {/* DISTRIBUTION */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(
                    (star) => {
                      const percentage =
                        star === 5
                          ? 72
                          : star === 4
                          ? 18
                          : star === 3
                          ? 6
                          : star === 2
                          ? 3
                          : 1;

                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2"
                        >
                          <span className="w-6 text-[9px] font-semibold text-slate-500">
                            {star}★
                          </span>

                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-[#C9A96E]"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>

                          <span className="w-7 text-right text-[9px] text-slate-400">
                            {percentage}%
                          </span>
                        </div>
                      );
                    }
                  )}

                  <p className="pt-1 text-[8px] leading-3 text-slate-400">
                    Rating distribution is currently estimated from
                    the product rating data.
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                  <Star
                    size={22}
                    className="text-slate-300"
                  />
                </div>

                <h3 className="mt-3 text-xs font-bold text-slate-800">
                  No reviews yet
                </h3>

                <p className="mt-1 text-[10px] text-slate-400">
                  Be the first customer to review this product.
                </p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}