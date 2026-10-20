import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "../components/ProductCard";
import { SORT_OPTIONS } from "../components/FilterSidebar";

import {
  Search,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
  Sparkles,
  Truck,
  ShieldCheck,
  RotateCcw,
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Monitor,
  Cpu,
  ArrowRight,
} from "lucide-react";

/* =====================================================================
   FONTS
===================================================================== */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`;

/* =====================================================================
   CONSTANTS
===================================================================== */

const PAGE_SIZE = 8;
const DEFAULT_MAX_PRICE = 1800;

/* =====================================================================
   FALLBACK CATEGORIES
===================================================================== */

const FALLBACK_CATEGORIES = [
  {
    name: "Phones",
    icon: Smartphone,
    subs: ["Flagship", "Budget", "5G"],
  },
  {
    name: "Laptops",
    icon: Laptop,
    subs: ["Ultrabook", "Gaming", "Business"],
  },
  {
    name: "Audio",
    icon: Headphones,
    subs: ["Earbuds", "Headphones", "Speakers"],
  },
  {
    name: "Wearables",
    icon: Watch,
    subs: ["Smartwatch", "Fitness Band"],
  },
  {
    name: "Tablets",
    icon: Monitor,
    subs: ["Standard", "Pro"],
  },
  {
    name: "Accessories",
    icon: Cpu,
    subs: ["Chargers", "Cases", "Cables"],
  },
];

/* =====================================================================
   CATEGORY GROUPS
   =====================================================================

   IMPORTANT:
   The backend currently returns values such as:
   Flagship, Budget, 5G, Gaming, Earbuds, etc.
   These are stored in categoryName.

   The frontend displays them as:
   Phones -> Flagship / Budget / 5G
   Laptops -> Ultrabook / Gaming / Business
   etc.

   This mapping allows both parent category and subcategory filtering.
===================================================================== */

const CATEGORY_GROUPS = {
  Phones: ["Flagship", "Budget", "5G"],
  Laptops: ["Ultrabook", "Gaming", "Business"],
  Audio: ["Earbuds", "Headphones", "Speakers"],
  Wearables: ["Smartwatch", "Fitness Band"],
  Tablets: ["Standard", "Pro"],
  Accessories: ["Chargers", "Cases", "Cables"],
};

/* =====================================================================
   BASIC HELPERS
===================================================================== */

const money = (value) =>
  `$${Number(value ?? 0).toFixed(0)}`;

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const normalizeSearchText = (value) =>
  String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getProductCategory = (product) =>
  product?.cat ||
  product?.categoryName ||
  product?.category?.name ||
  "";

const getProductSubcategory = (product) =>
  product?.sub ||
  product?.subcategoryName ||
  product?.subcategory?.name ||
  "";

const getProductBrand = (product) =>
  product?.brand ||
  product?.brandName ||
  "";

const getCreatedDate = (product) =>
  product?.createdAt ||
  product?.created_at ||
  product?.createTime ||
  product?.created ||
  "";

const getPopularity = (product) =>
  Number(
    product?.popularity ??
      product?.sales ??
      product?.soldCount ??
      product?.salesCount ??
      product?.viewCount ??
      0
  );

const getRating = (product) =>
  Number(
    product?.rating ??
      product?.averageRating ??
      0
  );

const getReviews = (product) =>
  Number(
    product?.reviews ??
      product?.reviewCount ??
      product?.reviewsCount ??
      0
  );

/* =====================================================================
   CURRENT PRODUCT PRICE
===================================================================== */

const getProductPrice = (product) => {
  const discount = Number(product?.discountPrice);
  const price = Number(product?.price);

  if (
    Number.isFinite(discount) &&
    discount > 0 &&
    Number.isFinite(price) &&
    discount < price
  ) {
    return discount;
  }

  return Number.isFinite(price) ? price : 0;
};

/* =====================================================================
   SEARCH HELPERS
===================================================================== */

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "for",
  "with",
  "to",
  "of",
  "in",
  "on",
  "under",
  "below",
  "less",
  "than",
  "around",
  "about",
  "please",
  "show",
  "me",
  "find",
  "want",
  "need",
  "looking",
  "look",
  "product",
  "products",
  "item",
  "items",
]);

function extractSearchPrice(query) {
  const text = normalize(query);

  const patterns = [
    /(?:under|below|less than|max|maximum|up to)\s*\$?\s*(\d+(?:\.\d+)?)/i,
    /\$\s*(\d+(?:\.\d+)?)/i,
    /(\d+(?:\.\d+)?)\s*(?:dollars|usd)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const price = Number(match[1]);

      if (Number.isFinite(price)) {
        return price;
      }
    }
  }

  return null;
}

function extractSearchKeywords(query) {
  const text = normalizeSearchText(query);

  return text
    .replace(
      /(?:under|below|less than|max|maximum|up to)\s*\$?\s*\d+(?:\.\d+)?/gi,
      " "
    )
    .replace(/\$\s*\d+(?:\.\d+)?/gi, " ")
    .replace(
      /\d+(?:\.\d+)?\s*(?:dollars|usd)/gi,
      " "
    )
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word &&
        !SEARCH_STOP_WORDS.has(word)
    );
}

function getProductSearchText(product) {
  return normalizeSearchText(
    [
      product?.name,
      getProductCategory(product),
      getProductSubcategory(product),
      getProductBrand(product),
      product?.description,
      product?.specification,
      product?.specs,
      product?.model,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

/* =====================================================================
   SEARCH SCORING
===================================================================== */

function getSearchScore(product, query) {
  const keywords = extractSearchKeywords(query);

  if (!keywords.length) {
    return 0;
  }

  const name = normalizeSearchText(product?.name);

  const category = normalizeSearchText(
    getProductCategory(product)
  );

  const subcategory = normalizeSearchText(
    getProductSubcategory(product)
  );

  const brand = normalizeSearchText(
    getProductBrand(product)
  );

  const searchText =
    getProductSearchText(product);

  const normalizedQuery =
    normalizeSearchText(query);

  let score = 0;

  if (name === normalizedQuery) {
    score += 5000;
  }

  if (
    normalizedQuery &&
    name.includes(normalizedQuery)
  ) {
    score += 2500;
  }

  keywords.forEach((keyword) => {
    if (name.includes(keyword)) {
      score += 100;
    }

    if (brand.includes(keyword)) {
      score += 60;
    }

    if (category.includes(keyword)) {
      score += 50;
    }

    if (subcategory.includes(keyword)) {
      score += 40;
    }

    if (searchText.includes(keyword)) {
      score += 10;
    }
  });

  return score;
}

/* =====================================================================
   PRODUCT SEARCH MATCHING
===================================================================== */

function productMatchesSearch(product, query) {
  const normalizedQuery =
    normalizeSearchText(query);

  if (!normalizedQuery) {
    return true;
  }

  const normalizedName =
    normalizeSearchText(product?.name);

  if (normalizedName === normalizedQuery) {
    return true;
  }

  if (
    normalizedName.includes(
      normalizedQuery
    )
  ) {
    return true;
  }

  const keywords =
    extractSearchKeywords(query);

  if (!keywords.length) {
    return true;
  }

  const searchText =
    getProductSearchText(product);

  return keywords.every((keyword) =>
    searchText.includes(keyword)
  );
}

/* =====================================================================
   CATEGORY HELPERS
===================================================================== */

function normalizeCategories(categories) {
  if (
    !Array.isArray(categories) ||
    categories.length === 0
  ) {
    return FALLBACK_CATEGORIES;
  }

  return categories.map((category) => {
    const name =
      category?.name ||
      category?.categoryName ||
      category?.title ||
      String(category);

    const fallback =
      FALLBACK_CATEGORIES.find(
        (item) =>
          normalize(item.name) ===
          normalize(name)
      );

    const rawSubs =
      category?.subs ||
      category?.children ||
      category?.subcategories ||
      [];

    const subs = Array.isArray(rawSubs)
      ? rawSubs
          .map((item) =>
            typeof item === "string"
              ? item
              : item?.name ||
                item?.subcategoryName ||
                item?.title
          )
          .filter(Boolean)
      : [];

    return {
      name,
      icon:
        fallback?.icon ||
        Smartphone,
      subs:
        subs.length > 0
          ? subs
          : fallback?.subs || [],
    };
  });
}

/* =====================================================================
   PRODUCT RAIL
===================================================================== */

function ProductRail({
  title,
  icon: Icon,
  iconClass,
  items,
  wishlist,
  compareIds,
  openProduct,
  addToCart,
  toggleCompare,
  toggleWishlist,
}) {
  const scrollerRef = useRef(null);

  const scrollBy = (direction) => {
    scrollerRef.current?.scrollBy({
      left: direction * 340,
      behavior: "smooth",
    });
  };

  if (!items?.length) {
    return null;
  }

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2
          className="flex items-center gap-2 text-xl font-semibold text-slate-900"
          style={{
            fontFamily:
              "'Space Grotesk', sans-serif",
          }}
        >
          <Icon
            size={20}
            className={iconClass}
          />

          {title}
        </h2>

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide"
        style={{
          scrollSnapType: "x mandatory",
        }}
      >
        {items.map((product) => (
          <div
            key={product.id}
            className="w-[190px] shrink-0 sm:w-[175px]"
            style={{
              scrollSnapAlign: "start",
            }}
          >
            <ProductCard
              p={product}
              smallImage
              openProduct={openProduct}
              addToCart={addToCart}
              toggleCompare={toggleCompare}
              isComparing={compareIds.includes(
                product.id
              )}
              toggleWishlist={
                toggleWishlist
              }
              isWishlisted={wishlist.includes(
                String(product.id)
              )}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/* =====================================================================
   HOME PAGE
===================================================================== */

export default function HomePage({
  openProduct,
  addToCart,
  compareIds = [],
  toggleCompare,
  wishlist = [],
  toggleWishlist,
  filters,
  setFilters,
  categories = [],
  products = [],
  loading = false,
}) {
  const [mobileFilterOpen, setMobileFilterOpen] =
    useState(false);

  const [mobileNavOpen, setMobileNavOpen] =
    useState(false);

  const [searchDraft, setSearchDraft] =
    useState(filters?.keyword || "");

  const [sort, setSort] =
    useState("relevance");

  const [page, setPage] = useState(1);

  /* ===================================================================
     CATEGORIES
  =================================================================== */

  const categoryList = useMemo(
    () => normalizeCategories(categories),
    [categories]
  );

  /* ===================================================================
     SEARCH BOX SYNC
  =================================================================== */

  useEffect(() => {
    setSearchDraft(filters?.keyword || "");
  }, [filters?.keyword]);

  /* ===================================================================
     RESET PAGE
  =================================================================== */

  useEffect(() => {
    setPage(1);
  }, [filters, sort]);

  /* ===================================================================
     SEARCH
  =================================================================== */

  const runSearch = () => {
    const query = searchDraft.trim();

    const extractedPrice =
      extractSearchPrice(query);

    setFilters((current) => ({
      ...current,
      cat: "All",
      sub: null,
      priceMax:
        extractedPrice !== null
          ? Math.min(
              DEFAULT_MAX_PRICE,
              Math.max(20, extractedPrice)
            )
          : DEFAULT_MAX_PRICE,
      inStockOnly: false,
      keyword: query,
    }));

    setTimeout(() => {
      document
        .getElementById("catalog")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* ===================================================================
     CATEGORY
  =================================================================== */

  const shopCategory = (
    categoryName,
    sub = null
  ) => {
    setFilters((current) => ({
      ...current,
      cat: categoryName || "All",
      sub: sub || null,
      keyword: "",
    }));

    setSearchDraft("");
    setMobileNavOpen(false);

    setTimeout(() => {
      document
        .getElementById("catalog")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* ===================================================================
     SHOP ALL
  =================================================================== */

  const shopAll = () => {
    setFilters({
      cat: "All",
      sub: null,
      priceMax: DEFAULT_MAX_PRICE,
      inStockOnly: false,
      keyword: "",
    });

    setSearchDraft("");

    setTimeout(() => {
      document
        .getElementById("catalog")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /* ===================================================================
     FILTERING + SORTING
  =================================================================== */

  const filtered = useMemo(() => {
    const currentFilters = filters || {
      cat: "All",
      sub: null,
      priceMax: DEFAULT_MAX_PRICE,
      inStockOnly: false,
      keyword: "",
    };

    const query =
      currentFilters.keyword?.trim() || "";

    const queryPrice =
      extractSearchPrice(query);

    const effectiveMaxPrice =
      queryPrice !== null
        ? Math.min(
            DEFAULT_MAX_PRICE,
            Math.max(20, queryPrice)
          )
        : Number(
            currentFilters.priceMax ??
              DEFAULT_MAX_PRICE
          );

    let list = products.filter(
      (product) => {
        const category =
          getProductCategory(product);

        const subcategory =
          getProductSubcategory(product);

        const price =
          getProductPrice(product);

        const stock = Number(
          product?.stock ?? 0
        );

        /* =============================================================
           CATEGORY + SUBCATEGORY FILTER

           Parent category:
             Phones
               -> Flagship
               -> Budget
               -> 5G

           Subcategory:
             Phones + Flagship
               -> Flagship only

           Because the API currently stores the leaf value
           in categoryName, we compare against CATEGORY_GROUPS.
        ============================================================= */

        if (currentFilters.cat !== "All") {
          const selectedCategory =
            currentFilters.cat;

          const selectedSubcategory =
            currentFilters.sub;

          const categoryGroup =
            CATEGORY_GROUPS[
              selectedCategory
            ];

          // Parent category selected
          if (categoryGroup) {
            // Parent + subcategory selected
            if (selectedSubcategory) {
              if (
                normalize(category) !==
                normalize(selectedSubcategory)
              ) {
                return false;
              }
            }

            // Parent category only
            else {
              const belongsToCategory =
                categoryGroup.some(
                  (item) =>
                    normalize(item) ===
                    normalize(category)
                );

              if (!belongsToCategory) {
                return false;
              }
            }
          }

          // Direct/leaf category selected
          else if (
            normalize(category) !==
            normalize(selectedCategory)
          ) {
            return false;
          }
        }

        /*
         * This handles products that have a real backend
         * subcategory in the future.
         *
         * If the current API has subcategoryName = null,
         * the parent/leaf logic above handles the filtering.
         */
        if (
          currentFilters.sub &&
          !CATEGORY_GROUPS[
            currentFilters.cat
          ] &&
          normalize(subcategory) !==
            normalize(currentFilters.sub)
        ) {
          return false;
        }

        if (price > effectiveMaxPrice) {
          return false;
        }

        if (
          currentFilters.inStockOnly &&
          stock <= 0
        ) {
          return false;
        }

        if (
          query &&
          !productMatchesSearch(
            product,
            query
          )
        ) {
          return false;
        }

        return true;
      }
    );

    const sorters = {
      relevance: (a, b) => {
        if (query) {
          const scoreDifference =
            getSearchScore(
              b,
              query
            ) -
            getSearchScore(
              a,
              query
            );

          if (scoreDifference !== 0) {
            return scoreDifference;
          }
        }

        return (
          getPopularity(b) -
          getPopularity(a)
        );
      },

      price_asc: (a, b) =>
        getProductPrice(a) -
        getProductPrice(b),

      price_desc: (a, b) =>
        getProductPrice(b) -
        getProductPrice(a),

      rating: (a, b) =>
        getRating(b) -
        getRating(a),

      newest: (a, b) =>
        new Date(
          getCreatedDate(b)
        ) -
        new Date(
          getCreatedDate(a)
        ),
    };

    return [...list].sort(
      sorters[sort] ||
        sorters.relevance
    );
  }, [products, filters, sort]);

  /* ===================================================================
     FEATURED
  =================================================================== */

  const featured = useMemo(() => {
    return products
      .filter(
        (product) =>
          Number(product?.stock ?? 0) > 0
      )
      .sort((a, b) => {
        const ratingDifference =
          getRating(b) -
          getRating(a);

        if (ratingDifference !== 0) {
          return ratingDifference;
        }

        return (
          getPopularity(b) -
          getPopularity(a)
        );
      })
      .slice(0, 6);
  }, [products]);

  /* ===================================================================
     TRENDING
  =================================================================== */

  const trending = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          getPopularity(b) -
          getPopularity(a)
      )
      .slice(0, 8);
  }, [products]);

  /* ===================================================================
     NEW ARRIVALS
  =================================================================== */

  const newArrivals = useMemo(() => {
    return [...products]
      .sort(
        (a, b) =>
          new Date(
            getCreatedDate(b)
          ) -
          new Date(
            getCreatedDate(a)
          )
      )
      .slice(0, 8);
  }, [products]);

  /* ===================================================================
     HERO PRODUCT
  =================================================================== */

  const heroProduct =
    products.find(
      (product) =>
        Number(product?.stock ?? 0) > 0
    ) ||
    products[0] ||
    null;

  /* ===================================================================
     PAGINATION
  =================================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filtered.length / PAGE_SIZE
    )
  );

  const safePage = Math.min(
    page,
    totalPages
  );

  const pageItems = filtered.slice(
    (safePage - 1) *
      PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  /* ===================================================================
     ACTIVE FILTERS
  =================================================================== */

  const clearFilters = () => {
    setFilters({
      cat: "All",
      sub: null,
      priceMax: DEFAULT_MAX_PRICE,
      inStockOnly: false,
      keyword: "",
    });

    setSearchDraft("");
  };

  const activeChips = [];

  if (
    filters?.cat &&
    filters.cat !== "All"
  ) {
    activeChips.push({
      label: filters.cat,
      clear: () =>
        setFilters((current) => ({
          ...current,
          cat: "All",
          sub: null,
        })),
    });
  }

  if (filters?.sub) {
    activeChips.push({
      label: filters.sub,
      clear: () =>
        setFilters((current) => ({
          ...current,
          sub: null,
        })),
    });
  }

  if (
    Number(
      filters?.priceMax ??
        DEFAULT_MAX_PRICE
    ) < DEFAULT_MAX_PRICE
  ) {
    activeChips.push({
      label: `Under ${money(
        filters.priceMax
      )}`,
      clear: () =>
        setFilters((current) => ({
          ...current,
          priceMax:
            DEFAULT_MAX_PRICE,
        })),
    });
  }

  if (filters?.inStockOnly) {
    activeChips.push({
      label: "In stock only",
      clear: () =>
        setFilters((current) => ({
          ...current,
          inStockOnly: false,
        })),
    });
  }

  if (filters?.keyword) {
    activeChips.push({
      label: `"${filters.keyword}"`,
      clear: () => {
        setFilters((current) => ({
          ...current,
          keyword: "",
        }));

        setSearchDraft("");
      },
    });
  }

  /* ===================================================================
     ACTIVE CATEGORY
  =================================================================== */

  const activeCategory =
    categoryList.find(
      (category) =>
        normalize(category.name) ===
        normalize(filters?.cat)
    );

  /* ===================================================================
     FILTER PANEL
  =================================================================== */

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Category
        </div>

        <div className="space-y-1">
          <button
            type="button"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                cat: "All",
                sub: null,
              }))
            }
            className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
              filters?.cat === "All"
                ? "bg-indigo-50 font-semibold text-indigo-900"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            All products
          </button>

          {categoryList.map(
            (category) => (
              <button
                type="button"
                key={category.name}
                onClick={() =>
                  setFilters(
                    (current) => ({
                      ...current,
                      cat: category.name,
                      sub: null,
                    })
                  )
                }
                className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm ${
                  normalize(
                    filters?.cat
                  ) ===
                  normalize(
                    category.name
                  )
                    ? "bg-indigo-50 font-semibold text-indigo-900"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {category.name}
              </button>
            )
          )}
        </div>
      </div>

      {activeCategory &&
        activeCategory.subs?.length >
          0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Type
            </div>

            <div className="flex flex-wrap gap-1.5">
              {activeCategory.subs.map(
                (subcategory) => (
                  <button
                    type="button"
                    key={subcategory}
                    onClick={() =>
                      setFilters(
                        (current) => ({
                          ...current,
                          sub:
                            current.sub ===
                            subcategory
                              ? null
                              : subcategory,
                        })
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      normalize(
                        filters?.sub
                      ) ===
                      normalize(
                        subcategory
                      )
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {subcategory}
                  </button>
                )
              )}
            </div>
          </div>
        )}

      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
          <span>Max price</span>

          <span className="text-slate-600">
            {money(
              filters?.priceMax ??
                DEFAULT_MAX_PRICE
            )}
          </span>
        </div>

        <input
          type="range"
          min={20}
          max={DEFAULT_MAX_PRICE}
          step={10}
          value={
            filters?.priceMax ??
            DEFAULT_MAX_PRICE
          }
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              priceMax: Number(
                event.target.value
              ),
            }))
          }
          className="w-full accent-indigo-700"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={Boolean(
            filters?.inStockOnly
          )}
          onChange={(event) =>
            setFilters((current) => ({
              ...current,
              inStockOnly:
                event.target.checked,
            }))
          }
          className="h-4 w-4 rounded accent-indigo-700"
        />

        In stock only
      </label>

      {activeChips.length > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-indigo-700 hover:underline"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  /* ===================================================================
     LOADING
  =================================================================== */

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({
            length: 8,
          }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ===================================================================
     EMPTY CATALOG
  =================================================================== */

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <Search
            size={24}
            className="text-slate-400"
          />
        </div>

        <h2
          className="mt-4 text-xl font-semibold text-slate-900"
          style={{
            fontFamily:
              "'Space Grotesk', sans-serif",
          }}
        >
          No products available
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
          We couldn't find any products
          in the catalog right now.
        </p>
      </div>
    );
  }

  /* ===================================================================
     PAGE
  =================================================================== */

  return (
    <div
      className="text-slate-900"
      style={{
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{FONT_IMPORT}</style>

      {/* ================================================================
          MOBILE HOME NAV
      ================================================================ */}

      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() =>
              setMobileNavOpen(false)
            }
          />

          <div className="absolute left-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2
                className="text-lg font-bold text-indigo-950"
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                }}
              >
                Shop TechNova
              </h2>

              <button
                type="button"
                onClick={() =>
                  setMobileNavOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <button
              type="button"
              onClick={shopAll}
              className="mb-2 w-full rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-indigo-900 hover:bg-indigo-50"
            >
              All products
            </button>

            {categoryList.map(
              (category) => (
                <button
                  type="button"
                  key={category.name}
                  onClick={() =>
                    shopCategory(
                      category.name
                    )
                  }
                  className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  {category.name}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* ================================================================
          HERO
      ================================================================ */}

      <section className="relative overflow-hidden rounded-2xl bg-indigo-950 transition-all duration-300 ease-out hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl hover:shadow-indigo-950/20">
        <div
          className="absolute inset-y-0 right-0 hidden w-2/5 bg-indigo-900 md:block"
          style={{
            clipPath:
              "polygon(30% 0, 100% 0, 100% 100%, 0 100%)",
          }}
        />

        <div className="relative grid gap-7 px-6 py-8 sm:px-9 sm:py-10 md:grid-cols-2 md:items-center md:py-11">
          {/* HERO TEXT */}
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-300">
              <Sparkles size={12} />
              TechNova collection
            </div>

            <h1
              className="mt-3 max-w-2xl text-4xl font-bold leading-tight text-white sm:text-[2.75rem]"
              style={{
                fontFamily:
                  "'Space Grotesk', sans-serif",
              }}
            >
              Technology that keeps up with where you're going
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Discover smartphones, laptops, audio, wearables and everyday
              accessories selected for modern life.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={shopAll}
                className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-indigo-950 transition hover:bg-slate-100"
              >
                Shop all products
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                onClick={() =>
                  shopCategory("Laptops")
                }
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See laptops
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-4 text-xs text-slate-300 sm:text-sm">
              <span className="flex items-center gap-2">
                <Truck
                  size={16}
                  className="text-amber-300"
                />
                Free shipping over $200
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-amber-300"
                />
                Secure shopping
              </span>

              <span className="flex items-center gap-2">
                <RotateCcw
                  size={16}
                  className="text-amber-300"
                />
                30-day returns
              </span>
            </div>
          </div>

          {/* HERO PRODUCT */}
          {heroProduct && (
            <div className="relative hidden justify-self-end md:flex">
              <button
                type="button"
                onClick={() =>
                  openProduct?.(
                    heroProduct.id
                  )
                }
                className="w-60 rotate-[-2deg] rounded-2xl bg-white p-4 text-left shadow-2xl transition hover:rotate-0"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
                  <img
                    src={heroProduct.image}
                    alt={
                      heroProduct.name ||
                      "Featured product"
                    }
                    className="h-full w-full object-contain p-3"
                    onError={(event) => {
                      event.currentTarget.style.display =
                        "none";
                    }}
                  />
                </div>

                <div className="mt-3 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  {getProductBrand(
                    heroProduct
                  )}
                </div>

                <div className="line-clamp-2 text-base font-bold text-slate-900">
                  {heroProduct.name}
                </div>

                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-lg font-extrabold text-indigo-950">
                    {money(
                      getProductPrice(
                        heroProduct
                      )
                    )}
                  </span>

                  <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    {Number(
                      heroProduct.stock ?? 0
                    ) > 0
                      ? "In stock"
                      : "Out of stock"}
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================
          SHOP BY CATEGORY
      ================================================================ */}

      <section className="mt-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
              Explore
            </p>

            <h2
              className="mt-1 text-xl font-semibold text-slate-900"
              style={{
                fontFamily:
                  "'Space Grotesk', sans-serif",
              }}
            >
              Shop by category
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {categoryList.map((category) => {
            const CategoryIcon =
              category.icon || Smartphone;

            return (
              <button
                type="button"
                key={category.name}
                onClick={() =>
                  shopCategory(category.name)
                }
                className="group flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 text-center transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md sm:p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
                  <CategoryIcon size={20} />
                </span>

                <span className="text-xs font-semibold text-slate-800 sm:text-sm">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          FEATURED PRODUCTS
      ================================================================ */}

      {featured.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">
                Hand picked
              </p>

              <h2
                className="mt-1 text-xl font-semibold text-slate-900"
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                }}
              >
                Featured products
              </h2>
            </div>

            <button
              type="button"
              onClick={shopAll}
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-700 hover:text-indigo-900 sm:flex"
            >
              View all
              <ChevronRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map(
              (product) => (
                <ProductCard
                  key={product.id}
                  p={product}
                  smallImage
                  openProduct={
                    openProduct
                  }
                  addToCart={
                    addToCart
                  }
                  toggleCompare={
                    toggleCompare
                  }
                  isComparing={compareIds.includes(
                    product.id
                  )}
                  toggleWishlist={
                    toggleWishlist
                  }
                  isWishlisted={wishlist.includes(
                    String(
                      product.id
                    )
                  )}
                />
              )
            )}
          </div>
        </section>
      )}

      {/* ================================================================
          TRENDING
      ================================================================ */}

      <div className="mt-12">
        <ProductRail
          title="Trending now"
          icon={Sparkles}
          iconClass="text-amber-500"
          items={trending}
          wishlist={wishlist}
          compareIds={compareIds}
          openProduct={openProduct}
          addToCart={addToCart}
          toggleCompare={
            toggleCompare
          }
          toggleWishlist={
            toggleWishlist
          }
        />
      </div>

      {/* ================================================================
          NEW ARRIVALS
      ================================================================ */}

      <div className="mt-12">
        <ProductRail
          title="New arrivals"
          icon={Truck}
          iconClass="text-emerald-600"
          items={newArrivals}
          wishlist={wishlist}
          compareIds={compareIds}
          openProduct={openProduct}
          addToCart={addToCart}
          toggleCompare={
            toggleCompare
          }
          toggleWishlist={
            toggleWishlist
          }
        />
      </div>

      {/* ================================================================
          ALL PRODUCTS / CATALOG
      ================================================================ */}

      <section
        id="catalog"
        className="mt-14 scroll-mt-24"
      >
        {/* MOBILE SEARCH */}

        <div className="mb-4 flex gap-2 sm:hidden">
          <div className="relative flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={searchDraft}
              onChange={(event) =>
                setSearchDraft(
                  event.target.value
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key ===
                  "Enter"
                ) {
                  runSearch();
                }
              }}
              placeholder="Search products..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={runSearch}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-950 text-white"
            aria-label="Search"
          >
            <Search size={16} />
          </button>
        </div>

        {/* CATALOG LAYOUT */}

        <div className="flex gap-8">
          {/* DESKTOP FILTER */}

          <aside className="hidden w-56 shrink-0 md:block">
            <FilterPanel />
          </aside>

          <div className="min-w-0 flex-1">
            {/* DESKTOP SORT */}

            <div className="mb-4 hidden justify-end md:flex">
              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm outline-none"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.key}
                    value={option.key}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* PRODUCTS */}

            {pageItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <Search
                    size={23}
                    className="text-slate-400"
                  />
                </div>

                <div className="mt-4 text-lg font-semibold text-slate-800">
                  {filters?.keyword?.trim()
                    ? `No products found for "${filters.keyword.trim()}"`
                    : "No products match your filters"}
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {filters?.keyword?.trim()
                    ? "Try a different search term or clear the search."
                    : "Try widening the price range or clearing a filter."}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-full bg-indigo-950 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-900"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {pageItems.map(
                  (product) => (
                    <ProductCard
                      key={product.id}
                      p={product}
                      openProduct={
                        openProduct
                      }
                      addToCart={
                        addToCart
                      }
                      toggleCompare={
                        toggleCompare
                      }
                      isComparing={compareIds.includes(
                        product.id
                      )}
                      toggleWishlist={
                        toggleWishlist
                      }
                      isWishlisted={wishlist.includes(
                        String(
                          product.id
                        )
                      )}
                    />
                  )
                )}
              </div>
            )}

            {/* PAGINATION */}

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                    )
                  }
                  disabled={
                    safePage === 1
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={15} />
                </button>

                {Array.from(
                  {
                    length: totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map(
                  (number) => (
                    <button
                      type="button"
                      key={number}
                      onClick={() =>
                        setPage(number)
                      }
                      className={`h-8 w-8 rounded-full text-sm font-medium transition ${
                        safePage === number
                          ? "bg-indigo-950 text-white"
                          : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                    )
                  }
                  disabled={
                    safePage ===
                    totalPages
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================================================================
          MOBILE FILTER SHEET
      ================================================================ */}

      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden"
          onClick={() =>
            setMobileFilterOpen(false)
          }
        >
          <div
            className="w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl"
            style={{
              maxHeight: "80vh",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="mb-5 flex items-center justify-between">
              <h3
                className="text-lg font-semibold"
                style={{
                  fontFamily:
                    "'Space Grotesk', sans-serif",
                }}
              >
                Filters
              </h3>

              <button
                type="button"
                onClick={() =>
                  setMobileFilterOpen(false)
                }
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            <FilterPanel />

            <button
              type="button"
              onClick={() =>
                setMobileFilterOpen(false)
              }
              className="mt-6 w-full rounded-full bg-indigo-950 py-2.5 text-sm font-semibold text-white"
            >
              Show {filtered.length} results
            </button>
          </div>
        </div>
      )}

      {/* ================================================================
          MOBILE SHOP MENU BUTTON
      ================================================================ */}

      <button
        type="button"
        onClick={() =>
          setMobileNavOpen(true)
        }
        aria-label="Open shop menu"
        className="fixed bottom-5 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-950 text-white shadow-xl md:hidden"
      >
        <Menu size={20} />
      </button>
    </div>
  );
}