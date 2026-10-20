import { useEffect, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Heart,
  Package,
  ChevronDown,
  ChevronRight,
  Sparkles,
  MapPin,
  Mail,
  LogOut,
  LogIn,
} from "lucide-react";
import { C } from "../lib/tokens";
import { useAuth } from "../lib/AuthContext";

/*
 * Visual category structure for the TechNova mega menu.
 *
 * Clicking a category/subcategory sends:
 * onPickCategory(parentCategory, subCategory)
 */
const CATEGORY_MENU = [
  {
    name: "Phones",
    children: ["Flagship", "Budget", "5G"],
  },
  {
    name: "Laptops",
    children: ["Ultrabook", "Gaming", "Business"],
  },
  {
    name: "Audio",
    children: ["Earbuds", "Headphones", "Speakers"],
  },
  {
    name: "Wearables",
    children: ["Smartwatch", "Fitness Band"],
  },
  {
    name: "Tablets",
    children: ["Standard", "Pro"],
  },
  {
    name: "Accessories",
    children: ["Chargers", "Cases", "Cables"],
  },
];

export default function NavBar({
  page,
  setPage,
  cartCount,
  wishlistCount,
  aiSearch,
  setAiSearch,
  onSearch,
  onPickCategory,
}) {
  const {
    isAuthenticated,
    isAdmin,
    logout,
  } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] =
    useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  /*
   * Ref for the navbar.
   */
  const headerRef = useRef(null);

  /*
   * Close mega menu when clicking outside navbar.
   */
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        headerRef.current &&
        !headerRef.current.contains(
          event.target
        )
      ) {
        setCategoryOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /*
   * Add navbar shadow when scrolling.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(
        window.scrollY > 10
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * Close menus and navigate.
   */
  const go = (target) => {
    setPage(target);

    setMenuOpen(false);
    setCategoryOpen(false);

    window.scrollTo?.({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  /*
   * Products navigation.
   */
  const goProducts = () => {
    setPage("home");

    setMenuOpen(false);
    setCategoryOpen(false);

    setTimeout(() => {
      document
        .getElementById("catalog")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  };

  /*
   * Sign out.
   *
   * AuthContext clears the saved JWT token.
   * App.jsx watches isAuthenticated and
   * sends the user to the auth page.
   */
 const handleLogout = () => {
   setLogoutConfirmOpen(true);
 };

 const confirmLogout = () => {
   logout();

   setLogoutConfirmOpen(false);
   setMenuOpen(false);
   setCategoryOpen(false);

   setPage("auth");

   window.scrollTo?.({
     top: 0,
     left: 0,
     behavior: "auto",
   });
 };

 const cancelLogout = () => {
   setLogoutConfirmOpen(false);
 };

  /*
   * Category selection.
   */
  const handleCategory = (
    category,
    sub = null
  ) => {
    onPickCategory?.(
      category,
      sub
    );

    setCategoryOpen(false);
    setMenuOpen(false);

    window.scrollTo?.({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  };

  return (
    <>
      <header
        ref={headerRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "#F1F5F9",
          borderBottom: `1px solid ${C.line}`,
          boxShadow: scrolled
            ? "0 6px 24px rgba(15,23,42,0.12)"
            : "0 1px 3px rgba(15,23,42,0.03)",
          transition:
            "box-shadow 0.3s ease",
        }}
      >
        {/* =========================================================
            MAIN HEADER
        ========================================================= */}

        <div
          className="tn-container"
          style={{
            minHeight: 65,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* =======================================================
              LOGO
          ======================================================= */}

          <button
            type="button"
            onClick={() => go("home")}
            aria-label="Go to TechNova home"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              flexShrink: 0,
              marginRight: 4,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 9,
                height: 9,
                borderRadius: 2,
                background:
                  C.electric,
                display: "block",
              }}
            />

            <span
              className="f-display"
              style={{
                fontSize: 20,
                fontWeight: 750,
                letterSpacing: -0.55,
                color: C.ink,
                lineHeight: 1,
              }}
            >
              TechNova
            </span>
          </button>

          {/* =======================================================
              PRODUCTS + CATEGORIES
          ======================================================= */}

          <nav
            className="hidden md:flex items-center"
            style={{
              gap: 2,
              flexShrink: 0,
            }}
            aria-label="Main navigation"
          >
            {/* Products */}

            <HeaderLink
              active={page === "home"}
              onClick={goProducts}
            >
              Products
            </HeaderLink>

            {/* Categories */}

            <div
              style={{
                position: "relative",
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setCategoryOpen(
                    (value) => !value
                  )
                }
                aria-haspopup="true"
                aria-expanded={
                  categoryOpen
                }
                className="f-body"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 5,
                  border: "none",
                  background:
                    categoryOpen
                      ? C.mutedLine
                      : "transparent",
                  color: C.ink,
                  cursor: "pointer",
                  padding:
                    "9px 10px",
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  transition:
                    "background 0.15s ease",
                }}
              >
                Categories

                <ChevronDown
                  size={14}
                  style={{
                    transform:
                      categoryOpen
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    transition:
                      "transform 0.18s ease",
                  }}
                />
              </button>
            </div>
          </nav>

          {/* =======================================================
              DESKTOP SEARCH
          ======================================================= */}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              onSearch?.();
            }}
            className="hidden md:block"
            style={{
              flex: 1,
              minWidth: 180,
              maxWidth: 520,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "100%",
              }}
            >
              <Search
                size={17}
                style={{
                  position:
                    "absolute",
                  left: 15,
                  top: "50%",
                  transform:
                    "translateY(-50%)",
                  color: "#94A3B8",
                  pointerEvents:
                    "none",
                }}
              />

              <input
                value={aiSearch}
                onChange={(event) =>
                  setAiSearch(
                    event.target.value
                  )
                }
                placeholder="Search products..."
                aria-label="Search products"
                className="f-body"
                style={{
                  width: "100%",
                  height: 42,
                  padding:
                    "0 104px 0 42px",
                  borderRadius: 10,
                  border: `1px solid ${C.line}`,
                  background:
                    "#F8FAFC",
                  color: C.ink,
                  fontSize: 13,
                  outline: "none",
                }}
              />

              {/* AI BUTTON */}

              <button
                type="button"
                onClick={() =>
                  go("ai-chat")
                }
                className="f-body"
                aria-label="Open TechNova AI"
                title="Open TechNova AI"
                style={{
                  position:
                    "absolute",
                  top: 5,
                  right: 5,
                  height: 32,
                  padding:
                    "0 11px",
                  border: "none",
                  borderRadius: 8,
                  background:
                    C.electric,
                  color: "#fff",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 5,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <Sparkles
                  size={13}
                />
                AI
              </button>
            </div>
          </form>

          {/* =======================================================
              STORE LOCATION
          ======================================================= */}

          <nav
            className="hidden md:flex items-center"
            style={{
              gap: 2,
              flexShrink: 0,
            }}
            aria-label="Store navigation"
          >
            <HeaderLink
              active={
                page === "location"
              }
              onClick={() =>
                go("location")
              }
            >
              <MapPin size={15} />
              Store Location
            </HeaderLink>
          </nav>

          {/* =======================================================
              WISHLIST + CART
          ======================================================= */}

          <nav
            className="hidden md:flex items-center"
            style={{
              gap: 2,
              flexShrink: 0,
            }}
            aria-label="Shopping navigation"
          >
            {/* Wishlist */}

            <IconBtn
              label="Saved items"
              active={
                page === "wishlist"
              }
              onClick={() =>
                go("wishlist")
              }
              count={
                wishlistCount
              }
            >
              <Heart
                size={18}
                fill={
                  page ===
                  "wishlist"
                    ? "currentColor"
                    : "none"
                }
              />
            </IconBtn>

            {/* Cart */}

            <IconBtn
              label="Cart"
              active={
                page === "cart"
              }
              onClick={() =>
                go("cart")
              }
              count={cartCount}
            >
              <ShoppingCart
                size={18}
              />
            </IconBtn>
          </nav>

          {/* =======================================================
              DESKTOP ACCOUNT ACCESS

              Orders → Profile → Sign out → Contact → Admin
          ======================================================= */}

          <nav
            className="hidden md:flex items-center"
            style={{
              gap: 2,
              flexShrink: 0,
            }}
            aria-label="Account navigation"
          >
            {/* Orders */}

            {isAuthenticated && (
              <HeaderLink
                active={
                  page === "orders"
                }
                onClick={() =>
                  go("orders")
                }
              >
                <Package size={15} />
                Orders
              </HeaderLink>
            )}

            {/* Profile */}

            {isAuthenticated && (
              <HeaderLink
                active={
                  page === "profile"
                }
                onClick={() =>
                  go("profile")
                }
              >
                <User size={15} />
                Profile
              </HeaderLink>
            )}

            {/* Sign out */}

            {isAuthenticated && (
              <HeaderLink
                onClick={
                  handleLogout
                }
              >
                <LogOut size={15} />
                Sign out
              </HeaderLink>
            )}

            {/* Sign in */}

            {!isAuthenticated && (
              <HeaderLink
                active={
                  page === "auth"
                }
                onClick={() =>
                  go("auth")
                }
              >
                <LogIn size={15} />
                Sign in
              </HeaderLink>
            )}

            {/* Contact */}

            <HeaderLink
              active={
                page === "contact"
              }
              onClick={() =>
                go("contact")
              }
            >
              <Mail size={15} />
              Contact
            </HeaderLink>

            {/* Admin */}

            {isAdmin &&
              isAuthenticated && (
                <HeaderLink
                  active={
                    page === "admin"
                  }
                  onClick={() =>
                    go("admin")
                  }
                >
                  <User size={15} />
                  Admin Dashboard
                </HeaderLink>
              )}
          </nav>

          {/* =======================================================
              MOBILE ACTIONS
          ======================================================= */}

          <div
            className="flex md:hidden items-center gap-1 ml-auto"
            style={{
              flexShrink: 0,
            }}
          >
            <IconBtn
              label="Cart"
              active={
                page === "cart"
              }
              onClick={() =>
                go("cart")
              }
              count={cartCount}
            >
              <ShoppingCart
                size={18}
              />
            </IconBtn>

            <button
              type="button"
              aria-label={
                menuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              onClick={() => {
                setMenuOpen(
                  (value) => !value
                );

                setCategoryOpen(
                  false
                );
              }}
              style={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                border: "none",
                background:
                  "transparent",
                color: C.ink,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              {menuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            DESKTOP MEGA MENU

            CATEGORY SECTION KEPT UNCHANGED
        ========================================================= */}

        {categoryOpen && (
          <div
            className="hidden md:block"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: "50%",
              transform:
                "translateX(-50%)",
              width:
                "min(1200px, calc(100vw - 32px))",
              maxHeight:
                "min(420px, calc(100vh - 110px))",
              overflowY: "auto",
              background: "#fff",
              border:
                `1px solid ${C.line}`,
              borderRadius: 14,
              boxShadow:
                "0 18px 50px rgba(15, 23, 42, 0.15)",
              padding: 24,
              zIndex: 1000,
            }}
          >
            {/* Heading */}

            <div
              className="f-body"
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: C.muted,
                textTransform:
                  "uppercase",
                letterSpacing: 0.8,
                marginBottom: 18,
              }}
            >
              Shop by category
            </div>

            {/* Category grid */}

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(6, minmax(0, 1fr))",
                gap: "24px",
              }}
            >
              {CATEGORY_MENU.map(
                (category) => (
                  <div
                    key={
                      category.name
                    }
                  >
                    {/* Parent category */}

                    <button
                      type="button"
                      onClick={() =>
                        handleCategory(
                          category.name,
                          null
                        )
                      }
                      className="f-body"
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        padding:
                          "4px 0",
                        marginBottom: 10,
                        cursor: "pointer",
                        color: C.ink,
                        fontSize: 14,
                        fontWeight: 700,
                        textAlign:
                          "left",
                      }}
                    >
                      {category.name}
                    </button>

                    {/* Subcategories */}

                    <div
                      style={{
                        display: "flex",
                        flexDirection:
                          "column",
                        gap: 4,
                      }}
                    >
                      {category.children.map(
                        (child) => (
                          <button
                            key={`${category.name}-${child}`}
                            type="button"
                            onClick={() =>
                              handleCategory(
                                category.name,
                                child
                              )
                            }
                            className="f-body"
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              padding:
                                "3px 0",
                              cursor:
                                "pointer",
                              color:
                                C.muted,
                              fontSize: 12,
                              textAlign:
                                "left",
                            }}
                          >
                            {child}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Bottom divider */}

            <div
              style={{
                borderTop:
                  `1px solid ${C.mutedLine}`,
                marginTop: 22,
                paddingTop: 14,
                display: "flex",
                justifyContent:
                  "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() =>
                  handleCategory(
                    "All",
                    null
                  )
                }
                className="f-body"
                style={{
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  gap: 5,
                  border: "none",
                  background:
                    "transparent",
                  color:
                    C.electric,
                  cursor:
                    "pointer",
                  fontSize: 12.5,
                  fontWeight: 600,
                  padding:
                    "4px 6px",
                }}
              >
                View all products
                <ChevronRight
                  size={13}
                />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            MOBILE MENU
        ========================================================= */}

        {menuOpen && (
          <div
            className="md:hidden"
            style={{
              borderTop:
                `1px solid ${C.line}`,
              background: "#fff",
            }}
          >
            <div
              className="tn-container"
              style={{
                paddingTop: 14,
                paddingBottom: 20,
              }}
            >
              {/* MOBILE SEARCH */}

              <form
                onSubmit={(event) => {
                  event.preventDefault();

                  onSearch?.();

                  setMenuOpen(false);
                }}
              >
                <div
                  style={{
                    position:
                      "relative",
                  }}
                >
                  <Search
                    size={16}
                    style={{
                      position:
                        "absolute",
                      left: 13,
                      top: "50%",
                      transform:
                        "translateY(-50%)",
                      color:
                        C.muted,
                    }}
                  />

                  <input
                    value={aiSearch}
                    onChange={(
                      event
                    ) =>
                      setAiSearch(
                        event.target
                          .value
                      )
                    }
                    placeholder="Search products"
                    aria-label="Search products"
                    className="f-body"
                    style={{
                      width:
                        "100%",
                      height: 42,
                      padding:
                        "0 42px 0 38px",
                      borderRadius: 10,
                      border:
                        `1px solid ${C.line}`,
                      background:
                        "#F8FAFC",
                      color:
                        C.ink,
                      fontSize: 13,
                    }}
                  />

                  <button
                    type="submit"
                    aria-label="Search"
                    style={{
                      position:
                        "absolute",
                      right: 5,
                      top: 5,
                      width: 32,
                      height: 32,
                      borderRadius:
                        8,
                      border: "none",
                      background:
                        C.electric,
                      color:
                        "#fff",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      cursor:
                        "pointer",
                    }}
                  >
                    <Search
                      size={14}
                    />
                  </button>
                </div>
              </form>

              {/* MOBILE AI BUTTON */}

              <button
                type="button"
                onClick={() =>
                  go("ai-chat")
                }
                className="f-body"
                style={{
                  width: "100%",
                  minHeight: 44,
                  marginTop: 12,
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  gap: 7,
                  border: "none",
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, #2563EB, #7C3AED)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 6px 16px rgba(37, 99, 235, 0.18)",
                }}
              >
                <Sparkles
                  size={15}
                />
                Chat with TechNova AI
              </button>

              {/* MOBILE MAIN NAVIGATION */}

              <div
                style={{
                  marginTop: 14,
                  display: "flex",
                  flexDirection:
                    "column",
                  gap: 2,
                }}
              >
                {/* Home */}

                <MobileNavButton
                  active={
                    page === "home"
                  }
                  onClick={() =>
                    go("home")
                  }
                >
                  Home
                </MobileNavButton>

                {/* Products */}

                <MobileNavButton
                  active={
                    page === "home"
                  }
                  onClick={
                    goProducts
                  }
                >
                  Products
                </MobileNavButton>

                {/* Store Location */}

                <MobileNavButton
                  active={
                    page ===
                    "location"
                  }
                  onClick={() =>
                    go("location")
                  }
                >
                  <span className="flex items-center gap-2">
                    <MapPin
                      size={15}
                    />
                    Store Location
                  </span>
                </MobileNavButton>

                {/* Contact */}

                <MobileNavButton
                  active={
                    page ===
                    "contact"
                  }
                  onClick={() =>
                    go("contact")
                  }
                >
                  <span className="flex items-center gap-2">
                    <Mail
                      size={15}
                    />
                    Contact
                  </span>
                </MobileNavButton>

                {/* Orders */}

                {isAuthenticated && (
                  <MobileNavButton
                    active={
                      page ===
                      "orders"
                    }
                    onClick={() =>
                      go("orders")
                    }
                  >
                    Orders
                  </MobileNavButton>
                )}

                {/* Account */}

                {isAuthenticated && (
                  <MobileNavButton
                    active={
                      page ===
                      "profile"
                    }
                    onClick={() =>
                      go("profile")
                    }
                  >
                    Account
                  </MobileNavButton>
                )}

                {/* Admin */}

                {isAdmin &&
                  isAuthenticated && (
                    <MobileNavButton
                      active={
                        page ===
                        "admin"
                      }
                      onClick={() =>
                        go("admin")
                      }
                    >
                      Admin Dashboard
                    </MobileNavButton>
                  )}

                {/* Saved items */}

                {isAuthenticated && (
                  <MobileNavButton
                    active={
                      page ===
                      "wishlist"
                    }
                    onClick={() =>
                      go("wishlist")
                    }
                  >
                    <span>
                      Saved items
                    </span>

                    {wishlistCount >
                      0 && (
                      <CountBadge
                        count={
                          wishlistCount
                        }
                      />
                    )}
                  </MobileNavButton>
                )}

                {/* Shopping cart */}

                {isAuthenticated && (
                  <MobileNavButton
                    active={
                      page ===
                      "cart"
                    }
                    onClick={() =>
                      go("cart")
                    }
                  >
                    <span>
                      Shopping cart
                    </span>

                    {cartCount > 0 && (
                      <CountBadge
                        count={
                          cartCount
                        }
                      />
                    )}
                  </MobileNavButton>
                )}

                {/* Sign in */}

                {!isAuthenticated && (
                  <MobileNavButton
                    active={
                      page === "auth"
                    }
                    onClick={() =>
                      go("auth")
                    }
                  >
                    <span className="flex items-center gap-2">
                      <LogIn
                        size={15}
                      />
                      Sign in
                    </span>
                  </MobileNavButton>
                )}

                {/* Sign out */}

                {isAuthenticated && (
                  <MobileNavButton
                    active={false}
                    onClick={
                      handleLogout
                    }
                  >
                    <span className="flex items-center gap-2">
                      <LogOut
                        size={15}
                      />
                      Sign out
                    </span>
                  </MobileNavButton>
                )}
              </div>

              {/* MOBILE CATEGORIES */}

              <div
                style={{
                  borderTop:
                    `1px solid ${C.mutedLine}`,
                  marginTop: 14,
                  paddingTop: 14,
                }}
              >
                <div
                  className="f-body"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: C.muted,
                    textTransform:
                      "uppercase",
                    letterSpacing: 0.7,
                    marginBottom: 10,
                  }}
                >
                  Categories
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: 2,
                  }}
                >
                  {CATEGORY_MENU.map(
                    (category) => (
                      <div
                        key={
                          category.name
                        }
                        style={{
                          borderBottom:
                            `1px solid ${C.mutedLine}`,
                        }}
                      >
                        {/* Main category */}

                        <button
                          type="button"
                          onClick={() =>
                            handleCategory(
                              category.name,
                              null
                            )
                          }
                          className="f-body"
                          style={{
                            width:
                              "100%",
                            minHeight: 42,
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "space-between",
                            border:
                              "none",
                            background:
                              "#fff",
                            color:
                              C.ink,
                            fontSize:
                              14,
                            fontWeight:
                              600,
                            padding:
                              "8px 4px",
                            cursor:
                              "pointer",
                            textAlign:
                              "left",
                          }}
                        >
                          <span>
                            {
                              category.name
                            }
                          </span>

                          <ChevronRight
                            size={14}
                            color={
                              C.muted
                            }
                          />
                        </button>

                        {/* Subcategories */}

                        <div
                          style={{
                            display:
                              "flex",
                            flexWrap:
                              "wrap",
                            gap: 6,
                            padding:
                              "0 4px 10px",
                          }}
                        >
                          {category.children.map(
                            (
                              child
                            ) => (
                              <button
                                key={`${category.name}-${child}`}
                                type="button"
                                onClick={() =>
                                  handleCategory(
                                    category.name,
                                    child
                                  )
                                }
                                className="f-body"
                                style={{
                                  border:
                                    `1px solid ${C.line}`,
                                  background:
                                    "#F8FAFC",
                                  color:
                                    C.muted,
                                  borderRadius:
                                    999,
                                  padding:
                                    "6px 10px",
                                  fontSize:
                                    12,
                                  cursor:
                                    "pointer",
                                }}
                              >
                                {
                                  child
                                }
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

            {/* LOGOUT CONFIRMATION POPUP */}

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
                  if (event.target === event.currentTarget) {
                    cancelLogout();
                  }
                }}
              >
                <div
                  role="dialog"
                  aria-modal="true"
                  style={{
                    width: "min(400px, 100%)",
                    background: "#fff",
                    borderRadius: 16,
                    padding: 24,
                    boxShadow:
                      "0 24px 70px rgba(15, 23, 42, 0.25)",
                  }}
                >
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

                  <h2
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

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
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
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#e2e8f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#f1f5f9";
                      }}
                    >
                      Cancel
                    </button>

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

/* ===============================================================
   DESKTOP TEXT NAVIGATION BUTTON
================================================================= */

function HeaderLink({
  children,
  onClick,
  active,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="f-body"
      style={{
        display:
          "inline-flex",
        alignItems:
          "center",
        gap: 5,
        border: "none",
        background: active
          ? C.mutedLine
          : "transparent",
        color: active
          ? C.ink
          : "#475569",
        cursor: "pointer",
        borderRadius: 8,
        padding: "8px 9px",
        fontSize: 12.5,
        fontWeight: active
          ? 650
          : 550,
        transition:
          "background 0.15s ease",
        whiteSpace:
          "nowrap",
      }}
    >
      {children}
    </button>
  );
}

/* ===============================================================
   ICON BUTTON
================================================================= */

function IconBtn({
  children,
  onClick,
  count = 0,
  label,
  active,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="f-body"
      style={{
        position: "relative",
        width: 38,
        height: 38,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        border: "none",
        background: active
          ? C.mutedLine
          : "transparent",
        color: active
          ? C.ink
          : "#334155",
        borderRadius: 8,
        cursor: "pointer",
      }}
    >
      {children}

      {count > 0 && (
        <CountBadge
          count={count}
        />
      )}
    </button>
  );
}

/* ===============================================================
   COUNT BADGE
================================================================= */

function CountBadge({
  count,
}) {
  return (
    <span
      className="f-body"
      style={{
        position: "absolute",
        top: 1,
        right: 1,
        minWidth: 16,
        height: 16,
        padding: "0 4px",
        borderRadius: 999,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        background:
          C.signal,
        color: "#fff",
        fontSize: 9,
        fontWeight: 750,
        lineHeight: 1,
        border:
          "2px solid #fff",
      }}
    >
      {count > 99
        ? "99+"
        : count}
    </span>
  );
}

/* ===============================================================
   MOBILE NAV BUTTON
================================================================= */

function MobileNavButton({
  children,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="f-body"
      style={{
        width: "100%",
        minHeight: 42,
        display: "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        border: "none",
        background: active
          ? C.electricSoft
          : "transparent",
        color: active
          ? C.electric
          : C.ink,
        borderRadius: 8,
        padding: "8px 10px",
        fontSize: 14,
        fontWeight: active
          ? 650
          : 500,
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}