import {
  useState,
  useEffect,
  useCallback,
  useRef,
  lazy,
  Suspense,
} from "react";

import { PRODUCTS, replaceProducts } from "./lib/data";
import { ToastProvider, useToast } from "./lib/ToastContext";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import { api } from "./lib/api";

import {
  adaptProducts,
  adaptCartItems,
} from "./lib/adaptProduct";

import NavBar from "./components/NavBar";
import AdminNavBar from "./components/AdminNavBar";
import Footer from "./components/Footer";

import {
  CompareTray,
  CompareModal,
} from "./components/CompareTray";

import AIChat from "./components/AIChat";
import AdminContactMessages from "./pages/AdminContactMessages";

// ============================================================
// LAZY LOAD CUSTOMER PAGES
// ============================================================

const HomePage = lazy(
  () => import("./pages/HomePage")
);

const AuthPage = lazy(
  () => import("./pages/AuthPage")
);

const ProductPage = lazy(
  () => import("./pages/ProductPage")
);

const CartPage = lazy(
  () => import("./pages/CartPage")
);

const CheckoutPage = lazy(
  () => import("./pages/CheckoutPage")
);

const OrdersPage = lazy(
  () => import("./pages/OrdersPage")
);

const ProfilePage = lazy(
  () => import("./pages/ProfilePage")
);

const WishlistPage = lazy(
  () => import("./pages/WishlistPage")
);

const StoreLocation = lazy(
  () => import("./pages/StoreLocation")
);

const ContactPage = lazy(
  () => import("./pages/Contact")
);

// ============================================================
// LAZY LOAD ADMIN PAGES
// ============================================================

const AdminDashboard = lazy(
  () => import("./pages/AdminDashboard")
);

const AdminProducts = lazy(
  () => import("./pages/AdminProducts")
);

const AdminCategories = lazy(
  () => import("./pages/AdminCategories")
);

const AdminOrders = lazy(
  () => import("./pages/AdminOrders")
);

const AdminUsers = lazy(
  () => import("./pages/AdminUsers")
);

const AdminSales = lazy(
  () => import("./pages/AdminSales")
);

const AdminSettings = lazy(
  () => import("./pages/AdminSettings")
);

// ============================================================
// LOCAL STORAGE
// ============================================================

const RECENTLY_VIEWED_KEY =
  "technova_recently_viewed";

// ============================================================
// PAGE GROUPS
// ============================================================

const ADMIN_PAGES = [
  "admin",
  "admin-products",
  "admin-categories",
  "admin-orders",
  "admin-users",
  "admin-sales",
  "admin-settings",
  "admin-contact-messages",
];

const CUSTOMER_AUTH_PAGES = [
  "cart",
  "checkout",
  "orders",
  "profile",
  "wishlist",
  "addresses",
  "payment-methods",
  "security",
  "notifications",
];

// ============================================================
// APP INNER
// ============================================================

function AppInner() {
  // ============================================================
  // PAGE
  // ============================================================

  const [page, setPage] = useState(null);

  const [activeProductId, setActiveProductId] =
    useState(PRODUCTS[0]?.id);

  // ============================================================
  // CART
  // ============================================================

  const [cartItems, setCartItems] = useState([]);

  // ============================================================
  // BUY NOW
  // ============================================================

  /*
   * Buy Now is intentionally separate from cartItems.
   *
   * This means:
   *
   * Cart:
   *   Product A + Product B + Product C
   *
   * Buy Now:
   *   Product D
   *
   * Product D goes directly to checkout without modifying
   * Product A/B/C in the cart.
   */

  const [buyNowItems, setBuyNowItems] =
    useState([]);

  // ============================================================
  // WISHLIST
  // ============================================================

  const [wishlistProducts, setWishlistProducts] =
    useState([]);

  // ============================================================
  // RECENTLY VIEWED
  // ============================================================

  const [recentlyViewed, setRecentlyViewed] =
    useState(() => {
      try {
        const raw =
          localStorage.getItem(
            RECENTLY_VIEWED_KEY
          );

        if (!raw) {
          return [];
        }

        const parsed =
          JSON.parse(raw);

        return Array.isArray(parsed)
          ? parsed
          : [];
      } catch (error) {
        console.warn(
          "Could not load recently viewed:",
          error
        );

        return [];
      }
    });

  // ============================================================
  // COMPARE
  // ============================================================

  const [compareIds, setCompareIds] =
    useState([]);

  const [compareOpen, setCompareOpen] =
    useState(false);

  // ============================================================
  // AUTH
  // ============================================================

  const [authMode, setAuthMode] =
    useState("login");

  // ============================================================
  // SEARCH
  // ============================================================

  const [aiSearch, setAiSearch] =
    useState("");

  const [searchNote, setSearchNote] =
    useState(null);

  // ============================================================
  // FILTERS
  // ============================================================

  const [filters, setFilters] =
    useState({
      cat: "All",
      sub: null,
      priceMax: 1800,
      inStockOnly: false,
      keyword: "",
    });

  // ============================================================
  // PRODUCTS
  // ============================================================

  const [productsLoaded, setProductsLoaded] =
    useState(false);

  const [loadError, setLoadError] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  // ============================================================
  // CATEGORIES
  // ============================================================

  const [categories, setCategories] =
    useState([]);

  // ============================================================
  // CONTEXT
  // ============================================================

  const toast = useToast();

  const {
    isAuthenticated,
    isAdmin,
  } = useAuth();

  // ============================================================
  // AUTHENTICATION → PAGE
  // ============================================================

  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        setPage("admin");
      } else {
        setPage("home");
      }
    } else {
      setAuthMode("login");
      setPage("auth");

      // Clear temporary Buy Now state when logged out.
      setBuyNowItems([]);
    }
  }, [
    isAuthenticated,
    isAdmin,
  ]);

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    api
      .get("/products?pageSize=100")
      .then((pageResult) => {
        if (cancelled) {
          return;
        }

        console.log(
          "Products API response:",
          pageResult
        );

        let rawProducts = [];

        if (Array.isArray(pageResult)) {
          rawProducts = pageResult;
        } else if (
          pageResult &&
          Array.isArray(pageResult.list)
        ) {
          rawProducts = pageResult.list;
        }

        if (!rawProducts.length) {
          console.warn(
            "No products found in API response"
          );

          setProducts([]);
          setProductsLoaded(true);

          return;
        }

        const adapted =
          adaptProducts(rawProducts);

        console.log(
          "Adapted products:",
          adapted
        );

        setProducts(adapted);

        replaceProducts(adapted);

        if (adapted.length > 0) {
          setActiveProductId(
            adapted[0].id
          );
        } else {
          setActiveProductId(
            undefined
          );
        }

        setProductsLoaded(true);
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load products:",
          err
        );

        setLoadError(
          err.message ||
            "Failed to load products"
        );

        setProducts([]);
        setProductsLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    api
      .get("/categories")
      .then((tree) => {
        if (cancelled) {
          return;
        }

        console.log(
          "Category tree:",
          tree
        );

        if (Array.isArray(tree)) {
          setCategories(tree);
        } else {
          setCategories([]);
        }
      })
      .catch((err) => {
        if (cancelled) {
          return;
        }

        console.error(
          "Failed to load categories:",
          err
        );

        setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CART
  // ============================================================

  const refreshCart = useCallback(() => {
    if (!isAuthenticated) {
      setCartItems([]);

      return Promise.resolve([]);
    }

    return api
      .get("/cart")
      .then((result) => {
        let list = [];

        if (Array.isArray(result)) {
          list = result;
        } else if (
          result &&
          Array.isArray(result.list)
        ) {
          list = result.list;
        }

        const adapted =
          adaptCartItems(list);

        const enriched =
          adapted.map((item) => {
            const productId =
              item?.productId ??
              item?.product_id ??
              item?.product?.id ??
              item?.product?.productId ??
              null;

            const matchingProduct =
              products.find(
                (product) =>
                  String(
                    product?.id
                  ) ===
                  String(productId)
              );

            const hasCartStock =
              item?.stock !== undefined &&
              item?.stock !== null &&
              item?.stock !== "";

            const hasProductStock =
              matchingProduct?.stock !==
                undefined &&
              matchingProduct?.stock !==
                null &&
              matchingProduct?.stock !== "";

            const cartStock =
              hasCartStock
                ? Number(item.stock)
                : null;

            const productStock =
              hasProductStock
                ? Number(
                    matchingProduct.stock
                  )
                : null;

            let resolvedStock = null;

            if (
              Number.isFinite(
                cartStock
              )
            ) {
              resolvedStock =
                cartStock;
            } else if (
              Number.isFinite(
                productStock
              )
            ) {
              resolvedStock =
                productStock;
            }

            return {
              ...item,

              productId:
                productId ??
                matchingProduct?.id ??
                null,

              name:
                item?.name ||
                matchingProduct?.name ||
                "Unnamed product",

              price:
                item?.price !==
                  undefined &&
                item?.price !== null
                  ? item.price
                  : matchingProduct?.price ??
                    0,

              image:
                item?.image ||
                matchingProduct?.image ||
                matchingProduct
                  ?.images?.[0]
                  ?.image ||
                matchingProduct
                  ?.images?.[0]
                  ?.url ||
                "",

              cat:
                item?.cat ||
                matchingProduct?.cat ||
                "",

              sub:
                item?.sub ||
                matchingProduct?.sub ||
                "",

              stock:
                resolvedStock,
            };
          });

        console.log(
          "Enriched cart items:",
          enriched
        );

        setCartItems(enriched);

        return enriched;
      })
      .catch((err) => {
        console.error(
          "Failed to load cart:",
          err
        );

        return [];
      });
  }, [
    isAuthenticated,
    products,
  ]);

  // ============================================================
  // WISHLIST
  // ============================================================

  const refreshWishlist =
    useCallback(() => {
      if (!isAuthenticated) {
        setWishlistProducts([]);

        return Promise.resolve([]);
      }

      return api
        .get("/wishlist")
        .then((result) => {
          console.log(
            "Wishlist API response:",
            result
          );

          let list = [];

          if (Array.isArray(result)) {
            list = result;
          } else if (
            result &&
            Array.isArray(result.list)
          ) {
            list = result.list;
          }

          const adapted =
            adaptProducts(list);

          const uniqueProducts = [];
          const seenIds = new Set();

          adapted.forEach(
            (product) => {
              if (
                product?.id ===
                  undefined ||
                product?.id === null
              ) {
                return;
              }

              const key =
                String(product.id);

              if (
                !seenIds.has(key)
              ) {
                seenIds.add(key);

                uniqueProducts.push(
                  product
                );
              }
            }
          );

          console.log(
            "Final wishlist products:",
            uniqueProducts
          );

          setWishlistProducts(
            uniqueProducts
          );

          return uniqueProducts;
        })
        .catch((err) => {
          console.error(
            "Failed to load wishlist:",
            err
          );

          setWishlistProducts([]);

          return [];
        });
    }, [isAuthenticated]);

  // ============================================================
  // LOAD USER CART + WISHLIST
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setCartItems([]);
      setWishlistProducts([]);

      return;
    }

    refreshCart();
    refreshWishlist();
  }, [
    isAuthenticated,
    refreshCart,
    refreshWishlist,
  ]);

  // ============================================================
  // CART COUNT
  // ============================================================

  const cartCount =
    cartItems.reduce(
      (total, item) => {
        return (
          total +
          Number(
            item?.quantity || 0
          )
        );
      },
      0
    );

  // ============================================================
  // WISHLIST IDS
  // ============================================================

  const wishlistIds = [
    ...new Set(
      wishlistProducts
        .map(
          (product) =>
            product?.id
        )
        .filter(
          (id) =>
            id !== undefined &&
            id !== null
        )
        .map((id) =>
          String(id)
        )
    ),
  ];

  const wishlistCount =
    wishlistIds.length;

  // ============================================================
  // ACTIVE PRODUCT
  // ============================================================

  const activeProduct =
    products.find(
      (product) =>
        String(product?.id) ===
        String(activeProductId)
    );

  // ============================================================
  // PRODUCT NAMES
  // ============================================================

  const productNames =
    products
      .map(
        (product) =>
          product?.name
      )
      .filter(Boolean);

  // ============================================================
  // RECENTLY VIEWED
  // ============================================================

  const addRecentlyViewed =
    useCallback((id) => {
      if (
        id === undefined ||
        id === null ||
        id === ""
      ) {
        return;
      }

      setRecentlyViewed(
        (current) => {
          const next = [
            id,
            ...current.filter(
              (item) =>
                String(item) !==
                String(id)
            ),
          ].slice(0, 12);

          try {
            localStorage.setItem(
              RECENTLY_VIEWED_KEY,
              JSON.stringify(next)
            );
          } catch (error) {
            console.warn(
              "Could not save recently viewed:",
              error
            );
          }

          return next;
        }
      );
    }, []);

  const clearRecentlyViewed =
    useCallback(() => {
      setRecentlyViewed([]);

      try {
        localStorage.removeItem(
          RECENTLY_VIEWED_KEY
        );
      } catch (error) {
        console.warn(
          "Could not clear recently viewed:",
          error
        );
      }

      try {
        window.dispatchEvent(
          new CustomEvent(
            "technova:recently-viewed-cleared"
          )
        );
      } catch {
        // Ignore browser event errors.
      }
    }, []);

    // ============================================================
    // COMPARE
    // ============================================================

    const getCompareFamily = (product) => {
      const category = String(product?.cat ?? "")
        .trim()
        .toLowerCase();

      const subcategory = String(product?.sub ?? "")
        .trim()
        .toLowerCase();

      const combined = `${category} ${subcategory}`;

      if (
        combined.includes("phone") ||
        combined.includes("smartphone")
      ) {
        return "Phones";
      }

      if (
        combined.includes("laptop") ||
        combined.includes("notebook") ||
        combined.includes("ultrabook")
      ) {
        return "Laptops";
      }

      if (
        combined.includes("earbud") ||
        combined.includes("buds")
      ) {
        return "Earbuds";
      }

      if (combined.includes("headphone")) {
        return "Headphones";
      }

      if (combined.includes("speaker")) {
        return "Speakers";
      }

      if (
        combined.includes("smartwatch") ||
        combined.includes("watch")
      ) {
        return "Smartwatch";
      }

      if (
        combined.includes("fitness") ||
        combined.includes("band")
      ) {
        return "Fitness Band";
      }

      if (combined.includes("tablet")) {
        return "Tablets";
      }

      if (combined.includes("charger")) {
        return "Chargers";
      }

      if (combined.includes("case")) {
        return "Cases";
      }

      if (combined.includes("cable")) {
        return "Cables";
      }

      return category || "Other";
    };


    const toggleCompare = useCallback(
      (id) => {
        const normalizedId = String(id);

        setCompareIds((ids) => {
          const normalizedIds = ids.map(String);

          // --------------------------------------------------------
          // REMOVE IF ALREADY SELECTED
          // --------------------------------------------------------

          if (normalizedIds.includes(normalizedId)) {
            return ids.filter(
              (itemId) => String(itemId) !== normalizedId
            );
          }

          // --------------------------------------------------------
          // MAXIMUM 3 PRODUCTS
          // --------------------------------------------------------

          if (ids.length >= 3) {
            toast(
              "You can compare up to 3 products",
              "warn"
            );

            return ids;
          }

          // --------------------------------------------------------
          // FIND PRODUCT
          // --------------------------------------------------------

          const productToAdd = PRODUCTS.find(
            (product) =>
              String(product.id) === normalizedId
          );

          if (!productToAdd) {
            return ids;
          }

          // --------------------------------------------------------
          // SAME CATEGORY CHECK
          // --------------------------------------------------------

          if (ids.length > 0) {
            const firstProduct = PRODUCTS.find(
              (product) =>
                String(product.id) === String(ids[0])
            );

            if (firstProduct) {
              const existingFamily =
                getCompareFamily(firstProduct);

              const newFamily =
                getCompareFamily(productToAdd);

              if (existingFamily !== newFamily) {
                toast(
                  `Can't compare ${existingFamily} with ${newFamily}. Please select products from the same category.`,
                  "warn"
                );

                return ids;
              }
            }
          }

          // --------------------------------------------------------
          // ADD PRODUCT
          // --------------------------------------------------------

          return [...ids, id];
        });
      },
      [toast]
    );

  // ============================================================
  // WISHLIST TOGGLE
  // ============================================================

  const toggleWishlist =
    useCallback(
      (id) => {
        if (!isAuthenticated) {
          toast(
            "Please sign in first",
            "warn"
          );

          setAuthMode("login");
          setPage("auth");

          return;
        }

        const normalizedId =
          String(id);

        const isSaved =
          wishlistIds.some(
            (wishlistId) =>
              String(
                wishlistId
              ) === normalizedId
          );

        const request = isSaved
          ? api.del(
              `/wishlist/${id}`
            )
          : api.post(
              `/wishlist/${id}`
            );

        request
          .then(() => {
            return refreshWishlist();
          })
          .then(() => {
            toast(
              isSaved
                ? "Removed from saved items"
                : "Saved for later",
              isSaved
                ? "info"
                : "success"
            );
          })
          .catch((err) => {
            console.error(
              "Wishlist update failed:",
              err
            );

            refreshWishlist();

            toast(
              err.message ||
                "Wishlist update failed",
              "warn"
            );
          });
      },
      [
        isAuthenticated,
        wishlistIds,
        refreshWishlist,
        toast,
      ]
    );

  // ============================================================
  // ADD TO CART
  // ============================================================

  const addingToCartRef =
    useRef(new Set());

  const addToCart =
    useCallback(
      (id, quantity = 1) => {
        console.log(
          "ADD TO CART FUNCTION CALLED:",
          id,
          quantity
        );

        if (
          id === undefined ||
          id === null ||
          id === ""
        ) {
          toast(
            "Invalid product",
            "warn"
          );

          return Promise.reject(
            new Error(
              "Invalid product ID"
            )
          );
        }

        if (!isAuthenticated) {
          toast(
            "Please sign in first",
            "warn"
          );

          setAuthMode("login");
          setPage("auth");

          return Promise.reject(
            new Error(
              "Not authenticated"
            )
          );
        }

        const requestedQuantity =
          Number(quantity);

        if (
          !Number.isFinite(
            requestedQuantity
          ) ||
          requestedQuantity < 1
        ) {
          toast(
            "Invalid quantity",
            "warn"
          );

          return Promise.reject(
            new Error(
              "Invalid quantity"
            )
          );
        }

        const productId =
          Number(id);

        if (
          addingToCartRef.current.has(
            productId
          )
        ) {
          console.log(
            "Duplicate add-to-cart request ignored:",
            productId
          );

          return Promise.resolve(
            false
          );
        }

        addingToCartRef.current.add(
          productId
        );

        return api
          .post("/cart", {
            productId,
            quantity:
              requestedQuantity,
          })
          .then(() => {
            return refreshCart();
          })
          .then(() => {
            const product =
              products.find(
                (item) =>
                  String(
                    item?.id
                  ) ===
                  String(id)
              );

            toast(
              `Added ${requestedQuantity} × ${
                product?.name ??
                "item"
              } to cart`,
              "success"
            );

            return true;
          })
          .catch((err) => {
            console.error(
              "Could not add item to cart:",
              err
            );

            toast(
              err.message ||
                "Could not add item to cart",
              "warn"
            );

            throw err;
          })
          .finally(() => {
            addingToCartRef.current.delete(
              productId
            );
          });
      },
      [
        isAuthenticated,
        refreshCart,
        toast,
        products,
      ]
    );

  // ============================================================
  // BUY NOW
  // ============================================================

  const buyNow =
    useCallback(
      (product, quantity = 1) => {
        console.log(
          "BUY NOW FUNCTION CALLED:",
          product,
          quantity
        );

        if (!product?.id) {
          toast(
            "Invalid product",
            "warn"
          );

          return Promise.reject(
            new Error(
              "Invalid product"
            )
          );
        }

        if (!isAuthenticated) {
          toast(
            "Please sign in first",
            "warn"
          );

          setAuthMode("login");
          setPage("auth");

          return Promise.reject(
            new Error(
              "Not authenticated"
            )
          );
        }

        const requestedQuantity =
          Number(quantity);

        if (
          !Number.isFinite(
            requestedQuantity
          ) ||
          requestedQuantity < 1
        ) {
          toast(
            "Invalid quantity",
            "warn"
          );

          return Promise.reject(
            new Error(
              "Invalid quantity"
            )
          );
        }

        /*
         * IMPORTANT:
         *
         * We DO NOT call addToCart().
         *
         * The selected product is stored separately in
         * buyNowItems and sent to CheckoutPage.
         *
         * Existing cartItems remain untouched.
         */

        const buyNowItem = {
          ...product,
          productId: product.id,
          quantity:
            requestedQuantity,
        };

        setBuyNowItems([
          buyNowItem,
        ]);

        setPage("checkout");

        window.scrollTo?.({
          top: 0,
          left: 0,
          behavior: "auto",
        });

        return Promise.resolve(true);
      },
      [
        isAuthenticated,
        toast,
      ]
    );

  // ============================================================
  // UPDATE CART QUANTITY
  // ============================================================

  const updateCartQuantity =
    useCallback(
      (cartItemId, quantity) => {
        if (
          cartItemId ===
            undefined ||
          cartItemId === null
        ) {
          return;
        }

        const requestedQuantity =
          Number(quantity);

        if (
          !Number.isFinite(
            requestedQuantity
          )
        ) {
          toast(
            "Invalid quantity",
            "warn"
          );

          return;
        }

        if (
          requestedQuantity < 1
        ) {
          api
            .del(
              `/cart/${cartItemId}`
            )
            .then(() =>
              refreshCart()
            )
            .catch((err) => {
              console.error(
                "Could not remove cart item:",
                err
              );

              toast(
                err.message ||
                  "Could not remove item",
                "warn"
              );
            });

          return;
        }

        api
          .put(
            `/cart/${cartItemId}`,
            {
              quantity:
                requestedQuantity,
            }
          )
          .then(() =>
            refreshCart()
          )
          .catch((err) => {
            console.error(
              "Could not update cart:",
              err
            );

            toast(
              err.message ||
                "Could not update cart",
              "warn"
            );
          });
      },
      [refreshCart, toast]
    );

  // ============================================================
  // REMOVE CART ITEM
  // ============================================================

  const removeCartItem =
    useCallback(
      (cartItemId) => {
        if (
          cartItemId ===
            undefined ||
          cartItemId === null
        ) {
          return;
        }

        api
          .del(
            `/cart/${cartItemId}`
          )
          .then(() =>
            refreshCart()
          )
          .catch((err) => {
            console.error(
              "Could not remove cart item:",
              err
            );

            toast(
              err.message ||
                "Could not remove item",
              "warn"
            );
          });
      },
      [refreshCart, toast]
    );

  // ============================================================
  // CHECKOUT
  // ============================================================

  const checkout = useCallback(
    (payload) => {
      return api.post("/orders", payload).then((order) => {
        refreshCart();

        if (payload?.buyNow) {
          setBuyNowItems([]);
        }

        return order;
      });
    },
    [refreshCart]
  );

  // ============================================================
  // OPEN PRODUCT
  // ============================================================

  const openProduct =
    useCallback(
      (id) => {
        if (
          id === undefined ||
          id === null ||
          id === ""
        ) {
          console.warn(
            "openProduct called without valid ID:",
            id
          );

          return;
        }

        addRecentlyViewed(id);

        setActiveProductId(id);
        setPage("product");

        window.scrollTo?.({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      },
      [addRecentlyViewed]
    );

  // ============================================================
  // SEARCH
  // ============================================================

  const runSearch =
    useCallback(() => {
      const query =
        aiSearch.trim();

      if (!query) {
        setSearchNote(null);

        setFilters(
          (current) => ({
            ...current,
            keyword: "",
          })
        );

        return;
      }

      setSearchNote(
        `Search: "${query}"`
      );

      setFilters(
        (current) => ({
          ...current,
          cat: "All",
          sub: null,
          keyword: query,
        })
      );

      setPage("home");

      setTimeout(() => {
        document
          .getElementById(
            "catalog"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    }, [aiSearch]);

  // ============================================================
  // CATEGORY SELECTION
  // ============================================================

  const pickCategory =
    useCallback(
      (cat, sub = null) => {
        setFilters(
          (current) => ({
            ...current,
            cat: cat || "All",
            sub: sub || null,
            keyword: "",
          })
        );

        setSearchNote(null);
        setPage("home");

        setTimeout(() => {
          document
            .getElementById(
              "catalog"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 50);
      },
      []
    );

  // ============================================================
  // VIEW ALL PRODUCTS
  // ============================================================

  const handleViewAllProducts =
    useCallback(() => {
      setPage("home");

      setTimeout(() => {
        document
          .getElementById(
            "catalog"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      }, 50);
    }, []);

  void handleViewAllProducts;

  // ============================================================
  // GUARDED NAVIGATION
  // ============================================================

  const guardedSetPage =
    useCallback(
      (target) => {
        // ------------------------------------------------------
        // ADMIN PAGES
        // ------------------------------------------------------

        if (
          ADMIN_PAGES.includes(
            target
          )
        ) {
          if (!isAuthenticated) {
            setAuthMode("login");
            setPage("auth");

            toast(
              "Please sign in first",
              "warn"
            );

            return;
          }

          if (!isAdmin) {
            toast(
              "Admin access required",
              "warn"
            );

            return;
          }

          setPage(target);

          window.scrollTo?.({
            top: 0,
            left: 0,
            behavior: "auto",
          });

          return;
        }

        // ------------------------------------------------------
        // CUSTOMER AUTH PAGES
        // ------------------------------------------------------

        if (
          CUSTOMER_AUTH_PAGES.includes(
            target
          ) &&
          !isAuthenticated
        ) {
          setAuthMode("login");
          setPage("auth");

          toast(
            "Please sign in first",
            "warn"
          );

          return;
        }

        // ------------------------------------------------------
        // NORMAL NAVIGATION
        // ------------------------------------------------------

        setPage(target);

        window.scrollTo?.({
          top: 0,
          left: 0,
          behavior: "auto",
        });
      },
      [
        isAuthenticated,
        isAdmin,
        toast,
      ]
    );

  // ============================================================
  // EXTRA AUTH + ROLE PROTECTION
  // ============================================================

  useEffect(() => {
    if (!isAuthenticated) {
      if (
        page !== null &&
        page !== "auth"
      ) {
        setAuthMode("login");
        setPage("auth");
      }

      return;
    }

    // ----------------------------------------------------------
    // CUSTOMER CANNOT ACCESS ADMIN PAGES
    // ----------------------------------------------------------

    if (
      !isAdmin &&
      ADMIN_PAGES.includes(page)
    ) {
      setPage("home");

      return;
    }
  }, [
    isAuthenticated,
    isAdmin,
    page,
  ]);

  // ============================================================
  // INITIAL LOADING
  // ============================================================

  if (page === null) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Loading TechNova
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Please wait...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // AUTH PAGE
  // ============================================================

  if (page === "auth") {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        }
      >
        <AuthPage
          mode={authMode}
          setMode={setAuthMode}
          setPage={setPage}
        />
      </Suspense>
    );
  }

  // ============================================================
  // ADMIN APPLICATION
  // ============================================================

  /*
   * ADMIN LAYOUT
   *
   * Customer NavBar is NOT rendered here.
   * Customer Footer is NOT rendered here.
   * Compare Tray is NOT rendered here.
   * Floating AI Chat is NOT rendered here.
   */

  if (
    isAdmin &&
    ADMIN_PAGES.includes(page)
  ) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">

        {/* ADMIN NAVBAR */}

        <AdminNavBar
          page={page}
          setPage={
            guardedSetPage
          }
        />

        {/* ADMIN CONTENT */}

        <main className="w-full">
          <Suspense
            fallback={
              <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-slate-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

                <p className="text-sm text-slate-500">
                  Loading admin panel...
                </p>
              </div>
            }
          >

            {/* ADMIN DASHBOARD */}

            {page === "admin" && (
              <AdminDashboard
                setPage={guardedSetPage}
              />
            )}

            {page === "admin-contact-messages" && (
              <AdminContactMessages
                setPage={guardedSetPage}
              />
            )}

            {/* ADMIN PRODUCTS */}

            {page === "admin-products" && (
              <AdminProducts
                setPage={guardedSetPage}
              />
            )}

            {/* ADMIN CATEGORIES */}

            {page ===
              "admin-categories" && (
              <AdminCategories
                setPage={
                  guardedSetPage
                }
              />
            )}

            {/* ADMIN ORDERS */}

            {page ===
              "admin-orders" && (
              <AdminOrders
                setPage={
                  guardedSetPage
                }
              />
            )}

            {/* ADMIN USERS */}

            {page ===
              "admin-users" && (
              <AdminUsers
                setPage={
                  guardedSetPage
                }
              />
            )}

            {/* ADMIN SALES */}

            {page ===
              "admin-sales" && (
              <AdminSales
                setPage={
                  guardedSetPage
                }
              />
            )}

            {/* ADMIN SETTINGS */}

            {page ===
              "admin-settings" && (
              <AdminSettings
                setPage={
                  guardedSetPage
                }
              />
            )}

          </Suspense>
        </main>
      </div>
    );
  }

  // ============================================================
  // CUSTOMER PRODUCT LOADING
  // ============================================================

  if (!productsLoaded) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-600" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">
            Loading TechNova
          </p>

          <p className="mt-0.5 text-xs text-slate-400">
            Please wait while we prepare your
            experience
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // CUSTOMER APPLICATION
  // ============================================================

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 antialiased">

      {/* ======================================================
          LOAD ERROR
      ======================================================= */}

      {loadError && (
        <div className="flex items-center justify-center gap-2 border-b border-red-200 bg-red-50 py-2 text-center text-xs text-red-600">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />

          <span>
            ⚠️ {loadError}
          </span>
        </div>
      )}

      {/* ======================================================
          CUSTOMER NAVBAR
      ======================================================= */}

      <NavBar
        page={page}
        setPage={
          guardedSetPage
        }
        cartCount={
          cartCount
        }
        wishlistCount={
          wishlistCount
        }
        aiSearch={
          aiSearch
        }
        setAiSearch={
          setAiSearch
        }
        onSearch={
          runSearch
        }
        onPickCategory={
          pickCategory
        }
        categories={
          categories
        }
        productNames={
          productNames
        }
      />

      {/* ======================================================
          CUSTOMER MAIN
      ======================================================= */}

      <main
        className={
          page === "ai-chat"
            ? "w-full flex-1"
            : "mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        }
      >
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center gap-4 py-24">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />

              <p className="text-sm text-slate-500">
                Loading page...
              </p>
            </div>
          }
        >

          {/* HOME */}

          {page === "home" && (
            <HomePage
              openProduct={
                openProduct
              }
              addToCart={
                addToCart
              }
              compareIds={
                compareIds
              }
              toggleCompare={
                toggleCompare
              }
              wishlist={
                wishlistIds
              }
              toggleWishlist={
                toggleWishlist
              }
              filters={
                filters
              }
              setFilters={
                setFilters
              }
              searchNote={
                searchNote
              }
              categories={
                categories
              }
              products={
                products
              }
              loading={
                !productsLoaded
              }
            />
          )}

          {/* LOCATION */}

          {page === "location" && (
            <StoreLocation
              setPage={
                guardedSetPage
              }
            />
          )}

          {/* CONTACT */}

          {page === "contact" && (
            <ContactPage
              setPage={
                guardedSetPage
              }
            />
          )}

          {/* PRODUCT */}

          {page === "product" && (
            <ProductPage
              product={
                activeProduct
              }
              addToCart={
                addToCart
              }
              compareIds={
                compareIds
              }
              toggleCompare={
                toggleCompare
              }
              wishlist={
                wishlistIds
              }
              toggleWishlist={
                toggleWishlist
              }
              setPage={
                guardedSetPage
              }
              openProduct={
                openProduct
              }
              onBuyNow={
                buyNow
              }
            />
          )}

          {/* CART */}

          {page === "cart" && (
            <CartPage
              cartItems={
                cartItems
              }
              updateQuantity={
                updateCartQuantity
              }
              removeItem={
                removeCartItem
              }
              setPage={
                guardedSetPage
              }
              openProduct={
                openProduct
              }
              products={
                products
              }
            />
          )}

          {/* CHECKOUT */}

          {page === "checkout" && (
            <CheckoutPage
              cartItems={
                cartItems
              }
              buyNowItems={
                buyNowItems
              }
              onCheckout={
                checkout
              }
              setPage={
                guardedSetPage
              }
            />
          )}

          {/* ORDERS */}

          {page === "orders" && (
            <OrdersPage
              setPage={
                guardedSetPage
              }
            />
          )}

          {/* PROFILE */}

          {page === "profile" && (
            <ProfilePage
              setPage={
                guardedSetPage
              }
              wishlistProducts={
                wishlistProducts
              }
              recentlyViewed={
                recentlyViewed
              }
              products={
                products
              }
              openProduct={
                openProduct
              }
              addToCart={
                addToCart
              }
              onClearRecentlyViewed={
                clearRecentlyViewed
              }
            />
          )}

          {/* WISHLIST */}

          {page === "wishlist" && (
            <WishlistPage
              wishlistProducts={
                wishlistProducts
              }
              openProduct={
                openProduct
              }
              addToCart={
                addToCart
              }
              compareIds={
                compareIds
              }
              toggleCompare={
                toggleCompare
              }
              toggleWishlist={
                toggleWishlist
              }
              setPage={
                guardedSetPage
              }
            />
          )}

          {/* AI CHAT */}

          {page === "ai-chat" && (
            <AIChat
              fullPage
              setPage={
                guardedSetPage
              }
            />
          )}

        </Suspense>
      </main>

      {/* ======================================================
          CUSTOMER FOOTER
      ======================================================= */}

      <Footer
        setPage={
          guardedSetPage
        }
      />

      {/* ======================================================
          CUSTOMER COMPARE
      ======================================================= */}

      <CompareTray
        compareIds={
          compareIds
        }
        toggleCompare={
          toggleCompare
        }
        onOpenCompare={() =>
          setCompareOpen(true)
        }
      />

      {compareOpen && (
        <CompareModal
          compareIds={
            compareIds
          }
          onClose={() =>
            setCompareOpen(false)
          }
        />
      )}

      {/* ======================================================
          FLOATING CUSTOMER AI CHAT
      ======================================================= */}

      {page !== "ai-chat" && (
        <AIChat />
      )}

    </div>
  );
}

// ============================================================
// ROOT APP
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  );
}