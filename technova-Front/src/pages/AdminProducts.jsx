import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api } from "../lib/api";

export default function AdminProducts({ setPage }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  // ============================================================
  // CATEGORY DROPDOWN
  // ============================================================

  const [categoryOpen, setCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  // ============================================================
  // FORM
  // ============================================================

  const [form, setForm] = useState({
    name: "",
    price: "",
    discountPrice: "",
    stock: "",
    categoryId: "",
    image: "",
    description: "",
    specs: "",
    rating: "0",
    reviewCount: "0",
    isFeatured: false,
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // ============================================================
  // LOCK BODY SCROLL WHEN FORM IS OPEN
  // ============================================================

  useEffect(() => {
    if (!showForm) {
      return;
    }

    const scrollY = window.scrollY;

    const originalBodyStyle = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position =
        originalBodyStyle.position;

      document.body.style.top =
        originalBodyStyle.top;

      document.body.style.width =
        originalBodyStyle.width;

      document.body.style.overflow =
        originalBodyStyle.overflow;

      window.scrollTo(0, scrollY);
    };
  }, [showForm]);

  // ============================================================
  // CLOSE CATEGORY DROPDOWN
  // ============================================================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target)
      ) {
        setCategoryOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ============================================================
  // LOAD PRODUCTS
  // ============================================================

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await api.get(
        "/admin/products"
      );

      setProducts(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load products:",
        err
      );

      setError(
        err.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  }

  // ============================================================
  // LOAD CATEGORIES
  // ============================================================

  async function loadCategories() {
    try {
      const data = await api.get(
        "/categories"
      );

      setCategories(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load categories:",
        err
      );
    }
  }

  // ============================================================
  // MESSAGE
  // ============================================================

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  // ============================================================
  // PRODUCT SEPARATION
  // ============================================================

  const activeProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !Boolean(product.isDeleted)
      ),
    [products]
  );

  const deletedProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          Boolean(product.isDeleted)
      ),
    [products]
  );

  // ============================================================
  // SEARCH
  // ============================================================

  function productMatchesSearch(product) {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return true;
    }

    return (
      String(product.id || "")
        .toLowerCase()
        .includes(keyword) ||
      product.name
        ?.toLowerCase()
        .includes(keyword) ||
      product.categoryName
        ?.toLowerCase()
        .includes(keyword) ||
      product.subcategoryName
        ?.toLowerCase()
        .includes(keyword)
    );
  }

  const filteredActiveProducts =
    activeProducts.filter(
      product =>
        productMatchesSearch(product)
    );

  const filteredDeletedProducts =
    deletedProducts.filter(
      product =>
        productMatchesSearch(product)
    );

  // ============================================================
  // STATISTICS
  // ============================================================

  const outOfStockProducts =
    activeProducts.filter(
      (product) =>
        Number(product.stock || 0) <= 0
    );

  // ============================================================
  // FORM HELPERS
  // ============================================================

  function handleInputChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  function resetForm() {
    setForm({
      name: "",
      price: "",
      discountPrice: "",
      stock: "",
      categoryId: "",
      image: "",
      description: "",
      specs: "",
      rating: "0",
      reviewCount: "0",
      isFeatured: false,
    });

    setCategoryOpen(false);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingId(null);
    resetForm();
  }

  function handleAddProduct() {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  }

  function handleEditProduct(product) {
    if (product.isDeleted) {
      return;
    }

    setEditingId(product.id);

    setForm({
      name: product.name || "",
      price: product.price ?? "",
      discountPrice:
        product.discountPrice ?? "",
      stock: product.stock ?? "",
      categoryId:
        product.categoryId ?? "",
      image: product.image || "",
      description:
        product.description || "",
      specs: product.specs || "",
      rating: product.rating ?? "0",
      reviewCount:
        product.reviewCount ?? "0",
      isFeatured:
        Boolean(product.isFeatured),
    });

    setCategoryOpen(false);
    setShowForm(true);
  }

  // ============================================================
  // CATEGORY OPTIONS
  // ============================================================

  function getCategoryOptions() {
    const options = [];

    categories.forEach((category) => {
      if (
        category.children &&
        category.children.length > 0
      ) {
        category.children.forEach(
          (child) => {
            options.push({
              id: child.id,
              name: child.name,
              parentName:
                category.name,
            });
          }
        );
      } else {
        options.push({
          id: category.id,
          name: category.name,
          parentName: null,
        });
      }
    });

    return options;
  }

  const categoryOptions =
    getCategoryOptions();

  const selectedCategory =
    categoryOptions.find(
      (category) =>
        String(category.id) ===
        String(form.categoryId)
    );

  // ============================================================
  // SUBMIT
  // ============================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.name.trim()) {
      showMessage(
        "Product name is required."
      );
      return;
    }

    if (
      form.price === "" ||
      Number(form.price) < 0
    ) {
      showMessage(
        "Product price is required."
      );
      return;
    }

    // 0 stock is valid
    if (
      form.stock === "" ||
      Number(form.stock) < 0
    ) {
      showMessage(
        "Product stock is required."
      );
      return;
    }

    if (!form.categoryId) {
      showMessage(
        "Please select a category."
      );
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name: form.name.trim(),

        price: Number(form.price),

        discountPrice:
          form.discountPrice !== ""
            ? Number(
                form.discountPrice
              )
            : null,

        stock: Number(form.stock),

        categoryId: Number(
          form.categoryId
        ),

        image:
          form.image.trim() || null,

        description:
          form.description.trim() ||
          null,

        specs:
          form.specs.trim()
            ? form.specs.trim()
            : "{}",

        rating:
          form.rating !== ""
            ? Number(form.rating)
            : 0,

        reviewCount:
          form.reviewCount !== ""
            ? Number(
                form.reviewCount
              )
            : 0,

        isFeatured:
          form.isFeatured,
      };

      if (editingId) {
        await api.put(
          `/admin/products/${editingId}`,
          productData
        );

        setShowForm(false);
        setEditingId(null);
        resetForm();

        await loadProducts();

        showMessage(
          "Product updated successfully."
        );
      } else {
        await api.post(
          "/admin/products",
          productData
        );

        setShowForm(false);
        resetForm();

        await loadProducts();

        showMessage(
          "Product created successfully."
        );
      }
    } catch (err) {
      console.error(
        "Failed to save product:",
        err
      );

      showMessage(
        err.message ||
          "Failed to save product"
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // DELETE
  // ============================================================

  async function handleDelete(product) {
    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.del(
        `/admin/products/${product.id}`
      );

      await loadProducts();

      showMessage(
        "Product deleted successfully."
      );
    } catch (err) {
      console.error(
        "Failed to delete product:",
        err
      );

      showMessage(
        err.message ||
          "Failed to delete product"
      );
    }
  }

  // ============================================================
  // RESTORE
  // ============================================================

  async function handleRestore(product) {
    const confirmed =
      window.confirm(
        `Restore "${product.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(
        `/admin/products/${product.id}/restore`,
        {}
      );

      await loadProducts();

      showMessage(
        "Product restored successfully."
      );
    } catch (err) {
      console.error(
        "Failed to restore product:",
        err
      );

      showMessage(
        err.message ||
          "Failed to restore product"
      );
    }
  }

  // ============================================================
  // PRODUCT ROW
  // ============================================================

  function ProductRow({ product }) {
    const stock = Number(
      product.stock || 0
    );

    return (
      <tr className="transition hover:bg-slate-50">

        {/* PRODUCT */}

        <td className="px-6 py-4">
          <div className="flex items-center gap-3">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                📦
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-900">
                {product.name}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                ID: {product.id}
              </p>
            </div>

          </div>
        </td>

        {/* CATEGORY */}

        <td className="px-6 py-4">
          <p className="text-sm text-slate-700">
            {product.categoryName ||
              product.subcategoryName ||
              "Uncategorized"}
          </p>
        </td>

        {/* PRICE */}

        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-slate-900">
            ¥
            {Number(
              product.price || 0
            ).toLocaleString()}
          </p>

          {product.discountPrice !=
            null && (
            <p className="text-xs text-emerald-600 mt-1">
              Sale: ¥
              {Number(
                product.discountPrice
              ).toLocaleString()}
            </p>
          )}
        </td>

        {/* STOCK */}

        <td className="px-6 py-4">
          <span
            className={
              stock <= 0
                ? "text-sm font-semibold text-red-600"
                : stock < 10
                ? "text-sm font-semibold text-orange-600"
                : "text-sm font-semibold text-slate-700"
            }
          >
            {stock}
          </span>
        </td>

        {/* STATUS */}

        <td className="px-6 py-4">
          {stock <= 0 ? (
            <span className="inline-flex px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
              Out of Stock
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
              ACTIVE
            </span>
          )}
        </td>

        {/* ACTIONS */}

        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2">

            <button
              type="button"
              onClick={() =>
                handleEditProduct(product)
              }
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
            >
              Edit
            </button>

            <button
              type="button"
              onClick={() =>
                handleDelete(product)
              }
              className="px-3.5 py-2 rounded-lg border border-red-200 bg-white text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              Delete
            </button>

          </div>
        </td>

      </tr>
    );
  }

  // ============================================================
  // DELETED PRODUCT ROW
  // ============================================================

  function DeletedProductRow({
    product,
  }) {
    return (
      <tr className="bg-red-50/30 transition hover:bg-red-50/60">

        {/* PRODUCT */}

        <td className="px-6 py-4">
          <div className="flex items-center gap-3">

            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-12 rounded-xl object-cover border border-red-200 opacity-60"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl opacity-60">
                📦
              </div>
            )}

            <div>
              <p className="font-semibold text-slate-500">
                {product.name}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                ID: {product.id}
              </p>
            </div>

          </div>
        </td>

        {/* CATEGORY */}

        <td className="px-6 py-4">
          <p className="text-sm text-slate-500">
            {product.categoryName ||
              product.subcategoryName ||
              "Uncategorized"}
          </p>
        </td>

        {/* PRICE */}

        <td className="px-6 py-4">
          <p className="text-sm font-semibold text-slate-500">
            ¥
            {Number(
              product.price || 0
            ).toLocaleString()}
          </p>

          {product.discountPrice !=
            null && (
            <p className="text-xs text-slate-400 mt-1">
              Sale: ¥
              {Number(
                product.discountPrice
              ).toLocaleString()}
            </p>
          )}
        </td>

        {/* STOCK */}

        <td className="px-6 py-4">
          <span className="text-sm font-semibold text-slate-500">
            {product.stock ?? 0}
          </span>
        </td>

        {/* STATUS */}

        <td className="px-6 py-4">
          <span className="inline-flex px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            DELETED
          </span>
        </td>

        {/* ACTION */}

        <td className="px-6 py-4">
          <div className="flex items-center justify-end">

            <button
              type="button"
              onClick={() =>
                handleRestore(product)
              }
              className="px-3.5 py-2 rounded-lg border border-emerald-200 bg-white text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition"
            >
              Restore
            </button>

          </div>
        </td>

      </tr>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="text-center">

            <div className="inline-flex items-center gap-3 text-slate-500">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />

              Loading products...
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-xl mx-auto px-4 py-20">

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">

            <div className="text-4xl mb-3">
              ⚠️
            </div>

            <h2 className="text-lg font-semibold text-red-700">
              Unable to load products
            </h2>

            <p className="text-sm text-red-600 mt-2">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProducts}
              className="mt-5 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              Try Again
            </button>

          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

          <div>
            <div className="flex items-center gap-3 mb-2">

              <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-sm">
                📦
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-900">
                  Product Management
                </h1>

                <p className="text-slate-500 text-sm mt-1">
                  Manage products in your TechNova store.
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            {/* DASHBOARD */}

            <button
              type="button"
              onClick={() => setPage("admin")}
              className="px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-100 transition shadow-sm"
            >
              ← Dashboard
            </button>

            {/* ADD */}

            <button
              type="button"
              onClick={handleAddProduct}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
            >
              + Add Product
            </button>

          </div>

        </div>

        {/* ================================================= */}
        {/* MESSAGE */}
        {/* ================================================= */}

        {message && (
          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {message}
          </div>
        )}

        {/* ================================================= */}
        {/* STATISTICS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          {/* TOTAL */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Total Products
                </p>

                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {products.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-xl">
                📦
              </div>

            </div>

          </div>

          {/* ACTIVE */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Active
                </p>

                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {activeProducts.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">
                ✓
              </div>

            </div>

          </div>

          {/* DELETED */}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Deleted
                </p>

                <p className="text-3xl font-bold text-red-500 mt-1">
                  {deletedProducts.length}
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center text-xl">
                🗑️
              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* EXTRA PRODUCT STATS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Out of Stock
                </p>

                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {outOfStockProducts.length}
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Active products
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center text-xl">
                ⚠️
              </div>

            </div>

          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-500">
                  Featured Products
                </p>

                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {
                    activeProducts.filter(
                      (product) =>
                        Boolean(
                          product.isFeatured
                        )
                    ).length
                  }
                </p>

                <p className="text-xs text-slate-400 mt-2">
                  Currently featured
                </p>
              </div>

              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-xl">
                ⭐
              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* PRODUCT SEARCH */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">

          <div className="px-5 sm:px-6 py-5">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Products
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Search and manage your store products.
                </p>
              </div>

              <div className="relative w-full md:w-80">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

        {/* ================================================= */}
        {/* ADD / EDIT PRODUCT FORM */}
        {/* ================================================= */}

        {showForm && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6">

            <div className="min-h-full flex items-center justify-center">

              <div
                className="w-full max-w-5xl max-h-[calc(100vh-32px)] flex flex-col overflow-hidden bg-white rounded-3xl shadow-2xl"
                onMouseDown={(event) =>
                  event.stopPropagation()
                }
              >

                {/* FORM HEADER */}

                <div className="shrink-0 px-6 sm:px-8 py-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">

                  <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                        {editingId
                          ? "✏️"
                          : "📦"}
                      </div>

                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                          {editingId
                            ? "Edit Product"
                            : "Add New Product"}
                        </h2>

                        <p className="text-sm text-slate-500 mt-1">
                          {editingId
                            ? "Update your product information."
                            : "Create a new product for your TechNova store."}
                        </p>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={closeForm}
                      disabled={saving}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                    >
                      ×
                    </button>

                  </div>

                </div>

                {/* SCROLLABLE BODY */}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">

                  <form
                    onSubmit={handleSubmit}
                    className="p-6 sm:p-8 space-y-8"
                  >

                    {/* ==================================================
                        PRODUCT INFORMATION
                    ================================================== */}

                    <div>

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">
                          01
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Product Information
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Basic information about the product.
                          </p>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* NAME */}

                        <div className="md:col-span-2">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Product Name
                          </label>

                          <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={
                              handleInputChange
                            }
                            placeholder="e.g. iPhone 17 Pro"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                          />

                        </div>

                        {/* CATEGORY */}

                        <div
                          ref={categoryRef}
                          className="relative"
                        >

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Category
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              setCategoryOpen(
                                (open) =>
                                  !open
                              )
                            }
                            className={`w-full px-4 py-3 rounded-xl border bg-white text-left flex items-center justify-between gap-3 transition ${
                              categoryOpen
                                ? "border-blue-500 ring-2 ring-blue-500/20"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >

                            <span
                              className={
                                selectedCategory
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }
                            >
                              {selectedCategory
                                ? selectedCategory.name
                                : "Select category"}
                            </span>

                            <span
                              className={`text-slate-400 transition-transform duration-200 ${
                                categoryOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            >
                              ▾
                            </span>

                          </button>

                          {categoryOpen && (
                            <div className="absolute left-0 right-0 top-full mt-2 z-[100] rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">

                              <div className="max-h-64 overflow-y-auto py-1">

                                {categoryOptions.length ===
                                0 ? (
                                  <div className="px-4 py-3 text-sm text-slate-500">
                                    No categories available.
                                  </div>
                                ) : (
                                  categoryOptions.map(
                                    (category) => (
                                      <button
                                        key={
                                          category.id
                                        }
                                        type="button"
                                        onClick={() => {
                                          setForm(
                                            (
                                              current
                                            ) => ({
                                              ...current,
                                              categoryId:
                                                category.id,
                                            })
                                          );

                                          setCategoryOpen(
                                            false
                                          );
                                        }}
                                        className={`w-full px-4 py-3 text-left transition ${
                                          String(
                                            form.categoryId
                                          ) ===
                                          String(
                                            category.id
                                          )
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                      >

                                        <div className="flex items-center justify-between gap-3">

                                          <div>

                                            <p className="text-sm font-medium">
                                              {
                                                category.name
                                              }
                                            </p>

                                            {category.parentName && (
                                              <p className="text-xs text-slate-400 mt-0.5">
                                                {
                                                  category.parentName
                                                }
                                              </p>
                                            )}

                                          </div>

                                          {String(
                                            form.categoryId
                                          ) ===
                                            String(
                                              category.id
                                            ) && (
                                            <span className="text-blue-600 font-bold">
                                              ✓
                                            </span>
                                          )}

                                        </div>

                                      </button>
                                    )
                                  )
                                )}

                              </div>

                            </div>
                          )}

                        </div>

                        {/* FEATURED */}

                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              Featured Product
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Highlight this product on the store.
                            </p>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">

                            <input
                              type="checkbox"
                              name="isFeatured"
                              checked={
                                form.isFeatured
                              }
                              onChange={
                                handleInputChange
                              }
                              className="sr-only peer"
                            />

                            <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-blue-600 transition-colors" />

                            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />

                          </label>

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        PRICING
                    ================================================== */}

                    <div className="border-t border-slate-100 pt-8">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">
                          02
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Pricing & Inventory
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Set the product price and available stock.
                          </p>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                        {/* PRICE */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Price (¥)
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                              ¥
                            </span>

                            <input
                              type="number"
                              name="price"
                              value={
                                form.price
                              }
                              onChange={
                                handleInputChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="9999"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                          </div>

                        </div>

                        {/* SALE */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Sale Price (¥)
                          </label>

                          <div className="relative">

                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                              ¥
                            </span>

                            <input
                              type="number"
                              name="discountPrice"
                              value={
                                form.discountPrice
                              }
                              onChange={
                                handleInputChange
                              }
                              min="0"
                              step="0.01"
                              placeholder="Optional"
                              className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                          </div>

                        </div>

                        {/* STOCK */}

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Stock
                          </label>

                          <input
                            type="number"
                            name="stock"
                            value={
                              form.stock
                            }
                            onChange={
                              handleInputChange
                            }
                            min="0"
                            placeholder="50"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        IMAGE
                    ================================================== */}

                    <div className="border-t border-slate-100 pt-8">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">
                          03
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Product Image
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Add an image URL and preview your product.
                          </p>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        <div>

                          <div className="h-64 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">

                            {form.image ? (
                              <img
                                src={
                                  form.image
                                }
                                alt="Product preview"
                                className="w-full h-full object-contain p-5"
                                onError={(
                                  event
                                ) => {
                                  event.currentTarget.style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="text-center px-6">

                                <div className="text-5xl mb-3">
                                  🖼️
                                </div>

                                <p className="text-sm font-semibold text-slate-600">
                                  Image Preview
                                </p>

                                <p className="text-xs text-slate-400 mt-1">
                                  Your product image will appear here.
                                </p>

                              </div>
                            )}

                          </div>

                        </div>

                        <div className="lg:col-span-2 flex flex-col justify-center">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Image URL
                          </label>

                          <input
                            type="text"
                            name="image"
                            value={
                              form.image
                            }
                            onChange={
                              handleInputChange
                            }
                            placeholder="https://example.com/product-image.jpg"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          />

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        DETAILS
                    ================================================== */}

                    <div className="border-t border-slate-100 pt-8">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">
                          04
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Product Details
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Tell customers more about this product.
                          </p>
                        </div>

                      </div>

                      <div className="space-y-5">

                        <div>

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Description
                          </label>

                          <textarea
                            name="description"
                            value={
                              form.description
                            }
                            onChange={
                              handleInputChange
                            }
                            rows="5"
                            placeholder="Describe the product, its features, benefits and what makes it special..."
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                          />

                        </div>

                        <div>

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Specifications
                          </label>

                          <textarea
                            name="specs"
                            value={
                              form.specs
                            }
                            onChange={
                              handleInputChange
                            }
                            rows="5"
                            placeholder='Example: {"RAM":"8GB","Storage":"256GB","Display":"6.4 inch"}'
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm transition"
                          />

                          <p className="text-xs text-slate-400 mt-2">
                            Enter specifications as valid JSON.
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        RATINGS
                    ================================================== */}

                    <div className="border-t border-slate-100 pt-8">

                      <div className="flex items-center gap-3 mb-5">

                        <div className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-sm">
                          05
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Ratings & Reviews
                          </h3>

                          <p className="text-xs text-slate-500 mt-0.5">
                            Set the displayed rating information.
                          </p>
                        </div>

                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        <div className="rounded-2xl border border-slate-200 p-5">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Rating
                          </label>

                          <div className="flex items-center gap-4">

                            <input
                              type="number"
                              name="rating"
                              value={
                                form.rating
                              }
                              onChange={
                                handleInputChange
                              }
                              min="0"
                              max="5"
                              step="0.1"
                              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <div className="text-yellow-500 text-xl">
                              ★★★★★
                            </div>

                          </div>

                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5">

                          <label className="block text-sm font-semibold text-slate-700 mb-2">
                            Review Count
                          </label>

                          <input
                            type="number"
                            name="reviewCount"
                            value={
                              form.reviewCount
                            }
                            onChange={
                              handleInputChange
                            }
                            min="0"
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />

                        </div>

                      </div>

                    </div>

                    {/* ==================================================
                        ACTIONS
                    ================================================== */}

                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-slate-100">

                      <button
                        type="button"
                        onClick={closeForm}
                        disabled={saving}
                        className="px-5 py-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        {saving
                          ? editingId
                            ? "Updating..."
                            : "Creating..."
                          : editingId
                          ? "Update Product"
                          : "Create Product"}
                      </button>

                    </div>

                  </form>

                </div>

              </div>

            </div>

          </div>
        )}

        {/* ================================================= */}
        {/* ACTIVE PRODUCTS */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">

          <div className="px-5 sm:px-6 py-5 border-b border-slate-200">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-xl">
                  📦
                </div>

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    <h2 className="text-lg font-bold text-slate-900">
                      Active Products
                    </h2>

                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold">
                      ACTIVE
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Products currently available in your store.
                  </p>

                </div>

              </div>

              <span className="inline-flex self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {filteredActiveProducts.length} Active
              </span>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Product
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Category
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Price
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Stock
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredActiveProducts.map(
                  (product) => (
                    <ProductRow
                      key={product.id}
                      product={product}
                    />
                  )
                )}

                {filteredActiveProducts.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-14 text-center"
                    >

                      <div className="text-4xl mb-3">
                        🔍
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {search
                          ? "No matching active products"
                          : "No active products"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? "Try a different search term."
                          : "Add a product to your store to get started."}
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* ================================================= */}
        {/* DELETED PRODUCTS */}
        {/* ================================================= */}

        <div className="bg-white rounded-2xl border border-red-200 shadow-sm overflow-hidden">

          <div className="px-5 sm:px-6 py-5 border-b border-red-100 bg-red-50/50">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-xl">
                  🗑️
                </div>

                <div>

                  <div className="flex items-center gap-2 flex-wrap">

                    <h2 className="text-lg font-bold text-slate-900">
                      Deleted Products
                    </h2>

                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-semibold">
                      DELETED
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Deleted products are kept here and can be restored.
                  </p>

                </div>

              </div>

              <span className="inline-flex self-start sm:self-auto px-3 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                {filteredDeletedProducts.length} Deleted
              </span>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Product
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Category
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Price
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Stock
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredDeletedProducts.map(
                  (product) => (
                    <DeletedProductRow
                      key={product.id}
                      product={product}
                    />
                  )
                )}

                {filteredDeletedProducts.length ===
                  0 && (
                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-14 text-center"
                    >

                      <div className="text-4xl mb-3">
                        🗑️
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {search
                          ? "No matching deleted products"
                          : "No deleted products"}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {search
                          ? "Try a different search term."
                          : "Deleted products will appear here."}
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}